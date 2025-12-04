from django.core.management.base import BaseCommand
from market.models import MarketPrice, PriceAlert
from django.contrib.auth import get_user_model
from datetime import date, timedelta
from decimal import Decimal
import random
import math

User = get_user_model()


class Command(BaseCommand):
    help = 'Create dummy market data for testing'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.SUCCESS('Creating dummy market data...'))
        
        # Crops with base prices and seasonal patterns
        crops_config = {
            'Maize': {'base': 45, 'volatility': 0.15, 'trend': 'rising'},
            'Beans': {'base': 85, 'volatility': 0.20, 'trend': 'stable'},
            'Potatoes': {'base': 60, 'volatility': 0.18, 'trend': 'falling'},
            'Tomatoes': {'base': 70, 'volatility': 0.25, 'trend': 'rising'},
            'Cabbage': {'base': 55, 'volatility': 0.12, 'trend': 'stable'},
            'Kale': {'base': 40, 'volatility': 0.10, 'trend': 'stable'},
            'Onions': {'base': 65, 'volatility': 0.22, 'trend': 'rising'},
            'Carrots': {'base': 58, 'volatility': 0.15, 'trend': 'stable'},
        }
        
        markets = ['national', 'nairobi', 'nakuru', 'mombasa', 'kisumu']
        
        # Market price modifiers (city variations)
        market_modifiers = {
            'national': 1.0,
            'nairobi': 1.15,    # +15% in Nairobi
            'nakuru': 0.95,     # -5% in Nakuru
            'mombasa': 1.10,    # +10% in Mombasa
            'kisumu': 0.90,     # -10% in Kisumu
        }
        
        # Create prices for last 60 days with realistic trends
        price_count = 0
        today = date.today()
        
        for crop, config in crops_config.items():
            base_price = config['base']
            volatility = config['volatility']
            trend = config['trend']
            
            # Generate trend factor
            if trend == 'rising':
                trend_direction = 0.002  # +0.2% per day
            elif trend == 'falling':
                trend_direction = -0.002  # -0.2% per day
            else:
                trend_direction = 0
            
            for i in range(60):
                price_date = today - timedelta(days=59-i)
                
                # Calculate base price with trend
                days_elapsed = i
                trend_factor = 1 + (trend_direction * days_elapsed)
                
                # Add seasonal wave (sine wave for realism)
                seasonal_factor = 1 + (0.05 * math.sin(i / 10))
                
                # Random daily variation
                daily_variation = random.uniform(1 - volatility, 1 + volatility)
                
                current_base = base_price * trend_factor * seasonal_factor * daily_variation
                
                for market in markets:
                    # Apply market modifier
                    market_factor = market_modifiers[market]
                    final_price = Decimal(str(round(current_base * market_factor, 2)))
                    
                    MarketPrice.objects.get_or_create(
                        crop=crop,
                        market=market,
                        date=price_date,
                        defaults={
                            'price_per_kg': final_price,
                            'source': 'manual'
                        }
                    )
                    price_count += 1
        
        self.stdout.write(self.style.SUCCESS(f'✓ Created {price_count} market prices'))
        self.stdout.write(self.style.SUCCESS(f'  - 8 crops × 5 markets × 60 days'))
        self.stdout.write(self.style.SUCCESS(f'  - Realistic trends: rising, falling, stable'))
        
        # Create sample price alerts for test user
        try:
            user = User.objects.get(email='farmer1@lima.com')
            
            # Create diverse alerts
            alerts_config = [
                ('Maize', 50, 'national', True),
                ('Beans', 90, 'nairobi', False),
                ('Potatoes', 65, 'national', True),
                ('Tomatoes', 75, 'nakuru', True),
                ('Onions', 70, 'national', False),
            ]
            
            alert_count = 0
            for crop, target, market, active in alerts_config:
                alert, created = PriceAlert.objects.get_or_create(
                    user=user,
                    crop=crop,
                    market=market,
                    defaults={
                        'target_price': Decimal(str(target)),
                        'notify_email': True,
                        'notify_sms': False,
                        'is_active': active
                    }
                )
                if created:
                    alert_count += 1
            
            self.stdout.write(self.style.SUCCESS(f'✓ Created {alert_count} price alerts'))
            
            # Show current prices for reference
            self.stdout.write(self.style.SUCCESS('\n📊 Current Prices (National):'))
            for crop in crops_config.keys():
                latest = MarketPrice.objects.filter(
                    crop=crop,
                    market='national'
                ).order_by('-date').first()
                
                if latest:
                    trend_indicator = '📈' if crops_config[crop]['trend'] == 'rising' else (
                        '📉' if crops_config[crop]['trend'] == 'falling' else '➡️'
                    )
                    self.stdout.write(
                        self.style.SUCCESS(
                            f'  {trend_indicator} {crop:12} KES {latest.price_per_kg}/kg'
                        )
                    )
            
        except User.DoesNotExist:
            self.stdout.write(self.style.WARNING('  Test user not found, skipping alerts'))
        
        self.stdout.write(self.style.SUCCESS('\n✅ Market data created successfully!'))
        self.stdout.write(self.style.WARNING('\nTrends configured:'))
        self.stdout.write(self.style.WARNING('  📈 Rising: Maize, Tomatoes, Onions'))
        self.stdout.write(self.style.WARNING('  📉 Falling: Potatoes'))
        self.stdout.write(self.style.WARNING('  ➡️  Stable: Beans, Cabbage, Kale, Carrots'))
