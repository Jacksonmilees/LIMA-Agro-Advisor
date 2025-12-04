from django.contrib import admin
from .models import CropGuide, PestDisease, AIRecommendation

class PestDiseaseInline(admin.TabularInline):
    model = PestDisease
    extra = 1

@admin.register(CropGuide)
class CropGuideAdmin(admin.ModelAdmin):
    list_display = ['name', 'scientific_name', 'planting_season', 'time_to_harvest_days']
    search_fields = ['name', 'scientific_name']
    inlines = [PestDiseaseInline]
    
    fieldsets = (
        ('Basic Info', {'fields': ('name', 'scientific_name')}),
        ('Planting', {'fields': ('planting_season', 'time_to_harvest_days', 'seed_rate_per_acre', 'spacing')}),
        ('Requirements', {'fields': ('soil_ph_min', 'soil_ph_max', 'water_requirement')}),
        ('Management', {'fields': ('fertilizer_recommendation', 'common_challenges')}),
    )

@admin.register(PestDisease)
class PestDiseaseAdmin(admin.ModelAdmin):
    list_display = ['name', 'type', 'crop']
    list_filter = ['type', 'crop']
    search_fields = ['name', 'symptoms']

@admin.register(AIRecommendation)
class AIRecommendationAdmin(admin.ModelAdmin):
    list_display = ['user', 'query', 'created_at', 'feedback_score']
    list_filter = ['created_at', 'context']
    search_fields = ['query', 'response', 'user__email']
    readonly_fields = ['created_at']
