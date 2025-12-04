from django.contrib import admin
from .models import WeatherData, NDVIData, ClimateRisk, WeatherAlert


@admin.register(WeatherData)
class WeatherDataAdmin(admin.ModelAdmin):
    list_display = ['location_name', 'date', 'forecast_date', 'temp_avg', 'rainfall', 'condition', 'source']
    list_filter = ['condition', 'source', 'date']
    search_fields = ['location_name']
    date_hierarchy = 'date'
    ordering = ['-date']
    
    fieldsets = (
        ('Location', {'fields': ('latitude', 'longitude', 'location_name')}),
        ('Date', {'fields': ('date', 'forecast_date')}),
        ('Temperature', {'fields': ('temp_min', 'temp_max', 'temp_avg')}),
        ('Conditions', {'fields': ('rainfall', 'humidity', 'wind_speed', 'condition')}),
        ('Source', {'fields': ('source',)}),
        ('Metadata', {'fields': ('created_at',)}),
    )
    readonly_fields = ['created_at']


@admin.register(NDVIData)
class NDVIDataAdmin(admin.ModelAdmin):
    list_display = ['farm_profile', 'ndvi_value', 'health_status', 'image_date', 'cloud_cover_percent', 'source']
    list_filter = ['health_status', 'source', 'image_date']
    search_fields = ['farm_profile__farm_name', 'farm_profile__user__email']
    date_hierarchy = 'image_date'
    ordering = ['-image_date']
    readonly_fields = ['health_status', 'created_at']
    
    fieldsets = (
        ('Farm', {'fields': ('farm_profile',)}),
        ('NDVI Data', {'fields': ('ndvi_value', 'health_status', 'image_date')}),
        ('Quality', {'fields': ('cloud_cover_percent', 'source')}),
        ('Metadata', {'fields': ('created_at',)}),
    )


@admin.register(ClimateRisk)
class ClimateRiskAdmin(admin.ModelAdmin):
    list_display = ['farm_profile', 'assessment_date', 'overall_risk_level', 'drought_risk', 'flood_risk', 'confidence']
    list_filter = ['overall_risk_level', 'assessment_date']
    search_fields = ['farm_profile__farm_name', 'farm_profile__user__email']
    date_hierarchy = 'assessment_date'
    ordering = ['-assessment_date']
    readonly_fields = ['overall_risk_level', 'created_at']
    
    fieldsets = (
        ('Farm', {'fields': ('farm_profile',)}),
        ('Period', {'fields': ('assessment_date', 'period_start', 'period_end')}),
        ('Risk Scores', {'fields': ('drought_risk', 'flood_risk', 'extreme_temp_risk', 'overall_risk_level')}),
        ('Assessment', {'fields': ('recommendations', 'confidence')}),
        ('Metadata', {'fields': ('created_at',)}),
    )


@admin.register(WeatherAlert)
class WeatherAlertAdmin(admin.ModelAdmin):
    list_display = ['user', 'alert_type', 'severity', 'title', 'is_active', 'is_read', 'valid_from', 'valid_until']
    list_filter = ['alert_type', 'severity', 'is_active', 'is_read']
    search_fields = ['user__email', 'title', 'message']
    date_hierarchy = 'created_at'
    ordering = ['-created_at']
    readonly_fields = ['created_at']
    
    fieldsets = (
        ('User & Type', {'fields': ('user', 'alert_type', 'severity')}),
        ('Message', {'fields': ('title', 'message')}),
        ('Validity', {'fields': ('valid_from', 'valid_until')}),
        ('Status', {'fields': ('is_active', 'is_read', 'notification_sent')}),
        ('Metadata', {'fields': ('created_at',)}),
    )
    
    actions = ['mark_as_read', 'mark_as_unread', 'activate_alerts', 'deactivate_alerts']
    
    def mark_as_read(self, request, queryset):
        queryset.update(is_read=True)
    mark_as_read.short_description = "Mark selected as read"
    
    def mark_as_unread(self, request, queryset):
        queryset.update(is_read=False)
    mark_as_unread.short_description = "Mark selected as unread"
    
    def activate_alerts(self, request, queryset):
        queryset.update(is_active=True)
    activate_alerts.short_description = "Activate selected alerts"
    
    def deactivate_alerts(self, request, queryset):
        queryset.update(is_active=False)
    deactivate_alerts.short_description = "Deactivate selected alerts"
