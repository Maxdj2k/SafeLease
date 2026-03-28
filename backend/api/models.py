from django.db import models


class Property(models.Model):
    name = models.CharField(max_length=255)
    address_line1 = models.CharField(max_length=255)
    city = models.CharField(max_length=100, default="Norfolk")
    state = models.CharField(max_length=2, default="VA")
    postal_code = models.CharField(max_length=10)
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    management_company = models.CharField(max_length=255)
    lease_type_hint = models.CharField(
        max_length=200,
        blank=True,
        help_text="Demo hint about typical lease structure; not verified.",
    )
    lease_insight = models.TextField(
        blank=True,
        help_text="Demo narrative about what renters often watch for in the lease.",
    )
    management_insight = models.TextField(
        blank=True,
        help_text="Demo narrative about how management tends to operate (sample only).",
    )

    class Meta:
        ordering = ["name"]
        verbose_name_plural = "properties"


class Report(models.Model):
    ISSUE_TYPES = [
        ("mold", "Mold"),
        ("maintenance", "Maintenance"),
        ("pests", "Pests"),
        ("flooding", "Flooding"),
        ("safety", "Safety"),
        ("deposit", "Deposit"),
        ("responsiveness", "Responsiveness"),
    ]
    SEVERITY_CHOICES = [
        ("low", "Low"),
        ("medium", "Medium"),
        ("high", "High"),
    ]

    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name="reports")
    issue_type = models.CharField(max_length=32, choices=ISSUE_TYPES)
    severity = models.CharField(max_length=16, choices=SEVERITY_CHOICES)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to="report_photos/", blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]


class ResidentPulse(models.Model):
    property = models.ForeignKey(
        Property,
        on_delete=models.CASCADE,
        related_name="resident_pulses",
    )
    approves = models.BooleanField(
        help_text="Whether the resident currently approves living here."
    )
    note = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
