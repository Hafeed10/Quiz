from django.core.management.base import BaseCommand
from quiz_api.models import Participant, Quiz, Question, QuestionOption, Attempt, Answer
from quiz_api.mongo_service import get_mongo_db

class Command(BaseCommand):
    help = "Purge all demo/test data from SQLite database and MongoDB Atlas."

    def handle(self, *args, **options):
        self.stdout.write("Purging all demo data from local database...")
        Answer.objects.all().delete()
        Attempt.objects.all().delete()
        QuestionOption.objects.all().delete()
        Question.objects.all().delete()
        Quiz.objects.all().delete()
        Participant.objects.all().delete()

        self.stdout.write("Purging collections from MongoDB Atlas...")
        db = get_mongo_db()
        if db is not None:
            try:
                db.participants.delete_many({})
                db.quizzes.delete_many({})
                db.attempts.delete_many({})
                self.stdout.write("MongoDB Atlas collections cleared.")
            except Exception as e:
                self.stderr.write(f"MongoDB clear warning: {e}")

        self.stdout.write(self.style.SUCCESS("All demo data removed! Database is clean and ready."))
