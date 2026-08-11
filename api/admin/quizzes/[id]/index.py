import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))))
from _helpers import BaseHandler, calc_dynamic_status
from _db import get_db, next_id, now_iso

def get_quiz_id_from_path(path):
    parts = [p for p in path.split("?")[0].split("/") if p]
    # e.g. ['api', 'admin', 'quizzes', '5']
    try:
        return int(parts[3])
    except (IndexError, ValueError):
        return None

def format_quiz(quiz, db):
    qid = quiz["quiz_id"]
    attempts = list(db.attempts.find({"quiz_id": qid}))
    completed = [a for a in attempts if a.get("status") == "COMPLETED"]
    scores = [a["score"] for a in completed]
    winner = db.attempts.find_one({"quiz_id": qid, "status": "COMPLETED"}, sort=[("score", -1), ("submitted_at", 1)])
    dyn = calc_dynamic_status(
        quiz.get("status"), quiz.get("quiz_date"),
        quiz.get("start_time", "10:00:00"), quiz.get("end_time", "10:20:00")
    )
    return {
        "id": qid, "title": quiz.get("title", ""),
        "quiz_date": quiz.get("quiz_date", ""),
        "start_time": quiz.get("start_time"), "end_time": quiz.get("end_time"),
        "duration_minutes": quiz.get("duration_minutes", 20),
        "passage_title": quiz.get("passage_title", ""),
        "passage_content": quiz.get("passage_content", ""),
        "instructions": quiz.get("instructions", ""),
        "status": quiz.get("status"), "dynamic_status": dyn,
        "questions": quiz.get("questions", []),
        "participants_count": len(attempts), "completed_count": len(completed),
        "average_score": round(sum(scores) / len(scores), 1) if scores else None,
        "winner_name": winner["participant_name"] if winner else None,
        "created_at": quiz.get("created_at"), "updated_at": quiz.get("updated_at"),
    }

class handler(BaseHandler):
    def do_GET(self):
        quiz_id = get_quiz_id_from_path(self.path)
        if not quiz_id:
            return self.send_json({"error": "Quiz ID required."}, 400)
        db = get_db()
        quiz = db.quizzes.find_one({"quiz_id": quiz_id})
        if not quiz:
            return self.send_json({"error": "Quiz not found."}, 404)
        self.send_json(format_quiz(quiz, db))

    def do_PUT(self):
        quiz_id = get_quiz_id_from_path(self.path)
        if not quiz_id:
            return self.send_json({"error": "Quiz ID required."}, 400)
        db = get_db()
        quiz = db.quizzes.find_one({"quiz_id": quiz_id})
        if not quiz:
            return self.send_json({"error": "Quiz not found."}, 404)
        body = self.get_body()
        now = now_iso()
        updates = {"updated_at": now}
        for field in ("title", "quiz_date", "start_time", "end_time", "duration_minutes",
                      "passage_title", "passage_content", "instructions", "status"):
            if field in body:
                updates[field] = body[field]

        questions_raw = body.get("questions")
        if questions_raw is not None:
            if len(questions_raw) != 4:
                return self.send_json({"error": f"Must have exactly 4 questions (got {len(questions_raw)})."}, 400)
            built = []
            for idx, q in enumerate(questions_raw):
                q_id = q.get("question_id") or next_id("questions")
                opts = q.get("options", [])
                built_opts = []
                for oi, opt in enumerate(opts):
                    opt_id = opt.get("option_id") or next_id("options")
                    built_opts.append({
                        "option_id": opt_id,
                        "option_key": opt.get("option_key", ["A","B","C","D"][oi]),
                        "option_text": str(opt.get("option_text","")).strip(),
                        "is_correct": bool(opt.get("is_correct", False)),
                    })
                built.append({
                    "question_id": q_id,
                    "question_number": q.get("question_number", idx+1),
                    "question_text": str(q.get("question_text","")).strip(),
                    "options": built_opts,
                })
            updates["questions"] = built

        db.quizzes.update_one({"quiz_id": quiz_id}, {"$set": updates})
        quiz.update(updates)
        self.send_json(format_quiz(quiz, db))

    def do_DELETE(self):
        quiz_id = get_quiz_id_from_path(self.path)
        if not quiz_id:
            return self.send_json({"error": "Quiz ID required."}, 400)
        db = get_db()
        db.quizzes.delete_one({"quiz_id": quiz_id})
        db.attempts.delete_many({"quiz_id": quiz_id})
        self.send_json({"success": True}, 204)
