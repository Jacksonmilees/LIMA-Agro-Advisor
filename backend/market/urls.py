from django.urls import path
from .views import (
    MarketPriceListView,
    LatestPricesView,
    PriceTrendView,
    PriceAlertListCreateView,
    PriceAlertDetailView,
    PriceForecastView,
    BestTimeToSellView,
)

app_name = 'market'

urlpatterns = [
    # Market Prices
    path('prices/', MarketPriceListView.as_view(), name='price_list'),
    path('prices/latest/', LatestPricesView.as_view(), name='latest_prices'),
    path('prices/trend/', PriceTrendView.as_view(), name='price_trend'),
    
    # Price Alerts
    path('alerts/', PriceAlertListCreateView.as_view(), name='alert_list'),
    path('alerts/<int:pk>/', PriceAlertDetailView.as_view(), name='alert_detail'),
    
    # Forecasting & Recommendations
    path('forecast/', PriceForecastView.as_view(), name='price_forecast'),
    path('best-time-to-sell/', BestTimeToSellView.as_view(), name='best_time_to_sell'),
]
