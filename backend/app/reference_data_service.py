"""
Postgres (Supabase) adapter for reference/lookup data that doesn't belong
in Firestore — districts, LGD villages/subdistricts, SHC nutrients, crop calendars.

This is the ONLY module that talks to Postgres. All readers (routers, sync jobs)
go through this module. Firestore and Gemini remain completely unaware of Postgres.
"""

import logging
from contextlib import contextmanager
from datetime import datetime, timezone

import psycopg2
import psycopg2.extras
from psycopg2 import sql

from app.config import get_settings

logger = logging.getLogger("kisan-alert.reference-data")
settings = get_settings()


class ReferenceDataError(Exception):
    pass


# ── Connection ───────────────────────────────────────────────────────────
@contextmanager
def _get_conn():
    if not settings.database_url:
        raise ReferenceDataError(
            "DATABASE_URL is not set — cannot query reference data"
        )
    conn = psycopg2.connect(settings.database_url, sslmode="require")
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


# ── Districts ────────────────────────────────────────────────────────────
def list_districts(limit: int = 50, start_after: str | None = None) -> dict:
    try:
        with _get_conn() as conn:
            cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
            if start_after:
                cur.execute(
                    """SELECT id::text, name, state, notes, created_at
                       FROM districts
                       WHERE id > %s
                       ORDER BY id
                       LIMIT %s""",
                    (start_after, limit),
                )
            else:
                cur.execute(
                    """SELECT id::text, name, state, notes, created_at
                       FROM districts
                       ORDER BY id
                       LIMIT %s""",
                    (limit,),
                )
            rows = cur.fetchall()
            items = [_row_to_dict(r) for r in rows]
            next_cursor = items[-1]["id"] if len(items) == limit else None
            return {"items": items, "next_cursor": next_cursor}
    except ReferenceDataError:
        raise
    except Exception as e:
        logger.exception("list_districts failed")
        raise ReferenceDataError(f"Database error: {e}") from e


def get_district(district_id: str) -> dict:
    try:
        with _get_conn() as conn:
            cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
            cur.execute(
                """SELECT id::text, name, state, notes, created_at
                   FROM districts WHERE id = %s""",
                (district_id,),
            )
            row = cur.fetchone()
            if not row:
                raise ReferenceDataError(f"District '{district_id}' not found")
            return _row_to_dict(row)
    except ReferenceDataError:
        raise
    except Exception as e:
        logger.exception("get_district failed")
        raise ReferenceDataError(f"Database error: {e}") from e


def create_district(data: dict) -> dict:
    try:
        with _get_conn() as conn:
            cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
            cur.execute(
                """INSERT INTO districts (name, state, notes, created_at)
                   VALUES (%(name)s, %(state)s, %(notes)s, %(created_at)s)
                   RETURNING id::text, name, state, notes, created_at""",
                {
                    "name": data["name"],
                    "state": data.get("state", "Andhra Pradesh"),
                    "notes": data.get("notes"),
                    "created_at": data.get("created_at", datetime.now(timezone.utc)),
                },
            )
            return _row_to_dict(cur.fetchone())
    except Exception as e:
        logger.exception("create_district failed")
        raise ReferenceDataError(f"Database error: {e}") from e


def update_district(district_id: str, data: dict) -> dict:
    sets = []
    params = {"id": district_id}
    for field in ("name", "state", "notes"):
        if field in data:
            sets.append(sql.Identifier(field).as_string(None) + f" = %({field})s")
            params[field] = data[field]
    if not sets:
        return get_district(district_id)
    query = sql.SQL(
        "UPDATE districts SET {sets} WHERE id = %(id)s "
        "RETURNING id::text, name, state, notes, created_at"
    ).format(sets=sql.SQL(", ").join(sql.SQL(s) for s in sets))
    try:
        with _get_conn() as conn:
            cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
            cur.execute(query, params)
            row = cur.fetchone()
            if not row:
                raise ReferenceDataError(f"District '{district_id}' not found")
            return _row_to_dict(row)
    except ReferenceDataError:
        raise
    except Exception as e:
        logger.exception("update_district failed")
        raise ReferenceDataError(f"Database error: {e}") from e


def delete_district(district_id: str) -> None:
    try:
        with _get_conn() as conn:
            cur = conn.cursor()
            cur.execute("DELETE FROM districts WHERE id = %s", (district_id,))
            if cur.rowcount == 0:
                raise ReferenceDataError(f"District '{district_id}' not found")
    except ReferenceDataError:
        raise
    except Exception as e:
        logger.exception("delete_district failed")
        raise ReferenceDataError(f"Database error: {e}") from e


# ── Ward Reference Data Sync ─────────────────────────────────────────────
def get_ward_defaults(district_id: str) -> dict:
    """Reads static/quarterly reference fields from Postgres (soil_type,
    avg_rainfall_mm, groundwater_depth_m) for a given district.

    The actual query depends on the reference table schema once loaded.
    Returns defaults that can be written into a Firestore ward_data doc.
    """
    try:
        with _get_conn() as conn:
            cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
            cur.execute(
                """SELECT soil_type, avg_rainfall_mm, groundwater_depth_m,
                          lat, lon
                   FROM ward_reference_data
                   WHERE district_id = %s
                   LIMIT 1""",
                (district_id,),
            )
            row = cur.fetchone()
            if not row:
                logger.warning(
                    "No ward reference data found for district %s", district_id
                )
                return {}
            return {k: v for k, v in dict(row).items() if v is not None}
    except Exception as e:
        logger.exception("get_ward_defaults failed")
        raise ReferenceDataError(f"Database error: {e}") from e


def sync_ward_defaults_to_firestore(ward_id: str, district_id: str) -> dict:
    """One-way sync: Postgres reference data → Firestore ward_data doc,
    only overwriting fields the ward doc doesn't already have a manual
    override for (i.e., field is currently null or absent)."""
    from app.firebase_client import db

    defaults = get_ward_defaults(district_id)
    if not defaults:
        raise ReferenceDataError(
            f"No reference data available in Postgres for district '{district_id}'"
        )

    snap = db.collection("ward_data").document(ward_id).get()
    if not snap.exists:
        raise ReferenceDataError(f"Ward '{ward_id}' not found in Firestore")

    existing = snap.to_dict() or {}
    updates = {}
    for field, value in defaults.items():
        if existing.get(field) is None:
            updates[field] = value

    if updates:
        updates["updated_at"] = datetime.now(timezone.utc)
        db.collection("ward_data").document(ward_id).update(updates)
        logger.info(
            "Synced %d fields from Postgres to Firestore ward '%s': %s",
            len(updates) - 1,
            ward_id,
            list(updates.keys()),
        )
    else:
        logger.info("Ward '%s' already has all fields set — no sync needed", ward_id)

    from app.firestore_utils import doc_to_dict

    return doc_to_dict(db.collection("ward_data").document(ward_id).get())


# ── Internal helpers ─────────────────────────────────────────────────────
def _row_to_dict(row) -> dict:
    d = dict(row)
    d["id"] = str(d.pop("id", ""))
    if d.get("created_at") and isinstance(d["created_at"], datetime):
        d["created_at"] = d["created_at"].replace(tzinfo=timezone.utc)
    return d
