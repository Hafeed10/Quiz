import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from _helpers import BaseHandler, masked_phone
from _db import get_db

def get_attempt_id(path):
    parts = [p for p in path.split("?")[0].split("/") if p]
    try: return int(parts[3])
    except: return None

class handler(BaseHandler):
    def do_GET(self):
        attempt_id = get_attempt_id(self.path)
        if not attempt_id: return self.send_json({"error": "Attempt ID required."}, 400)
        db = get_db()
        a = db.attempts.find_one({"attempt_id": attempt_id})
        if not a: return self.send_json({"error": "Attempt not found."}, 404)

        # Enrich with participant photo
        p = db.participants.find_one({"participant_id": a.get("participant_id")})
        photo = p.get("photo", "") if p else ""
        phone = a.get("participant_phone", "")

        # Enrich answers with correct option details
        quiz = db.quizzes.find_one({"quiz_id": a["quiz_id"]})
        q_map = {q["question_id"]: q for q in (quiz.get("questions", []) if quiz else [])}
        answers = []
        for ans in a.get("answers", []):
            q = q_map.get(ans.get("question_id"), {})
            correct = next((o for o in q.get("options", []) if o.get("is_correct")), None)
            answers.append({
                "question_number": q.get("question_number"),
                "question_text": ans.get("question_text", q.get("question_text", "")),
                "selected_key": ans.get("selected_option_key"),
                "selected_text": ans.get("selected_option_text"),
                "is_correct": ans.get("is_correct", False),
                "correct_option": {"key": correct["option_key"], "text": correct["option_text"]} if correct else None,
            })

        self.send_json({
            "id": a["attempt_id"], "quiz_id": a["quiz_id"],
            "quiz_title": a.get("quiz_title", ""), "quiz_date": a.get("quiz_date", ""),
            "participant_name": a.get("participant_name", ""),
            "phone_number": phone,
            "masked_phone": masked_phone(phone) if phone else "****",
            "photo": photo,
            "status": a.get("status", ""), "score": a.get("score", 0),
            "started_at": a.get("started_at"), "submitted_at": a.get("submitted_at"),
            "submission_time_formatted": a.get("submitted_at", "—"),
            "answers": answers,
        })
