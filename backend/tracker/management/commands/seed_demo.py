from datetime import timedelta

from django.contrib.auth.models import User
from django.core.management.base import BaseCommand
from django.utils import timezone

from tracker.models import Application


class Command(BaseCommand):
    help = "Create demo user (demo / demo1234) with sample applications"

    def handle(self, *args, **opts):
        user, _ = User.objects.get_or_create(username="demo")
        user.set_password("demo1234")
        user.save()
        Application.objects.filter(owner=user).delete()
        today = timezone.localdate()
        rows = [
            ("Zoho", "Python Developer", "wishlist", "Chennai", None),
            ("Freshworks", "Full Stack Developer", "applied", "Chennai", 2),
            ("Kissflow", "Django Developer", "applied", "Remote", -1),
            ("Wipro", "Associate Engineer", "interview", "Bengaluru", 3),
            ("Infosys", "Systems Engineer", "offer", "Chennai", None),
            ("Startup X", "React Developer", "rejected", "Remote", None),
        ]
        for company, role, st, loc, d in rows:
            Application.objects.create(
                owner=user, company=company, role=role, status=st, location=loc,
                follow_up_date=today + timedelta(days=d) if d is not None else None,
            )
        self.stdout.write(self.style.SUCCESS("Seeded demo / demo1234"))
