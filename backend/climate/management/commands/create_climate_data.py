from django.core.management.base import BaseCommand
from climate.models import WeatherData, NDVIData, ClimateRisk, WeatherAlert
from farms.models import FarmProfile
from django.contrib.auth import get_user_model
from datetime import date, timedelta, datetime
from decimal import Decimal
from django.utils import timezone
import random

User = get_user_model()


class Command(BaseCommand):
    help = 'Create dummy climate data for testing'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.SUCCESS('Creating dummy climate data...'))
        
        # Get test farm
        try:
            user = User.objects.get(email='farmer1@lima.com')
            farm = user.farm_profile
        except:
            self.stdout.write(self.style.ERROR('Test user/farm not found. Run create_dummy_data first.'))
            return
        
        # Weather data for farm location
        lat = farm.latitude or Decimal('-0.3031')
        lon = farm.longitude or Decimal('36.0800')
        location = farm.location or 'Nakuru'
        
        # Create 30 days of historical weather
        weather_count = 0
        for i in range(30):
            weather_date = date.today() - timedelta(days=29-i)
            
            # Simulate weather patterns
            base_temp = 22 + random.uniform(-3, 5)
            rainfall = max(0, random.gauss(5, 10))  # Avg 5mm, can spike
            
            WeatherData.objects.get_or_create(
                latitude=lat,
                longitude=lon,
                date=weather_date,
                forecast_date=None,
                defaults={
                    'location_name': location,
                    'temp_min': Decimal(str(round(base_temp - 5, 2))),
                    'temp_max': Decimal(str(round(base_temp + 8, 2))),
                    'temp_avg': Decimal(str(round(base_temp, 2))),
                    'rainfall': Decimal(str(round(rainfall, 2))),
                    'humidity': random.randint(50, 90),
                    'wind_speed': Decimal(str(round(random.uniform(5, 25), 2))),
                    'condition': random.choice(['clear', 'cloudy', 'rainy', 'partly_cloudy']),
                    'source': 'manual'
                }
            )
            weather_count += 1
        
        # Create 7 days of forecast
        for i in range(1, 8):
            forecast_date = date.today() + timedelta(days=i)
            base_temp = 23 + random.uniform(-2, 4)
            
            WeatherData.objects.get_or_create(
                latitude=lat,
                longitude=lon,
                date=date.today(),
                forecast_date=forecast_date,
                defaults={
                    'location_name': location,
                    'temp_min': Decimal(str(round(base_temp - 4, 2))),
                    'temp_max': Decimal(str(round(base_temp + 7, 2))),
                    'temp_avg': Decimal(str(round(base_temp, 2))),
                    'rainfall': Decimal(str(round(max(0, random.gauss(3, 8)), 2))),
                    'humidity': random.randint(55, 85),
                    'wind_speed': Decimal(str(round(random.uniform(5, 20), 2))),
                    'condition': random.choice(['clear', 'cloudy', 'rainy', 'partly_cloudy']),
                    'source': 'manual'
                }
            )
            weather_count += 1
        
        self.stdout.write(self.style.SUCCESS(f'✓ Created {weather_count} weather records'))
        
        # Create NDVI data (crop health)
        ndvi_count = 0
        for i in range(6):  # Last 6 months
            image_date = date.today() - timedelta(days=i*30)
            
            # Simulate NDVI trend (improving over time)
            ndvi_value = Decimal(str(round(0.35 + (i * 0.05) + random.uniform(-0.05, 0.05), 3)))
            ndvi_value = max(Decimal('0.1'), min(Decimal('0.9'), ndvi_value))
            
            NDVIData.objects.get_or_create(
                farm_profile=farm,
                image_date=image_date,
                defaults={
                    'ndvi_value': ndvi_value,
                    'source': 'manual',
                    'cloud_cover_percent': random.randint(5, 30)
                }
            )
            ndvi_count += 1
        
        self.stdout.write(self.style.SUCCESS(f'✓ Created {ndvi_count} NDVI records'))
        
        # Create climate risk assessment
        risk, created = ClimateRisk.objects.update_or_create(
            farm_profile=farm,
            assessment_date=date.today(),
            defaults={
                'period_start': date.today(),
                'period_end': date.today() + timedelta(days=30),
                'drought_risk': random.randint(20, 50),
                'flood_risk': random.randint(15, 40),
                'extreme_temp_risk': random.randint(10, 35),
                'recommendations': 'Monitor rainfall patterns\nEnsure adequate irrigation\nPrepare for variable conditions',
                'confidence': 75
            }
        )
        
        self.stdout.write(self.style.SUCCESS(f'✓ Created climate risk assessment'))
        
        # Create weather alerts
        alerts_created = 0
        alert_types = [
            ('heavy_rain', 'warning', 'Heavy Rainfall Expected', 'Expect heavy rains in the next 48 hours. Prepare drainage.'),
            ('drought', 'info', 'Low Rainfall Alert', 'Rainfall below average. Consider water conservation.'),
        ]
        
        for alert_type, severity, title, message in alert_types:
            WeatherAlert.objects.get_or_create(
                user=user,
                alert_type=alert_type,
                defaults={
                    'severity': severity,
                    'title': title,
                    'message': message,
                    'valid_from': timezone.now(),
                    'valid_until': timezone.now() + timedelta(days=3),
                    'is_active': True,
                    'is_read': False
                }
            )
            alerts_created += 1
        
        self.stdout.write(self.style.SUCCESS(f'✓ Created {alerts_created} weather alerts'))
        
        # Summary
        latest_weather = WeatherData.objects.filter(
            latitude=lat,
            longitude=lon,
            forecast_date__isnull=True
        ).order_by('-date').first()
        
        latest_ndvi = NDVIData.objects.filter(farm_profile=farm).order_by('-image_date').first()
        
        self.stdout.write(self.style.SUCCESS('\n📊 Climate Data Summary:'))
        if latest_weather:
            self.stdout.write(self.style.SUCCESS(f'  🌡️  Latest Temp: {latest_weather.temp_avg}°C'))
            self.stdout.write(self.style.SUCCESS(f'  🌧️  Rainfall: {latest_weather.rainfall}mm'))
        
        if latest_ndvi:
            self.stdout.write(self.style.SUCCESS(f'  🌿 Latest NDVI: {latest_ndvi.ndvi_value} ({latest_ndvi.get_health_status_display()})'))
        
        self.stdout.write(self.style.SUCCESS(f'  ⚠️  Risk Level: {risk.get_overall_risk_level_display()}'))
        
        self.stdout.write(self.style.SUCCESS('\n✅ Climate data created successfully!'))
