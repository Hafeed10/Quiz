from django.core.management.base import BaseCommand
from quiz_api.mongo_service import sync_from_mongo_to_sqlite, ping_mongo

class Command(BaseCommand):
    help = "Restore and sync all saved documents from MongoDB Atlas into local SQLite database for UI display"

    def handle(self, *args, **options):
        self.stdout.write("Checking MongoDB Atlas connection...")
        ping = ping_mongo()
        if not ping:
            self.stderr.write("Failed to connect to MongoDB Atlas.")
            return

        self.stdout.write("MongoDB Atlas connected! Syncing saved data into SQLite database...")
        sync_from_mongo_to_sqlite()
        self.stdout.write(self.style.SUCCESS("Successfully restored and synced MongoDB Atlas saved data to UI database!"))
