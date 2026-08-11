from django.test import TestCase
from django.utils import timezone
from datetime import time, timedelta
from rest_framework.test import APIClient
from quiz_api.models import Participant, Quiz, Question, QuestionOption, Attempt, Answer, normalize_phone

class QuizCoreTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.participant = Participant.objects.create(
            name="Rahul Sharma",
            phone_number="9876543210"
        )
        self.quiz = Quiz.objects.create(
            title="Science Daily Quiz",
            quiz_date=timezone.localdate(),
            start_time=time(0, 0),
            end_time=time(23, 59),
            duration_minutes=5,
            passage_title="Quantum Physics",
            passage_content="Quantum mechanics is the study of matter and light at subatomic levels.",
            status="LIVE"
        )

        self.questions = []
        for i in range(1, 5):
            q = Question.objects.create(
                quiz=self.quiz,
                question_number=i,
                question_text=f"Sample Question {i}?"
            )
            QuestionOption.objects.create(question=q, option_key="A", option_text="Option A Text", is_correct=(i != 2))
            QuestionOption.objects.create(question=q, option_key="B", option_text="Option B Text", is_correct=(i == 2))
            QuestionOption.objects.create(question=q, option_key="C", option_text="Option C Text", is_correct=False)
            QuestionOption.objects.create(question=q, option_key="D", option_text="Option D Text", is_correct=False)
            self.questions.append(q)

    def test_phone_normalization(self):
        self.assertEqual(normalize_phone("+91 98765-43210"), "919876543210")
        self.assertEqual(normalize_phone("9876 543 210"), "9876543210")

    def test_participant_lookup_auto_recognition(self):
        response = self.client.get('/api/auth/lookup/?phone=9876543210')
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data['exists'])
        self.assertEqual(response.data['name'], "Rahul Sharma")
        self.assertIn('history', response.data)

    def test_admin_dashboard_metrics(self):
        # Create an attempt
        Attempt.objects.create(
            quiz=self.quiz,
            participant=self.participant,
            score=4,
            status='COMPLETED'
        )
        response = self.client.get('/api/admin/stats/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['total_participants'], 1)
        self.assertEqual(response.data['total_quizzes'], 1)

    def test_create_admin_quiz_with_nested_questions(self):
        payload = {
            "title": "The Importance of Trees",
            "quiz_date": "2026-08-09",
            "start_time": "10:00 AM",
            "end_time": "06:07 PM",
            "duration_minutes": 20,
            "passage_title": "The Importance of Trees",
            "passage_content": "Trees provide oxygen and prevent soil erosion.",
            "instructions": "Answer all 4 questions.",
            "status": "LIVE",
            "questions": [
                {
                    "question_number": 1,
                    "question_text": "What do trees provide?",
                    "options": [
                        {"option_key": "A", "option_text": "Water", "is_correct": False},
                        {"option_key": "B", "option_text": "Oxygen", "is_correct": True},
                        {"option_key": "C", "option_text": "Wood", "is_correct": False},
                        {"option_key": "D", "option_text": "Soil", "is_correct": False}
                    ]
                },
                {
                    "question_number": 2,
                    "question_text": "How do trees help prevent erosion?",
                    "options": [
                        {"option_key": "A", "option_text": "Leaves", "is_correct": False},
                        {"option_key": "B", "option_text": "Roots hold soil", "is_correct": True},
                        {"option_key": "C", "option_text": "Branches", "is_correct": False},
                        {"option_key": "D", "option_text": "Bark", "is_correct": False}
                    ]
                },
                {
                    "question_number": 3,
                    "question_text": "What do people get from trees?",
                    "options": [
                        {"option_key": "A", "option_text": "Plastic", "is_correct": False},
                        {"option_key": "B", "option_text": "Wood and medicines", "is_correct": True},
                        {"option_key": "C", "option_text": "Glass", "is_correct": False},
                        {"option_key": "D", "option_text": "Petroleum", "is_correct": False}
                    ]
                },
                {
                    "question_number": 4,
                    "question_text": "Which natural food do trees produce?",
                    "options": [
                        {"option_key": "A", "option_text": "Plastic", "is_correct": False},
                        {"option_key": "B", "option_text": "Metal", "is_correct": False},
                        {"option_key": "C", "option_text": "Fruits", "is_correct": True},
                        {"option_key": "D", "option_text": "Glass", "is_correct": False}
                    ]
                }
            ]
        }
        response = self.client.post('/api/admin/quizzes/', payload, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['title'], "The Importance of Trees")
        self.assertEqual(Question.objects.filter(quiz_id=response.data['id']).count(), 4)

    def test_participant_login_and_auto_fill(self):
        response = self.client.post('/api/auth/participant/', {
            "name": "Rahul Sharma",
            "phone_number": "9876543210"
        })
        self.assertEqual(response.status_code, 200)
        self.assertFalse(response.data['is_new'])
        self.assertEqual(response.data['participant']['name'], "Rahul Sharma")

    def test_submit_attempt_and_score_calculation(self):
        # Rahul submits all correct answers: Q1->A, Q2->B, Q3->A, Q4->A
        answers = {}
        for q in self.questions:
            corr_opt = q.options.filter(is_correct=True).first()
            answers[str(q.id)] = corr_opt.id

        response = self.client.post(f'/api/quiz/{self.quiz.id}/submit/', {
            "participant_id": self.participant.id,
            "answers": answers
        }, format='json')

        self.assertEqual(response.status_code, 201)
        self.assertTrue(response.data['success'])

        attempt = Attempt.objects.get(quiz=self.quiz, participant=self.participant)
        self.assertEqual(attempt.score, 4)
        self.assertEqual(attempt.status, 'COMPLETED')

    def test_anti_duplicate_submission_blocked(self):
        # First submission
        answers = {}
        for q in self.questions:
            answers[str(q.id)] = q.options.first().id

        self.client.post(f'/api/quiz/{self.quiz.id}/submit/', {
            "participant_id": self.participant.id,
            "answers": answers
        }, format='json')

        # Second submission attempt with same user
        response2 = self.client.post(f'/api/quiz/{self.quiz.id}/submit/', {
            "participant_id": self.participant.id,
            "answers": answers
        }, format='json')

        self.assertEqual(response2.status_code, 400)
        self.assertIn("already completed", str(response2.data))

    def test_winner_tie_breaking(self):
        # Participant 1 (Rahul) submits 4/4 at 10:01
        p1 = self.participant
        # Participant 2 (Priya) submits 4/4 at 10:02
        p2 = Participant.objects.create(name="Priya Patel", phone_number="9876543211")

        now = timezone.now()
        att1 = Attempt.objects.create(
            quiz=self.quiz,
            participant=p1,
            score=4,
            status='COMPLETED',
            submitted_at=now - timedelta(minutes=5)
        )
        att2 = Attempt.objects.create(
            quiz=self.quiz,
            participant=p2,
            score=4,
            status='COMPLETED',
            submitted_at=now - timedelta(minutes=2)
        )

        response = self.client.get(f'/api/admin/quizzes/{self.quiz.id}/winner/')
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data['winner_found'])
        self.assertEqual(response.data['winner']['name'], "Rahul Sharma")
