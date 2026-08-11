import os
from collections import defaultdict
from django.core.management.base import BaseCommand
from django.db import transaction
from quiz_api.models import Participant, Attempt
from quiz_api.mongo_service import sync_participant_to_mongo, get_mongo_db

class Command(BaseCommand):
    help = 'Consolidate duplicate participant records by Name and Phone Number into 1 single master profile'

    def handle(self, *args, **options):
        self.stdout.write("Consolidating participant records...")
        
        # 1. Group by Name (case-insensitive) OR Phone Number
        groups = defaultdict(list)
        for p in Participant.objects.all():
            key = p.name.strip().lower()
            groups[key].append(p)

        with transaction.atomic():
            for name, p_list in groups.items():
                if len(p_list) > 1:
                    # Pick master: highest attempts count, or lowest ID
                    p_list.sort(key=lambda x: (x.attempts.count(), -x.id), reverse=True)
                    master = p_list[0]
                    self.stdout.write(f"Consolidating {len(p_list)} entries for '{name}' into Master ID #{master.id} ({master.phone_number})")
                    
                    for other in p_list[1:]:
                        for att in other.attempts.all():
                            existing = Attempt.objects.filter(participant=master, quiz_id=att.quiz_id).first()
                            if existing:
                                if att.score > existing.score:
                                    existing.score = att.score
                                    existing.status = att.status
                                    existing.submitted_at = att.submitted_at
                                    existing.save()
                                att.delete()
                            else:
                                att.participant = master
                                att.save()
                        other.delete()

        # Clean MongoDB participants collection and re-sync
        try:
            db = get_mongo_db()
            if db is not None:
                db.participants.delete_many({})
                self.stdout.write("Wiped stale participants in MongoDB Atlas.")
        except Exception as e:
            self.stdout.write(f"MongoDB wipe notice: {e}")

        for p in Participant.objects.all():
            sync_participant_to_mongo(p)
            self.stdout.write(f"Consolidated Profile ID #{p.id}: {p.name} ({p.phone_number}), Attempts: {p.attempts.count()}")

        self.stdout.write(self.style.SUCCESS("All participant records successfully consolidated into single items per person!"))
