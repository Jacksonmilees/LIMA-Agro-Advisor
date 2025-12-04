from django.urls import path
from .views import (
    WeatherDataView,
    WeatherForecastView,
    NDVIDataListCreateView,
    NDVIDataDetailView,
    ClimateRiskAssessmentView,
    ClimateRiskListView,
    WeatherAlertListView,
    ClimateAnalyticsView,
)

app_name = 'climate'

urlpatterns = [
    # Weather
    path('weather/', WeatherDataView.as_view(), name='weather_data'),
    path('weather/forecast/', WeatherForecastView.as_view(), name='weather_forecast'),
    
    # NDVI (Crop Health)
    path('ndvi/', NDVIDataListCreateView.as_view(), name='ndvi_list'),
    path('ndvi/<int:pk>/', NDVIDataDetailView.as_view(), name='ndvi_detail'),
    
    # Climate Risk
    path('risk-assessment/', ClimateRiskAssessmentView.as_view(), name='risk_assessment'),
    path('risks/', ClimateRiskListView.as_view(), name='risk_list'),
    
    # Alerts & Analytics  
    path('alerts/', WeatherAlertListView.as_view(), name='alert_list'),
    path('analytics/', ClimateAnalyticsView.as_view(), name='climate_analytics'),
]
