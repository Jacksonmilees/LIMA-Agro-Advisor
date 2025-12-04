from django.db import models
from django.contrib.auth import get_user_model
from farms.models import FarmProfile

User = get_user_model()


class JournalEntry(models.Model):
    """
    Farm diary entries - daily notes, observations, activities
    """
    farm_profile = models.ForeignKey(
        FarmProfile,
        on_delete=models.CASCADE,
        related_name='journal_entries'
    )
    
    title = models.CharField(max_length=200)
    entry_date = models.DateField()
    
    ENTRY_TYPE_CHOICES = [
        ('general', 'General Note'),
        ('planting', 'Planting Activity'),
        ('harvesting', 'Harvesting'),
        ('spraying', 'Spraying/Pesticide'),
        ('fertilizing', 'Fertilizing'),
        ('irrigation', 'Irrigation'),
        ('observation', 'Field Observation'),
        ('weather', 'Weather Note'),
        ('other', 'Other'),
    ]
    entry_type = models.CharField(max_length=20, choices=ENTRY_TYPE_CHOICES, default='general')
    
    content = models.TextField(help_text="Detailed notes")
    
    # Optional metadata
    crop_name = models.CharField(max_length=100, blank=True, help_text="Which crop (if applicable)")
    field_section = models.CharField(max_length=100, blank=True, help_text="Field name/section")
    
    # Photos
    photo_url = models.URLField(blank=True, null=True, help_text="Photo URL")
    
    # Tags for search
    tags = models.CharField(max_length=200, blank=True, help_text="Comma-separated tags")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-entry_date', '-created_at']
        indexes = [
            models.Index(fields=['farm_profile', 'entry_date']),
            models.Index(fields=['entry_type']),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.entry_date}"


class FieldActivity(models.Model):
    """
    Structured tracking of specific farm activities
    """
    farm_profile = models.ForeignKey(
        FarmProfile,
        on_delete=models.CASCADE,
        related_name='field_activities'
    )
    
    activity_date = models.DateField()
    
    ACTIVITY_TYPE_CHOICES = [
        ('land_preparation', 'Land Preparation'),
        ('planting', 'Planting'),
        ('weeding', 'Weeding'),
        ('fertilizer_application', 'Fertilizer Application'),
        ('pesticide_application', 'Pesticide Application'),
        ('irrigation', 'Irrigation'),
        ('harvesting', 'Harvesting'),
        ('post_harvest', 'Post-Harvest Activity'),
    ]
    activity_type = models.CharField(max_length=30, choices=ACTIVITY_TYPE_CHOICES)
    
    crop_name = models.CharField(max_length=100, blank=True)
    field_section = models.CharField(max_length=100, blank=True)
    
    # Activity details
    description = models.TextField()
    quantity_used = models.CharField(max_length=100, blank=True, help_text="e.g., 50kg fertilizer, 2L pesticide")
    cost = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, help_text="Cost in KES")
    
    # Labor
    labor_hours = models.DecimalField(max_digits=5, decimal_places=1, null=True, blank=True)
    workers_count = models.IntegerField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-activity_date']
        verbose_name_plural = 'Field Activities'
    
    def __str__(self):
        return f"{self.get_activity_type_display()} - {self.activity_date}"
