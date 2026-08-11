import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from _helpers import BaseHandler, masked_phone
from _db import get_db
from collections import defaultdict

class handler(BaseHandler):
    def do_GET(self):
        db = get_db()
        participants = list(db.participants.find({}))
        all_attempts = list(db.attempts.find({"status": "COMPLETED"}))

        # Group attempts by participant name (same logic as Django)
        grouped = defaultdict(list)
        for p in participants:
            key = p["name"].strip().lower()
            grouped[key].append(p)

        # Build attempt lookup: participant_id -> list of attempts
        att_by_pid = defaultdict(list)
        for a in all_attempts:
            att_by_pid[a["participant_id"]].append(a)

        results = []
        for key, p_list in grouped.items():
            # Primary = most attempts
            p_list.sort(key=lambda x: len(att_by_pid.get(x["participant_id"], [])), reverse=True)
            primary = p_list[0]

            # Collect all completed attempts across linked participants, deduplicate by quiz_id
            seen_quiz_ids = set()
            all_completed = []
            for p in p_list:
                for a in att_by_pid.get(p["participant_id"], []):
                    if a["quiz_id"] not in seen_quiz_ids:
                        seen_quiz_ids.add(a["quiz_id"])
                        all_completed.append(a)

            all_completed.sort(key=lambda x: (x.get("quiz_date", ""), x.get("submitted_at", "")), reverse=True)

            total_quizzes = len(all_completed)
            total_score = sum(a.get("score", 0) for a in all_completed)
            max_possible = total_quizzes * 4
            avg_score = round(total_score / total_quizzes, 1) if total_quizzes > 0 else 0
            accuracy = round((total_score / max_possible) * 100, 1) if max_possible > 0 else 0

            daily = [{
                "attempt_id": a["attempt_id"], "quiz_id": a["quiz_id"],
                "quiz_title": a.get("quiz_title", ""), "quiz_date": a.get("quiz_date", ""),
                "score": a.get("score", 0), "max_score": 4,
                "status": a.get("status", ""), "submitted_at": a.get("submitted_at"),
                "submission_time": a.get("submitted_at", "—"),
            } for a in all_completed]

            latest = all_completed[0] if all_completed else None
            results.append({
                "id": primary["participant_id"], "name": primary["name"],
                "phone_number": primary["phone_number"],
                "masked_phone": masked_phone(primary["phone_number"]),
                "photo": primary.get("photo", ""),
                "total_quizzes_taken": total_quizzes,
                "total_score": total_score, "max_possible_score": max_possible,
                "average_score": avg_score, "accuracy_percent": accuracy,
                "last_active": latest["submitted_at"][:10] if (latest and latest.get("submitted_at")) else "—",
                "daily_breakdown": daily,
                "created_at": primary.get("created_at"),
            })

        results.sort(key=lambda x: (x["total_score"], x["accuracy_percent"], x["total_quizzes_taken"]), reverse=True)
        for i, r in enumerate(results):
            r["rank"] = i + 1

        self.send_json({"total_participants": len(results), "participants": results})
