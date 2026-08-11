import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))))
from _helpers import BaseHandler
from _db import get_db, now_iso, local_date_str

def get_quiz_id(path):
    parts = [p for p in path.split("?")[0].split("/") if p]
    try: return int(parts[3])
    except: return None

class handler(BaseHandler):
    def do_POST(self):
        quiz_id = get_quiz_id(self.path)
        if not quiz_id: return self.send_json({"error": "Quiz ID required."}, 400)
        db = get_db()
        now = now_iso()
        db.quizzes.update_one({"quiz_id": quiz_id}, {"$set": {"status": "LIVE", "quiz_date": local_date_str(), "updated_at": now}})
        self.send_json({"status": "Published", "quiz_status": "LIVE"})
