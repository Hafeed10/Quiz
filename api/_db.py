import pymongo
import os
from datetime import datetime, timezone as dt_timezone

MONGO_URI = os.environ.get(
    "MONGO_URI",
    "mongodb+srv://hafeexhafe_db_user:iHvYbQHm8c7shaBp@cluster0.rthyrwy.mongodb.net/daily_quiz?retryWrites=true&w=majority&appName=Cluster0"
)
MONGO_DB_NAME = os.environ.get("MONGO_DB_NAME", "daily_quiz")

_client = None

def get_db():
    global _client
    if _client is None:
        _client = pymongo.MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    return _client[MONGO_DB_NAME]

def next_id(collection_name):
    """Auto-increment counter using MongoDB counters collection."""
    db = get_db()
    result = db.counters.find_one_and_update(
        {"_id": collection_name},
        {"$inc": {"seq": 1}},
        upsert=True,
        return_document=pymongo.ReturnDocument.AFTER
    )
    return result["seq"]

def now_iso():
    return datetime.now(dt_timezone.utc).isoformat()

def now_str(fmt="%b %d, %Y - %I:%M %p"):
    from datetime import timezone as tz
    import pytz
    ist = pytz.timezone("Asia/Kolkata")
    return datetime.now(tz.utc).astimezone(ist).strftime(fmt)

def local_date_str():
    """Return today's date in IST as YYYY-MM-DD."""
    import pytz
    from datetime import timezone as tz
    ist = pytz.timezone("Asia/Kolkata")
    return datetime.now(tz.utc).astimezone(ist).strftime("%Y-%m-%d")

def local_time_str():
    """Return current IST time as HH:MM:SS."""
    import pytz
    from datetime import timezone as tz
    ist = pytz.timezone("Asia/Kolkata")
    return datetime.now(tz.utc).astimezone(ist).strftime("%H:%M:%S")
