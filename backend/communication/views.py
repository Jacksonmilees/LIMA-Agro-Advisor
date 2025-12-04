from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Count
from .models import Notification, NotificationPreference, SMSLog, EmailLog
from .serializers import (
    NotificationSerializer,
    NotificationMarkReadSerializer,
    NotificationPreferenceSerializer,
    SMSLogSerializer,
    EmailLogSerializer,
    SendNotificationSerializer,
    NotificationSummarySerializer
)


class NotificationListView(generics.ListAPIView):
    """
    GET /api/v1/communication/notifications/
    List user's notifications
    
    Query params:
    - is_read: Filter by read status (true/false)
    - notification_type: Filter by type
    - priority: Filter by priority
    """
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = Notification.objects.filter(user=self.request.user)
        
        # Apply filters
        is_read = self.request.query_params.get('is_read')
        if is_read is not None:
            queryset = queryset.filter(is_read=is_read.lower() == 'true')
        
        notification_type = self.request.query_params.get('notification_type')
        if notification_type:
            queryset = queryset.filter(notification_type=notification_type)
        
        priority = self.request.query_params.get('priority')
        if priority:
            queryset = queryset.filter(priority=priority)
        
        return queryset


class NotificationMarkReadView(APIView):
    """
    POST /api/v1/communication/notifications/mark-read/
    Mark notifications as read
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = NotificationMarkReadSerializer(data=request.data)
        if serializer.is_valid():
            notification_ids = serializer.validated_data['notification_ids']
            
            # Update notifications
            updated = Notification.objects.filter(
                id__in=notification_ids,
                user=request.user
            ).update(
                is_read=True,
                read_at=timezone.now()
            )
            
            return Response({
                'message': f'{updated} notification(s) marked as read'
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class NotificationDetailView(generics.RetrieveDestroyAPIView):
    """
    GET/DELETE /api/v1/communication/notifications/{id}/
    """
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)
    
    def retrieve(self, request, *args, **kwargs):
        """Auto-mark as read when retrieved"""
        instance = self.get_object()
        if not instance.is_read:
            instance.is_read = True
            instance.read_at = timezone.now()
            instance.save()
        
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


class NotificationPreferenceView(APIView):
    """
    GET/PUT /api/v1/communication/preferences/
    Get or update notification preferences
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        # Get or create preferences
        preferences, created = NotificationPreference.objects.get_or_create(user=request.user)
        serializer = NotificationPreferenceSerializer(preferences)
        return Response(serializer.data)
    
    def put(self, request):
        preferences, created = NotificationPreference.objects.get_or_create(user=request.user)
        serializer = NotificationPreferenceSerializer(preferences, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SendNotificationView(APIView):
    """
    POST /api/v1/communication/send/
    Send a notification to the user (for testing/admin use)
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = SendNotificationSerializer(data=request.data)
        if serializer.is_valid():
            # Create notification
            notification = Notification.objects.create(
                user=request.user,
                notification_type=serializer.validated_data['notification_type'],
                title=serializer.validated_data['title'],
                message=serializer.validated_data['message'],
                priority=serializer.validated_data['priority']
            )
            
            # Get user preferences
            try:
                preferences = request.user.notification_preferences
            except:
                preferences = NotificationPreference.objects.create(user=request.user)
            
            # Send via requested channels (mock for now)
            if serializer.validated_data.get('send_sms') and preferences.sms_enabled:
                # Mock SMS sending
                SMSLog.objects.create(
                    user=request.user,
                    notification=notification,
                    phone_number=request.user.phone or '+254700000000',
                    message=notification.message[:160],  # SMS limit
                    status='sent'
                )
                notification.sent_via_sms = True
            
            if serializer.validated_data.get('send_email') and preferences.email_enabled:
                # Mock email sending
                EmailLog.objects.create(
                    user=request.user,
                    notification=notification,
                    email_address=request.user.email,
                    subject=notification.title,
                    body=notification.message,
                    status='sent'
                )
                notification.sent_via_email = True
            
            notification.save()
            
            return Response(NotificationSerializer(notification).data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SMSLogListView(generics.ListAPIView):
    """
    GET /api/v1/communication/sms-logs/
    List SMS logs for user
    """
    serializer_class = SMSLogSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return SMSLog.objects.filter(user=self.request.user)


class EmailLogListView(generics.ListAPIView):
    """
    GET /api/v1/communication/email-logs/
    List email logs for user
    """
    serializer_class = EmailLogSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return EmailLog.objects.filter(user=self.request.user)


class NotificationSummaryView(APIView):
    """
    GET /api/v1/communication/summary/
    Get notification statistics
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        # Total & unread
        total_notifications = Notification.objects.filter(user=user).count()
        unread_count = Notification.objects.filter(user=user, is_read=False).count()
        
        # By type
        notifications_by_type = {}
        for nt, label in Notification.NOTIFICATION_TYPE_CHOICES:
            count = Notification.objects.filter(user=user, notification_type=nt).count()
            if count > 0:
                notifications_by_type[nt] = count
        
        # By priority
        notifications_by_priority = {}
        for p, label in Notification.PRIORITY_CHOICES:
            count = Notification.objects.filter(user=user, priority=p).count()
            if count > 0:
                notifications_by_priority[p] = count
        
        # Recent (last 5)
        recent = Notification.objects.filter(user=user).order_by('-created_at')[:5]
        
        data = {
            'total_notifications': total_notifications,
            'unread_count': unread_count,
            'notifications_by_type': notifications_by_type,
            'notifications_by_priority': notifications_by_priority,
            'recent_notifications': NotificationSerializer(recent, many=True).data
        }
        
        return Response(data)
