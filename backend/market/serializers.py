from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import MarketPrice, PriceAlert, PriceForecast
from datetime import date, timedelta

User = get_user_model()


class MarketPriceSerializer(serializers.ModelSerializer):
    """
    Serializer for MarketPrice
    """
    class Meta:
        model = MarketPrice
        fields = [
            'id', 'crop', 'market', 'price_per_kg',
            'date', 'source', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate_price_per_kg(self, value):
        """Ensure price is positive"""
        if value <= 0:
            raise serializers.ValidationError("Price must be greater than 0")
        return value
    
    def validate_date(self, value):
        """Ensure date is not in the future"""
        if value > date.today():
            raise serializers.ValidationError("Price date cannot be in the future")
        return value


class PriceAlertSerializer(serializers.ModelSerializer):
    """
    Serializer for PriceAlert
    """
    user_email = serializers.EmailField(source='user.email', read_only=True)
    current_price = serializers.SerializerMethodField()
    is_triggered = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = PriceAlert
        fields = [
            'id', 'user', 'user_email', 'crop', 'target_price',
            'market', 'is_active', 'triggered_at', 'triggered_price',
            'current_price', 'is_triggered',
            'notify_sms', 'notify_email',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'user', 'triggered_at', 'triggered_price',
            'created_at', 'updated_at'
        ]
    
    def get_current_price(self, obj):
        """Get the latest market price for this crop"""
        try:
            latest_price = MarketPrice.objects.filter(
                crop=obj.crop,
                market=obj.market
            ).order_by('-date').first()
            
            if latest_price:
                return {
                    'price': str(latest_price.price_per_kg),
                    'date': latest_price.date
                }
            return None
        except:
            return None
    
    def validate_target_price(self, value):
        """Ensure target price is positive"""
        if value <= 0:
            raise serializers.ValidationError("Target price must be greater than 0")
        return value


class PriceAlertCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating price alerts
    """
    class Meta:
        model = PriceAlert
        fields = ['crop', 'target_price', 'market', 'notify_sms', 'notify_email']
    
    def create(self, validated_data):
        """Auto-assign user from request"""
        user = self.context['request'].user
        alert = PriceAlert.objects.create(user=user, **validated_data)
        return alert


class PriceForecastSerializer(serializers.ModelSerializer):
    """
    Serializer for PriceForecast
    """
    days_ahead = serializers.SerializerMethodField()
    
    class Meta:
        model = PriceForecast
        fields = [
            'id', 'crop', 'market', 'forecast_date',
            'predicted_price', 'confidence', 'model_used',
            'days_ahead', 'generated_at'
        ]
        read_only_fields = ['id', 'generated_at']
    
    def get_days_ahead(self, obj):
        """Calculate days from today to forecast date"""
        delta = obj.forecast_date - date.today()
        return delta.days


class PriceComparisonSerializer(serializers.Serializer):
    """
    Serializer for price comparison across markets
    """
    crop = serializers.CharField()
    markets = serializers.ListField()
    date = serializers.DateField()


class PriceTrendSerializer(serializers.Serializer):
    """
    Serializer for price trend analysis
    """
    crop = serializers.CharField()
    market = serializers.CharField()
    date_from = serializers.DateField()
    date_to = serializers.DateField()
    prices = serializers.ListField()
    average_price = serializers.DecimalField(max_digits=10, decimal_places=2)
    min_price = serializers.DecimalField(max_digits=10, decimal_places=2)
    max_price = serializers.DecimalField(max_digits=10, decimal_places=2)
    trend = serializers.CharField()  # 'rising', 'falling', 'stable'
