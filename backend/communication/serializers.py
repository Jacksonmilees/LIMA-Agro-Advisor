from rest_framework import serializers
from .models import Notification, NotificationPreference, SMSLog, EmailLog
from django.utils import timezone


class NotificationSerializer(serializers.ModelSerializer):
    notification_type_display = serializers.CharField(source='get_notification_type_display', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    
    class Meta:
        model = Notification
        fields = [
            'id', 'user', 'notification_type', 'notification_type_display',
            'title', 'message', 'priority', 'priority_display',
            'is_read', 'read_at',
            'sent_via_sms', 'sent_via_email', 'sent_via_push',
            'related_module', 'related_object_id',
            'created_at'
        ]
        read_only_fields = ['id', 'user', 'created_at']


class NotificationMarkReadSerializer(serializers.Serializer):
    """Serializer for marking notifications as read"""
    notification_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=True
    )


class NotificationPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationPreference
        fields = [
            'id', 'user',
            'sms_enabled', 'email_enabled', 'push_enabled',
            'weather_alerts', 'price_alerts', 'insurance_updates',
            'harvest_reminders', 'payment_reminders',
            'quiet_hours_enabled', 'quiet_hours_start', 'quiet_hours_end',
            'updated_at'
        ]
        read_only_fields = ['id', 'user', 'updated_at']


class SMSLogSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = SMSLog
        fields = [
            'id', 'user', 'notification', 'phone_number',
            'message', 'status', 'status_display',
            'provider', 'provider_message_id', 'cost',
            'error_message', 'sent_at', 'delivered_at'
        ]
        read_only_fields = ['id', 'sent_at']


class EmailLogSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = EmailLog
        fields = [
            'id', 'user', 'notification', 'email_address',
            'subject', 'body', 'status', 'status_display',
            'error_message', 'sent_at'
        ]
        read_only_fields = ['id', 'sent_at']


class SendNotificationSerializer(serializers.Serializer):
    """Serializer for sending custom notifications"""
    notification_type = serializers.ChoiceField(choices=Notification.NOTIFICATION_TYPE_CHOICES)
    title = serializers.CharField(max_length=200)
    message = serializers.CharField()
    priority = serializers.ChoiceField(choices=Notification.PRIORITY_CHOICES, default='medium')
    send_sms = serializers.BooleanField(default=False)
    send_email = serializers.BooleanField(default=False)


class NotificationSummarySerializer(serializers.Serializer):
    """Serializer for notification statistics"""
    total_notifications = serializers.IntegerField()
    unread_count = serializers.IntegerField()
    notifications_by_type = serializers.DictField()
    notifications_by_priority = serializers.DictField()
    recent_notifications = NotificationSerializer(many=True)
