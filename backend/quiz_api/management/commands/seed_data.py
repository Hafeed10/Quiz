from django.core.management.base import BaseCommand

class Command(BaseCommand):
    help = "Database is configured for production. No demo data is seeded."

    def handle(self, *args, **options):
        self.stdout.write("Production database active. Create new quizzes via Admin Dashboard.")
