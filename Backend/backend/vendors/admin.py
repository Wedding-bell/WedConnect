from django.contrib import admin
from .models import State, District, Category, Vendor

@admin.register(State)
class StateAdmin(admin.ModelAdmin):
    list_display = ("id", "name")

@admin.register(District)
class DistrictAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "state")
    list_filter = ("state",)

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "is_active")

@admin.register(Vendor)
class VendorAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "email", "category", "is_active", "joining_date")
    list_filter = ("category", "is_active", "joining_date")
    search_fields = ("name", "email", "contact_number")
