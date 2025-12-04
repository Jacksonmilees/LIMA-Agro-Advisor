from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import WeatherData, NDVIData, ClimateRisk, WeatherAlert
from farms.models import FarmProfile
from datetime import date

User = get_user_model()


class WeatherDataSerializer(serializers.ModelSerializer):
    """
    Serializer for WeatherData
    """
    is_forecast = serializers.SerializerMethodField()
    
    class Meta:
        model = WeatherData
        fields = [
            'id', 'latitude', 'longitude', 'location_name',
            'date', 'forecast_date', 'is_forecast',
            'temp_min', 'temp_max', 'temp_avg',
            'rainfall', 'humidity', 'wind_speed',
            'condition', 'source', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
    
    def get_is_forecast(self, obj):
        """Check if this is forecast data"""
        return obj.forecast_date is not None


class NDVIDataSerializer(serializers.ModelSerializer):
    """
    Serializer for NDVIData
    """
    farm_name = serializers.CharField(source='farm_profile.farm_name', read_only=True)
    health_status_display = serializers.CharField(source='get_health_status_display', read_only=True)
    
    class Meta:
        model = NDVIData
        fields = [
            'id', 'farm_profile', 'farm_name',
            'ndvi_value', 'image_date',
            'health_status', 'health_status_display',
            'source', 'cloud_cover_percent', 'created_at'
        ]
        read_only_fields = ['id', 'health_status', 'created_at']
    
    def validate_ndvi_value(self, value):
        """Ensure NDVI is in valid range"""
        if value < -1 or value > 1:
            raise serializers.ValidationError("NDVI value must be between -1 and 1")
        return value


class NDVIDataCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating NDVI data (auto-assigns farm from user)
    """
    class Meta:
        model = NDVIData
        fields = ['ndvi_value', 'image_date', 'source', 'cloud_cover_percent']
    
    def create(self, validated_data):
        """Auto-assign farm_profile from request user"""
        user = self.context['request'].user
        
        try:
            farm_profile = user.farm_profile
        except FarmProfile.DoesNotExist:
            raise serializers.ValidationError({
                'error': 'Farm profile not found. Please create a farm profile first.'
            })
        
        ndvi_data = NDVIData.objects.create(
            farm_profile=farm_profile,
            **validated_data
        )
        return ndvi_data


class ClimateRiskSerializer(serializers.ModelSerializer):
    """
    Serializer for ClimateRisk
    """
    farm_name = serializers.CharField(source='farm_profile.farm_name', read_only=True)
    overall_risk_display = serializers.CharField(source='get_overall_risk_level_display', read_only=True)
    
    class Meta:
        model = ClimateRisk
        fields = [
            'id', 'farm_profile', 'farm_name',
            'assessment_date', 'period_start', 'period_end',
            'drought_risk', 'flood_risk', 'extreme_temp_risk',
            'overall_risk_level', 'overall_risk_display',
            'recommendations', 'confidence', 'created_at'
        ]
        read_only_fields = ['id', 'overall_risk_level', 'created_at']
    
    def validate_drought_risk(self, value):
        if value < 0 or value > 100:
            raise serializers.ValidationError("Risk score must be between 0 and 100")
        return value
    
    def validate_flood_risk(self, value):
        if value < 0 or value > 100:
            raise serializers.ValidationError("Risk score must be between 0 and 100")
        return value
    
    def validate_extreme_temp_risk(self, value):
        if value < 0 or value > 100:
            raise serializers.ValidationError("Risk score must be between 0 and 100")
        return value


class WeatherAlertSerializer(serializers.ModelSerializer):
    """
    Serializer for WeatherAlert
    """
    user_email = serializers.EmailField(source='user.email', read_only=True)
    alert_type_display = serializers.CharField(source='get_alert_type_display', read_only=True)
    severity_display = serializers.CharField(source='get_severity_display', read_only=True)
    
    class Meta:
        model = WeatherAlert
        fields = [
            'id', 'user', 'user_email',
            'alert_type', 'alert_type_display',
            'severity', 'severity_display',
            'title', 'message',
            'valid_from', 'valid_until',
            'is_active', 'is_read', 'notification_sent',
            'created_at'
        ]
        read_only_fields = ['id', 'user', 'created_at']


class WeatherForecastSerializer(serializers.Serializer):
    """
    Serializer for weather forecast summary
    """
    location = serializers.CharField()
    forecast_days = serializers.IntegerField()
    forecasts = WeatherDataSerializer(many=True)


class ClimateAnalyticsSerializer(serializers.Serializer):
    """
    Serializer for climate analytics
    """
    farm_name = serializers.CharField()
    period_start = serializers.DateField()
    period_end = serializers.DateField()
    
    # Weather stats
    avg_temperature = serializers.DecimalField(max_digits=5, decimal_places=2)
    total_rainfall = serializers.DecimalField(max_digits=7, decimal_places=2)
    rainy_days = serializers.IntegerField()
    
    # NDVI trend
    avg_ndvi = serializers.DecimalField(max_digits=4, decimal_places=3)
    latest_health_status = serializers.CharField()
    
    # Risk summary
    current_risk_level = serializers.CharField()
    risk_factors = serializers.DictField()
