import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from _helpers import BaseHandler, normalize_phone, masked_phone
from _db import get_db

class handler(BaseHandler):
    def do_GET(self):
        params = self.get_params()
        phone = params.get("phone") or params.get("phone_number")
        participant_id = params.get("participant_id")

        db = get_db()

        p = None
        if participant_id:
            p = db.participants.find_one({"participant_id": int(participant_id)})
        elif phone:
            cleaned = normalize_phone(phone)
            if cleaned:
                p = db.participants.find_one({"phone_number": cleaned})

        # Next quiz info
        from _db import local_date_str
        from datetime import date, timedelta
        from _helpers import format_time_12h
        today = local_date_str()
        next_quiz_doc = db.quizzes.find_one(
            {"quiz_date": {"$gt": today}, "status": {"$nin": ["DRAFT"]}},
            sort=[("quiz_date", 1)]
        )
        if next_quiz_doc:
            start = format_time_12h(next_quiz_doc.get("start_time", "10:00:00"))
            end = format_time_12h(next_quiz_doc.get("end_time", "10:20:00"))
            next_quiz = {
                "quiz_id": next_quiz_doc["quiz_id"], "title": next_quiz_doc.get("title"),
                "date": next_quiz_doc["quiz_date"], "time": start, "end_time": end,
                "duration_minutes": next_quiz_doc.get("duration_minutes", 20),
                "window_text": f"{start} to {end}",
            }
        else:
            tomorrow = (date.today() + timedelta(days=1)).strftime("%Y-%m-%d")
            next_quiz = {"quiz_id": None, "title": "Daily Reading Quiz", "date": tomorrow,
                         "time": "10:00 AM", "end_time": "10:20 AM", "duration_minutes": 20, "window_text": "10:00 AM to 10:20 AM"}

        if not p:
            return self.send_json({"exists": False, "next_quiz": next_quiz, "attempts": [], "total_attempts": 0})

        attempts = list(db.attempts.find({"participant_id": p["participant_id"]}, sort=[("submitted_at", -1)]))
        attempts_data = [{
            "id": a["attempt_id"], "quiz_id": a["quiz_id"],
            "quiz_title": a.get("quiz_title", ""), "quiz_date": a.get("quiz_date", ""),
            "status": a.get("status", ""), "submitted_at": a.get("submitted_at", "—"),
        } for a in attempts]

        self.send_json({
            "exists": True,
            "participant": {
                "id": p["participant_id"], "name": p["name"],
                "phone_number": p["phone_number"],
                "masked_phone": masked_phone(p["phone_number"]),
                "photo": p.get("photo", ""),
            },
            "total_attempts": len(attempts),
            "completed_count": sum(1 for a in attempts if a.get("status") == "COMPLETED"),
            "next_quiz": next_quiz,
            "attempts": attempts_data,
        })
