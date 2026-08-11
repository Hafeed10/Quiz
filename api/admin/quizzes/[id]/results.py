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

        attempts = list(db.attempts.find({"quiz_id": quiz_id, "status": "COMPLETED"}))
        total = len(attempts)
        scores = [a["score"] for a in attempts]

        score_dist = {
            "4_points": sum(1 for s in scores if s == 4),
            "3_points": sum(1 for s in scores if s == 3),
            "2_points": sum(1 for s in scores if s == 2),
            "1_point":  sum(1 for s in scores if s == 1),
            "0_points": sum(1 for s in scores if s == 0),
        }

        questions = quiz.get("questions", [])
        q_analytics = []
        for q in sorted(questions, key=lambda x: x["question_number"]):
            qid = q["question_id"]
            correct_key = next((o["option_key"] for o in q["options"] if o.get("is_correct")), "—")
            total_ans = 0; correct_ans = 0
            for att in attempts:
                for ans in att.get("answers", []):
                    if ans["question_id"] == qid:
                        total_ans += 1
                        if ans.get("is_correct"): correct_ans += 1
            rate = round(correct_ans / total_ans * 100, 1) if total_ans > 0 else 0
            q_analytics.append({
                "question_id": qid, "question_number": q["question_number"],
                "question_text": q["question_text"],
                "correct_option_key": correct_key,
                "total_answers": total_ans, "correct_answers": correct_ans,
                "accuracy_rate": rate,
            })

        self.send_json({
            "quiz_id": quiz_id, "quiz_title": quiz.get("title", ""),
            "total_completed": total, "score_distribution": score_dist,
            "questions_analytics": q_analytics,
        })
