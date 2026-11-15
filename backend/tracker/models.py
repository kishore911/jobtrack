from django.contrib.auth.models import User
from django.db import models


class Application(models.Model):
    class Status(models.TextChoices):
        WISHLIST = "wishlist", "Wishlist"
        APPLIED = "applied", "Applied"
        INTERVIEW = "interview", "Interview"
        OFFER = "offer", "Offer"
        REJECTED = "rejected", "Rejected"

    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="applications")
    company = models.CharField(max_length=120)
    role = models.CharField(max_length=120)
    status = models.CharField(max_length=12, choices=Status.choices, default=Status.WISHLIST)
    job_url = models.URLField(blank=True)
    location = models.CharField(max_length=80, blank=True)
    salary = models.CharField(max_length=50, blank=True)
    notes = models.TextField(blank=True)
    follow_up_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]

    def __str__(self):
        return f"{self.role} @ {self.company}"
