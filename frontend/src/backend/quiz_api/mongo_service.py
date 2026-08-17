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


def sync_from_mongo_to_sqlite():
    """
    Sync saved database records from MongoDB Atlas into Django ORM / SQLite database
    so that all saved MongoDB Atlas data is displayed in the UI.
    """
    try:
        db = get_mongo_db()
        if db is None:
            return

        from quiz_api.models import Participant, Quiz, Question, QuestionOption, Attempt, Answer
        from django.utils import timezone
        from datetime import datetime, time

        # 1. Sync Quizzes & Questions
        mongo_quizzes = list(db.quizzes.find({}))
        for q_doc in mongo_quizzes:
            quiz_id = q_doc.get('quiz_id')
            if not quiz_id:
                continue

            q_date_str = q_doc.get('quiz_date')
            try:
                q_date = datetime.strptime(q_date_str, '%Y-%m-%d').date() if isinstance(q_date_str, str) else q_date_str
            except Exception:
                q_date = timezone.localdate()

            def parse_time(t_val):
                if isinstance(t_val, str):
                    try:
                        return datetime.strptime(t_val, '%H:%M:%S').time()
                    except Exception:
                        try:
                            return datetime.strptime(t_val, '%H:%M').time()
                        except Exception:
                            pass
                return time(10, 0)

            start_t = parse_time(q_doc.get('start_time', '10:00:00'))
            end_t = parse_time(q_doc.get('end_time', '16:00:00'))

            quiz_obj, _ = Quiz.objects.update_or_create(
                id=quiz_id,
                defaults={
                    'title': q_doc.get('title', 'Daily Reading Quiz'),
                    'quiz_date': q_date,
                    'start_time': start_t,
                    'end_time': end_t,
                    'duration_minutes': q_doc.get('duration_minutes', 360),
                    'passage_title': q_doc.get('passage_title', 'Reading Passage'),
                    'passage_content': q_doc.get('passage_content', ''),
                    'instructions': q_doc.get('instructions', ''),
                    'status': q_doc.get('status', 'LIVE'),
                }
            )

            # Questions & Options
            for q_data in q_doc.get('questions', []):
                q_num = q_data.get('question_number')
                q_text = q_data.get('question_text', '')
                if not q_num or not q_text:
                    continue

                q_obj, _ = Question.objects.update_or_create(
                    quiz=quiz_obj,
                    question_number=q_num,
                    defaults={'question_text': q_text}
                )

                for opt_data in q_data.get('options', []):
                    opt_key = opt_data.get('option_key')
                    opt_text = opt_data.get('option_text', '')
                    is_corr = bool(opt_data.get('is_correct', False))
                    if opt_key and opt_text:
                        QuestionOption.objects.update_or_create(
                            question=q_obj,
                            option_key=opt_key,
                            defaults={
                                'option_text': opt_text,
                                'is_correct': is_corr
                            }
                        )

        # 2. Sync Participants
        mongo_participants = list(db.participants.find({}))
        for p_doc in mongo_participants:
            phone = p_doc.get('phone_number')
            name = p_doc.get('name')
            p_id = p_doc.get('participant_id')
            if not phone or not name:
                continue
            if p_id:
                Participant.objects.update_or_create(
                    id=p_id,
                    defaults={
                        'name': name,
                        'phone_number': phone,
                        'photo': p_doc.get('photo', '')
                    }
                )
            else:
                Participant.objects.update_or_create(
                    phone_number=phone,
                    defaults={
                        'name': name,
                        'photo': p_doc.get('photo', '')
                    }
                )

        # 3. Sync Attempts
        mongo_attempts = list(db.attempts.find({}))
        for a_doc in mongo_attempts:
            att_id = a_doc.get('attempt_id')
            q_id = a_doc.get('quiz_id')
            p_id = a_doc.get('participant_id')
            if not att_id or not q_id or not p_id:
                continue

            quiz_instance = Quiz.objects.filter(id=q_id).first()
            participant_instance = Participant.objects.filter(id=p_id).first() or Participant.objects.filter(phone_number=a_doc.get('participant_phone')).first()

            if quiz_instance and participant_instance:
                sub_at_str = a_doc.get('submitted_at')
                sub_at = timezone.now()
                if sub_at_str:
                    try:
                        sub_at = datetime.fromisoformat(sub_at_str)
                    except Exception:
                        pass

                Attempt.objects.update_or_create(
                    id=att_id,
                    defaults={
                        'quiz': quiz_instance,
                        'participant': participant_instance,
                        'score': a_doc.get('score', 0),
                        'status': a_doc.get('status', 'COMPLETED'),
                        'submitted_at': sub_at
                    }
                )
    except Exception as e:
        print(f"[MongoDB Sync Engine] Error syncing from Mongo to SQLite: {e}")


