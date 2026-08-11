import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from _helpers import BaseHandler, calc_dynamic_status
from _db import get_db, next_id, now_iso, local_date_str

class handler(BaseHandler):
    def do_POST(self):
        # Extract quiz id from path: /api/quiz/[id]/submit
        parts = [p for p in self.path.split("?")[0].split("/") if p]
        # parts: ['api', 'quiz', '5', 'submit']
        try:
            quiz_id = int(parts[2])
        except (IndexError, ValueError):
            return self.send_json({"error": "Invalid quiz ID."}, 400)

        body = self.get_body()
        participant_id = body.get("participant_id")
        answers_raw = body.get("answers", {})  # {question_id: option_id} — but now option_key

        if not participant_id:
            return self.send_json({"error": "participant_id is required."}, 400)
        if not answers_raw:
            return self.send_json({"error": "answers are required."}, 400)

        db = get_db()

        # Get quiz
        quiz = db.quizzes.find_one({"quiz_id": quiz_id})
        if not quiz:
            return self.send_json({"error": "Quiz not found."}, 404)

        # Check quiz status
        dynamic = calc_dynamic_status(
            quiz.get("status"), quiz.get("quiz_date"),
            quiz.get("start_time", "10:00:00"), quiz.get("end_time", "10:20:00")
        )
        if dynamic == "DRAFT":
            return self.send_json({"error": "This quiz is not published."}, 400)
        if dynamic == "SCHEDULED":
            return self.send_json({"error": "Today's quiz has not started yet."}, 400)
        if dynamic in ("ENDED", "ARCHIVED"):
            return self.send_json({"error": "Today's quiz has ended. Submissions are closed."}, 400)

        # Check participant
        participant_id = int(participant_id)
        p = db.participants.find_one({"participant_id": participant_id})
        if not p:
            return self.send_json({"error": "Participant not found."}, 400)

        # Anti-duplicate
        existing = db.attempts.find_one({"quiz_id": quiz_id, "participant_id": participant_id})
        if existing:
            return self.send_json({"error": "You have already completed today's quiz. Only one attempt is permitted."}, 400)

        # Validate answers against quiz questions
        questions = quiz.get("questions", [])
        if len(questions) != 4:
            return self.send_json({"error": f"Quiz configuration error: Expected 4 questions, found {len(questions)}."}, 400)

        q_ids = {str(q["question_id"]) for q in questions}
        sub_ids = {str(k) for k in answers_raw.keys()}
        if q_ids != sub_ids:
            missing = len(q_ids - sub_ids)
            return self.send_json({"error": f"Please answer all four questions ({missing} unanswered)."}, 400)

        # Score answers
        now = now_iso()
        total_score = 0
        answers_data = []
        q_map = {str(q["question_id"]): q for q in questions}

        for q_id_str, selected_key in answers_raw.items():
            q = q_map.get(str(q_id_str))
            if not q:
                continue
            # selected_key is option_key (A/B/C/D) OR option_id (int from old system)
            # Support both formats
            correct_opt = next((o for o in q["options"] if o.get("is_correct")), None)
            selected_opt = None

            if isinstance(selected_key, int) or str(selected_key).isdigit():
                # Old system: option_id based — find by position
                opt_idx = int(selected_key) % len(q["options"]) if q["options"] else 0
                selected_opt = next(
                    (o for o in q["options"] if o.get("option_id") == int(selected_key)),
                    q["options"][0] if q["options"] else None
                )
            else:
                selected_opt = next((o for o in q["options"] if o["option_key"] == str(selected_key).upper()), None)

            is_correct = False
            if selected_opt and correct_opt:
                is_correct = selected_opt["option_key"] == correct_opt["option_key"]
            if is_correct:
                total_score += 1

            answers_data.append({
                "question_id": q["question_id"],
                "question_text": q["question_text"],
                "selected_option_key": selected_opt["option_key"] if selected_opt else None,
                "selected_option_text": selected_opt["option_text"] if selected_opt else None,
                "is_correct": is_correct,
            })

        # Save attempt
        attempt_id = next_id("attempts")
        attempt = {
            "attempt_id": attempt_id,
            "quiz_id": quiz_id,
            "quiz_title": quiz.get("title", ""),
            "quiz_date": quiz.get("quiz_date", ""),
            "participant_id": participant_id,
            "participant_name": p["name"],
            "participant_phone": p["phone_number"],
            "score": total_score,
            "max_score": 4,
            "status": "COMPLETED",
            "answers": answers_data,
            "submitted_at": now,
            "created_at": now,
        }
        db.attempts.insert_one(attempt)

        # Update quiz counts
        db.quizzes.update_one(
            {"quiz_id": quiz_id},
            {"$inc": {"participants_count": 1, "completed_count": 1}, "$set": {"updated_at": now}}
        )

        self.send_json({
            "success": True,
            "attempt_id": attempt_id,
            "status": "COMPLETED",
            "message": "Congratulations! Your answers have been submitted successfully. Thank you for participating in today's quiz.",
        }, 201)
