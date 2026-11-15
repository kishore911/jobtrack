from datetime import timedelta

from django.db.models import Q
from django.utils import timezone
from rest_framework import generics, permissions, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Application
from .serializers import ApplicationSerializer, RegisterSerializer


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class ApplicationViewSet(viewsets.ModelViewSet):
    """Users only ever see their own applications. Supports ?q= search."""
    serializer_class = ApplicationSerializer

    def get_queryset(self):
        qs = Application.objects.filter(owner=self.request.user)
        q = self.request.query_params.get("q")
        if q:
            qs = qs.filter(Q(company__icontains=q) | Q(role__icontains=q))
        return qs

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class StatsView(APIView):
    def get(self, request):
        qs = Application.objects.filter(owner=request.user)
        counts = {s: qs.filter(status=s).count() for s, _ in Application.Status.choices}
        sent = sum(v for k, v in counts.items() if k != "wishlist")
        got_interview = counts["interview"] + counts["offer"]
        soon = timezone.localdate() + timedelta(days=7)
        followups = qs.filter(
            status__in=["applied", "interview"], follow_up_date__isnull=False, follow_up_date__lte=soon
        ).order_by("follow_up_date")[:5]
        return Response({
            "total": qs.count(),
            "counts": counts,
            "interview_rate": round(100 * got_interview / sent) if sent else 0,
            "followups": [
                {"id": a.id, "company": a.company, "role": a.role, "date": a.follow_up_date} for a in followups
            ],
        })
