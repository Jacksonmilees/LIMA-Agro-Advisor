from django.contrib import admin
from .models import Notification, NotificationPreference, SMSLog, EmailLog


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['title', 'user', 'notification_type', 'priority', 'is_read', 'created_at']
    list_filter = ['notification_type', 'priority', 'is_read', 'created_at']
    search_fields = ['title', 'message', 'user__email']
    date_hierarchy = 'created_at'
    ordering = ['-created_at']
    readonly_fields = ['created_at', 'read_at']
    
    fieldsets = (
        ('Basic Info', {'fields': ('user', 'notification_type', 'title', 'message', 'priority')}),
        ('Status', {'fields': ('is_read', 'read_at')}),
        ('Delivery', {'fields': ('sent_via_sms', 'sent_via_email', 'sent_via_push')}),
        ('Related', {'fields': ('related_module', 'related_object_id')}),
        ('Metadata', {'fields': ('created_at',)}),
    )
    
    actions = ['mark_as_read', 'mark_as_unread']
    
    def mark_as_read(self, request, queryset):
        from django.utils import timezone
        queryset.update(is_read=True, read_at=timezone.now())
    mark_as_read.short_description = "Mark selected as read"
    
    def mark_as_unread(self, request, queryset):
        queryset.update(is_read=False, read_at=None)
    mark_as_unread.short_description = "Mark selected as unread"


@admin.register(NotificationPreference)
class NotificationPreferenceAdmin(admin.ModelAdmin):
    list_display = ['user', 'sms_enabled', 'email_enabled', 'push_enabled', 'quiet_hours_enabled']
    search_fields = ['user__email']
    
    fieldsets = (
        ('User', {'fields': ('user',)}),
        ('Channels', {'fields': ('sms_enabled', 'email_enabled', 'push_enabled')}),
        ('Types', {'fields': ('weather_alerts', 'price_alerts', 'insurance_updates', 'harvest_reminders', 'payment_reminders')}),
        ('Quiet Hours', {'fields': ('quiet_hours_enabled', 'quiet_hours_start', 'quiet_hours_end')}),
    )


@admin.register(SMSLog)
class SMSLogAdmin(admin.ModelAdmin):
    list_display = ['phone_number', 'user', 'status', 'provider', 'cost', 'sent_at']
    list_filter = ['status', 'provider', 'sent_at']
    search_fields = ['phone_number', 'message', 'user__email']
    date_hierarchy = 'sent_at'
    ordering = ['-sent_at']
    readonly_fields = ['sent_at', 'delivered_at']
    
    fieldsets = (
        ('Recipient', {'fields': ('user', 'phone_number')}),
        ('Message', {'fields': ('message', 'notification')}),
        ('Status', {'fields': ('status', 'error_message')}),
        ('Provider', {'fields': ('provider', 'provider_message_id', 'cost')}),
        ('Timestamps', {'fields': ('sent_at', 'delivered_at')}),
    )


@admin.register(EmailLog)
class EmailLogAdmin(admin.ModelAdmin):
    list_display = ['email_address', 'user', 'subject', 'status', 'sent_at']
    list_filter = ['status', 'sent_at']
    search_fields = ['email_address', 'subject', 'user__email']
    date_hierarchy = 'sent_at'
    ordering = ['-sent_at']
    readonly_fields = ['sent_at']
    
    fieldsets = (
        ('Recipient', {'fields': ('user', 'email_address')}),
        ('Email', {'fields': ('subject', 'body', 'notification')}),
        ('Status', {'fields': ('status', 'error_message')}),
        ('Timestamps', {'fields': ('sent_at',)}),
    )
