from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Avg, Min, Max, Count
from django.utils import timezone
from datetime import date, timedelta
from decimal import Decimal
import statistics

from .models import MarketPrice, PriceAlert, PriceForecast
from .serializers import (
    MarketPriceSerializer,
    PriceAlertSerializer,
    PriceAlertCreateSerializer,
    PriceForecastSerializer,
    PriceTrendSerializer,
)


class MarketPriceListView(generics.ListAPIView):
    """
    GET /api/v1/market/prices/
    Get market prices with optional filtering
    
    Query params:
    - crop: Filter by crop
    - market: Filter by market
    - date_from: Start date
    - date_to: End date
    """
    serializer_class = MarketPriceSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = MarketPrice.objects.all()
        
        # Filter by crop
        crop = self.request.query_params.get('crop')
        if crop:
            queryset = queryset.filter(crop=crop)
        
        # Filter by market
        market = self.request.query_params.get('market')
        if market:
            queryset = queryset.filter(market=market)
        
        # Filter by date range
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')
        
        if date_from:
            queryset = queryset.filter(date__gte=date_from)
        if date_to:
            queryset = queryset.filter(date__lte=date_to)
        else:
            # Default: last 30 days
            date_to = date.today()
            date_from = date_to - timedelta(days=30)
            queryset = queryset.filter(date__gte=date_from, date__lte=date_to)
        
        return queryset.order_by('-date')


class LatestPricesView(APIView):
    """
    GET /api/v1/market/prices/latest/
    Get latest price for each crop
    
    Query params:
    - market: Filter by specific market (default: national)
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        market = request.query_params.get('market', 'national')
        
        # Get unique crops
        crops = MarketPrice.objects.values_list('crop', flat=True).distinct()
        
        latest_prices = []
        for crop in crops:
            price = MarketPrice.objects.filter(
                crop=crop,
                market=market
            ).order_by('-date').first()
            
            if price:
                latest_prices.append(MarketPriceSerializer(price).data)
        
        return Response(latest_prices, status=status.HTTP_200_OK)


class PriceTrendView(APIView):
    """
    GET /api/v1/market/prices/trend/
    Get price trend analysis for a crop
    
    Query params (required):
    - crop: Crop name
    - market: Market name (default: national)
    - days: Number of days to analyze (default: 30)
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        crop = request.query_params.get('crop')
        if not crop:
            return Response({
                'error': 'crop parameter is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        market = request.query_params.get('market', 'national')
        days = int(request.query_params.get('days', 30))
        
        date_to = date.today()
        date_from = date_to - timedelta(days=days)
        
        # Get prices
        prices = MarketPrice.objects.filter(
            crop=crop,
            market=market,
            date__gte=date_from,
            date__lte=date_to
        ).order_by('date')
        
        if not prices.exists():
            return Response({
                'error': f'No price data found for {crop} in {market}'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Calculate statistics
        price_values = [float(p.price_per_kg) for p in prices]
        avg_price = statistics.mean(price_values)
        min_price = min(price_values)
        max_price = max(price_values)
        
        # Determine trend (compare first half vs second half)
        mid_point = len(price_values) // 2
        first_half_avg = statistics.mean(price_values[:mid_point]) if mid_point > 0 else avg_price
        second_half_avg = statistics.mean(price_values[mid_point:]) if mid_point > 0 else avg_price
        
        if second_half_avg > first_half_avg * 1.05:  # 5% increase
            trend = 'rising'
        elif second_half_avg < first_half_avg * 0.95:  # 5% decrease
            trend = 'falling'
        else:
            trend = 'stable'
        
        # Format response
        price_data = [{
            'date': p.date,
            'price': str(p.price_per_kg)
        } for p in prices]
        
        result = {
            'crop': crop,
            'market': market,
            'date_from': date_from,
            'date_to': date_to,
            'prices': price_data,
            'average_price': round(avg_price, 2),
            'min_price': round(min_price, 2),
            'max_price': round(max_price, 2),
            'trend': trend,
            'data_points': len(price_values)
        }
        
        return Response(result, status=status.HTTP_200_OK)


class PriceAlertListCreateView(generics.ListCreateAPIView):
    """
    GET /api/v1/market/alerts/
    List user's price alerts
    
    POST /api/v1/market/alerts/
    Create a new price alert
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return PriceAlert.objects.filter(user=self.request.user)
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return PriceAlertCreateSerializer
        return PriceAlertSerializer


class PriceAlertDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET/PATCH/DELETE /api/v1/market/alerts/{id}/
    """
    serializer_class = PriceAlertSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return PriceAlert.objects.filter(user=self.request.user)


class PriceForecastView(APIView):
    """
    GET /api/v1/market/forecast/
    Get price forecast for a crop
    
    Query params:
    - crop: Crop name (required)
    - market: Market name (default: national)
    - days: Days ahead to forecast (default: 7, max: 30)
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        crop = request.query_params.get('crop')
        if not crop:
            return Response({
                'error': 'crop parameter is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        market = request.query_params.get('market', 'national')
        days_ahead = min(int(request.query_params.get('days', 7)), 30)
        
        # Get historical prices (last 30 days)
        date_to = date.today()
        date_from = date_to - timedelta(days=30)
        
        historical_prices = MarketPrice.objects.filter(
            crop=crop,
            market=market,
            date__gte=date_from
        ).order_by('date')
        
        if historical_prices.count() < 3:
            return Response({
                'error': f'Insufficient data for {crop} forecast. Need at least 3 data points.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Simple moving average forecast
        price_values = [float(p.price_per_kg) for p in historical_prices]
        avg_price = statistics.mean(price_values)
        
        # Calculate trend
        if len(price_values) >= 7:
            recent_avg = statistics.mean(price_values[-7:])
            overall_avg = statistics.mean(price_values)
            trend_factor = recent_avg / overall_avg if overall_avg > 0 else 1.0
        else:
            trend_factor = 1.0
        
        # Generate forecasts
        forecasts = []
        for i in range(1, days_ahead + 1):
            forecast_date = date_to + timedelta(days=i)
            
            # Simple forecast: average * trend factor with slight decay
            predicted_price = avg_price * (trend_factor ** (0.9 ** i))
            
            # Confidence decreases with days ahead
            confidence = max(100 - (i * 3), 50)  # 97% to 50%
            
            forecasts.append({
                'date': forecast_date,
                'predicted_price': round(predicted_price, 2),
                'confidence': confidence,
                'model': 'moving_average'
            })
        
        return Response({
            'crop': crop,
            'market': market,
            'historical_avg': round(avg_price, 2),
            'trend_factor': round(trend_factor, 3),
            'forecasts': forecasts,
            'generated_at': timezone.now()
        }, status=status.HTTP_200_OK)


class BestTimeToSellView(APIView):
    """
    GET /api/v1/market/best-time-to-sell/
    Recommend best time to sell based on forecasts
    
    Query params:
    - crop: Crop name (required)
    - market: Market name (default: national)
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        crop = request.query_params.get('crop')
        if not crop:
            return Response({
                'error': 'crop parameter is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        market = request.query_params.get('market', 'national')
        
        # Get current price
        current_price_obj = MarketPrice.objects.filter(
            crop=crop,
            market=market
        ).order_by('-date').first()
        
        if not current_price_obj:
            return Response({
                'error': f'No current price data for {crop}'
            }, status=status.HTTP_404_NOT_FOUND)
        
        current_price = float(current_price_obj.price_per_kg)
        
        # Get forecasts (30 days ahead)
        date_from = date.today() - timedelta(days=30)
        historical = MarketPrice.objects.filter(
            crop=crop,
            market=market,
            date__gte=date_from
        )
        
        if historical.count() < 3:
            return Response({
                'recommendation': 'sell_now',
                'reason': 'Insufficient data for forecast. Current price is available.',
                'current_price': current_price,
                'confidence': 'low'
            }, status=status.HTTP_200_OK)
        
        # Simple forecast logic
        prices = [float(p.price_per_kg) for p in historical.order_by('date')]
        avg_price = statistics.mean(prices)
        recent_avg = statistics.mean(prices[-7:]) if len(prices) >= 7 else avg_price
        
        # Decision logic
        if recent_avg > avg_price * 1.1:  # Prices rising strongly
            recommendation = 'wait'
            reason = 'Prices are trending upward. Consider waiting a few days for better rates.'
            confidence = 'medium'
        elif current_price > avg_price * 1.05:  # Above average
            recommendation = 'sell_now'
            reason = 'Current price is above average. Good time to sell.'
            confidence = 'high'
        elif recent_avg < avg_price * 0.9:  # Prices falling
            recommendation = 'sell_now'
            reason = 'Prices are declining. Sell now to avoid further losses.'
            confidence = 'medium'
        else:
            recommendation = 'sell_now'
            reason = 'Price is stable. Good time to sell.'
            confidence = 'medium'
        
        return Response({
            'crop': crop,
            'market': market,
            'recommendation': recommendation,
            'reason': reason,
            'confidence': confidence,
            'current_price': current_price,
            'average_price': round(avg_price, 2),
            'recent_trend': 'rising' if recent_avg > avg_price else 'falling'
        }, status=status.HTTP_200_OK)
