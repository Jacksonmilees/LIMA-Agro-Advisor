from django.urls import path
from .views import (
    NotificationListView,
    NotificationMarkReadView,
    NotificationDetailView,
    NotificationPreferenceView,
    SendNotificationView,
    SMSLogListView,
    EmailLogListView,
    NotificationSummaryView
)

app_name = 'communication'

urlpatterns = [
    # Notifications
    path('notifications/', NotificationListView.as_view(), name='notification_list'),
    path('notifications/<int:pk>/', NotificationDetailView.as_view(), name='notification_detail'),
    path('notifications/mark-read/', NotificationMarkReadView.as_view(), name='mark_read'),
    
    # Preferences
    path('preferences/', NotificationPreferenceView.as_view(), name='preferences'),
    
    # Send notification
    path('send/', SendNotificationView.as_view(), name='send_notification'),
    
    # Logs
    path('sms-logs/', SMSLogListView.as_view(), name='sms_logs'),
    path('email-logs/', EmailLogListView.as_view(), name='email_logs'),
    
    # Summary
    path('summary/', NotificationSummaryView.as_view(), name='summary'),
]
