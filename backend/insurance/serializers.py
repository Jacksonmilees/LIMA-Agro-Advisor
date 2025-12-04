from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import InsurancePolicy, PolicyTrigger, InsuranceClaim, PremiumPayment, PolicyRecommendation
from farms.models import FarmProfile
from datetime import date
import uuid

User = get_user_model()


class PolicyTriggerSerializer(serializers.ModelSerializer):
    """Serializer for PolicyTrigger"""
    trigger_type_display = serializers.CharField(source='get_trigger_type_display', read_only=True)
    
    class Meta:
        model = PolicyTrigger
        fields = [
            'id', 'policy', 'trigger_type', 'trigger_type_display',
            'threshold_value', 'measurement_period_days', 'payout_percentage',
            'is_triggered', 'trigger_date', 'created_at'
        ]
        read_only_fields = ['id', 'is_triggered', 'trigger_date', 'created_at']


class InsurancePolicySerializer(serializers.ModelSerializer):
    """Serializer for InsurancePolicy"""
    farm_name = serializers.CharField(source='farm_profile.farm_name', read_only=True)
    policy_type_display = serializers.CharField(source='get_policy_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    is_valid = serializers.BooleanField(read_only=True)
    triggers = PolicyTriggerSerializer(many=True, read_only=True)
    
    class Meta:
        model = InsurancePolicy
        fields = [
            'id', 'farm_profile', 'farm_name', 'policy_number',
            'policy_type', 'policy_type_display',
            'coverage_amount', 'premium_amount', 'payment_frequency',
            'start_date', 'end_date',
            'status', 'status_display', 'is_valid',
            'is_paid', 'payment_date',
            'triggers', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'policy_number', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        # Auto-generate policy number
        validated_data['policy_number'] = f"POL{uuid.uuid4().hex[:8].upper()}"
        return super().create(validated_data)


class PolicyCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating insurance policies"""
    class Meta:
        model = InsurancePolicy
        fields = [
            'policy_type', 'coverage_amount', 'premium_amount',
            'payment_frequency', 'start_date', 'end_date'
        ]
    
    def create(self, validated_data):
        user = self.context['request'].user
        
        try:
            farm_profile = user.farm_profile
        except FarmProfile.DoesNotExist:
            raise serializers.ValidationError({
                'error': 'Farm profile not found. Please create a farm profile first.'
            })
        
        # Auto-generate policy number
        policy_number = f"POL{uuid.uuid4().hex[:8].upper()}"
        
        policy = InsurancePolicy.objects.create(
            farm_profile=farm_profile,
            policy_number=policy_number,
            **validated_data
        )
        return policy
    
    def to_representation(self, instance):
        """Return full policy data after creation"""
        return InsurancePolicySerializer(instance, context=self.context).data


class InsuranceClaimSerializer(serializers.ModelSerializer):
    """Serializer for InsuranceClaim"""
    policy_number = serializers.CharField(source='policy.policy_number', read_only=True)
    claim_type_display = serializers.CharField(source='get_claim_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = InsuranceClaim
        fields = [
            'id', 'policy', 'policy_number', 'claim_number',
            'claim_type', 'claim_type_display',
            'trigger', 'claim_amount', 'description',
            'status', 'status_display',
            'filed_date', 'processed_date', 'payout_date',
            'admin_notes', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'claim_number', 'filed_date',
            'created_at', 'updated_at'
        ]
    
    def create(self, validated_data):
        # Auto-generate claim number
        validated_data['claim_number'] = f"CLM{uuid.uuid4().hex[:8].upper()}"
        return super().create(validated_data)


class PremiumPaymentSerializer(serializers.ModelSerializer):
    """Serializer for PremiumPayment"""
    policy_number = serializers.CharField(source='policy.policy_number', read_only=True)
    payment_method_display = serializers.CharField(source='get_payment_method_display', read_only=True)
    
    class Meta:
        model = PremiumPayment
        fields = [
            'id', 'policy', 'policy_number',
            'amount', 'payment_date', 'payment_method', 'payment_method_display',
            'transaction_ref', 'is_confirmed', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class PolicyRecommendationSerializer(serializers.ModelSerializer):
    """Serializer for PolicyRecommendation"""
    farm_name = serializers.CharField(source='farm_profile.farm_name', read_only=True)
    policy_type_display = serializers.CharField(source='get_recommended_policy_type_display', read_only=True)
    
    class Meta:
        model = PolicyRecommendation
        fields = [
            'id', 'farm_profile', 'farm_name',
            'recommended_policy_type', 'policy_type_display',
            'recommended_coverage', 'recommended_premium',
            'risk_assessment_summary', 'confidence_score',
            'generated_date'
        ]
        read_only_fields = ['id', 'generated_date']


class InsuranceAnalyticsSerializer(serializers.Serializer):
    """Serializer for insurance analytics"""
    farm_name = serializers.CharField()
    
    # Policies
    total_policies = serializers.IntegerField()
    active_policies = serializers.IntegerField()
    total_coverage = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_premiums = serializers.DecimalField(max_digits=12, decimal_places=2)
    
    # Claims
    total_claims = serializers.IntegerField()
    approved_claims = serializers.IntegerField()
    total_payouts = serializers.DecimalField(max_digits=12, decimal_places=2)
    
    # Policy breakdown
    policies_by_type = serializers.DictField()
    claims_by_status = serializers.DictField()
