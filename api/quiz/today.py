import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from _helpers import BaseHandler, calc_dynamic_status, format_time_12h
from _db import get_db, local_date_str, local_time_str

def build_quiz_response(quiz, participant_id=None, db=None):
    status = quiz.get("status", "SCHEDULED")
    quiz_date = quiz.get("quiz_date", "")
    start = quiz.get("start_time", "10:00:00")
    end = quiz.get("end_time", "10:20:00")
    dynamic = calc_dynamic_status(status, quiz_date, start, end)

    # Strip correct answers from public questions
    questions = []
    for q in quiz.get("questions", []):
        options = [{"id": o.get("option_id", idx), "option_key": o["option_key"], "option_text": o["option_text"]}
                   for idx, o in enumerate(q.get("options", []))]
        questions.append({
            "id": q.get("question_id", q.get("id")),
            "question_number": q["question_number"],
            "question_text": q["question_text"],
            "options": options,
        })

    has_completed = False
    attempt_data = None
    if participant_id and db:
        att = db.attempts.find_one({"quiz_id": quiz["quiz_id"], "participant_id": int(participant_id)})
        if att:
            has_completed = True
            attempt_data = {"id": att["attempt_id"], "status": att.get("status"), "submitted_at": att.get("submitted_at")}

    return {
        "id": quiz["quiz_id"],
        "title": quiz.get("title", "Daily Reading Quiz"),
        "quiz_date": quiz_date,
        "start_time": start,
        "end_time": end,
        "duration_minutes": quiz.get("duration_minutes", 20),
        "passage_title": quiz.get("passage_title", ""),
        "passage_content": quiz.get("passage_content", ""),
        "instructions": quiz.get("instructions", ""),
        "status": status,
        "dynamic_status": dynamic,
        "questions": questions,
        "server_time": local_time_str(),
        "available": True,
        "has_completed": has_completed,
        "attempt": attempt_data,
    }

class handler(BaseHandler):
    def do_GET(self):
        params = self.get_params()
        participant_id = params.get("participant_id")
        db = get_db()
        today = local_date_str()

        quiz = db.quizzes.find_one({"status": "LIVE"})
        if not quiz:
            quiz = db.quizzes.find_one({"quiz_date": today, "status": {"$ne": "DRAFT"}})
        if not quiz:
            quiz = db.quizzes.find_one({"status": {"$ne": "DRAFT"}}, sort=[("quiz_date", -1)])

        if not quiz:
            return self.send_json({
                "available": False,
                "message": "Today's quiz is not currently available. Please check back later."
            })

        self.send_json(build_quiz_response(quiz, participant_id, db))
