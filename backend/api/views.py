from django.db.models import Prefetch, Q
from rest_framework import mixins, viewsets
from rest_framework.generics import CreateAPIView
from rest_framework.parsers import JSONParser, MultiPartParser, FormParser

from .models import Property, Report, ResidentPulse
from .serializers import (
    PropertyListSerializer,
    PropertyDetailSerializer,
    ReportCreateSerializer,
    ResidentPulseSerializer,
)


class PropertyViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    queryset = Property.objects.all()

    def get_queryset(self):
        qs = Property.objects.prefetch_related(
            Prefetch("reports", queryset=Report.objects.order_by("-created_at")),
            Prefetch("resident_pulses", queryset=ResidentPulse.objects.order_by("-created_at")),
        )
        q = self.request.query_params.get("search") or self.request.query_params.get("q")
        if q:
            term = q.strip()
            qs = qs.filter(
                Q(name__icontains=term)
                | Q(address_line1__icontains=term)
                | Q(management_company__icontains=term)
                | Q(city__icontains=term)
            )
        return qs

    def get_serializer_class(self):
        if self.action == "retrieve":
            return PropertyDetailSerializer
        return PropertyListSerializer


class ReportCreateView(CreateAPIView):
    queryset = Report.objects.all()
    serializer_class = ReportCreateSerializer
    parser_classes = [JSONParser, MultiPartParser, FormParser]


class ResidentPulseCreateView(CreateAPIView):
    queryset = ResidentPulse.objects.all()
    serializer_class = ResidentPulseSerializer
    parser_classes = [JSONParser, FormParser]
