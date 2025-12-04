from django.db import models
from django.contrib.auth import get_user_model
from farms.models import FarmProfile
from decimal import Decimal
from django.core.validators import MinValueValidator, MaxValueValidator

User = get_user_model()


class InsurancePolicy(models.Model):
    """
    Parametric insurance policy for farmers
    Automatic payouts based on weather triggers
    """
    farm_profile = models.ForeignKey(
        FarmProfile,
        on_delete=models.CASCADE,
        related_name='insurance_policies'
    )
    
    # Policy details
    policy_number = models.CharField(max_length=50, unique=True)
    
    POLICY_TYPE_CHOICES = [
        ('drought', 'Drought Insurance'),
        ('flood', 'Flood Insurance'),
        ('multi_peril', 'Multi-Peril (Drought + Flood)'),
        ('excess_rain', 'Excess Rainfall Insurance'),
        ('temperature', 'Extreme Temperature Insurance'),
    ]
    policy_type = models.CharField(max_length=20, choices=POLICY_TYPE_CHOICES)
    
    # Coverage
    coverage_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('1000'))],
        help_text="Maximum payout amount (KES)"
    )
    
    # Premium
    premium_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('100'))],
        help_text="Premium to be paid (KES)"
    )
    
    PAYMENT_FREQUENCY_CHOICES = [
        ('monthly', 'Monthly'),
        ('quarterly', 'Quarterly'),
        ('annually', 'Annually'),
    ]
    payment_frequency = models.CharField(
        max_length=20,
        choices=PAYMENT_FREQUENCY_CHOICES,
        default='quarterly'
    )
    
    # Policy period
    start_date = models.DateField()
    end_date = models.DateField()
    
    # Status
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('active', 'Active'),
        ('expired', 'Expired'),
        ('cancelled', 'Cancelled'),
        ('claimed', 'Claimed'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    
    # Payment status
    is_paid = models.BooleanField(default=False)
    payment_date = models.DateField(null=True, blank=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'insurance_policies'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['farm_profile', 'status']),
            models.Index(fields=['policy_number']),
        ]
    
    def __str__(self):
        return f"{self.policy_number} - {self.get_policy_type_display()} ({self.status})"
    
    @property
    def is_valid(self):
        """Check if policy is currently valid"""
        from datetime import date
        return (
            self.status == 'active' and
            self.is_paid and
            self.start_date <= date.today() <= self.end_date
        )


class PolicyTrigger(models.Model):
    """
    Trigger conditions for automatic payouts
    Based on weather/climate parameters
    """
    policy = models.ForeignKey(
        InsurancePolicy,
        on_delete=models.CASCADE,
        related_name='triggers'
    )
    
    TRIGGER_TYPE_CHOICES = [
        ('rainfall_deficit', 'Rainfall Below Threshold'),
        ('rainfall_excess', 'Rainfall Above Threshold'),
        ('temperature_high', 'Temperature Above Threshold'),
        ('temperature_low', 'Temperature Below Threshold'),
        ('consecutive_dry_days', 'Consecutive Dry Days'),
    ]
    trigger_type = models.CharField(max_length=30, choices=TRIGGER_TYPE_CHOICES)
    
    # Threshold values
    threshold_value = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Threshold value for trigger"
    )
    
    # Measurement period (days)
    measurement_period_days = models.IntegerField(
        default=30,
        help_text="Period over which to measure (e.g., 30 days)"
    )
    
    # Payout
    payout_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0')), MaxValueValidator(Decimal('100'))],
        help_text="Percentage of coverage to payout (0-100%)"
    )
    
    # Status
    is_triggered = models.BooleanField(default=False)
    trigger_date = models.DateField(null=True, blank=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'policy_triggers'
        ordering = ['-created_at']
    
    def __str__(self):
        status = "✓ Triggered" if self.is_triggered else "Active"
        return f"{self.policy.policy_number} - {self.get_trigger_type_display()} [{status}]"


class InsuranceClaim(models.Model):
    """
    Insurance claims (automatic or manual)
    """
    policy = models.ForeignKey(
        InsurancePolicy,
        on_delete=models.CASCADE,
        related_name='claims'
    )
    
    claim_number = models.CharField(max_length=50, unique=True)
    
    CLAIM_TYPE_CHOICES = [
        ('automatic', 'Automatic (Trigger-based)'),
        ('manual', 'Manual Submission'),
    ]
    claim_type = models.CharField(max_length=20, choices=CLAIM_TYPE_CHOICES)
    
    # Trigger reference (if automatic)
    trigger = models.ForeignKey(
        PolicyTrigger,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='claims'
    )
    
    # Claim details
    claim_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0'))]
    )
    
    description = models.TextField(
        blank=True,
        help_text="Claim description/reason"
    )
    
    # Status
    STATUS_CHOICES = [
        ('pending', 'Pending Review'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('paid', 'Paid'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Processing
    filed_date = models.DateField(auto_now_add=True)
    processed_date = models.DateField(null=True, blank=True)
    payout_date = models.DateField(null=True, blank=True)
    
    # Admin notes
    admin_notes = models.TextField(blank=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'insurance_claims'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['policy', 'status']),
            models.Index(fields=['claim_number']),
        ]
    
    def __str__(self):
        return f"{self.claim_number} - KES {self.claim_amount} ({self.status})"


class PremiumPayment(models.Model):
    """
    Premium payment records
    """
    policy = models.ForeignKey(
        InsurancePolicy,
        on_delete=models.CASCADE,
        related_name='payments'
    )
    
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0'))]
    )
    
    payment_date = models.DateField()
    
    PAYMENT_METHOD_CHOICES = [
        ('mpesa', 'M-Pesa'),
        ('bank', 'Bank Transfer'),
        ('cash', 'Cash'),
        ('mobile_money', 'Mobile Money'),
    ]
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES)
    
    # Payment reference
    transaction_ref = models.CharField(max_length=100, blank=True)
    
    # Status
    is_confirmed = models.BooleanField(default=False)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'premium_payments'
        ordering = ['-payment_date']
    
    def __str__(self):
        return f"Payment for {self.policy.policy_number} - KES {self.amount}"


class PolicyRecommendation(models.Model):
    """
    AI-generated policy recommendations for farmers
    Based on farm profile and climate risks
    """
    farm_profile = models.ForeignKey(
        FarmProfile,
        on_delete=models.CASCADE,
        related_name='policy_recommendations'
    )
    
    recommended_policy_type = models.CharField(
        max_length=20,
        choices=InsurancePolicy.POLICY_TYPE_CHOICES
    )
    
    recommended_coverage = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        help_text="Recommended coverage amount (KES)"
    )
    
    recommended_premium = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Estimated premium (KES)"
    )
    
    # Reasoning
    risk_assessment_summary = models.TextField(
        help_text="Why this policy is recommended"
    )
    
    confidence_score = models.IntegerField(
        default=50,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Confidence in recommendation (0-100%)"
    )
    
    # Metadata
    generated_date = models.DateField(auto_now_add=True)
    
    class Meta:
        db_table = 'policy_recommendations'
        ordering = ['-generated_date']
    
    def __str__(self):
        return f"Recommendation for {self.farm_profile.farm_name} - {self.recommended_policy_type}"
