from rest_framework import serializers

from .models import Property, Report, ResidentPulse
from .risk import ISSUE_WEIGHTS, SEVERITY_MULTIPLIERS, aggregate_risk


class ReportSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Report
        fields = ("id", "issue_type", "severity", "description", "image_url", "created_at")

    def get_image_url(self, obj):
        if not obj.image:
            return None
        request = self.context.get("request")
        if request:
            return request.build_absolute_uri(obj.image.url)
        return obj.image.url


class ResidentPulseSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResidentPulse
        fields = ("id", "property", "approves", "note", "created_at")
        read_only_fields = ("id", "created_at")


class PropertyListSerializer(serializers.ModelSerializer):
    risk_score = serializers.SerializerMethodField()
    risk_label = serializers.SerializerMethodField()
    address_display = serializers.SerializerMethodField()

    class Meta:
        model = Property
        fields = (
            "id",
            "name",
            "address_display",
            "latitude",
            "longitude",
            "management_company",
            "risk_score",
            "risk_label",
        )

    def get_address_display(self, obj):
        return f"{obj.address_line1}, {obj.city}, {obj.state} {obj.postal_code}"

    def _agg(self, obj):
        if not hasattr(self, "_risk_cache"):
            self._risk_cache = {}
        if obj.pk not in self._risk_cache:
            self._risk_cache[obj.pk] = aggregate_risk(obj.reports.all())
        return self._risk_cache[obj.pk]

    def get_risk_score(self, obj):
        return self._agg(obj)["risk_score"]

    def get_risk_label(self, obj):
        return self._agg(obj)["risk_label"]


class PropertyDetailSerializer(PropertyListSerializer):
    issue_counts = serializers.SerializerMethodField()
    risk_breakdown = serializers.SerializerMethodField()
    overall_livability = serializers.SerializerMethodField()
    resident_approval = serializers.SerializerMethodField()
    pulse_feed = serializers.SerializerMethodField()
    reports = ReportSerializer(many=True, read_only=True)
    scoring_explanation = serializers.SerializerMethodField()

    class Meta(PropertyListSerializer.Meta):
        fields = PropertyListSerializer.Meta.fields + (
            "address_line1",
            "city",
            "state",
            "postal_code",
            "lease_type_hint",
            "lease_insight",
            "management_insight",
            "issue_counts",
            "risk_breakdown",
            "overall_livability",
            "resident_approval",
            "pulse_feed",
            "scoring_explanation",
            "reports",
        )

    def get_issue_counts(self, obj):
        return self._agg(obj)["issue_counts"]

    def get_risk_breakdown(self, obj):
        return self._agg(obj)["by_issue"]

    def get_overall_livability(self, obj):
        label = self._agg(obj)["risk_label"]
        if label == "low":
            return "good"
        if label == "high":
            return "caution"
        return "mixed"

    def get_resident_approval(self, obj):
        pulses = list(obj.resident_pulses.all())
        total = len(pulses)
        approves = sum(1 for p in pulses if p.approves)
        disapproves = total - approves
        percent = round((approves / total) * 100, 1) if total else None
        return {
            "total_votes": total,
            "approve_count": approves,
            "disapprove_count": disapproves,
            "approve_percent": percent,
        }

    def get_pulse_feed(self, obj):
        return ResidentPulseSerializer(obj.resident_pulses.all()[:25], many=True).data

    def get_scoring_explanation(self, obj):
        return {
            "issue_weights": ISSUE_WEIGHTS,
            "severity_multipliers": SEVERITY_MULTIPLIERS,
            "formula": "per_report_points = issue_weight[issue_type] * severity_multiplier[severity]",
        }


class ReportCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = (
            "id",
            "property",
            "issue_type",
            "severity",
            "description",
            "image",
            "created_at",
        )
        read_only_fields = ("id", "created_at")
