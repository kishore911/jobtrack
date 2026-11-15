from django.urls import path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView

from .views import ApplicationViewSet, RegisterView, StatsView

router = DefaultRouter()
router.register("applications", ApplicationViewSet, basename="application")

urlpatterns = [
    path("auth/register/", RegisterView.as_view()),
    path("auth/token/", TokenObtainPairView.as_view()),
    path("stats/", StatsView.as_view()),
] + router.urls
