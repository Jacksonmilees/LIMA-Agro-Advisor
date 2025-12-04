from django.db import models
from django.contrib.auth import get_user_model
from farms.models import FarmProfile
from decimal import Decimal

User = get_user_model()


class WeatherData(models.Model):
    """
    Weather data for different locations
    Can be from OpenWeatherMap API or other sources
    """
    # Location
    latitude = models.DecimalField(max_digits=10, decimal_places=8)
    longitude = models.DecimalField(max_digits=11, decimal_places=8)
    location_name = models.CharField(max_length=255, blank=True)
    
    # Date/Time
    date = models.DateField(db_index=True)
    forecast_date = models.DateField(
        null=True,
        blank=True,
        help_text="For forecasts: the date being forecasted. Null for historical data."
    )
    
    # Temperature (Celsius)
    temp_min = models.DecimalField(max_digits=5, decimal_places=2)
    temp_max = models.DecimalField(max_digits=5, decimal_places=2)
    temp_avg = models.DecimalField(max_digits=5, decimal_places=2)
    
    # Precipitation (mm)
    rainfall = models.DecimalField(
        max_digits=7,
        decimal_places=2,
        default=0,
        help_text="Rainfall in millimeters"
    )
    
    # Humidity (%)
    humidity = models.IntegerField(
        null=True,
        blank=True,
        help_text="Relative humidity percentage"
    )
    
    # Wind (km/h)
    wind_speed = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True
    )
    
    # Conditions
    CONDITION_CHOICES = [
        ('clear', 'Clear'),
        ('cloudy', 'Cloudy'),
        ('rainy', 'Rainy'),
        ('stormy', 'Stormy'),
        ('partly_cloudy', 'Partly Cloudy'),
    ]
    condition = models.CharField(
        max_length=20,
        choices=CONDITION_CHOICES,
        default='clear'
    )
    
    # Data source
    SOURCE_CHOICES = [
        ('openweather', 'OpenWeatherMap'),
        ('manual', 'Manual Entry'),
        ('sensor', 'Weather Station'),
    ]
    source = models.CharField(max_length=20, choices=SOURCE_CHOICES, default='manual')
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'weather_data'
        ordering = ['-date']
        unique_together = ['latitude', 'longitude', 'date', 'forecast_date']
        indexes = [
            models.Index(fields=['date', 'latitude', 'longitude']),
            models.Index(fields=['forecast_date']),
        ]
    
    def __str__(self):
        forecast_str = f" (forecast for {self.forecast_date})" if self.forecast_date else ""
        return f"{self.location_name or 'Location'} - {self.date}{forecast_str}"


class NDVIData(models.Model):
    """
    NDVI (Normalized Difference Vegetation Index) data
    Measures crop health from satellite imagery
    Can integrate with Google Earth Engine
    """
    farm_profile = models.ForeignKey(
        FarmProfile,
        on_delete=models.CASCADE,
        related_name='ndvi_data'
    )
    
    # NDVI value (-1 to 1, healthy vegetation is 0.3-0.8)
    ndvi_value = models.DecimalField(
        max_digits=4,
        decimal_places=3,
        help_text="NDVI value: -1 to 1 (0.3-0.8 = healthy crops)"
    )
    
    # Date of satellite image
    image_date = models.DateField(db_index=True)
    
    # Health assessment
    HEALTH_CHOICES = [
        ('poor', 'Poor - NDVI < 0.2'),
        ('fair', 'Fair - NDVI 0.2-0.4'),
        ('good', 'Good - NDVI 0.4-0.6'),
        ('excellent', 'Excellent - NDVI > 0.6'),
    ]
    health_status = models.CharField(max_length=20, choices=HEALTH_CHOICES)
    
    # Satellite/Source
    SOURCE_CHOICES = [
        ('sentinel', 'Sentinel-2'),
        ('landsat', 'Landsat'),
        ('google_ee', 'Google Earth Engine'),
        ('manual', 'Manual Calculation'),
    ]
    source = models.CharField(max_length=20, choices=SOURCE_CHOICES, default='manual')
    
    # Cloud cover (affects reliability)
    cloud_cover_percent = models.IntegerField(
        null=True,
        blank=True,
        help_text="Cloud coverage percentage (lower is better)"
    )
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'ndvi_data'
        ordering = ['-image_date']
        indexes = [
            models.Index(fields=['farm_profile', '-image_date']),
        ]
    
    def __str__(self):
        return f"{self.farm_profile.farm_name} - NDVI {self.ndvi_value} ({self.health_status}) on {self.image_date}"
    
    def save(self, *args, **kwargs):
        """Auto-determine health status based on NDVI value"""
        ndvi = float(self.ndvi_value)
        if ndvi < 0.2:
            self.health_status = 'poor'
        elif ndvi < 0.4:
            self.health_status = 'fair'
        elif ndvi < 0.6:
            self.health_status = 'good'
        else:
            self.health_status = 'excellent'
        super().save(*args, **kwargs)


class ClimateRisk(models.Model):
    """
    Climate risk assessment for farms
    Drought, flood, extreme temperature risks
    """
    farm_profile = models.ForeignKey(
        FarmProfile,
        on_delete=models.CASCADE,
        related_name='climate_risks'
    )
    
    # Assessment date
    assessment_date = models.DateField(db_index=True)
    
    # Risk period
    period_start = models.DateField()
    period_end = models.DateField()
    
    # Risk scores (0-100, higher = more risk)
    drought_risk = models.IntegerField(
        default=0,
        help_text="Drought risk score (0-100)"
    )
    flood_risk = models.IntegerField(
        default=0,
        help_text="Flood risk score (0-100)"
    )
    extreme_temp_risk = models.IntegerField(
        default=0,
        help_text="Extreme temperature risk score (0-100)"
    )
    
    # Overall risk level
    RISK_LEVEL_CHOICES = [
        ('low', 'Low Risk'),
        ('medium', 'Medium Risk'),
        ('high', 'High Risk'),
        ('critical', 'Critical Risk'),
    ]
    overall_risk_level = models.CharField(
        max_length=20,
        choices=RISK_LEVEL_CHOICES,
        default='low'
    )
    
    # Recommendations
    recommendations = models.TextField(
        blank=True,
        help_text="Risk mitigation recommendations"
    )
    
    # Confidence score
    confidence = models.IntegerField(
        default=50,
        help_text="Confidence level of assessment (0-100%)"
    )
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'climate_risks'
        ordering = ['-assessment_date']
        indexes = [
            models.Index(fields=['farm_profile', '-assessment_date']),
            models.Index(fields=['overall_risk_level']),
        ]
    
    def __str__(self):
        return f"{self.farm_profile.farm_name} - {self.overall_risk_level} risk on {self.assessment_date}"
    
    def save(self, *args, **kwargs):
        """Auto-calculate overall risk level"""
        max_risk = max(self.drought_risk, self.flood_risk, self.extreme_temp_risk)
        
        if max_risk >= 75:
            self.overall_risk_level = 'critical'
        elif max_risk >= 50:
            self.overall_risk_level = 'high'
        elif max_risk >= 25:
            self.overall_risk_level = 'medium'
        else:
            self.overall_risk_level = 'low'
        
        super().save(*args, **kwargs)


class WeatherAlert(models.Model):
    """
    Weather alerts/warnings for users
    Automatic notifications based on weather conditions
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='weather_alerts')
    
    # Alert type
    ALERT_TYPE_CHOICES = [
        ('drought', 'Drought Warning'),
        ('heavy_rain', 'Heavy Rainfall Warning'),
        ('storm', 'Storm Warning'),
        ('frost', 'Frost Warning'),
        ('heatwave', 'Heatwave Warning'),
    ]
    alert_type = models.CharField(max_length=20, choices=ALERT_TYPE_CHOICES)
    
    # Severity
    SEVERITY_CHOICES = [
        ('info', 'Information'),
        ('warning', 'Warning'),
        ('critical', 'Critical'),
    ]
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES, default='warning')
    
    # Message
    title = models.CharField(max_length=255)
    message = models.TextField()
    
    # Validity period
    valid_from = models.DateTimeField()
    valid_until = models.DateTimeField()
    
    # Status
    is_active = models.BooleanField(default=True)
    is_read = models.BooleanField(default=False)
    
    # Notification sent
    notification_sent = models.BooleanField(default=False)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'weather_alerts'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'is_active', '-created_at']),
            models.Index(fields=['alert_type', 'severity']),
        ]
    
    def __str__(self):
        return f"{self.get_severity_display()} - {self.title}"
