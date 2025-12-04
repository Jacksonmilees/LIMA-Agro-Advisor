from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from farms.models import FarmProfile, HarvestRecord, ExpenseRecord
from datetime import datetime, timedelta
from decimal import Decimal
import random

User = get_user_model()


class Command(BaseCommand):
    help = 'Create dummy farm data for testing'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.SUCCESS('Creating dummy farm data...'))
        
        # Get or create test user
        user, created = User.objects.get_or_create(
            email='farmer1@lima.com',
            defaults={
                'username': 'farmer1',
                'first_name': 'John',
                'last_name': 'Doe',
            }
        )
        
        if created:
            user.set_password('SecurePassword123!')
            user.save()
            self.stdout.write(self.style.SUCCESS(f'✓ Created user: {user.email}'))
        else:
            self.stdout.write(self.style.WARNING(f'  User already exists: {user.email}'))
        
        # Create or update farm profile
        farm_profile, created = FarmProfile.objects.update_or_create(
            user=user,
            defaults={
                'farm_name': 'Sunshine Farms',
                'county': 'nakuru',
                'location': 'Nakuru Town',
                'latitude': Decimal('-0.3031'),
                'longitude': Decimal('36.0800'),
                'size_acres': Decimal('5.5'),
                'crops': ['Maize', 'Beans', 'Potatoes', 'Tomatoes'],
                'farming_type': 'mixed',
            }
        )
        
        if created:
            self.stdout.write(self.style.SUCCESS(f'✓ Created farm profile: {farm_profile.farm_name}'))
        else:
            self.stdout.write(self.style.WARNING(f'  Updated farm profile: {farm_profile.farm_name}'))
        
        # Create harvest records
        crops = [
            ('Maize', 500, 45.50),
            ('Beans', 200, 85.00),
            ('Potatoes', 350, 60.00),
            ('Tomatoes', 180, 70.00),
            ('Maize', 450, 48.00),
            ('Beans', 180, 88.00),
        ]
        
        harvest_count = 0
        for i, (crop, quantity, price) in enumerate(crops):
            harvest_date = datetime.now().date() - timedelta(days=random.randint(1, 60))
            
            harvest, created = HarvestRecord.objects.get_or_create(
                farm_profile=farm_profile,
                crop=crop,
                harvest_date=harvest_date,
                defaults={
                    'quantity_kg': Decimal(str(quantity)),
                    'price_per_kg': Decimal(str(price)),
                    'notes': f'Sample harvest {i+1}',
                }
            )
            
            if created:
                harvest_count += 1
        
        self.stdout.write(self.style.SUCCESS(f'✓ Created {harvest_count} harvest records'))
        
        # Create expense records
        expenses = [
            ('seeds', 3000, 'Hybrid maize seeds'),
            ('fertilizer', 5000, 'NPK fertilizer'),
            ('pesticides', 2500, 'Insecticides and fungicides'),
            ('labor', 4000, 'Hired labor for planting'),
            ('equipment', 1500, 'Tools and equipment'),
            ('transport', 2000, 'Transport to market'),
            ('fertilizer', 4500, 'Top dressing fertilizer'),
            ('labor', 3500, 'Weeding labor'),
        ]
        
        expense_count = 0
        for i, (category, amount, description) in enumerate(expenses):
            expense_date = datetime.now().date() - timedelta(days=random.randint(1, 90))
            
            expense, created = ExpenseRecord.objects.get_or_create(
                farm_profile=farm_profile,
                category=category,
                date=expense_date,
                amount=Decimal(str(amount)),
                defaults={
                    'description': description,
                }
            )
            
            if created:
                expense_count += 1
        
        self.stdout.write(self.style.SUCCESS(f'✓ Created {expense_count} expense records'))
        
        # Summary
        total_harvests = HarvestRecord.objects.filter(farm_profile=farm_profile).count()
        total_expenses = ExpenseRecord.objects.filter(farm_profile=farm_profile).count()
        
        self.stdout.write(self.style.SUCCESS('\n=== SUMMARY ==='))
        self.stdout.write(self.style.SUCCESS(f'User: {user.email}'))
        self.stdout.write(self.style.SUCCESS(f'Farm: {farm_profile.farm_name}'))
        self.stdout.write(self.style.SUCCESS(f'Total Harvests: {total_harvests}'))
        self.stdout.write(self.style.SUCCESS(f'Total Expenses: {total_expenses}'))
        self.stdout.write(self.style.SUCCESS('\n✅ Dummy data created successfully!'))
        self.stdout.write(self.style.WARNING('\nLogin credentials:'))
        self.stdout.write(self.style.WARNING('  Email: farmer1@lima.com'))
        self.stdout.write(self.style.WARNING('  Password: SecurePassword123!'))
