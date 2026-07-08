from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException

from app.reference_data_service import (
    ReferenceDataError,
    list_districts as pg_list_districts,
    get_district as pg_get_district,
    create_district as pg_create_district,
    update_district as pg_update_district,
    delete_district as pg_delete_district,
)
from app.schemas import DistrictCreate, DistrictUpdate, DistrictOut
from app.auth import require_admin

router = APIRouter(prefix="/districts", tags=["Districts"])


def _pg_err(e: ReferenceDataError):
    raise HTTPException(status_code=404, detail=str(e))


@router.get("", response_model=dict)
def list_districts(limit: int = 50, start_after: str | None = None):
    try:
        return pg_list_districts(limit=limit, start_after=start_after)
    except ReferenceDataError as e:
        raise HTTPException(status_code=502, detail=str(e))


@router.get("/{district_id}", response_model=DistrictOut)
def get_district(district_id: str):
    try:
        return pg_get_district(district_id)
    except ReferenceDataError as e:
        _pg_err(e)


@router.post(
    "",
    response_model=DistrictOut,
    status_code=201,
    dependencies=[Depends(require_admin)],
)
def create_district(payload: DistrictCreate):
    data = payload.dict()
    data["created_at"] = datetime.now(timezone.utc)
    try:
        return pg_create_district(data)
    except ReferenceDataError as e:
        raise HTTPException(status_code=502, detail=str(e))


@router.patch(
    "/{district_id}", response_model=DistrictOut, dependencies=[Depends(require_admin)]
)
def update_district(district_id: str, payload: DistrictUpdate):
    try:
        return pg_update_district(district_id, payload.dict(exclude_none=True))
    except ReferenceDataError as e:
        _pg_err(e)


@router.delete("/{district_id}", status_code=204, dependencies=[Depends(require_admin)])
def delete_district(district_id: str):
    try:
        pg_delete_district(district_id)
    except ReferenceDataError as e:
        _pg_err(e)
