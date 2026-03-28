from django.core.management.base import BaseCommand
from django.db import transaction

from api.models import Property, Report, ResidentPulse

DEMO_PROPERTIES = [
    {
        "name": "Harbor View Flats",
        "address_line1": "100 W Main St",
        "postal_code": "23510",
        "latitude": "36.846800",
        "longitude": "-76.292100",
        "management_company": "Coastal Residential Group",
        "lease_type_hint": "Mostly 12-month; renewal window around 60 days (demo).",
        "lease_insight": "Renter-reported threads mention moisture addenda and liability for drip pans. "
        "Demo tip: confirm who pays for mold testing and whether renters insurance is mandatory.",
        "management_insight": "Office hours are steady, but after-hours emergency response has been uneven "
        "in sample reports. Judges should expect ticket-style workflows more than on-site super.",
    },
    {
        "name": "Ghent Row Townhomes",
        "address_line1": "2100 Colley Ave",
        "postal_code": "23517",
        "latitude": "36.868200",
        "longitude": "-76.301400",
        "management_company": "Ghent Property Partners",
        "lease_type_hint": "Townhome-style; pet fees and yard care clauses common in demo packets.",
        "lease_insight": "Sample chatter flags exterior maintenance schedules and snow/ice responsibility "
        "for stoops. Ask for a written turnaround time for non-emergency work orders.",
        "management_insight": "Smaller portfolio feel in demo stories: slower email but fewer handoffs. "
        "Worth verifying who holds the security deposit if management changes brands.",
    },
    {
        "name": "Oceanair Lofts",
        "address_line1": "432 Granby St",
        "postal_code": "23510",
        "latitude": "36.851100",
        "longitude": "-76.288900",
        "management_company": "Downtown Norfolk Leasing",
        "lease_type_hint": "High-rise-style fees: amenity and package-locker line items appear in demo leases.",
        "lease_insight": "Demo renters mention guest policies, fob replacement costs, and HVAC filter cadence. "
        "Clarify noise hours and concierge vs. security responsibilities before signing.",
        "management_insight": "Centralized leasing team: fast application turnaround in demo, but "
        "building-wide communication can feel generic. Confirm local superintendent coverage.",
    },
    {
        "name": "Chelsea West Apartments",
        "address_line1": "880 W 44th St",
        "postal_code": "23508",
        "latitude": "36.874500",
        "longitude": "-76.312200",
        "management_company": "Midtown Rentals LLC",
        "lease_type_hint": "Standard 12-month; roommate addenda and guarantor language in demo files.",
        "lease_insight": "Sample notes highlight flooding-prone units and waterproofing riders. "
        "Ask about sump pumps, flood insurance expectations, and guest parking rules.",
        "management_insight": "Mixed reviews in demo: maintenance volume spikes after storms. "
        "Use the report feed to see if work orders stay open across weather cycles.",
    },
    {
        "name": "Lamberts Point Studios",
        "address_line1": "1200 W 38th St",
        "postal_code": "23508",
        "latitude": "36.880100",
        "longitude": "-76.305600",
        "management_company": "ODU Area Housing Co.",
        "lease_type_hint": "Academic-adjacent leases; shorter terms and summer sublease riders (demo).",
        "lease_insight": "Demo threads stress subletting rules, joint liability with roommates, and "
        "cleaning fee schedules. Read the move-out photo checklist line by line.",
        "management_insight": "Younger renter base means high turnover; demo management leans on "
        "self-service portals. Expect peak-season delays right before semester starts.",
    },
    {
        "name": "Riverfront Commons",
        "address_line1": "155 E Brambleton Ave",
        "postal_code": "23510",
        "latitude": "36.842900",
        "longitude": "-76.278500",
        "management_company": "Coastal Residential Group",
        "lease_type_hint": "Luxury-lite addenda: smart-lock apps and shared workspace rules (demo).",
        "lease_insight": "Sample renters talk through HVAC caps, balcony storage bans, and riverfront "
        "noise disclosures. Verify who clears drains and gutter backups touching your deck.",
        "management_insight": "Same operator as Harbor View in this demo—compare both threads for "
        "consistency on responsiveness before you assume branding equals service level.",
    },
    {
        "name": "Park Place Norfolk",
        "address_line1": "300 Monticello Ave",
        "postal_code": "23510",
        "latitude": "36.854400",
        "longitude": "-76.285700",
        "management_company": "Downtown Norfolk Leasing",
        "lease_type_hint": "Downtown mixed-use; retail-hours clauses and loading-zone parking (demo).",
        "lease_insight": "Demo packets mention guest parking validation, elevator reservations for moves, "
        "and trash chute etiquette fines. Ask about package overflow during holidays.",
        "management_insight": "Shared leasing desk across multiple towers in demo narrative—clarify "
        "which property manager owns your building’s escalations.",
    },
    {
        "name": "Larchmont Courtyard",
        "address_line1": "5900 Hampton Blvd",
        "postal_code": "23508",
        "latitude": "36.885600",
        "longitude": "-76.318800",
        "management_company": "Larchmont Living",
        "lease_type_hint": "Garden-style; pest and landscaping pass-through fees appear in demo docs.",
        "lease_insight": "Sample reports flag exterior bait stations and mulch moisture near foundations. "
        "Check whether pest is included or billed back quarterly.",
        "management_insight": "Demo impression: polite onsite staff, but vendor scheduling can slip "
        "during humid months—track dates on open tickets.",
    },
    {
        "name": "Willoughby Bay Townes",
        "address_line1": "7000 Hampton Blvd",
        "postal_code": "23505",
        "latitude": "36.895200",
        "longitude": "-76.325400",
        "management_company": "Bay Management Services",
        "lease_type_hint": "Townhomes near water; wind/hurricane prep addenda in demo sets.",
        "lease_insight": "Demo renters discuss garage drainage, fence repairs, and HOA-style exterior "
        "paint rules. Confirm who insures detached sheds or carports.",
        "management_insight": "Regional operator in demo—expect email-first communication with occasional "
        "third-party vendors. Read vendor access windows carefully.",
    },
    {
        "name": "East Beach Row",
        "address_line1": "9500 East Beach Blvd",
        "postal_code": "23518",
        "latitude": "36.918000",
        "longitude": "-76.168500",
        "management_company": "East Beach Realty",
        "lease_type_hint": "Coastal rental with seasonal maintenance surcharges in demo paperwork.",
        "lease_insight": "Sample chatter covers storm shutters, sand-salt tracking, and pooled water "
        "in garages. Ask how quickly pumps and drains are inspected after warnings.",
        "management_insight": "Boutique local manager in demo—relationship-heavy but smaller bench for "
        "after-hours coverage; align expectations on hurricane season protocols.",
    },
]

DEMO_REPORTS = [
    (0, "mold", "high", "Mold in bedroom corner, reported twice, unresolved for 3 weeks."),
    (0, "responsiveness", "medium", "Maintenance took 2 weeks to fix leak near window."),
    (1, "maintenance", "medium", "Water heater repair took 10 days despite follow-ups."),
    (2, "safety", "medium", "Main entry lock remained broken for several nights."),
    (2, "pests", "high", "Roach activity in kitchen continued after one treatment."),
    (3, "flooding", "high", "Ground-floor hallway flooded after heavy rain."),
    (3, "mold", "medium", "Musty smell developed after flood cleanup."),
    (4, "deposit", "high", "Unexpected deductions disputed at move-out."),
    (5, "maintenance", "high", "HVAC outage lasted four days during summer heat."),
    (6, "responsiveness", "low", "Portal replies are polite but sometimes delayed."),
    (7, "pests", "medium", "Ant issues near trash area each month."),
    (8, "safety", "low", "Parking lot lighting dim after 10 PM."),
    (9, "flooding", "medium", "Garage puddling appears after storms."),
]

DEMO_PULSES = [
    (0, False, "Would not renew if moisture issues continue."),
    (1, True, "Mostly satisfied, issues eventually get fixed."),
    (2, False, "Security concerns still unresolved."),
    (3, False, "Flooding risk makes daily life stressful."),
    (4, False, "Move-out experience reduced trust."),
    (5, True, "Building has issues but neighbors are supportive."),
    (6, True, "Currently okay for commute and budget."),
    (7, True, "Livable overall, needs better pest prevention."),
    (8, True, "Mostly comfortable with minor safety concerns."),
    (9, False, "Storm season problems affect confidence."),
]


class Command(BaseCommand):
    help = "Seed 10 Norfolk demo properties with realistic reports and pulse votes."

    def add_arguments(self, parser):
        parser.add_argument("--clear", action="store_true", help="Clear existing data first")

    @transaction.atomic
    def handle(self, *args, **options):
        if options["clear"]:
            ResidentPulse.objects.all().delete()
            Report.objects.all().delete()
            Property.objects.all().delete()

        if Property.objects.exists() and not options["clear"]:
            self.stdout.write("Data already exists. Use --clear to reseed.")
            return

        properties = []
        for row in DEMO_PROPERTIES:
            obj = Property.objects.create(city="Norfolk", state="VA", **row)
            properties.append(obj)

        for idx, issue, severity, text in DEMO_REPORTS:
            Report.objects.create(
                property=properties[idx],
                issue_type=issue,
                severity=severity,
                description=text,
            )

        for idx, approves, note in DEMO_PULSES:
            ResidentPulse.objects.create(property=properties[idx], approves=approves, note=note)

        self.stdout.write(self.style.SUCCESS("Seeded 10 properties with demo reports and pulses."))
