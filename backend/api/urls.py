from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import PropertyViewSet, ReportCreateView, ResidentPulseCreateView

router = DefaultRouter()
router.register("properties", PropertyViewSet, basename="property")

urlpatterns = [
    path("", include(router.urls)),
    path("reports/", ReportCreateView.as_view(), name="report-create"),
    path("pulses/", ResidentPulseCreateView.as_view(), name="pulse-create"),
]
