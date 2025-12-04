from django.contrib import admin
from .models import MarketPrice, PriceAlert, PriceForecast


@admin.register(MarketPrice)
class MarketPriceAdmin(admin.ModelAdmin):
    list_display = ['crop', 'market', 'price_per_kg', 'date', 'source', 'created_at']
    list_filter = ['crop', 'market', 'source', 'date']
    search_fields = ['crop', 'market']
    date_hierarchy = 'date'
    ordering = ['-date', 'crop']
    
    fieldsets = (
        ('Price Details', {'fields': ('crop', 'market', 'price_per_kg', 'date')}),
        ('Source', {'fields': ('source',)}),
        ('Timestamps', {'fields': ('created_at', 'updated_at')}),
    )
    readonly_fields = ['created_at', 'updated_at']


@admin.register(PriceAlert)
class PriceAlertAdmin(admin.ModelAdmin):
    list_display = ['user', 'crop', 'target_price', 'market', 'is_active', 'triggered_at', 'created_at']
    list_filter = ['is_active', 'crop', 'market', 'notify_sms', 'notify_email']
    search_fields = ['user__email', 'crop']
    readonly_fields = ['triggered_at', 'triggered_price', 'created_at', 'updated_at']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('User & Alert', {'fields': ('user', 'crop', 'target_price', 'market')}),
        ('Status', {'fields': ('is_active', 'triggered_at', 'triggered_price')}),
        ('Notifications', {'fields': ('notify_sms', 'notify_email')}),
        ('Timestamps', {'fields': ('created_at', 'updated_at')}),
    )
    
    actions = ['activate_alerts', 'deactivate_alerts']
    
    def activate_alerts(self, request, queryset):
        queryset.update(is_active=True)
    activate_alerts.short_description = "Activate selected alerts"
    
    def deactivate_alerts(self, request, queryset):
        queryset.update(is_active=False)
    deactivate_alerts.short_description = "Deactivate selected alerts"


@admin.register(PriceForecast)
class PriceForecastAdmin(admin.ModelAdmin):
    list_display = ['crop', 'market', 'forecast_date', 'predicted_price', 'confidence', 'model_used', 'generated_at']
    list_filter = ['crop', 'market', 'model_used', 'forecast_date']
    search_fields = ['crop', 'market']
    date_hierarchy = 'forecast_date'
    ordering = ['forecast_date', 'crop']
    readonly_fields = ['generated_at']
    
    fieldsets = (
        ('Forecast Details', {'fields': ('crop', 'market', 'forecast_date')}),
        ('Prediction', {'fields': ('predicted_price', 'confidence', 'model_used')}),
        ('Timestamps', {'fields': ('generated_at',)}),
    )
