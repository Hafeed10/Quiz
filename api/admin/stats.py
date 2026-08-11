import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from _helpers import BaseHandler, calc_dynamic_status, format_time_12h
from _db import get_db, local_date_str

class handler(BaseHandler):
    def do_GET(self):
        db = get_db()
        today = local_date_str()

        total_participants = db.participants.count_documents({})
        total_quizzes = db.quizzes.count_documents({})

        today_quiz = db.quizzes.find_one({"status": "LIVE"}) or \
                     db.quizzes.find_one({"quiz_date": today}) or \
                     db.quizzes.find_one({}, sort=[("quiz_date", -1)])

        today_stats = {
            "quiz_id": None, "title": "No Active Quiz",
            "quiz_date": today, "status": "NO_QUIZ",
            "start_time": None, "end_time": None,
            "participants_count": 0, "completed_count": 0,
            "average_score": 0, "highest_score": 0,
        }

        if today_quiz:
            qid = today_quiz["quiz_id"]
            attempts = list(db.attempts.find({"quiz_id": qid}))
            completed = [a for a in attempts if a.get("status") == "COMPLETED"]
            scores = [a["score"] for a in completed]
            avg_score = round(sum(scores) / len(scores), 1) if scores else 0
            dyn = calc_dynamic_status(
                today_quiz.get("status"), today_quiz.get("quiz_date"),
                today_quiz.get("start_time", "10:00:00"), today_quiz.get("end_time", "10:20:00")
            )
            today_stats = {
                "quiz_id": qid,
                "title": today_quiz.get("title", ""),
                "quiz_date": today_quiz.get("quiz_date", today),
                "status": dyn,
                "start_time": today_quiz.get("start_time"),
                "end_time": today_quiz.get("end_time"),
                "participants_count": len(attempts),
                "completed_count": len(completed),
                "average_score": avg_score,
                "highest_score": max(scores, default=0),
            }

        self.send_json({
            "total_participants": total_participants,
            "total_quizzes": total_quizzes,
            "today_stats": today_stats,
        })
