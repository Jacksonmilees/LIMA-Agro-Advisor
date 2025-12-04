from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Extended User model for LIMA farmers
    """
    LANGUAGE_CHOICES = [
        ('en', 'English'),
        ('sw', 'Swahili'),
        ('ki', 'Kikuyu'),
        ('lu', 'Luhya'),
        ('ka', 'Kalenjin'),
    ]
    
    # Override email to make it unique and required
    email = models.EmailField(unique=True, blank=False, null=False)
    
    # Additional fields
    phone = models.CharField(max_length=20, unique=True, blank=True, null=True)
    language = models.CharField(max_length=10, choices=LANGUAGE_CHOICES, default='en')
    profile_image = models.ImageField(upload_to='profiles/', blank=True, null=True)
    
    # User preferences
    notification_enabled = models.BooleanField(default=True)
    sms_alerts_enabled = models.BooleanField(default=False)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Use email as username
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']
    
    class Meta:
        db_table = 'users'
        ordering = ['-created_at']
    
    def __str__(self):
        return self.email
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip() or self.username
