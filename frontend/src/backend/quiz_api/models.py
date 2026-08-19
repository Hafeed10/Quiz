import re
from django.db import models
from django.utils import timezone
from datetime import datetime, time

def normalize_phone(phone_str: str) -> str:
    """Normalize phone number by stripping spaces, hyphens, and non-digit characters."""
    if not phone_str:
        return ""
    # Keep leading + if present for international, otherwise remove all non-digits
    cleaned = re.sub(r'[^\d+]', '', str(phone_str).strip())
    digits_only = re.sub(r'\D', '', cleaned)
    return digits_only

class Participant(models.Model):
    name = models.CharField(max_length=150)
    phone_number = models.CharField(max_length=20, unique=True, db_index=True)
    photo = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.masked_phone})"

    @property
    def masked_phone(self):
        p = self.phone_number
        if len(p) <= 4:
            return "****"
        return f"{p[:2]}{'*' * (len(p) - 4)}{p[-2:]}"

    def save(self, *args, **kwargs):
        self.phone_number = normalize_phone(self.phone_number)
        super().save(*args, **kwargs)


class Quiz(models.Model):
    STATUS_CHOICES = [
        ('DRAFT', 'Draft'),
        ('SCHEDULED', 'Scheduled'),
        ('LIVE', 'Live'),
        ('ENDED', 'Ended'),
        ('ARCHIVED', 'Archived'),
    ]

    WINNER_MODE_CHOICES = [
        ('AUTO', 'Automatic (Top Score + Earliest Time)'),
        ('MANUAL', 'Manual Hand-Pick'),
        ('LUCKY_DRAW', 'Lucky Draw Selector'),
    ]

    title = models.CharField(max_length=255, default="Daily Reading Quiz")
    quiz_date = models.DateField(db_index=True)
    start_time = models.TimeField(default=time(10, 0))
    end_time = models.TimeField(default=time(16, 0))
    duration_minutes = models.PositiveIntegerField(default=360, help_text="Duration in minutes")
    
    passage_title = models.CharField(max_length=255, blank=True, default="Reading Passage")
    passage_content = models.TextField(help_text="The main paragraph/passage for the daily quiz")
    instructions = models.TextField(
        default="Read the following paragraph carefully before answering the questions. Answer all four questions within the time window."
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='SCHEDULED')
    
    manual_winner = models.ForeignKey(Participant, on_delete=models.SET_NULL, null=True, blank=True, related_name='manual_winner_quizzes')
    winner_selection_mode = models.CharField(max_length=20, choices=WINNER_MODE_CHOICES, default='AUTO')
    winner_notes = models.CharField(max_length=255, blank=True, default='')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-quiz_date', '-created_at']
        verbose_name_plural = "Quizzes"

    def __str__(self):
        return f"{self.title} - {self.quiz_date} ({self.dynamic_status})"

    def calculate_current_lifecycle(self):
        """
        Determine if the quiz is upcoming, live, or ended.
        Admin's explicitly set status (LIVE, ENDED, DRAFT, ARCHIVED) takes full precedence.
        If status is SCHEDULED, it checks the admin's start_time and end_time window.
        """
        if self.status in ['LIVE', 'ENDED', 'DRAFT', 'ARCHIVED']:
            return self.status

        today = timezone.localdate()
        now_time = timezone.localtime().time()

        if self.quiz_date > today:
            return 'SCHEDULED'
        elif self.quiz_date < today:
            return 'ENDED'
        else:
            # Same day
            if now_time < self.start_time:
                return 'SCHEDULED'
            elif self.start_time <= now_time <= self.end_time:
                return 'LIVE'
            else:
                return 'ENDED'

    @property
    def dynamic_status(self):
        return self.calculate_current_lifecycle()


class Question(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='questions')
    question_number = models.PositiveSmallIntegerField(help_text="1, 2, 3, or 4")
    question_text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['question_number']
        unique_together = ('quiz', 'question_number')

    def __str__(self):
        return f"Q{self.question_number} ({self.quiz.title}): {self.question_text[:50]}"


class QuestionOption(models.Model):
    OPTION_KEYS = [
        ('A', 'Option A'),
        ('B', 'Option B'),
        ('C', 'Option C'),
        ('D', 'Option D'),
    ]

    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='options')
    option_key = models.CharField(max_length=1, choices=OPTION_KEYS)
    option_text = models.CharField(max_length=500)
    is_correct = models.BooleanField(default=False)

    class Meta:
        ordering = ['option_key']
        unique_together = ('question', 'option_key')

    def __str__(self):
        return f"Q{self.question.question_number} - Option {self.option_key}: {self.option_text[:40]} {'[CORRECT]' if self.is_correct else ''}"


class Attempt(models.Model):
    STATUS_CHOICES = [
        ('IN_PROGRESS', 'In Progress'),
        ('COMPLETED', 'Completed'),
    ]

    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='attempts')
    participant = models.ForeignKey(Participant, on_delete=models.CASCADE, related_name='attempts')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='COMPLETED')
    started_at = models.DateTimeField(default=timezone.now)
    submitted_at = models.DateTimeField(default=timezone.now)
    score = models.PositiveSmallIntegerField(default=0, help_text="Total score out of 4")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-score', 'submitted_at']
        unique_together = ('quiz', 'participant')

    def __str__(self):
        return f"Attempt: {self.participant.name} on {self.quiz.quiz_date} - Score: {self.score}/4"


class Answer(models.Model):
    attempt = models.ForeignKey(Attempt, on_delete=models.CASCADE, related_name='answers')
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='answers')
    selected_option = models.ForeignKey(QuestionOption, on_delete=models.CASCADE)
    is_correct = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['question__question_number']
        unique_together = ('attempt', 'question')

    def __str__(self):
        return f"Ans by {self.attempt.participant.name} for Q{self.question.question_number}: {self.selected_option.option_key} ({'Correct' if self.is_correct else 'Incorrect'})"
