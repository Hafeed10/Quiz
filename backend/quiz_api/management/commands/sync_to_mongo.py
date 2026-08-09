from django.core.management.base import BaseCommand
from quiz_api.models import Participant, Quiz, Attempt
from quiz_api.mongo_service import sync_participant_to_mongo, sync_quiz_to_mongo, sync_attempt_to_mongo, ping_mongo

class Command(BaseCommand):
    help = "Sync all existing Django database records into MongoDB Atlas"

    def handle(self, *args, **options):
        self.stdout.write("Checking MongoDB Atlas connection...")
        ping = ping_mongo()
        if not ping:
            self.stderr.write("Failed to connect to MongoDB Atlas.")
            return

        self.stdout.write("MongoDB Atlas connected successfully! Syncing records...")

        participants = Participant.objects.all()
        for p in participants:
            sync_participant_to_mongo(p)
        self.stdout.write(f"Synced {participants.count()} participants.")

        quizzes = Quiz.objects.all()
        for q in quizzes:
            sync_quiz_to_mongo(q)
        self.stdout.write(f"Synced {quizzes.count()} quizzes.")

        attempts = Attempt.objects.all()
        for a in attempts:
            sync_attempt_to_mongo(a)
        self.stdout.write(f"Synced {attempts.count()} attempts.")

        self.stdout.write(self.style.SUCCESS("All records successfully synced to MongoDB Atlas!"))
