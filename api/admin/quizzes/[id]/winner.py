import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))))
from _helpers import BaseHandler
from _db import get_db

def get_quiz_id(path):
    parts = [p for p in path.split("?")[0].split("/") if p]
    try: return int(parts[3])
    except: return None

class handler(BaseHandler):
    def do_GET(self):
        quiz_id = get_quiz_id(self.path)
        if not quiz_id: return self.send_json({"error": "Quiz ID required."}, 400)
        db = get_db()
        quiz = db.quizzes.find_one({"quiz_id": quiz_id})
        if not quiz: return self.send_json({"error": "Quiz not found."}, 404)

        winner = db.attempts.find_one(
            {"quiz_id": quiz_id, "status": "COMPLETED"},
            sort=[("score", -1), ("submitted_at", 1)]
        )
        top = list(db.attempts.find({"quiz_id": quiz_id, "status": "COMPLETED"}, sort=[("score", -1), ("submitted_at", 1)]).limit(10))

        if not winner:
            return self.send_json({
                "winner_found": False,
                "message": "No completed attempts recorded yet for this quiz.",
                "criteria": "Highest score + Earliest submission timestamp",
                "top_candidates": []
            })

        self.send_json({
            "winner_found": True,
            "quiz_id": quiz_id,
            "quiz_title": quiz.get("title", ""),
            "quiz_date": quiz.get("quiz_date", ""),
            "criteria": "Highest score + Earliest submission timestamp",
            "winner": {
                "participant_id": winner["participant_id"],
                "name": winner["participant_name"],
                "masked_phone": winner.get("participant_phone", "")[-4:].zfill(4) if winner.get("participant_phone") else "****",
                "phone_number": winner.get("participant_phone", ""),
                "score": winner["score"], "max_score": 4,
                "submitted_at": winner.get("submitted_at", "—"),
            },
            "top_candidates": [
                {"rank": i+1, "name": a["participant_name"],
                 "masked_phone": a.get("participant_phone", "")[-4:] if a.get("participant_phone") else "****",
                 "score": a["score"], "submitted_at": a.get("submitted_at", "—")}
                for i, a in enumerate(top)
            ]
        })
