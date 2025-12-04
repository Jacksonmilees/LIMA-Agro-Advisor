from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import FarmProfile, HarvestRecord, ExpenseRecord
from decimal import Decimal

User = get_user_model()


class FarmProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for FarmProfile
    """
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    total_harvests = serializers.IntegerField(read_only=True)
    total_expenses = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    
    class Meta:
        model = FarmProfile
        fields = [
            'id', 'user', 'user_email', 'user_name',
            'farm_name', 'county', 'location',
            'latitude', 'longitude', 'size_acres',
            'crops', 'farming_type',
            'total_harvests', 'total_expenses',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']
    
    def validate_crops(self, value):
        """Ensure crops is a list"""
        if not isinstance(value, list):
            raise serializers.ValidationError("Crops must be a list")
        return value
    
    def validate_size_acres(self, value):
        """Ensure farm size is positive"""
        if value <= 0:
            raise serializers.ValidationError("Farm size must be greater than 0")
        return value


class HarvestRecordSerializer(serializers.ModelSerializer):
    """
    Serializer for HarvestRecord
    """
    farm_name = serializers.CharField(source='farm_profile.farm_name', read_only=True)
    
    class Meta:
        model = HarvestRecord
        fields = [
            'id', 'farm_profile', 'farm_name',
            'crop', 'quantity_kg', 'harvest_date',
            'price_per_kg', 'estimated_value', 'notes',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'estimated_value', 'created_at', 'updated_at']
    
    def validate_quantity_kg(self, value):
        """Ensure quantity is positive"""
        if value <= 0:
            raise serializers.ValidationError("Quantity must be greater than 0")
        return value
    
    def validate_price_per_kg(self, value):
        """Ensure price is positive if provided"""
        if value is not None and value <= 0:
            raise serializers.ValidationError("Price must be greater than 0")
        return value


class HarvestRecordCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating harvest records (doesn't require farm_profile in input)
    """
    class Meta:
        model = HarvestRecord
        fields = [
            'crop', 'quantity_kg', 'harvest_date',
            'price_per_kg', 'notes'
        ]
    
    def create(self, validated_data):
        """Auto-assign farm_profile from request user"""
        user = self.context['request'].user
        
        # Check if user has a farm profile
        try:
            farm_profile = user.farm_profile
        except FarmProfile.DoesNotExist:
            raise serializers.ValidationError({
                'error': 'Farm profile not found. Please create a farm profile first at /api/v1/farms/profile/'
            })
        
        harvest = HarvestRecord.objects.create(
            farm_profile=farm_profile,
            **validated_data
        )
        return harvest


class ExpenseRecordSerializer(serializers.ModelSerializer):
    """
    Serializer for ExpenseRecord
    """
    farm_name = serializers.CharField(source='farm_profile.farm_name', read_only=True)
    
    class Meta:
        model = ExpenseRecord
        fields = [
            'id', 'farm_profile', 'farm_name',
            'category', 'amount', 'date', 'description',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate_amount(self, value):
        """Ensure amount is positive"""
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than 0")
        return value


class ExpenseRecordCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating expense records (doesn't require farm_profile in input)
    """
    class Meta:
        model = ExpenseRecord
        fields = ['category', 'amount', 'date', 'description']
    
    def create(self, validated_data):
        """Auto-assign farm_profile from request user"""
        user = self.context['request'].user
        
        # Check if user has a farm profile
        try:
            farm_profile = user.farm_profile
        except FarmProfile.DoesNotExist:
            raise serializers.ValidationError({
                'error': 'Farm profile not found. Please create a farm profile first at /api/v1/farms/profile/'
            })
        
        expense = ExpenseRecord.objects.create(
            farm_profile=farm_profile,
            **validated_data
        )
        return expense


class FarmAnalyticsSerializer(serializers.Serializer):
    """
    Serializer for farm analytics (read-only)
    """
    # Revenue
    total_harvest_value = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_harvest_quantity = serializers.DecimalField(max_digits=12, decimal_places=2)
    harvest_count = serializers.IntegerField()
    
    # Expenses
    total_expenses = serializers.DecimalField(max_digits=12, decimal_places=2)
    expense_count = serializers.IntegerField()
    expenses_by_category = serializers.DictField()
    
    # Profit
    gross_profit = serializers.DecimalField(max_digits=12, decimal_places=2)
    profit_margin = serializers.DecimalField(max_digits=5, decimal_places=2)
    
    # Top crops
    top_crops = serializers.ListField()
    
    # Date range
    date_from = serializers.DateField()
    date_to = serializers.DateField()
