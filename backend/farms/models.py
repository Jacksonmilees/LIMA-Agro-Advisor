from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator
from decimal import Decimal

User = get_user_model()


class FarmProfile(models.Model):
    """
    Farm profile for each user
    One user can have one farm profile
    """
    COUNTY_CHOICES = [
        ('nairobi', 'Nairobi'),
        ('nakuru', 'Nakuru'),
        ('kiambu', 'Kiambu'),
        ('meru', 'Meru'),
        ('kisumu', 'Kisumu'),
        ('uasin_gishu', 'Uasin Gishu'),
        ('trans_nzoia', 'Trans Nzoia'),
        ('bungoma', 'Bungoma'),
        ('kakamega', 'Kakamega'),
        ('other', 'Other'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='farm_profile')
    farm_name = models.CharField(max_length=255, blank=True, null=True)
    county = models.CharField(max_length=50, choices=COUNTY_CHOICES)
    location = models.CharField(max_length=255, help_text="Town/Village name")
    
    # Coordinates (for climate/weather data)
    latitude = models.DecimalField(max_digits=10, decimal_places=8, null=True, blank=True)
    longitude = models.DecimalField(max_digits=11, decimal_places=8, null=True, blank=True)
    
    # Farm details
    size_acres = models.DecimalField(
        max_digits=8, 
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
        help_text="Farm size in acres"
    )
    
    # Crops grown (JSON field to store multiple crops)
    crops = models.JSONField(
        default=list,
        help_text="List of crops grown on this farm"
    )
    
    # Farming type
    FARMING_TYPE_CHOICES = [
        ('subsistence', 'Subsistence'),
        ('commercial', 'Commercial'),
        ('mixed', 'Mixed'),
    ]
    farming_type = models.CharField(max_length=20, choices=FARMING_TYPE_CHOICES, default='subsistence')
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'farm_profiles'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.email} - {self.farm_name or self.location}"
    
    @property
    def total_harvests(self):
        """Total number of harvest records"""
        return self.harvest_records.count()
    
    @property
    def total_expenses(self):
        """Total expenses for this farm"""
        return self.expense_records.aggregate(
            total=models.Sum('amount')
        )['total'] or Decimal('0.00')


class HarvestRecord(models.Model):
    """
    Record of each harvest
    """
    CROP_CHOICES = [
        ('Maize', 'Maize'),
        ('Beans', 'Beans'),
        ('Potatoes', 'Potatoes'),
        ('Tomatoes', 'Tomatoes'),
        ('Cabbage', 'Cabbage'),
        ('Kale', 'Kale'),
        ('Wheat', 'Wheat'),
        ('Rice', 'Rice'),
        ('Coffee', 'Coffee'),
        ('Tea', 'Tea'),
        ('Sugarcane', 'Sugarcane'),
        ('Bananas', 'Bananas'),
        ('Other', 'Other'),
    ]
    
    farm_profile = models.ForeignKey(
        FarmProfile, 
        on_delete=models.CASCADE, 
        related_name='harvest_records'
    )
    
    crop = models.CharField(max_length=50, choices=CROP_CHOICES)
    quantity_kg = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
        help_text="Harvest quantity in kilograms"
    )
    
    harvest_date = models.DateField()
    
    # Value estimation
    price_per_kg = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Market price at harvest time (KES)"
    )
    
    estimated_value = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Total estimated value (KES)"
    )
    
    # Notes
    notes = models.TextField(blank=True, null=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'harvest_records'
        ordering = ['-harvest_date', '-created_at']
        indexes = [
            models.Index(fields=['farm_profile', '-harvest_date']),
            models.Index(fields=['crop', '-harvest_date']),
        ]
    
    def __str__(self):
        return f"{self.crop} - {self.quantity_kg}kg on {self.harvest_date}"
    
    def save(self, *args, **kwargs):
        """Auto-calculate estimated value if price is provided"""
        if self.price_per_kg and self.quantity_kg:
            self.estimated_value = self.price_per_kg * self.quantity_kg
        super().save(*args, **kwargs)


class ExpenseRecord(models.Model):
    """
    Farm expenses tracker
    """
    CATEGORY_CHOICES = [
        ('seeds', 'Seeds'),
        ('fertilizer', 'Fertilizer'),
        ('pesticides', 'Pesticides'),
        ('labor', 'Labor'),
        ('equipment', 'Equipment'),
        ('transport', 'Transport'),
        ('irrigation', 'Irrigation'),
        ('rent', 'Land Rent'),
        ('other', 'Other'),
    ]
    
    farm_profile = models.ForeignKey(
        FarmProfile,
        on_delete=models.CASCADE,
        related_name='expense_records'
    )
    
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
        help_text="Expense amount in KES"
    )
    
    date = models.DateField()
    description = models.TextField(blank=True, null=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'expense_records'
        ordering = ['-date', '-created_at']
        indexes = [
            models.Index(fields=['farm_profile', '-date']),
            models.Index(fields=['category', '-date']),
        ]
    
    def __str__(self):
        return f"{self.category} - KES {self.amount} on {self.date}"
