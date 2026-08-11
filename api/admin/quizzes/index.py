import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from _helpers import BaseHandler, calc_dynamic_status
from _db import get_db, next_id, now_iso, local_date_str

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
        "id": qid,
        "title": quiz.get("title", ""),
        "quiz_date": quiz.get("quiz_date", ""),
        "start_time": quiz.get("start_time"),
        "end_time": quiz.get("end_time"),
        "duration_minutes": quiz.get("duration_minutes", 20),
        "passage_title": quiz.get("passage_title", ""),
        "passage_content": quiz.get("passage_content", ""),
        "instructions": quiz.get("instructions", ""),
        "status": quiz.get("status"),
        "dynamic_status": dyn,
        "questions": quiz.get("questions", []),
        "participants_count": len(attempts),
        "completed_count": len(completed),
        "average_score": round(sum(scores) / len(scores), 1) if scores else None,
        "winner_name": winner["participant_name"] if winner else None,
        "created_at": quiz.get("created_at"),
        "updated_at": quiz.get("updated_at"),
    }

class handler(BaseHandler):
    def do_GET(self):
        db = get_db()
        quizzes = list(db.quizzes.find({}, sort=[("quiz_date", -1), ("created_at", -1)]))
        self.send_json([format_quiz(q, db) for q in quizzes])

    def do_POST(self):
        body = self.get_body()
        now = now_iso()
        today = local_date_str()
        db = get_db()

        questions_raw = body.get("questions", [])
        if len(questions_raw) != 4:
            return self.send_json({"error": f"A quiz must contain exactly 4 questions (received {len(questions_raw)})."}, 400)

        # Validate questions
        built_questions = []
        for idx, q in enumerate(questions_raw):
            q_num = q.get("question_number", idx + 1)
            q_text = str(q.get("question_text", "")).strip()
            if not q_text:
                return self.send_json({"error": f"Question {q_num} text cannot be empty."}, 400)
            opts = q.get("options", [])
            if len(opts) != 4:
                return self.send_json({"error": f"Question {q_num} must have exactly 4 options."}, 400)
            correct_count = sum(1 for o in opts if o.get("is_correct"))
            if correct_count != 1:
                return self.send_json({"error": f"Question {q_num} must have exactly 1 correct answer."}, 400)

            q_id = next_id("questions")
            built_opts = []
            for oi, opt in enumerate(opts):
                opt_id = next_id("options")
                built_opts.append({
                    "option_id": opt_id,
                    "option_key": opt.get("option_key", ["A","B","C","D"][oi]),
                    "option_text": str(opt.get("option_text", "")).strip(),
                    "is_correct": bool(opt.get("is_correct", False)),
                })
            built_questions.append({
                "question_id": q_id,
                "question_number": q_num,
                "question_text": q_text,
                "options": built_opts,
            })

        quiz_id = next_id("quizzes")
        quiz = {
            "quiz_id": quiz_id,
            "title": str(body.get("title", "Daily Reading Quiz")).strip(),
            "quiz_date": str(body.get("quiz_date", today)),
            "start_time": str(body.get("start_time", "10:00:00")),
            "end_time": str(body.get("end_time", "10:20:00")),
            "duration_minutes": int(body.get("duration_minutes", 20)),
            "passage_title": str(body.get("passage_title", "Reading Passage")).strip(),
            "passage_content": str(body.get("passage_content", "")).strip(),
            "instructions": str(body.get("instructions", "Read the passage carefully before answering.")).strip(),
            "status": str(body.get("status", "SCHEDULED")),
            "questions": built_questions,
            "participants_count": 0,
            "completed_count": 0,
            "winner_name": None,
            "created_at": now,
            "updated_at": now,
        }
        db.quizzes.insert_one(quiz)
        self.send_json(format_quiz(quiz, db), 201)
