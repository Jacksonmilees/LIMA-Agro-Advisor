from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class CropGuide(models.Model):
    """
    General knowledge base for specific crops.
    """
    name = models.CharField(max_length=100, unique=True)
    scientific_name = models.CharField(max_length=100, blank=True, null=True)
    
    # Planting Details
    planting_season = models.CharField(max_length=200, help_text="Best time to plant")
    time_to_harvest_days = models.IntegerField(help_text="Average days to maturity")
    seed_rate_per_acre = models.CharField(max_length=100, help_text="e.g., 25kg per acre")
    spacing = models.CharField(max_length=100, help_text="e.g., 30cm x 15cm")
    
    # Requirements
    soil_ph_min = models.DecimalField(max_digits=3, decimal_places=1, default=5.5)
    soil_ph_max = models.DecimalField(max_digits=3, decimal_places=1, default=7.0)
    water_requirement = models.CharField(max_length=50, choices=[
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('very_high', 'Very High')
    ], default='medium')
    
    # Management
    fertilizer_recommendation = models.TextField(help_text="General fertilizer advice")
    common_challenges = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class PestDisease(models.Model):
    """
    Common pests and diseases affecting crops.
    """
    TYPE_CHOICES = [
        ('pest', 'Pest'),
        ('disease', 'Disease'),
        ('weed', 'Weed'),
    ]
    
    crop = models.ForeignKey(CropGuide, on_delete=models.CASCADE, related_name='pests_diseases')
    name = models.CharField(max_length=100)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    
    symptoms = models.TextField()
    prevention = models.TextField(blank=True)
    treatment_organic = models.TextField(blank=True, help_text="Organic control methods")
    treatment_chemical = models.TextField(blank=True, help_text="Chemical control methods")
    
    image_url = models.URLField(blank=True, null=True)
    
    def __str__(self):
        return f"{self.name} ({self.get_type_display()}) - {self.crop.name}"

class AIRecommendation(models.Model):
    """
    Log of AI interactions/recommendations for farmers.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='agronomy_recommendations')
    query = models.TextField(help_text="User's question or image description")
    response = models.TextField(help_text="AI generated advice")
    
    # Metadata
    context = models.CharField(max_length=50, default='general', help_text="e.g., pest_id, crop_advice")
    created_at = models.DateTimeField(auto_now_add=True)
    feedback_score = models.IntegerField(null=True, blank=True, help_text="User rating 1-5")

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Rec for {self.user.email} - {self.created_at.date()}"
