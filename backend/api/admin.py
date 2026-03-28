from django.contrib import admin

from .models import Property, Report, ResidentPulse

admin.site.register(Property)
admin.site.register(Report)
admin.site.register(ResidentPulse)
