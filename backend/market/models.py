from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator
from decimal import Decimal

User = get_user_model()


class MarketPrice(models.Model):
    """
    Market prices for crops (historical and current)
    Can be populated via external API or manual entry
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
        ('Onions', 'Onions'),
        ('Carrots', 'Carrots'),
        ('Other', 'Other'),
    ]
    
    MARKET_CHOICES = [
        ('nairobi', 'Nairobi'),
        ('nakuru', 'Nakuru'),
        ('mombasa', 'Mombasa'),
        ('kisumu', 'Kisumu'),
        ('eldoret', 'Eldoret'),
        ('thika', 'Thika'),
        ('meru', 'Meru'),
        ('national', 'National Average'),
    ]
    
    crop = models.CharField(max_length=50, choices=CROP_CHOICES)
    market = models.CharField(max_length=50, choices=MARKET_CHOICES, default='national')
    
    # Price per kg in KES
    price_per_kg = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    
    # Date of this price
    date = models.DateField(db_index=True)
    
    # Source of data
    SOURCE_CHOICES = [
        ('kace', 'KACE - Kenya Agricultural Commodity Exchange'),
        ('manual', 'Manual Entry'),
        ('api', 'External API'),
        ('scraper', 'Web Scraper'),
    ]
    source = models.CharField(max_length=20, choices=SOURCE_CHOICES, default='manual')
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'market_prices'
        ordering = ['-date', 'crop']
        unique_together = ['crop', 'market', 'date']  # One price per crop per market per day
        indexes = [
            models.Index(fields=['crop', '-date']),
            models.Index(fields=['market', '-date']),
            models.Index(fields=['crop', 'market', '-date']),
        ]
    
    def __str__(self):
        return f"{self.crop} - {self.market} - KES {self.price_per_kg}/kg on {self.date}"


class PriceAlert(models.Model):
    """
    User-created price alerts
    Notify when crop reaches target price
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='price_alerts')
    
    crop = models.CharField(max_length=50, choices=MarketPrice.CROP_CHOICES)
    target_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
        help_text="Alert when price reaches or exceeds this amount (KES/kg)"
    )
    
    market = models.CharField(
        max_length=50,
        choices=MarketPrice.MARKET_CHOICES,
        default='national',
        help_text="Which market to monitor"
    )
    
    # Alert status
    is_active = models.BooleanField(default=True)
    triggered_at = models.DateTimeField(null=True, blank=True)
    triggered_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Price when alert was triggered"
    )
    
    # Notification preferences
    notify_sms = models.BooleanField(default=False)
    notify_email = models.BooleanField(default=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'price_alerts'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'is_active']),
            models.Index(fields=['crop', 'is_active']),
        ]
    
    def __str__(self):
        status = "✓ Triggered" if self.triggered_at else ("Active" if self.is_active else "Inactive")
        return f"{self.user.email} - {self.crop} @ KES {self.target_price} [{status}]"
    
    @property
    def is_triggered(self):
        """Check if alert has been triggered"""
        return self.triggered_at is not None


class PriceForecast(models.Model):
    """
    AI-generated price forecasts
    Generated periodically or on-demand
    """
    crop = models.CharField(max_length=50, choices=MarketPrice.CROP_CHOICES)
    market = models.CharField(max_length=50, choices=MarketPrice.MARKET_CHOICES, default='national')
    
    # Forecast date (date in the future)
    forecast_date = models.DateField()
    
    # Predicted price
    predicted_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    
    # Confidence level (0-100%)
    confidence = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0')), MinValueValidator(Decimal('100'))],
        help_text="Confidence level of prediction (0-100%)"
    )
    
    # Model/method used
    MODEL_CHOICES = [
        ('linear', 'Linear Regression'),
        ('arima', 'ARIMA Time Series'),
        ('prophet', 'Facebook Prophet'),
        ('gemini', 'Google Gemini AI'),
        ('average', 'Moving Average'),
    ]
    model_used = models.CharField(max_length=20, choices=MODEL_CHOICES, default='average')
    
    # Metadata
    generated_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'price_forecasts'
        ordering = ['forecast_date']
        unique_together = ['crop', 'market', 'forecast_date', 'model_used']
        indexes = [
            models.Index(fields=['crop', 'forecast_date']),
            models.Index(fields=['crop', 'market', 'forecast_date']),
        ]
    
    def __str__(self):
        return f"{self.crop} - {self.market} - KES {self.predicted_price} on {self.forecast_date} ({self.confidence}% confidence)"
