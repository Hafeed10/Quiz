import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from _helpers import BaseHandler, normalize_phone, masked_phone
from _db import get_db, next_id, now_iso, local_date_str

class handler(BaseHandler):
    def do_POST(self):
        body = self.get_body()
        name = str(body.get("name", "")).strip()
        raw_phone = str(body.get("phone_number", "")).strip()
        photo = str(body.get("photo", "")).strip()

        if not name or len(name) < 2:
            return self.send_json({"error": "Name must be at least 2 characters."}, 400)
        phone = normalize_phone(raw_phone)
        if not phone or len(phone) < 7:
            return self.send_json({"error": "Please enter a valid phone number."}, 400)

        db = get_db()
        now = now_iso()

        # Find existing participant
        p = db.participants.find_one({"phone_number": phone})
        if not p:
            p = db.participants.find_one({"name": {"$regex": f"^{name}$", "$options": "i"}})

        is_new = False
        if not p:
            pid = next_id("participants")
            p = {
                "participant_id": pid,
                "name": name,
                "phone_number": phone,
                "masked_phone": masked_phone(phone),
                "photo": photo,
                "created_at": now,
                "updated_at": now,
            }
            db.participants.insert_one(p)
            is_new = True
        else:
            updates = {"updated_at": now}
            if name: updates["name"] = name
            if phone: updates["phone_number"] = phone
            if photo: updates["photo"] = photo
            updates["masked_phone"] = masked_phone(updates.get("phone_number", p["phone_number"]))
            db.participants.update_one({"participant_id": p["participant_id"]}, {"$set": updates})
            p.update(updates)

        # Check today's quiz and attempt
        today = local_date_str()
        today_quiz = db.quizzes.find_one({"status": "LIVE"}) or \
                     db.quizzes.find_one({"quiz_date": today, "status": {"$ne": "DRAFT"}})

        has_completed_today = False
        attempt_id = None
        today_quiz_id = None
        if today_quiz:
            today_quiz_id = today_quiz["quiz_id"]
            att = db.attempts.find_one({"quiz_id": today_quiz_id, "participant_id": p["participant_id"]})
            if att:
                has_completed_today = True
                attempt_id = att["attempt_id"]

        self.send_json({
            "success": True,
            "is_new": is_new,
            "participant": {
                "id": p["participant_id"],
                "name": p["name"],
                "phone_number": p["phone_number"],
                "masked_phone": masked_phone(p["phone_number"]),
                "photo": p.get("photo", ""),
            },
            "today_quiz_id": today_quiz_id,
            "has_completed_today": has_completed_today,
            "attempt_id": attempt_id,
        })
