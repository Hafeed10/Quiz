import os
import threading
from datetime import datetime
import pymongo
from django.utils import timezone

try:
    from django.conf import settings
    MONGO_URI = getattr(settings, 'MONGO_URI', "mongodb+srv://hafeexhafe_db_user:iHvYbQHm8c7shaBp@cluster0.rthyrwy.mongodb.net/daily_quiz?retryWrites=true&w=majority&appName=Cluster0")
    MONGO_DB_NAME = getattr(settings, 'MONGO_DB_NAME', 'daily_quiz')
except Exception:
    MONGO_URI = "mongodb+srv://hafeexhafe_db_user:iHvYbQHm8c7shaBp@cluster0.rthyrwy.mongodb.net/daily_quiz?retryWrites=true&w=majority&appName=Cluster0"
    MONGO_DB_NAME = "daily_quiz"

_client = None

def get_mongo_db():
    global _client
    if _client is None:
        try:
            _client = pymongo.MongoClient(MONGO_URI, serverSelectionTimeoutMS=4000)
        except Exception as e:
            print(f"[MongoDB] Connection error: {e}")
            return None
    try:
        return _client[MONGO_DB_NAME]
    except Exception as e:
        print(f"[MongoDB] DB access error: {e}")
        return None

def ping_mongo():
    try:
        db = get_mongo_db()
        if db is not None:
            return db.command('ping')
        return None
    except Exception as e:
        print(f"[MongoDB] Ping failed: {e}")
        return None

def _sync_participant_worker(participant_id, name, phone_number, masked_phone, created_at):
    try:
        db = get_mongo_db()
        if db is None:
            return
        doc = {
            "participant_id": participant_id,
            "name": name,
            "phone_number": phone_number,
            "masked_phone": masked_phone,
            "updated_at": timezone.localtime().isoformat()
        }
        db.participants.update_one(
            {"participant_id": participant_id},
            {"$set": doc, "$setOnInsert": {"created_at": created_at.isoformat() if created_at else timezone.localtime().isoformat()}},
            upsert=True
        )
    except Exception as e:
        print(f"[MongoDB] Failed to sync participant {participant_id}: {e}")

def sync_participant_to_mongo(participant):
    t = threading.Thread(
        target=_sync_participant_worker,
        args=(participant.id, participant.name, participant.phone_number, participant.masked_phone, getattr(participant, 'created_at', None)),
        daemon=True
    )
    t.start()

def _sync_quiz_worker(quiz_id):
    try:
        from quiz_api.models import Quiz
        quiz = Quiz.objects.filter(id=quiz_id).first()
        if not quiz:
            return
        db = get_mongo_db()
        if db is None:
            return
        
        questions_data = []
        for q in quiz.questions.all().order_by('question_number'):
            options_data = []
            for opt in q.options.all().order_by('option_key'):
                options_data.append({
                    "option_key": opt.option_key,
                    "option_text": opt.option_text,
                    "is_correct": opt.is_correct
                })
            questions_data.append({
                "question_id": q.id,
                "question_number": q.question_number,
                "question_text": q.question_text,
                "options": options_data
            })

        completed_count = quiz.attempts.filter(status='COMPLETED').count()
        participants_count = quiz.attempts.count()
        winner = quiz.attempts.filter(status='COMPLETED').order_by('-score', 'submitted_at').first()

        doc = {
            "quiz_id": quiz.id,
            "title": quiz.title,
            "quiz_date": quiz.quiz_date.strftime('%Y-%m-%d'),
            "start_time": quiz.start_time.strftime('%H:%M:%S') if quiz.start_time else "10:00:00",
            "end_time": quiz.end_time.strftime('%H:%M:%S') if quiz.end_time else "10:20:00",
            "duration_minutes": quiz.duration_minutes,
            "passage_title": quiz.passage_title,
            "passage_content": quiz.passage_content,
            "instructions": quiz.instructions,
            "status": quiz.status,
            "dynamic_status": quiz.dynamic_status,
            "questions_count": len(questions_data),
            "questions": questions_data,
            "participants_count": participants_count,
            "completed_count": completed_count,
            "winner_name": winner.participant.name if winner else None,
            "updated_at": timezone.localtime().isoformat()
        }
        db.quizzes.update_one(
            {"quiz_id": quiz.id},
            {"$set": doc, "$setOnInsert": {"created_at": quiz.created_at.isoformat() if quiz.created_at else timezone.localtime().isoformat()}},
            upsert=True
        )

        # Update Admin Platform Analytics collection
        from quiz_api.models import Participant
        db.admin_analytics.update_one(
            {"analytics_id": "platform_summary"},
            {"$set": {
                "total_quizzes": Quiz.objects.count(),
                "total_participants": Participant.objects.count(),
                "last_synced_at": timezone.localtime().isoformat()
            }},
            upsert=True
        )
    except Exception as e:
        print(f"[MongoDB] Failed to sync quiz {quiz_id}: {e}")

def sync_quiz_to_mongo(quiz):
    quiz_id = getattr(quiz, 'id', quiz)
    t = threading.Thread(target=_sync_quiz_worker, args=(quiz_id,), daemon=True)
    t.start()

def delete_quiz_from_mongo_sync(quiz_id):
    try:
        db = get_mongo_db()
        if db is not None:
            db.quizzes.delete_one({"quiz_id": quiz_id})
            db.attempts.delete_many({"quiz_id": quiz_id})
    except Exception as e:
        print(f"[MongoDB] Failed to delete quiz {quiz_id}: {e}")

def delete_quiz_from_mongo(quiz_id):
    delete_quiz_from_mongo_sync(quiz_id)

def delete_participant_from_mongo_sync(participant_id):
    try:
        db = get_mongo_db()
        if db is not None:
            db.participants.delete_one({"participant_id": participant_id})
            db.attempts.delete_many({"participant_id": participant_id})
    except Exception as e:
        print(f"[MongoDB] Failed to delete participant {participant_id}: {e}")

def _sync_attempt_worker(attempt_id):
    try:
        from quiz_api.models import Attempt
        attempt = Attempt.objects.filter(id=attempt_id).select_related('quiz', 'participant').first()
        if not attempt:
            return
        db = get_mongo_db()
        if db is None:
            return
        
        answers_data = []
        for ans in attempt.answers.all().select_related('question', 'selected_option'):
            answers_data.append({
                "question_id": ans.question.id,
                "question_text": ans.question.question_text,
                "selected_option_key": ans.selected_option.option_key if ans.selected_option else None,
                "selected_option_text": ans.selected_option.option_text if ans.selected_option else None,
                "is_correct": ans.is_correct
            })

        doc = {
            "attempt_id": attempt.id,
            "quiz_id": attempt.quiz.id,
            "quiz_title": attempt.quiz.title,
            "quiz_date": attempt.quiz.quiz_date.strftime('%Y-%m-%d'),
            "participant_id": attempt.participant.id,
            "participant_name": attempt.participant.name,
            "participant_phone": attempt.participant.phone_number,
            "score": attempt.score,
            "max_score": 4,
            "status": attempt.status,
            "answers": answers_data,
            "submitted_at": attempt.submitted_at.isoformat() if attempt.submitted_at else None,
            "updated_at": timezone.localtime().isoformat()
        }
        db.attempts.update_one(
            {"attempt_id": attempt.id},
            {"$set": doc, "$setOnInsert": {"created_at": attempt.created_at.isoformat() if attempt.created_at else timezone.localtime().isoformat()}},
            upsert=True
        )
    except Exception as e:
        print(f"[MongoDB] Failed to sync attempt {attempt_id}: {e}")

def sync_attempt_to_mongo(attempt):
    attempt_id = getattr(attempt, 'id', attempt)
    t = threading.Thread(target=_sync_attempt_worker, args=(attempt_id,), daemon=True)
    t.start()

