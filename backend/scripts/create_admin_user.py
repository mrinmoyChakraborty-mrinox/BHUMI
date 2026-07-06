"""
One-shot admin user creation — creates a Firebase Auth user by email/password
AND the matching rsk_officers profile with role: "admin" in one step.

Usage:
    python -m scripts.create_admin_user --email admin@example.com --password s3cret --name "Admin User"

Requires:
    - Firebase service account JSON configured in .env
    - The environment to be set up (pip install, etc.)

Outputs the Firebase Auth UID on success.
"""

import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import argparse
from datetime import datetime, timezone

from firebase_admin import auth as firebase_auth

from app.firebase_client import db, set_admin_claim


def main():
    parser = argparse.ArgumentParser(
        description="Create a Firebase Auth user with admin role in one step."
    )
    parser.add_argument("--email", required=True, help="Admin email address")
    parser.add_argument("--password", required=True, help="Admin password")
    parser.add_argument("--name", default="Admin", help="Display name")
    args = parser.parse_args()

    # Step 1: Create Firebase Auth user
    try:
        user = firebase_auth.create_user(
            email=args.email,
            password=args.password,
            display_name=args.name,
        )
        uid = user.uid
        print(f"Firebase Auth user created: {uid} ({args.email})")
    except firebase_auth.EmailAlreadyExistsError:
        # Fetch existing user by email
        user = firebase_auth.get_user_by_email(args.email)
        uid = user.uid
        print(f"Firebase Auth user already exists: {uid} ({args.email})")

    # Step 2: Set admin custom claim
    set_admin_claim(uid, True)
    print(f"Admin custom claim set on {uid}")

    # Step 3: Create Firestore profile
    profile = {
        "name": args.name,
        "ward_id": None,
        "role": "admin",
        "created_at": datetime.now(timezone.utc),
    }
    db.collection("rsk_officers").document(uid).set(profile)
    print(f"Firestore rsk_officers profile created for {uid}")

    print(f"\nDone. You can now log in with: {args.email} / {args.password}")


if __name__ == "__main__":
    main()
