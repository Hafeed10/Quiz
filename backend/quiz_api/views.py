import re
from django.db.models import Avg, Max, Count
from django.utils import timezone
from datetime import datetime, time, timedelta
from rest_framework import status, viewsets
from rest_framework.decorators import api_view, action
from rest_framework.response import Response

from .models import Participant, Quiz, Question, QuestionOption, Attempt, Answer, normalize_phone
from .serializers import (
    ParticipantSerializer, QuizPublicSerializer, AttemptSubmitSerializer,
    AdminQuizSerializer, AdminAttemptSerializer, QuestionOptionPublicSerializer
)

def get_next_quiz_info():
    today = timezone.localdate()
    next_quiz = Quiz.objects.filter(quiz_date__gt=today).exclude(status='DRAFT').order_by('quiz_date', 'start_time').first()
    if next_quiz:
        start_str = next_quiz.start_time.strftime('%I:%M %p') if next_quiz.start_time else "10:00 AM"
        end_str = next_quiz.end_time.strftime('%I:%M %p') if next_quiz.end_time else "04:00 PM"
        return {
            "quiz_id": next_quiz.id,
            "title": next_quiz.title,
            "date": next_quiz.quiz_date.strftime('%Y-%m-%d'),
            "date_formatted": next_quiz.quiz_date.strftime('%b %d, %Y'),
            "time": start_str,
            "end_time": end_str,
            "window_text": f"{start_str} to {end_str}",
        }
    tomorrow = today + timedelta(days=1)
    return {
        "quiz_id": None,
        "title": "Daily Reading Quiz",
        "date": tomorrow.strftime('%Y-%m-%d'),
        "date_formatted": tomorrow.strftime('%b %d, %Y'),
        "time": "10:00 AM",
        "end_time": "04:00 PM",
        "window_text": "10:00 AM to 4:00 PM",
    }

# ==========================================
# Participant Endpoints
# ==========================================

@api_view(['GET', 'POST'])
def lookup_participant(request):
    """
    Check if a participant already exists by phone number.
    Returns their saved name, next quiz schedule, and completed quizzes history.
    GET /api/auth/lookup/?phone=9876543210
    POST /api/auth/lookup/ { "phone_number": "9876543210" }
    """
    phone = (
        request.GET.get('phone') or
        request.GET.get('phone_number') or
        (request.data.get('phone') if isinstance(request.data, dict) else None) or
        (request.data.get('phone_number') if isinstance(request.data, dict) else None) or
        ''
    )
    cleaned = normalize_phone(phone)
    if not cleaned:
        return Response({"error": "Phone number is required."}, status=status.HTTP_400_BAD_REQUEST)

    next_quiz = get_next_quiz_info()
    participant = Participant.objects.filter(phone_number=cleaned).first()
    if participant:
        attempts = Attempt.objects.filter(participant=participant).select_related('quiz').order_by('-submitted_at', '-created_at')
        attempts_data = []
        for att in attempts:
            quiz = att.quiz
            attempts_data.append({
                "id": att.id,
                "quiz_id": quiz.id,
                "quiz_title": quiz.title,
                "passage_title": quiz.passage_title,
                "quiz_date": quiz.quiz_date.strftime('%Y-%m-%d'),
                "status": att.status,
                "submitted_at": timezone.localtime(att.submitted_at).strftime('%b %d, %Y - %I:%M %p') if att.submitted_at else "—",
            })

        return Response({
            "exists": True,
            "id": participant.id,
            "name": participant.name,
            "masked_phone": participant.masked_phone,
            "phone_number": participant.phone_number,
            "total_attempts": attempts.count(),
            "next_quiz": next_quiz,
            "history": attempts_data
        }, status=status.HTTP_200_OK)

    return Response({"exists": False, "next_quiz": next_quiz, "history": []}, status=status.HTTP_200_OK)

participant_lookup = lookup_participant


@api_view(['GET'])
def get_participant_history(request):
    """
    Get the history of completed quizzes and next quiz schedule for a participant.
    GET /api/participant/history/?phone=9876543210
    GET /api/participant/history/?participant_id=1
    """
    phone = request.GET.get('phone') or request.GET.get('phone_number')
    participant_id = request.GET.get('participant_id')
    next_quiz = get_next_quiz_info()

    participant = None
    if participant_id:
        participant = Participant.objects.filter(id=participant_id).first()
    elif phone:
        cleaned = normalize_phone(phone)
        if cleaned:
            participant = Participant.objects.filter(phone_number=cleaned).first()

    if not participant:
        return Response({
            "exists": False,
            "next_quiz": next_quiz,
            "attempts": [],
            "total_attempts": 0
        }, status=status.HTTP_200_OK)

    attempts = Attempt.objects.filter(participant=participant).select_related('quiz').order_by('-submitted_at', '-created_at')
    
    attempts_data = []
    for att in attempts:
        quiz = att.quiz
        attempts_data.append({
            "id": att.id,
            "quiz_id": quiz.id,
            "quiz_title": quiz.title,
            "passage_title": quiz.passage_title,
            "quiz_date": quiz.quiz_date.strftime('%Y-%m-%d'),
            "status": att.status,
            "submitted_at": timezone.localtime(att.submitted_at).strftime('%b %d, %Y - %I:%M %p') if att.submitted_at else "—",
        })

    return Response({
        "exists": True,
        "participant": {
            "id": participant.id,
            "name": participant.name,
            "phone_number": participant.phone_number,
            "masked_phone": participant.masked_phone
        },
        "total_attempts": attempts.count(),
        "completed_count": attempts.filter(status='COMPLETED').count(),
        "next_quiz": next_quiz,
        "attempts": attempts_data
    }, status=status.HTTP_200_OK)



@api_view(['POST'])
def login_or_register_participant(request):
    """
    Participant login / registration using Name + Phone Number.
    POST /api/auth/participant/ { "name": "Rahul Sharma", "phone_number": "9876543210" }
    """
    serializer = ParticipantSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    name = serializer.validated_data['name']
    raw_phone = serializer.validated_data['phone_number']
    phone = normalize_phone(raw_phone)

    participant, is_new = Participant.objects.get_or_create(
        phone_number=phone,
        defaults={'name': name}
    )

    if not is_new and name and name != participant.name:
        participant.name = name
        participant.save(update_fields=['name', 'updated_at'])

    today = timezone.localdate()
    today_quiz = Quiz.objects.filter(status='LIVE').first() or Quiz.objects.filter(quiz_date=today).exclude(status='DRAFT').first()
    
    has_completed_today = False
    attempt_id = None
    if today_quiz:
        attempt = Attempt.objects.filter(quiz=today_quiz, participant=participant).first()
        if attempt:
            has_completed_today = True
            attempt_id = attempt.id

    return Response({
        "success": True,
        "is_new": is_new,
        "participant": {
            "id": participant.id,
            "name": participant.name,
            "phone_number": participant.phone_number,
            "masked_phone": participant.masked_phone
        },
        "today_quiz_id": today_quiz.id if today_quiz else None,
        "has_completed_today": has_completed_today,
        "attempt_id": attempt_id
    }, status=status.HTTP_200_OK)

participant_auth = login_or_register_participant


@api_view(['GET'])
def get_today_quiz(request):
    """
    Get today's quiz state and questions without answers.
    GET /api/quiz/today/?participant_id=123
    """
    today = timezone.localdate()
    participant_id = request.GET.get('participant_id')

    # Find today's active LIVE quiz, or today's scheduled quiz, or the latest available quiz
    quiz = Quiz.objects.filter(status='LIVE').first()
    if not quiz:
        quiz = Quiz.objects.filter(quiz_date=today).exclude(status='DRAFT').first()
    if not quiz:
        quiz = Quiz.objects.exclude(status='DRAFT').order_by('-quiz_date').first()

    if not quiz:
        return Response({
            "available": False,
            "message": "Today's quiz is not currently available. Please check back later."
        }, status=status.HTTP_200_OK)

    has_completed = False
    attempt_data = None

    if participant_id:
        try:
            attempt = Attempt.objects.filter(quiz=quiz, participant_id=participant_id).first()
            if attempt:
                has_completed = True
                attempt_data = {
                    "id": attempt.id,
                    "status": attempt.status,
                    "submitted_at": attempt.submitted_at
                }
        except Exception:
            pass

    serializer = QuizPublicSerializer(quiz)
    data = serializer.data
    data['available'] = True
    data['has_completed'] = has_completed
    data['attempt'] = attempt_data

    return Response(data, status=status.HTTP_200_OK)


@api_view(['POST'])
def submit_quiz_attempt(request, quiz_id):
    """
    Submit answers for a quiz attempt:
    POST /api/quiz/<quiz_id>/submit/
    Body: { "participant_id": 1, "answers": { "1": 101, "2": 105, "3": 109, "4": 113 } }
    """
    try:
        quiz = Quiz.objects.get(id=quiz_id)
    except Quiz.DoesNotExist:
        return Response({"error": "Quiz not found."}, status=status.HTTP_404_NOT_FOUND)

    serializer = AttemptSubmitSerializer(data=request.data, context={'quiz': quiz})
    if serializer.is_valid():
        attempt = serializer.save()
        return Response({
            "success": True,
            "attempt_id": attempt.id,
            "status": "COMPLETED",
            "message": "Congratulations! Your answers have been submitted successfully. Thank you for participating in today's quiz."
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ==========================================
# Admin Endpoints
# ==========================================

class AdminQuizViewSet(viewsets.ModelViewSet):
    queryset = Quiz.objects.all().order_by('-quiz_date', '-created_at')
    serializer_class = AdminQuizSerializer

    @action(detail=True, methods=['post'])
    def publish(self, request, pk=None):
        quiz = self.get_object()
        quiz.status = 'LIVE'
        quiz.quiz_date = timezone.localdate()
        quiz.save()
        return Response({"status": "Published", "quiz_status": quiz.status})

    @action(detail=True, methods=['post'])
    def make_live(self, request, pk=None):
        quiz = self.get_object()
        quiz.status = 'LIVE'
        quiz.quiz_date = timezone.localdate()
        quiz.save()
        return Response({"status": "Made Live", "quiz_status": quiz.status})

    @action(detail=True, methods=['post'])
    def close_quiz(self, request, pk=None):
        quiz = self.get_object()
        quiz.status = 'ENDED'
        quiz.save()
        return Response({"status": "Closed", "quiz_status": quiz.status})


@api_view(['GET'])
def admin_dashboard_stats(request):
    """
    Overview statistics for the Admin Dashboard.
    """
    today = timezone.localdate()
    total_participants = Participant.objects.count()
    total_quizzes = Quiz.objects.count()

    today_quiz = Quiz.objects.filter(status='LIVE').first() or Quiz.objects.filter(quiz_date=today).first()
    if not today_quiz:
        today_quiz = Quiz.objects.order_by('-quiz_date').first()

    today_stats = {
        "quiz_id": today_quiz.id if today_quiz else None,
        "title": today_quiz.title if today_quiz else "No Active Quiz",
        "quiz_date": today_quiz.quiz_date if today_quiz else today,
        "status": today_quiz.dynamic_status if today_quiz else "NO_QUIZ",
        "start_time": today_quiz.start_time.strftime('%H:%M') if today_quiz else None,
        "end_time": today_quiz.end_time.strftime('%H:%M') if today_quiz else None,
        "participants_count": today_quiz.attempts.count() if today_quiz else 0,
        "completed_count": today_quiz.attempts.filter(status='COMPLETED').count() if today_quiz else 0,
        "average_score": round(today_quiz.attempts.filter(status='COMPLETED').aggregate(avg=Avg('score'))['avg'] or 0, 1) if today_quiz else 0,
        "highest_score": today_quiz.attempts.filter(status='COMPLETED').aggregate(mx=Max('score'))['mx'] if today_quiz else 0,
    }

    return Response({
        "total_participants": total_participants,
        "total_quizzes": total_quizzes,
        "today_stats": today_stats
    })


@api_view(['GET'])
def admin_participants_list(request):
    """
    List participants and their attempts for a specific quiz or all time.
    GET /api/admin/participants/?quiz_id=1
    """
    quiz_id = request.GET.get('quiz_id')
    today = timezone.localdate()

    if quiz_id:
        quiz = Quiz.objects.filter(id=quiz_id).first()
    else:
        quiz = Quiz.objects.filter(status='LIVE').first() or Quiz.objects.filter(quiz_date=today).first() or Quiz.objects.order_by('-quiz_date').first()

    if not quiz:
        return Response([])

    attempts = Attempt.objects.filter(quiz=quiz).select_related('participant').prefetch_related('answers__selected_option', 'answers__question')
    serializer = AdminAttemptSerializer(attempts, many=True)
    return Response({
        "quiz_id": quiz.id,
        "quiz_title": quiz.title,
        "quiz_date": quiz.quiz_date,
        "attempts": serializer.data
    })


@api_view(['GET'])
def admin_attempt_detail(request, attempt_id):
    """
    Detailed answer review for a single participant attempt.
    """
    try:
        attempt = Attempt.objects.select_related('participant', 'quiz').get(id=attempt_id)
    except Attempt.DoesNotExist:
        return Response({"error": "Attempt not found."}, status=status.HTTP_404_NOT_FOUND)

    serializer = AdminAttemptSerializer(attempt)
    return Response(serializer.data)


@api_view(['GET'])
def admin_quiz_winner(request, quiz_id):
    """
    Admin-only winner determination:
    Primary: Highest Score (out of 4)
    Secondary (Tie-break): Earliest valid submission timestamp.
    """
    try:
        quiz = Quiz.objects.get(id=quiz_id)
    except Quiz.DoesNotExist:
        return Response({"error": "Quiz not found."}, status=status.HTTP_404_NOT_FOUND)

    completed_attempts = Attempt.objects.filter(quiz=quiz, status='COMPLETED').order_by('-score', 'submitted_at').select_related('participant')

    if not completed_attempts.exists():
        return Response({
            "winner_found": False,
            "message": "No completed attempts recorded yet for this quiz.",
            "criteria": "Highest score + Earliest submission timestamp",
            "top_candidates": []
        })

    winner_attempt = completed_attempts.first()
    winner_submitted = timezone.localtime(winner_attempt.submitted_at) if winner_attempt.submitted_at else None

    response_data = {
        "winner_found": True,
        "quiz_id": quiz.id,
        "quiz_title": quiz.title,
        "quiz_date": quiz.quiz_date,
        "criteria": "Highest score + Earliest submission timestamp",
        "winner": {
            "participant_id": winner_attempt.participant.id,
            "name": winner_attempt.participant.name,
            "masked_phone": winner_attempt.participant.masked_phone,
            "phone_number": winner_attempt.participant.phone_number,
            "score": winner_attempt.score,
            "max_score": 4,
            "submitted_at": winner_submitted.strftime('%H:%M:%S') if winner_submitted else '—',
            "submitted_full": winner_submitted.isoformat() if winner_submitted else None
        },
        "top_candidates": [
            {
                "rank": idx + 1,
                "name": att.participant.name,
                "masked_phone": att.participant.masked_phone,
                "score": att.score,
                "submitted_at": timezone.localtime(att.submitted_at).strftime('%H:%M:%S') if att.submitted_at else '—'
            }
            for idx, att in enumerate(completed_attempts[:10])
        ]
    }
    return Response(response_data)


@api_view(['GET'])
def admin_quiz_results_analytics(request, quiz_id):
    """
    Detailed analytics for quiz results (Question accuracy %, score histogram).
    """
    try:
        quiz = Quiz.objects.get(id=quiz_id)
    except Quiz.DoesNotExist:
        return Response({"error": "Quiz not found."}, status=status.HTTP_404_NOT_FOUND)

    attempts = Attempt.objects.filter(quiz=quiz, status='COMPLETED')
    total_completed = attempts.count()

    score_distribution = {
        "4_points": attempts.filter(score=4).count(),
        "3_points": attempts.filter(score=3).count(),
        "2_points": attempts.filter(score=2).count(),
        "1_point": attempts.filter(score=1).count(),
        "0_points": attempts.filter(score=0).count(),
    }

    questions_analytics = []
    for q in quiz.questions.all().order_by('question_number'):
        total_answers = Answer.objects.filter(attempt__quiz=quiz, question=q).count()
        correct_answers = Answer.objects.filter(attempt__quiz=quiz, question=q, is_correct=True).count()
        accuracy_rate = round((correct_answers / total_answers * 100), 1) if total_answers > 0 else 0
        correct_option = q.options.filter(is_correct=True).first()

        questions_analytics.append({
            "question_id": q.id,
            "question_number": q.question_number,
            "question_text": q.question_text,
            "correct_option_key": correct_option.option_key if correct_option else '—',
            "total_answers": total_answers,
            "correct_answers": correct_answers,
            "accuracy_rate": accuracy_rate
        })

    return Response({
        "quiz_id": quiz.id,
        "quiz_title": quiz.title,
        "total_completed": total_completed,
        "score_distribution": score_distribution,
        "questions_analytics": questions_analytics
    })
