import os
import sys
import shutil
from pathlib import Path

# Add backend directory to sys.path
BASE_DIR = Path(__file__).resolve().parent.parent / "frontend" / "src" / "backend"
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

# Ensure /tmp/db.sqlite3 exists on Vercel read-only filesystem
TMP_DB = Path("/tmp/db.sqlite3")
ORIG_DB = BASE_DIR / "db.sqlite3"

if not TMP_DB.exists() and ORIG_DB.exists():
    try:
        shutil.copy2(ORIG_DB, TMP_DB)
    except Exception as e:
        print(f"Failed to copy DB to /tmp: {e}")

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "quiz_backend.settings")

from django.core.wsgi import get_wsgi_application

app = get_wsgi_application()
