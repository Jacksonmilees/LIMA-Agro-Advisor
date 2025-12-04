from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Notification(models.Model):
    """
    Central notification system - aggregates from all modules
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    
    NOTIFICATION_TYPE_CHOICES = [
        ('weather_alert', 'Weather Alert'),
        ('price_alert', 'Price Alert'),
        ('insurance_claim', 'Insurance Claim'),
        ('harvest_reminder', 'Harvest Reminder'),
        ('payment_due', 'Payment Due'),
        ('general', 'General'),
    ]
    notification_type = models.CharField(max_length=30, choices=NOTIFICATION_TYPE_CHOICES)
    
    title = models.CharField(max_length=200)
    message = models.TextField()
    
    # Priority
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    
    # Delivery status
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    
    # Delivery channels
    sent_via_sms = models.BooleanField(default=False)
    sent_via_email = models.BooleanField(default=False)
    sent_via_push = models.BooleanField(default=False)
    
    # Metadata
    related_module = models.CharField(max_length=50, blank=True, help_text="e.g., climate, market")
    related_object_id = models.IntegerField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'is_read']),
            models.Index(fields=['notification_type']),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.user.email}"


class NotificationPreference(models.Model):
    """
    User preferences for receiving notifications
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='notification_preferences')
    
    # Channel preferences
    sms_enabled = models.BooleanField(default=True)
    email_enabled = models.BooleanField(default=True)
    push_enabled = models.BooleanField(default=True)
    
    # Type preferences
    weather_alerts = models.BooleanField(default=True)
    price_alerts = models.BooleanField(default=True)
    insurance_updates = models.BooleanField(default=True)
    harvest_reminders = models.BooleanField(default=True)
    payment_reminders = models.BooleanField(default=True)
    
    # Quiet hours
    quiet_hours_enabled = models.BooleanField(default=False)
    quiet_hours_start = models.TimeField(null=True, blank=True, help_text="e.g., 22:00")
    quiet_hours_end = models.TimeField(null=True, blank=True, help_text="e.g., 07:00")
    
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Preferences for {self.user.email}"


class SMSLog(models.Model):
    """
    Log of SMS messages sent (via Africa's Talking or similar)
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sms_logs')
    notification = models.ForeignKey(Notification, on_delete=models.SET_NULL, null=True, blank=True)
    
    phone_number = models.CharField(max_length=20)
    message = models.TextField()
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('sent', 'Sent'),
        ('delivered', 'Delivered'),
        ('failed', 'Failed'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Provider details
    provider = models.CharField(max_length=50, default='africas_talking', help_text="SMS gateway")
    provider_message_id = models.CharField(max_length=100, blank=True)
    cost = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True, help_text="Cost in KES")
    
    # Error tracking
    error_message = models.TextField(blank=True)
    
    sent_at = models.DateTimeField(auto_now_add=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-sent_at']
    
    def __str__(self):
        return f"SMS to {self.phone_number} - {self.status}"


class EmailLog(models.Model):
    """
    Log of emails sent
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='email_logs')
    notification = models.ForeignKey(Notification, on_delete=models.SET_NULL, null=True, blank=True)
    
    email_address = models.EmailField()
    subject = models.CharField(max_length=200)
    body = models.TextField()
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('sent', 'Sent'),
        ('failed', 'Failed'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    error_message = models.TextField(blank=True)
    
    sent_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-sent_at']
    
    def __str__(self):
        return f"Email to {self.email_address} - {self.status}"
