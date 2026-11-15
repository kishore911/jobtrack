from django.contrib.auth.models import User
from rest_framework.test import APITestCase

from .models import Application


class TrackerTests(APITestCase):
    def setUp(self):
        self.u = User.objects.create_user("a", password="pass1234")
        self.o = User.objects.create_user("b", password="pass1234")
        Application.objects.create(owner=self.o, company="Secret Inc", role="Dev")
        r = self.client.post("/api/auth/token/", {"username": "a", "password": "pass1234"})
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {r.data['access']}")

    def test_isolation_and_search(self):
        self.client.post("/api/applications/", {"company": "Zoho", "role": "Django Developer"})
        self.assertEqual(len(self.client.get("/api/applications/").data), 1)
        self.assertEqual(len(self.client.get("/api/applications/?q=zoho").data), 1)
        self.assertEqual(len(self.client.get("/api/applications/?q=secret").data), 0)

    def test_status_update_and_interview_rate(self):
        for name, st in [("X", "applied"), ("Y", "interview"), ("Z", "applied"), ("W", "wishlist")]:
            self.client.post("/api/applications/", {"company": name, "role": "Dev", "status": st})
        app = Application.objects.get(company="X")
        self.client.patch(f"/api/applications/{app.id}/", {"status": "offer"})
        s = self.client.get("/api/stats/").data
        self.assertEqual(s["counts"]["offer"], 1)
        self.assertEqual(s["interview_rate"], 67)  # 2 of 3 sent applications reached interview/offer
