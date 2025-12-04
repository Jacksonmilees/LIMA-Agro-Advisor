from django.contrib import admin
from .models import JournalEntry, FieldActivity


@admin.register(JournalEntry)
class JournalEntryAdmin(admin.ModelAdmin):
    list_display = ['title', 'farm_profile', 'entry_date', 'entry_type', 'crop_name']
    list_filter = ['entry_type', 'entry_date']
    search_fields = ['title', 'content', 'crop_name', 'farm_profile__farm_name']
    date_hierarchy = 'entry_date'
    ordering = ['-entry_date']
    
    fieldsets = (
        ('Basic Info', {'fields': ('farm_profile', 'title', 'entry_date', 'entry_type')}),
        ('Content', {'fields': ('content', 'photo_url')}),
        ('Details', {'fields': ('crop_name', 'field_section', 'tags')}),
        ('Metadata', {'fields': ('created_at', 'updated_at')}),
    )
    readonly_fields = ['created_at', 'updated_at']


@admin.register(FieldActivity)
class FieldActivityAdmin(admin.ModelAdmin):
    list_display = ['activity_type', 'farm_profile', 'activity_date', 'crop_name', 'cost']
    list_filter = ['activity_type', 'activity_date']
    search_fields = ['description', 'crop_name', 'farm_profile__farm_name']
    date_hierarchy = 'activity_date'
    ordering = ['-activity_date']
    
    fieldsets = (
        ('Basic Info', {'fields': ('farm_profile', 'activity_date', 'activity_type')}),
        ('Location', {'fields': ('crop_name', 'field_section')}),
        ('Activity Details', {'fields': ('description', 'quantity_used', 'cost')}),
        ('Labor', {'fields': ('labor_hours', 'workers_count')}),
        ('Metadata', {'fields': ('created_at',)}),
    )
    readonly_fields = ['created_at']
