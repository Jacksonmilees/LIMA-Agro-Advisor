from django.core.management.base import BaseCommand
from insurance.models import InsurancePolicy, PolicyTrigger, InsuranceClaim, PremiumPayment
from farms.models import FarmProfile
from django.contrib.auth import get_user_model
from datetime import date, timedelta
from decimal import Decimal
import random

User = get_user_model()


class Command(BaseCommand):
    help = 'Create dummy insurance data for testing'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.SUCCESS('Creating dummy insurance data...'))
        
        # Get test farm
        try:
            user = User.objects.get(email='farmer1@lima.com')
            farm = user.farm_profile
        except:
            self.stdout.write(self.style.ERROR('Test user/farm not found. Run create_dummy_data first.'))
            return
        
        # Create insurance policies
        policies_created = 0
        
        # 1. Drought Insurance (Active)
        drought_policy = InsurancePolicy.objects.create(
            farm_profile=farm,
            policy_number="POL2025DRGHT1",
            policy_type='drought',
            coverage_amount=Decimal('200000'),
            premium_amount=Decimal('10000'),
            payment_frequency='quarterly',
            start_date=date.today() - timedelta(days=60),
            end_date=date.today() + timedelta(days=305),
            status='active',
            is_paid=True,
            payment_date=date.today() - timedelta(days=60)
        )
        policies_created += 1
        
        # Add trigger for drought
        PolicyTrigger.objects.create(
            policy=drought_policy,
            trigger_type='rainfall_deficit',
            threshold_value=Decimal('50.00'),  # Less than 50mm in 30 days
            measurement_period_days=30,
            payout_percentage=Decimal('80.00')
        )
        
        # 2. Multi-Peril Insurance (Active)
        multi_policy = InsurancePolicy.objects.create(
            farm_profile=farm,
            policy_number="POL2025MULTI1",
            policy_type='multi_peril',
            coverage_amount=Decimal('300000'),
            premium_amount=Decimal('21000'),
            payment_frequency='quarterly',
            start_date=date.today() - timedelta(days=30),
            end_date=date.today() + timedelta(days=335),
            status='active',
            is_paid=True,
            payment_date=date.today() - timedelta(days=30)
        )
        policies_created += 1
        
        # Add triggers for multi-peril
        PolicyTrigger.objects.create(
            policy=multi_policy,
            trigger_type='rainfall_deficit',
            threshold_value=Decimal('40.00'),
            measurement_period_days=30,
            payout_percentage=Decimal('70.00')
        )
        
        PolicyTrigger.objects.create(
            policy=multi_policy,
            trigger_type='rainfall_excess',
            threshold_value=Decimal('250.00'),  # More than 250mm in 30 days
            measurement_period_days=30,
            payout_percentage=Decimal('60.00')
        )
        
        self.stdout.write(self.style.SUCCESS(f'✓ Created {policies_created} insurance policies'))
        
        # Create premium payments
        payments_created = 0
        
        PremiumPayment.objects.create(
            policy=drought_policy,
            amount=Decimal('10000'),
            payment_date=date.today() - timedelta(days=60),
            payment_method='mpesa',
            transaction_ref='MPX' + str(random.randint(100000, 999999)),
            is_confirmed=True
        )
        payments_created += 1
        
        PremiumPayment.objects.create(
            policy=multi_policy,
            amount=Decimal('21000'),
            payment_date=date.today() - timedelta(days=30),
            payment_method='mpesa',
            transaction_ref='MPX' + str(random.randint(100000, 999999)),
            is_confirmed=True
        )
        payments_created += 1
        
        self.stdout.write(self.style.SUCCESS(f'✓ Created {payments_created} premium payments'))
        
        # Summary
        self.stdout.write(self.style.SUCCESS('\n📊 Insurance Data Summary:'))
        self.stdout.write(self.style.SUCCESS(f'  🛡️  Policies: {policies_created}'))
        self.stdout.write(self.style.SUCCESS(f'     - Drought Insurance: KES 200,000 coverage'))
        self.stdout.write(self.style.SUCCESS(f'     - Multi-Peril Insurance: KES 300,000 coverage'))
        self.stdout.write(self.style.SUCCESS(f'  💰 Total Coverage: KES 500,000'))
        self.stdout.write(self.style.SUCCESS(f'  💳 Premiums Paid: KES 31,000'))
        
        self.stdout.write(self.style.WARNING('\n⚙️  Trigger Conditions:'))
        self.stdout.write(self.style.WARNING('  - Rainfall < 50mm in 30 days → 80% payout'))
        self.stdout.write(self.style.WARNING('  - Rainfall > 250mm in 30 days → 60% payout'))
        
        self.stdout.write(self.style.SUCCESS('\n✅ Insurance data created successfully!'))
        self.stdout.write(self.style.SUCCESS('\n💡 Tip: Run evaluate-triggers endpoint to check for automatic claims'))
