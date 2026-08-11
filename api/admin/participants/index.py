import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from _helpers import BaseHandler
from _db import get_db, local_date_str

def fmt_attempt(a):
    # Find quiz for this attempt
    return {
        "id": a["attempt_id"],
        "quiz_id": a["quiz_id"],
        "quiz_title": a.get("quiz_title", ""),
        "quiz_date": a.get("quiz_date", ""),
        "participant_name": a.get("participant_name", ""),
        "phone_number": a.get("participant_phone", ""),
        "masked_phone": a.get("participant_phone", "")[:2] + "****" + a.get("participant_phone", "")[-2:] if len(a.get("participant_phone","")) > 4 else "****",
        "photo": a.get("photo", ""),
        "status": a.get("status", ""),
        "score": a.get("score", 0),
        "started_at": a.get("started_at", a.get("created_at")),
        "submitted_at": a.get("submitted_at"),
        "submission_time_formatted": a.get("submitted_at", "—"),
        "answers": a.get("answers", []),
    }

class handler(BaseHandler):
    def do_GET(self):
        params = self.get_params()
        quiz_id = params.get("quiz_id")
        db = get_db()
        today = local_date_str()

        if quiz_id and str(quiz_id).upper() == "ALL":
            attempts = list(db.attempts.find({}, sort=[("submitted_at", -1)]))
            return self.send_json({
                "quiz_id": "ALL",
                "quiz_title": "All Quizzes (Combined Submissions)",
                "quiz_date": "All Dates",
                "attempts": [fmt_attempt(a) for a in attempts],
            })

        if quiz_id:
            quiz = db.quizzes.find_one({"quiz_id": int(quiz_id)})
        else:
            quiz = db.quizzes.find_one({"status": "LIVE"}) or \
                   db.quizzes.find_one({"quiz_date": today}) or \
                   db.quizzes.find_one({}, sort=[("quiz_date", -1)])

        if not quiz:
            return self.send_json({"quiz_id": None, "quiz_title": "No Active Quiz", "quiz_date": "—", "attempts": []})

        qid = quiz["quiz_id"]
        attempts = list(db.attempts.find({"quiz_id": qid}))
        # Enrich with photo from participants
        p_cache = {}
        for a in attempts:
            pid = a.get("participant_id")
            if pid not in p_cache:
                p = db.participants.find_one({"participant_id": pid})
                p_cache[pid] = p.get("photo", "") if p else ""
            a["photo"] = p_cache[pid]

        self.send_json({
            "quiz_id": qid,
            "quiz_title": quiz.get("title", ""),
            "quiz_date": quiz.get("quiz_date", ""),
            "attempts": [fmt_attempt(a) for a in attempts],
        })
