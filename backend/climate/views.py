from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Avg, Sum, Count
from datetime import date, timedelta
from decimal import Decimal
import statistics

from .models import WeatherData, NDVIData, ClimateRisk, WeatherAlert
from .serializers import (
    WeatherDataSerializer,
    NDVIDataSerializer,
    NDVIDataCreateSerializer,
    ClimateRiskSerializer,
    WeatherAlertSerializer,
    ClimateAnalyticsSerializer,
)


class WeatherDataView(APIView):
    """
    GET /api/v1/climate/weather/
    Get weather data for a location
    
    Query params:
    - lat: Latitude (required)
    - lon: Longitude (required)
    - days_back: Historical days (default: 7)
    - days_ahead: Forecast days (default: 0)
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        lat = request.query_params.get('lat')
        lon = request.query_params.get('lon')
        
        if not lat or not lon:
            return Response({
                'error': 'lat and lon parameters required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        days_back = int(request.query_params.get('days_back', 7))
        days_ahead = int(request.query_params.get('days_ahead', 0))
        
        # Get historical data
        date_from = date.today() - timedelta(days=days_back)
        historical = WeatherData.objects.filter(
            latitude=Decimal(lat),
            longitude=Decimal(lon),
            date__gte=date_from,
            forecast_date__isnull=True
        ).order_by('date')
        
        # Get forecast data
        forecasts = WeatherData.objects.filter(
            latitude=Decimal(lat),
            longitude=Decimal(lon),
            forecast_date__isnull=False,
            forecast_date__lte=date.today() + timedelta(days=days_ahead)
        ).order_by('forecast_date')
        
        return Response({
            'location': {'latitude': lat, 'longitude': lon},
            'historical': WeatherDataSerializer(historical, many=True).data,
            'forecasts': WeatherDataSerializer(forecasts, many=True).data
        }, status=status.HTTP_200_OK)


class WeatherForecastView(APIView):
    """
    GET /api/v1/climate/weather/forecast/
    Get weather forecast for farm location
    
    Uses user's farm coordinates or optional lat/lon
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        # Try to get coordinates from farm profile
        try:
            farm = request.user.farm_profile
            lat = farm.latitude
            lon = farm.longitude
            location_name = farm.location
        except:
            lat = request.query_params.get('lat')
            lon = request.query_params.get('lon')
            location_name = request.query_params.get('location', 'Location')
            
            if not lat or not lon:
                return Response({
                    'error': 'No farm profile found. Provide lat/lon parameters.'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        days = min(int(request.query_params.get('days', 7)), 14)
        
        # Get forecast data
        forecasts = WeatherData.objects.filter(
            latitude=lat,
            longitude=lon,
            forecast_date__isnull=False,
            forecast_date__gte=date.today(),
            forecast_date__lte=date.today() + timedelta(days=days)
        ).order_by('forecast_date')
        
        return Response({
            'location': location_name,
            'latitude': str(lat),
            'longitude': str(lon),
            'forecast_days': days,
            'forecasts': WeatherDataSerializer(forecasts, many=True).data
        }, status=status.HTTP_200_OK)


class NDVIDataListCreateView(generics.ListCreateAPIView):
    """
    GET /api/v1/climate/ndvi/
    List NDVI data for user's farm
    
    POST /api/v1/climate/ndvi/
    Add new NDVI measurement
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        try:
            farm = self.request.user.farm_profile
            return NDVIData.objects.filter(farm_profile=farm)
        except:
            return NDVIData.objects.none()
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return NDVIDataCreateSerializer
        return NDVIDataSerializer


class NDVIDataDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET/PATCH/DELETE /api/v1/climate/ndvi/{id}/
    """
    serializer_class = NDVIDataSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        try:
            farm = self.request.user.farm_profile
            return NDVIData.objects.filter(farm_profile=farm)
        except:
            return NDVIData.objects.none()


class ClimateRiskAssessmentView(APIView):
    """
    GET /api/v1/climate/risk-assessment/
    Generate climate risk assessment for user's farm
    
    Query params:
    - days_ahead: Assessment period (default: 30)
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        try:
            farm = request.user.farm_profile
        except:
            return Response({
                'error': 'Farm profile not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        days_ahead = int(request.query_params.get('days_ahead', 30))
        period_start = date.today()
        period_end = period_start + timedelta(days=days_ahead)
        
        # Get historical weather for the location
        historical = WeatherData.objects.filter(
            latitude=farm.latitude,
            longitude=farm.longitude,
            date__gte=date.today() - timedelta(days=30),
            forecast_date__isnull=True
        )
        
        # Calculate drought risk (low rainfall + high temps)
        if historical.exists():
            avg_rainfall = historical.aggregate(Avg('rainfall'))['rainfall__avg'] or 0
            avg_temp = historical.aggregate(Avg('temp_avg'))['temp_avg__avg'] or 0
            
            # Drought risk logic
            if avg_rainfall < 20:  # Less than 20mm in 30 days
                drought_risk = min(100, int(80 + (10 * (30 - avg_rainfall) / 30)))
            elif avg_rainfall < 50:
                drought_risk = int(40 + (40 * (50 - avg_rainfall) / 30))
            else:
                drought_risk = max(0, int(40 - (40 * (avg_rainfall - 50) / 50)))
            
            # Flood risk (excessive rainfall)
            if avg_rainfall > 200:
                flood_risk = min(100, int(70 + (avg_rainfall - 200) / 10))
            elif avg_rainfall > 150:
                flood_risk = int(40 + (30 * (avg_rainfall - 150) / 50))
            else:
                flood_risk = max(0, int(40 - (40 * (150 - avg_rainfall) / 150)))
            
            # Extreme temperature risk
            if avg_temp > 35:
                extreme_temp_risk = min(100, int(60 + (avg_temp - 35) * 5))
            elif avg_temp < 10:
                extreme_temp_risk = min(100, int(60 + (10 - avg_temp) * 5))
            else:
                extreme_temp_risk = 20  # Normal range
            
            confidence = 75
        else:
            # No historical data - default moderate risk
            drought_risk = 30
            flood_risk = 20
            extreme_temp_risk = 25
            confidence = 30
        
        # Generate recommendations
        recommendations = []
        if drought_risk > 50:
            recommendations.append("Implement water conservation measures")
            recommendations.append("Consider drought-resistant crop varieties")
        if flood_risk > 50:
            recommendations.append("Ensure proper drainage systems")
            recommendations.append("Prepare flood mitigation strategies")
        if extreme_temp_risk > 50:
            recommendations.append("Provide crop shade/protection")
            recommendations.append("Monitor crops frequently")
        
        if not recommendations:
            recommendations.append("Continue normal farming practices")
            recommendations.append("Monitor weather conditions regularly")
        
        # Create or update risk assessment
        risk, created = ClimateRisk.objects.update_or_create(
            farm_profile=farm,
            assessment_date=date.today(),
            defaults={
                'period_start': period_start,
                'period_end': period_end,
                'drought_risk': drought_risk,
                'flood_risk': flood_risk,
                'extreme_temp_risk': extreme_temp_risk,
                'recommendations': '\n'.join(recommendations),
                'confidence': confidence
            }
        )
        
        return Response(ClimateRiskSerializer(risk).data, status=status.HTTP_200_OK)


class ClimateRiskListView(generics.ListAPIView):
    """
    GET /api/v1/climate/risks/
    List all risk assessments for user's farm
    """
    serializer_class = ClimateRiskSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        try:
            farm = self.request.user.farm_profile
            return ClimateRisk.objects.filter(farm_profile=farm)
        except:
            return ClimateRisk.objects.none()


class WeatherAlertListView(generics.ListAPIView):
    """
    GET /api/v1/climate/alerts/
    List weather alerts for user
    
    Query params:
    - is_active: Filter active alerts (true/false)
    - is_read: Filter read/unread (true/false)
    """
    serializer_class = WeatherAlertSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = WeatherAlert.objects.filter(user=self.request.user)
        
        is_active = self.request.query_params.get('is_active')
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        is_read = self.request.query_params.get('is_read')
        if is_read is not None:
            queryset = queryset.filter(is_read=is_read.lower() == 'true')
        
        return queryset


class ClimateAnalyticsView(APIView):
    """
    GET /api/v1/climate/analytics/
    Get climate analytics for user's farm
    
    Query params:
    - days: Analysis period (default: 30)
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        try:
            farm = request.user.farm_profile
        except:
            return Response({
                'error': 'Farm profile not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        days = int(request.query_params.get('days', 30))
        period_start = date.today() - timedelta(days=days)
        period_end = date.today()
        
        # Weather stats
        weather = WeatherData.objects.filter(
            latitude=farm.latitude,
            longitude=farm.longitude,
            date__gte=period_start,
            date__lte=period_end,
            forecast_date__isnull=True
        )
        
        if weather.exists():
            avg_temp = weather.aggregate(Avg('temp_avg'))['temp_avg__avg'] or 0
            total_rainfall = weather.aggregate(Sum('rainfall'))['rainfall__sum'] or 0
            rainy_days = weather.filter(rainfall__gt=0).count()
        else:
            avg_temp = 0
            total_rainfall = 0
            rainy_days = 0
        
        # NDVI stats
        ndvi_data = NDVIData.objects.filter(
            farm_profile=farm,
            image_date__gte=period_start,
            image_date__lte=period_end
        )
        
        if ndvi_data.exists():
            avg_ndvi = ndvi_data.aggregate(Avg('ndvi_value'))['ndvi_value__avg'] or 0
            latest_ndvi = ndvi_data.order_by('-image_date').first()
            latest_health = latest_ndvi.get_health_status_display() if latest_ndvi else 'No data'
        else:
            avg_ndvi = 0
            latest_health = 'No data'
        
        # Risk summary
        latest_risk = ClimateRisk.objects.filter(farm_profile=farm).order_by('-assessment_date').first()
        if latest_risk:
            current_risk = latest_risk.get_overall_risk_level_display()
            risk_factors = {
                'drought': latest_risk.drought_risk,
                'flood': latest_risk.flood_risk,
                'extreme_temp': latest_risk.extreme_temp_risk
            }
        else:
            current_risk = 'Not assessed'
            risk_factors = {}
        
        analytics_data = {
            'farm_name': farm.farm_name or farm.location,
            'period_start': period_start,
            'period_end': period_end,
            'avg_temperature': round(float(avg_temp), 2),
            'total_rainfall': round(float(total_rainfall), 2),
            'rainy_days': rainy_days,
            'avg_ndvi': round(float(avg_ndvi), 3),
            'latest_health_status': latest_health,
            'current_risk_level': current_risk,
            'risk_factors': risk_factors
        }
        
        serializer = ClimateAnalyticsSerializer(analytics_data)
        return Response(serializer.data, status=status.HTTP_200_OK)
