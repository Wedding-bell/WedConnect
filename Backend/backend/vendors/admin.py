from django.contrib import admin
from .models import State, District

@admin.register(State)
class StateAdmin(admin.ModelAdmin):
    list_display = ("id", "name")

@admin.register(District)
class DistrictAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "state")
    list_filter = ("state",)
