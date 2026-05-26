#!/usr/bin/env python3
from pathlib import Path
from dotenv import load_dotenv
import os
import uuid
from datetime import datetime, timezone

# Ensure repo root env is loaded
HERE = Path(__file__).resolve().parent
load_dotenv(HERE.parent / ".env")

import sys
sys.path.insert(0, str(HERE.parent))

from pymongo import MongoClient
from auth import hash_password

MONGO_URL = os.environ.get("MONGO_URL")
DB_NAME = os.environ.get("DB_NAME")
ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "admin@example.com").lower()
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD")

if not (MONGO_URL and DB_NAME and ADMIN_PASSWORD):
    print("Missing MONGO_URL, DB_NAME, or ADMIN_PASSWORD in environment/.env")
    raise SystemExit(1)

client = MongoClient(MONGO_URL)
db = client[DB_NAME]

now = datetime.now(timezone.utc).isoformat()
new_hash = hash_password(ADMIN_PASSWORD)

res = db.users.update_one(
    {"email": ADMIN_EMAIL},
    {
        "$set": {
            "password_hash": new_hash,
            "updated_at": now,
        },
        "$setOnInsert": {
            "id": str(uuid.uuid4()),
            "email": ADMIN_EMAIL,
            "name": "Concierge Admin",
            "role": "admin",
            "created_at": now,
        },
    },
    upsert=True,
)

if res.matched_count:
    print(f"Updated password for existing admin {ADMIN_EMAIL}")
else:
    print(f"Inserted new admin {ADMIN_EMAIL}")

client.close()
