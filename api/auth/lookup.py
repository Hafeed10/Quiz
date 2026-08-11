import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from _helpers import BaseHandler, normalize_phone, masked_phone, calc_dynamic_status, format_time_12h
from _db import get_db, local_date_str

def get_next_quiz_info(db):
    today = local_date_str()
    quiz = db.quizzes.find_one(
        {"quiz_date": {"$gt": today}, "status": {"$nin": ["DRAFT"]}},
        sort=[("quiz_date", 1), ("start_time", 1)]
    )
    if quiz:
        start = format_time_12h(quiz.get("start_time", "10:00:00"))
        end = format_time_12h(quiz.get("end_time", "10:20:00"))
        return {
            "quiz_id": quiz["quiz_id"],
            "title": quiz.get("title", "Daily Reading Quiz"),
            "date": quiz["quiz_date"],
            "time": start, "end_time": end,
            "duration_minutes": quiz.get("duration_minutes", 20),
            "window_text": f"{start} to {end}",
        }
    from datetime import date, timedelta
    tomorrow = (date.today() + timedelta(days=1)).strftime("%Y-%m-%d")
    return {
        "quiz_id": None, "title": "Daily Reading Quiz",
        "date": tomorrow, "time": "10:00 AM", "end_time": "10:20 AM",
        "duration_minutes": 20, "window_text": "10:00 AM to 10:20 AM",
    }

class handler(BaseHandler):
    def do_GET(self):
        params = self.get_params()
        phone = params.get("phone") or params.get("phone_number", "")
        cleaned = normalize_phone(phone)
        if not cleaned:
            return self.send_json({"error": "Phone number is required."}, 400)

        db = get_db()
        next_quiz = get_next_quiz_info(db)
        p = db.participants.find_one({"phone_number": cleaned})
        if not p:
            return self.send_json({"exists": False, "next_quiz": next_quiz, "history": []})

        attempts = list(db.attempts.find(
            {"participant_id": p["participant_id"]},
            sort=[("submitted_at", -1)]
        ))
        history = [{
            "id": a["attempt_id"],
            "quiz_id": a["quiz_id"],
            "quiz_title": a.get("quiz_title", ""),
            "quiz_date": a.get("quiz_date", ""),
            "status": a.get("status", ""),
            "submitted_at": a.get("submitted_at", "—"),
        } for a in attempts]

        self.send_json({
            "exists": True,
            "id": p["participant_id"],
            "name": p["name"],
            "masked_phone": masked_phone(p["phone_number"]),
            "phone_number": p["phone_number"],
            "photo": p.get("photo", ""),
            "total_attempts": len(attempts),
            "next_quiz": next_quiz,
            "history": history,
        })

    def do_POST(self):
        body = self.get_body()
        phone = normalize_phone(body.get("phone") or body.get("phone_number", ""))
        if not phone:
            return self.send_json({"error": "Phone number is required."}, 400)
        db = get_db()
        next_quiz = get_next_quiz_info(db)
        p = db.participants.find_one({"phone_number": phone})
        if p:
            history = list(db.attempts.find({"participant_id": p["participant_id"]}, sort=[("submitted_at", -1)]))
            return self.send_json({
                "exists": True,
                "id": p["participant_id"],
                "name": p["name"],
                "masked_phone": masked_phone(p["phone_number"]),
                "phone_number": p["phone_number"],
                "photo": p.get("photo", ""),
                "total_attempts": len(history),
                "next_quiz": next_quiz,
                "history": [],
            })
        return self.send_json({"exists": False, "next_quiz": next_quiz, "history": []})
