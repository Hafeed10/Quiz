from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    participant_lookup,
    participant_auth,
    get_participant_history,
    get_today_quiz,
    submit_quiz_attempt,
    AdminQuizViewSet,
    admin_dashboard_stats,
    admin_participants_list,
    admin_cumulative_participants,
    admin_attempt_detail,
    admin_quiz_winner,
    admin_quiz_results_analytics,
)

router = DefaultRouter()
router.register(r'admin/quizzes', AdminQuizViewSet, basename='admin-quizzes')

urlpatterns = [
    # Participant Authentication & Recognition
    path('auth/lookup/', participant_lookup, name='participant-lookup'),
    path('auth/participant/', participant_auth, name='participant-auth'),
    path('participant/history/', get_participant_history, name='participant-history'),

    # Participant Quiz Endpoints
    path('quiz/today/', get_today_quiz, name='today-quiz'),
    path('quiz/<int:quiz_id>/submit/', submit_quiz_attempt, name='submit-quiz-attempt'),

    # Admin Management & Analytics
    path('admin/stats/', admin_dashboard_stats, name='admin-dashboard-stats'),
    path('admin/participants/cumulative/', admin_cumulative_participants, name='admin-cumulative-participants'),
    path('admin/participants/', admin_participants_list, name='admin-participants-list'),
    path('admin/attempts/<int:attempt_id>/', admin_attempt_detail, name='admin-attempt-detail'),
    path('admin/quizzes/<int:quiz_id>/winner/', admin_quiz_winner, name='admin-quiz-winner'),
    path('admin/quizzes/<int:quiz_id>/results/', admin_quiz_results_analytics, name='admin-quiz-results-analytics'),

    path('', include(router.urls)),
]
