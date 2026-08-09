from datetime import datetime, timedelta, time
from django.core.management.base import BaseCommand
from django.utils import timezone
from quiz_api.models import Participant, Quiz, Question, QuestionOption, Attempt, Answer

class Command(BaseCommand):
    help = "Seed realistic sample data for Daily Paragraph-Based Quiz Platform"

    def handle(self, *args, **options):
        self.stdout.write("Seeding database with sample daily quizzes and participants...")

        today = timezone.localdate()
        yesterday = today - timedelta(days=1)
        tomorrow = today + timedelta(days=1)

        # Clear existing test data
        Answer.objects.all().delete()
        Attempt.objects.all().delete()
        QuestionOption.objects.all().delete()
        Question.objects.all().delete()
        Quiz.objects.all().delete()
        Participant.objects.all().delete()

        # 1. Create Sample Participants
        participants_data = [
            ("Rahul Sharma", "9876543210"),
            ("Priya Patel", "9876543211"),
            ("Anil Kumar", "9876543212"),
            ("Sneha Rao", "9876543213"),
            ("Suresh Reddy", "9876543214"),
            ("Vikram Singh", "9876543215"),
            ("Neha Gupta", "9876543216"),
        ]

        participants = {}
        for name, phone in participants_data:
            p = Participant.objects.create(name=name, phone_number=phone)
            participants[name] = p

        self.stdout.write(f"Created {len(participants)} participants.")

        # 2. Create Yesterday's Completed Quiz (Historical)
        yesterday_quiz = Quiz.objects.create(
            title="The Renaissance & The Printing Revolution",
            quiz_date=yesterday,
            start_time=time(10, 0),
            end_time=time(10, 5),
            duration_minutes=5,
            passage_title="The Gutenberg Revolution",
            passage_content=(
                "In 1440, in Mainz, Germany, Johannes Gutenberg introduced movable type printing to Europe, "
                "a breakthrough that democratized information and catalyzed the Renaissance. Prior to this invention, "
                "books were painstakingly transcribed by hand, predominantly in monasteries, making them extraordinarily "
                "expensive and accessible only to royalty and the clergy. Gutenberg combined oil-based inks, a durable metal alloy "
                "of lead, tin, and antimony for the type pieces, and an adapted wooden screw press modeled after agricultural wine presses. "
                "His first major publication, the 42-line Gutenberg Bible completed in 1455, marked the dawn of mass media. "
                "Within five decades, printing presses spread across more than 250 European cities, printing over 20 million volumes "
                "and permanently accelerating scientific dissemination, literacy rates, and cultural exchange across the continent."
            ),
            instructions="Read the passage on Gutenberg's printing press and answer the four questions.",
            status="ENDED"
        )

        y_questions_data = [
            {
                "num": 1,
                "text": "What type of traditional device inspired Gutenberg's mechanical press design?",
                "options": [
                    ("A", "A blacksmith's bellows", False),
                    ("B", "An agricultural screw-type wine press", True),
                    ("C", "A water-powered grain mill", False),
                    ("D", "A nautical windlass", False),
                ]
            },
            {
                "num": 2,
                "text": "Which metals were combined in Gutenberg's durable type alloy?",
                "options": [
                    ("A", "Lead, tin, and antimony", True),
                    ("B", "Iron, copper, and bronze", False),
                    ("C", "Gold, silver, and mercury", False),
                    ("D", "Zinc, platinum, and nickel", False),
                ]
            },
            {
                "num": 3,
                "text": "Where and in what year did Gutenberg first introduce movable type to Europe?",
                "options": [
                    ("A", "Paris in 1460", False),
                    ("B", "Venice in 1435", False),
                    ("C", "Mainz in 1440", True),
                    ("D", "London in 1450", False),
                ]
            },
            {
                "num": 4,
                "text": "How many volumes were estimated to have been printed across Europe within the first 50 years?",
                "options": [
                    ("A", "Around 500,000", False),
                    ("B", "Over 20 million", True),
                    ("C", "Exactly 5 million", False),
                    ("D", "Less than 1 million", False),
                ]
            },
        ]

        y_q_objs = []
        for qd in y_questions_data:
            q = Question.objects.create(
                quiz=yesterday_quiz,
                question_number=qd["num"],
                question_text=qd["text"]
            )
            q_opts = {}
            for key, txt, corr in qd["options"]:
                opt = QuestionOption.objects.create(
                    question=q,
                    option_key=key,
                    option_text=txt,
                    is_correct=corr
                )
                q_opts[key] = opt
            y_q_objs.append((q, q_opts))

        # Seed attempts for yesterday
        y_attempts_specs = [
            ("Rahul Sharma", "10:02:12", {"1": "B", "2": "A", "3": "C", "4": "B"}), # 4/4
            ("Priya Patel", "10:03:18", {"1": "B", "2": "A", "3": "C", "4": "B"}),  # 4/4 (Submitted later than Rahul)
            ("Anil Kumar", "10:01:40", {"1": "B", "2": "A", "3": "A", "4": "B"}),   # 3/4
            ("Sneha Rao", "10:02:50", {"1": "B", "2": "C", "3": "C", "4": "B"}),    # 3/4
            ("Suresh Reddy", "10:04:10", {"1": "A", "2": "A", "3": "C", "4": "A"}), # 2/4
        ]

        base_dt = datetime.combine(yesterday, time(10, 0))
        for p_name, sub_time_str, choices in y_attempts_specs:
            p = participants[p_name]
            h, m, s = map(int, sub_time_str.split(':'))
            sub_dt = timezone.make_aware(datetime.combine(yesterday, time(h, m, s)))
            
            att = Attempt.objects.create(
                quiz=yesterday_quiz,
                participant=p,
                status='COMPLETED',
                started_at=sub_dt - timedelta(minutes=2),
                submitted_at=sub_dt,
                score=0
            )

            score = 0
            for idx, (q, opts_dict) in enumerate(y_q_objs, start=1):
                sel_key = choices[str(idx)]
                opt = opts_dict[sel_key]
                if opt.is_correct:
                    score += 1
                Answer.objects.create(
                    attempt=att,
                    question=q,
                    selected_option=opt,
                    is_correct=opt.is_correct
                )
            att.score = score
            att.save()

        self.stdout.write("Seeded yesterday's quiz with participants and Rahul as winner (4/4 at 10:02:12).")

        # 3. Create Today's Quiz (LIVE & Ready for Interactive Quiz participation)
        now_time = timezone.localtime().time()
        start_t = time(max(0, now_time.hour - 1), 0)
        end_t = time(min(23, now_time.hour + 4), 59)

        today_quiz = Quiz.objects.create(
            title="The James Webb Space Telescope & Deep Infrared Astronomy",
            quiz_date=today,
            start_time=start_t,
            end_time=end_t,
            duration_minutes=5,
            passage_title="Eyes on the Cosmic Dawn",
            passage_content=(
                "The James Webb Space Telescope (JWST) is an infrared astronomy space observatory launched on December 25, 2021. "
                "Positioned approximately 1.5 million kilometers from Earth at the Sun-Earth L2 Lagrange point, JWST's primary mirror "
                "consists of 18 hexagonal beryllium segments coated with a microscopic layer of pure gold, providing a total diameter of 6.5 meters. "
                "Operating at ultra-cold cryogenic temperatures around 50 Kelvin (-223°C), shielded by a five-layer tennis-court-sized sunshield, "
                "the telescope can detect faint infrared radiation from the earliest galaxies formed over 13.5 billion years ago. "
                "Unlike Hubble, which primarily observes ultraviolet, visible, and near-infrared wavelengths, JWST's mid-to-long infrared vision "
                "penetrates dense cosmic dust clouds to reveal stellar nurseries, proto-planetary discs, and the chemical signatures of distant exoplanet atmospheres."
            ),
            instructions="Read the passage carefully before answering the 4 questions. You have one attempt to submit your answers.",
            status="LIVE"
        )

        today_questions = [
            {
                "num": 1,
                "text": "What material is used for the substrate of JWST's 18 hexagonal primary mirror segments?",
                "options": [
                    ("A", "Fused quartz coated with silver", False),
                    ("B", "Lightweight beryllium coated with gold", True),
                    ("C", "Polished titanium with silicon carbide", False),
                    ("D", "Carbon-fiber composite with aluminium", False),
                ]
            },
            {
                "num": 2,
                "text": "At what specific orbital location is the JWST situated to maintain thermal stability?",
                "options": [
                    ("A", "Low Earth Orbit at 550 km altitude", False),
                    ("B", "Geostationary transfer orbit at 35,786 km", False),
                    ("C", "The Sun-Earth L2 Lagrange point (1.5M km from Earth)", True),
                    ("D", "Lunar orbit around the Moon's South Pole", False),
                ]
            },
            {
                "num": 3,
                "text": "Approximately what operating temperature is maintained by the five-layer sunshield?",
                "options": [
                    ("A", "Around 50 Kelvin (-223°C)", True),
                    ("B", "Absolute Zero (0 Kelvin)", False),
                    ("C", "150 Kelvin (-123°C)", False),
                    ("D", "Room temperature (293 Kelvin)", False),
                ]
            },
            {
                "num": 4,
                "text": "Why does JWST prioritize infrared wavelengths over Hubble's visible light spectrum?",
                "options": [
                    ("A", "Infrared cameras are significantly cheaper to manufacture", False),
                    ("B", "Infrared light travels faster than visible light through space", False),
                    ("C", "Infrared penetrates dense cosmic dust to observe the earliest distant galaxies", True),
                    ("D", "Infrared allows direct optical photography of black hole singularities", False),
                ]
            },
        ]

        t_q_objs = []
        for qd in today_questions:
            q = Question.objects.create(
                quiz=today_quiz,
                question_number=qd["num"],
                question_text=qd["text"]
            )
            q_opts = {}
            for key, txt, corr in qd["options"]:
                opt = QuestionOption.objects.create(
                    question=q,
                    option_key=key,
                    option_text=txt,
                    is_correct=corr
                )
                q_opts[key] = opt
            t_q_objs.append((q, q_opts))

        # Seed two sample submissions for today so admin has live data immediately
        vikram = participants["Vikram Singh"]
        neha = participants["Neha Gupta"]

        now_aware = timezone.now()
        att_vikram = Attempt.objects.create(
            quiz=today_quiz,
            participant=vikram,
            status='COMPLETED',
            started_at=now_aware - timedelta(minutes=10),
            submitted_at=now_aware - timedelta(minutes=7),
            score=4
        )
        for q, opts in t_q_objs:
            corr_opt = next(o for o in opts.values() if o.is_correct)
            Answer.objects.create(attempt=att_vikram, question=q, selected_option=corr_opt, is_correct=True)

        att_neha = Attempt.objects.create(
            quiz=today_quiz,
            participant=neha,
            status='COMPLETED',
            started_at=now_aware - timedelta(minutes=8),
            submitted_at=now_aware - timedelta(minutes=5),
            score=3
        )
        for idx, (q, opts) in enumerate(t_q_objs, start=1):
            if idx == 4:
                wrong_opt = next(o for o in opts.values() if not o.is_correct)
                Answer.objects.create(attempt=att_neha, question=q, selected_option=wrong_opt, is_correct=False)
            else:
                corr_opt = next(o for o in opts.values() if o.is_correct)
                Answer.objects.create(attempt=att_neha, question=q, selected_option=corr_opt, is_correct=True)

        self.stdout.write("Seeded Today's Live Quiz with Vikram and Neha attempts.")

        # 4. Create Tomorrow's Scheduled Quiz (Upcoming)
        tomorrow_quiz = Quiz.objects.create(
            title="Ocean Depths: The Mariana Trench & Hadal Biosphere",
            quiz_date=tomorrow,
            start_time=time(10, 0),
            end_time=time(10, 5),
            duration_minutes=5,
            passage_title="Life in the Abyss",
            passage_content=(
                "Plunging nearly 11,000 meters into the western Pacific Ocean, the Challenger Deep within the Mariana Trench "
                "represents the deepest known point on Earth. In this hadal zone, pressures exceed 1,000 atmospheres (over 1,086 bar), "
                "temperatures hover barely above freezing at 1 to 4°C, and total darkness prevails. Despite these extreme conditions, "
                "submersibles such as the Trieste in 1960 and modern robotic explorers have uncovered a thriving ecosystem. "
                "Organisms here rely on chemosynthesis rather than photosynthesis, supported by piezophile bacteria that thrive under crushing pressures. "
                "Unique xenophyophores—giant single-celled protozoans measuring up to 10 centimeters—and specialized amphipods produce high levels "
                "of trimethylamine N-oxide (TMAO) to stabilize their cellular proteins against hydrostatic compression."
            ),
            instructions="Tomorrow's daily challenge on deep-sea biological adaptations.",
            status="SCHEDULED"
        )

        tomorrow_questions = [
            {
                "num": 1,
                "text": "What is the deepest known location in the Mariana Trench called?",
                "options": [
                    ("A", "The Java Abyss", False),
                    ("B", "Challenger Deep", True),
                    ("C", "Sunda Trench", False),
                    ("D", "Puerto Rico Deep", False),
                ]
            },
            {
                "num": 2,
                "text": "What chemical compound helps hadal organisms stabilize proteins against extreme pressure?",
                "options": [
                    ("A", "Trimethylamine N-oxide (TMAO)", True),
                    ("B", "Sodium hypochlorite", False),
                    ("C", "Calcium carbonate", False),
                    ("D", "Sulfuric acid", False),
                ]
            },
            {
                "num": 3,
                "text": "What primary energetic process powers the deep hadal food chain in the absence of sunlight?",
                "options": [
                    ("A", "Radiotrophic synthesis", False),
                    ("B", "Photosynthesis", False),
                    ("C", "Chemosynthesis", True),
                    ("D", "Nuclear fusion", False),
                ]
            },
            {
                "num": 4,
                "text": "What are xenophyophores, which thrive on the trench floor?",
                "options": [
                    ("A", "Bioluminescent deep-sea sharks", False),
                    ("B", "Giant single-celled protozoans", True),
                    ("C", "Carnivorous hydrothermal coral reefs", False),
                    ("D", "Submarine volcanic vents", False),
                ]
            },
        ]

        for qd in tomorrow_questions:
            q = Question.objects.create(
                quiz=tomorrow_quiz,
                question_number=qd["num"],
                question_text=qd["text"]
            )
            for key, txt, corr in qd["options"]:
                QuestionOption.objects.create(
                    question=q,
                    option_key=key,
                    option_text=txt,
                    is_correct=corr
                )

        self.stdout.write(self.style.SUCCESS("Successfully seeded sample data for yesterday, today, and tomorrow!"))
