import re
from datetime import datetime, date, time
from django.db.models import Avg, Max, Count
from rest_framework import serializers
from django.utils import timezone
from .models import Participant, Quiz, Question, QuestionOption, Attempt, Answer, normalize_phone
from .mongo_service import sync_quiz_to_mongo

class FlexibleTimeField(serializers.TimeField):
    def to_internal_value(self, value):
        if isinstance(value, time):
            return value
        if not value:
            return time(10, 0)
        val = str(value).strip()
        for fmt in ('%I:%M %p', '%I:%M%p', '%I:%M:%S %p', '%H:%M:%S', '%H:%M'):
            try:
                return datetime.strptime(val, fmt).time()
            except ValueError:
                pass
        return super().to_internal_value(value)

class FlexibleDateField(serializers.DateField):
    def to_internal_value(self, value):
        if isinstance(value, date):
            return value
        if not value:
            return timezone.localdate()
        val = str(value).strip()
        for fmt in ('%Y-%m-%d', '%m/%d/%Y', '%d/%m/%Y', '%Y/%m/%d', '%b %d, %Y', '%B %d, %Y'):
            try:
                return datetime.strptime(val, fmt).date()
            except ValueError:
                pass
        return super().to_internal_value(value)

class ParticipantSerializer(serializers.ModelSerializer):
    phone_number = serializers.CharField()
    masked_phone = serializers.CharField(read_only=True)

    class Meta:
        model = Participant
        fields = ['id', 'name', 'phone_number', 'masked_phone', 'created_at']

    def validate_phone_number(self, value):
        cleaned = normalize_phone(value)
        if len(cleaned) < 7 or len(cleaned) > 15:
            raise serializers.ValidationError("Please enter a valid phone number (7 to 15 digits).")
        return cleaned

    def validate_name(self, value):
        cleaned = value.strip()
        if not cleaned:
            raise serializers.ValidationError("Please enter your name.")
        if len(cleaned) < 2:
            raise serializers.ValidationError("Name must be at least 2 characters long.")
        return cleaned


# ==========================================
# Participant / Public Serializers (SAFE)
# ==========================================

class QuestionOptionPublicSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuestionOption
        fields = ['id', 'option_key', 'option_text']


class QuestionPublicSerializer(serializers.ModelSerializer):
    options = QuestionOptionPublicSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = ['id', 'question_number', 'question_text', 'options']


class QuizPublicSerializer(serializers.ModelSerializer):
    questions = QuestionPublicSerializer(many=True, read_only=True)
    dynamic_status = serializers.CharField(read_only=True)
    server_time = serializers.SerializerMethodField()

    class Meta:
        model = Quiz
        fields = [
            'id', 'title', 'quiz_date', 'start_time', 'end_time', 
            'duration_minutes', 'passage_title', 'passage_content', 
            'instructions', 'status', 'dynamic_status', 'questions',
            'server_time'
        ]

    def get_server_time(self, obj):
        return timezone.localtime().strftime('%H:%M:%S')


class AttemptSubmitSerializer(serializers.Serializer):
    participant_id = serializers.IntegerField()
    answers = serializers.DictField(
        child=serializers.IntegerField(),
        help_text="Mapping of question_id to selected_option_id. Must have all 4 questions."
    )

    def validate(self, attrs):
        quiz = self.context.get('quiz')
        if not quiz:
            raise serializers.ValidationError("Quiz context not provided.")

        participant_id = attrs.get('participant_id')
        try:
            participant = Participant.objects.get(id=participant_id)
        except Participant.DoesNotExist:
            raise serializers.ValidationError({"participant_id": "Participant does not exist."})

        # Anti-duplicate check
        if Attempt.objects.filter(quiz=quiz, participant=participant).exists():
            raise serializers.ValidationError({
                "detail": "You have already completed today's quiz. Only one attempt is permitted."
            })

        # Time validation: Check if quiz is expired or not started
        current_status = quiz.dynamic_status
        if current_status == 'DRAFT':
            raise serializers.ValidationError({"detail": "This quiz is not published."})
        if current_status == 'SCHEDULED':
            raise serializers.ValidationError({"detail": "Today's quiz has not started yet."})
        if current_status in ['ENDED', 'ARCHIVED']:
            raise serializers.ValidationError({"detail": "Today's quiz has ended. Submissions are closed."})

        # Question verification
        questions = quiz.questions.all()
        if questions.count() != 4:
            raise serializers.ValidationError({"detail": f"Quiz configuration error: Expected 4 questions, found {questions.count()}."})

        submitted_answers = attrs.get('answers', {})
        q_ids = set(questions.values_list('id', flat=True))
        sub_q_ids = {int(k) for k in submitted_answers.keys()}

        if q_ids != sub_q_ids:
            missing_count = len(q_ids - sub_q_ids)
            raise serializers.ValidationError({
                "detail": f"Please answer all four questions before submitting ({missing_count} unanswered)."
            })

        # Validate that option belongs to the question
        for q_id, opt_id in submitted_answers.items():
            if not QuestionOption.objects.filter(id=opt_id, question_id=q_id).exists():
                raise serializers.ValidationError({"detail": f"Invalid option selected for question ID {q_id}."})

        attrs['participant'] = participant
        attrs['quiz'] = quiz
        return attrs

    def create(self, validated_data):
        quiz = validated_data['quiz']
        participant = validated_data['participant']
        answers_dict = validated_data['answers']

        now = timezone.now()
        attempt = Attempt.objects.create(
            quiz=quiz,
            participant=participant,
            status='COMPLETED',
            started_at=now,
            submitted_at=now,
            score=0
        )

        total_score = 0
        for q_id_str, opt_id in answers_dict.items():
            q_id = int(q_id_str)
            option = QuestionOption.objects.get(id=opt_id)
            is_correct = option.is_correct
            if is_correct:
                total_score += 1

            Answer.objects.create(
                attempt=attempt,
                question_id=q_id,
                selected_option=option,
                is_correct=is_correct
            )

        attempt.score = total_score
        attempt.save()
        return attempt


# ==========================================
# Admin Serializers (Full control + Keys)
# ==========================================

class AdminQuestionOptionSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False)

    class Meta:
        model = QuestionOption
        fields = ['id', 'option_key', 'option_text', 'is_correct']


class AdminQuestionSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False)
    options = AdminQuestionOptionSerializer(many=True)

    class Meta:
        model = Question
        fields = ['id', 'question_number', 'question_text', 'options']


class AdminQuizSerializer(serializers.ModelSerializer):
    quiz_date = FlexibleDateField(required=False)
    start_time = FlexibleTimeField(required=False)
    end_time = FlexibleTimeField(required=False)
    questions = AdminQuestionSerializer(many=True, required=False)
    dynamic_status = serializers.CharField(read_only=True)
    participants_count = serializers.SerializerMethodField()
    completed_count = serializers.SerializerMethodField()
    average_score = serializers.SerializerMethodField()
    winner_name = serializers.SerializerMethodField()

    class Meta:
        model = Quiz
        fields = [
            'id', 'title', 'quiz_date', 'start_time', 'end_time',
            'duration_minutes', 'passage_title', 'passage_content',
            'instructions', 'status', 'dynamic_status', 'questions',
            'participants_count', 'completed_count', 'average_score', 'winner_name',
            'created_at', 'updated_at'
        ]

    def get_participants_count(self, obj):
        return obj.attempts.count()

    def get_completed_count(self, obj):
        return obj.attempts.filter(status='COMPLETED').count()

    def get_average_score(self, obj):
        completed = obj.attempts.filter(status='COMPLETED')
        if not completed.exists():
            return None
        avg = completed.aggregate(avg=Avg('score'))['avg']
        return round(avg, 1) if avg is not None else None

    def get_winner_name(self, obj):
        winner_attempt = obj.attempts.filter(status='COMPLETED').order_by('-score', 'submitted_at').first()
        return winner_attempt.participant.name if winner_attempt else None

    def validate(self, attrs):
        # When creating or editing quiz with questions
        questions_data = self.initial_data.get('questions')
        if questions_data is not None:
            if len(questions_data) != 4:
                raise serializers.ValidationError({"questions": f"A quiz must contain exactly 4 questions (received {len(questions_data)})."})
            
            for idx, q_data in enumerate(questions_data):
                q_num = q_data.get('question_number', idx + 1)
                q_text = q_data.get('question_text', '').strip()
                if not q_text:
                    raise serializers.ValidationError({"questions": f"Question {q_num} text cannot be empty."})

                opts = q_data.get('options', [])
                if len(opts) != 4:
                    raise serializers.ValidationError({"questions": f"Question {q_num} must have exactly 4 options."})

                correct_count = sum(1 for o in opts if o.get('is_correct') is True)
                if correct_count != 1:
                    raise serializers.ValidationError({
                        "questions": f"Question {q_num} must have exactly 1 correct answer selected (found {correct_count})."
                    })

                for opt in opts:
                    if not opt.get('option_text', '').strip():
                        raise serializers.ValidationError({"questions": f"Option text in Question {q_num} cannot be empty."})

        return attrs

    def create(self, validated_data):
        questions_data = validated_data.pop('questions', None)
        if questions_data is None:
            questions_data = self.initial_data.get('questions', [])

        quiz = Quiz.objects.create(**validated_data)

        for idx, q_data in enumerate(questions_data):
            options_data = q_data.get('options', [])
            question = Question.objects.create(
                quiz=quiz,
                question_number=q_data.get('question_number', idx + 1),
                question_text=q_data.get('question_text', '')
            )
            for opt_data in options_data:
                QuestionOption.objects.create(
                    question=question,
                    option_key=opt_data.get('option_key', 'A'),
                    option_text=opt_data.get('option_text', ''),
                    is_correct=opt_data.get('is_correct', False)
                )
        sync_quiz_to_mongo(quiz)
        return quiz

    def update(self, instance, validated_data):
        questions_data = validated_data.pop('questions', None)
        if questions_data is None:
            questions_data = self.initial_data.get('questions', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if questions_data is not None:
            # Overwrite questions and options cleanly
            instance.questions.all().delete()
            for idx, q_data in enumerate(questions_data):
                options_data = q_data.get('options', [])
                question = Question.objects.create(
                    quiz=instance,
                    question_number=q_data.get('question_number', idx + 1),
                    question_text=q_data.get('question_text', '')
                )
                for opt_data in options_data:
                    QuestionOption.objects.create(
                        question=question,
                        option_key=opt_data.get('option_key', 'A'),
                        option_text=opt_data.get('option_text', ''),
                        is_correct=opt_data.get('is_correct', False)
                    )
        sync_quiz_to_mongo(instance)
        return instance


class AdminAnswerReviewSerializer(serializers.ModelSerializer):
    question_number = serializers.IntegerField(source='question.question_number')
    question_text = serializers.CharField(source='question.question_text')
    selected_key = serializers.CharField(source='selected_option.option_key')
    selected_text = serializers.CharField(source='selected_option.option_text')
    correct_option = serializers.SerializerMethodField()

    class Meta:
        model = Answer
        fields = ['id', 'question_number', 'question_text', 'selected_key', 'selected_text', 'is_correct', 'correct_option']

    def get_correct_option(self, obj):
        correct = obj.question.options.filter(is_correct=True).first()
        if correct:
            return {
                'key': correct.option_key,
                'text': correct.option_text
            }
        return None


class AdminAttemptSerializer(serializers.ModelSerializer):
    participant_name = serializers.CharField(source='participant.name')
    phone_number = serializers.CharField(source='participant.phone_number')
    masked_phone = serializers.CharField(source='participant.masked_phone')
    quiz_title = serializers.CharField(source='quiz.title', read_only=True)
    quiz_date = serializers.CharField(source='quiz.quiz_date', read_only=True)
    answers = AdminAnswerReviewSerializer(many=True, read_only=True)
    submission_time_formatted = serializers.SerializerMethodField()

    class Meta:
        model = Attempt
        fields = [
            'id', 'quiz_id', 'quiz_title', 'quiz_date', 'participant_name',
            'phone_number', 'masked_phone', 'status', 'score', 'started_at',
            'submitted_at', 'submission_time_formatted', 'answers'
        ]

    def get_submission_time_formatted(self, obj):
        if obj.submitted_at:
            return timezone.localtime(obj.submitted_at).strftime('%H:%M:%S')
        return '—'


class AdminWinnerSerializer(serializers.Serializer):
    winner_found = serializers.BooleanField()
    participant = serializers.SerializerMethodField()
    score = serializers.IntegerField(allow_null=True)
    submitted_at = serializers.DateTimeField(allow_null=True)
    formatted_time = serializers.CharField(allow_null=True)
    criteria = serializers.CharField()
    top_candidates = serializers.SerializerMethodField()

    def get_participant(self, obj):
        if not obj.get('attempt'):
            return None
        p = obj['attempt'].participant
        return {
            'id': p.id,
            'name': p.name,
            'masked_phone': p.masked_phone,
            'phone_number': p.phone_number
        }

    def get_top_candidates(self, obj):
        attempts = obj.get('top_attempts', [])
        return [
            {
                'rank': idx + 1,
                'name': att.participant.name,
                'masked_phone': att.participant.masked_phone,
                'score': att.score,
                'submitted_at': timezone.localtime(att.submitted_at).strftime('%H:%M:%S') if att.submitted_at else '—'
            }
            for idx, att in enumerate(attempts)
        ]
