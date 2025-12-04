from django.core.management.base import BaseCommand
from journal.models import JournalEntry, FieldActivity
from farms.models import FarmProfile
from django.contrib.auth import get_user_model
from datetime import date, timedelta
from decimal import Decimal

User = get_user_model()


class Command(BaseCommand):
    help = 'Create dummy journal data'

    def handle(self, *args, **kwargs):
        self.stdout.write('Creating journal dummy data...')
        
        # Get test farm
        try:
            user = User.objects.get(email='farmer1@lima.com')
            farm = user.farm_profile
        except:
            self.stdout.write(self.style.ERROR('Test user/farm not found. Run create_dummy_data first.'))
            return
        
        # Create journal entries
        entries_created = 0
        
        # Entry 1: Planting
        JournalEntry.objects.get_or_create(
            farm_profile=farm,
            title='Started planting maize',
            entry_date=date.today() - timedelta(days=30),
            defaults={
                'entry_type': 'planting',
                'content': 'Planted 2 acres of maize today. Weather was perfect. Used DH04 variety.',
                'crop_name': 'Maize',
                'field_section': 'North Field',
                'tags': 'maize, planting, DH04'
            }
        )
        entries_created += 1
        
        # Entry 2: Observation
        JournalEntry.objects.get_or_create(
            farm_profile=farm,
            title='Noticed some yellowing',
            entry_date=date.today() - timedelta(days=15),
            defaults={
                'entry_type': 'observation',
                'content': 'Some plants showing yellowing of lower leaves. Might need nitrogen top dressing.',
                'crop_name': 'Maize',
                'field_section': 'North Field',
                'tags': 'yellowing, nitrogen, observation'
            }
        )
        entries_created += 1
        
        # Entry 3: Spraying
        JournalEntry.objects.get_or_create(
            farm_profile=farm,
            title='Sprayed for Fall Armyworm',
            entry_date=date.today() - timedelta(days=10),
            defaults={
                'entry_type': 'spraying',
                'content': 'Applied Emamectin benzoate. FAW pressure was high.',
                'crop_name': 'Maize',
                'field_section': 'North Field',
                'tags': 'faw, pest control, spraying'
            }
        )
        entries_created += 1
        
        self.stdout.write(self.style.SUCCESS(f'✓ Created {entries_created} journal entries'))
        
        # Create field activities
        activities_created = 0
        
        # Activity 1: Land prep
        FieldActivity.objects.get_or_create(
            farm_profile=farm,
            activity_date=date.today() - timedelta(days=35),
            activity_type='land_preparation',
            defaults={
                'crop_name': 'Maize',
                'field_section': 'North Field',
                'description': 'Ploughed and harrowed 2 acres',
                'cost': Decimal('15000'),
                'labor_hours': Decimal('16.0'),
                'workers_count': 2
            }
        )
        activities_created += 1
        
        # Activity 2: Planting
        FieldActivity.objects.get_or_create(
            farm_profile=farm,
            activity_date=date.today() - timedelta(days=30),
            activity_type='planting',
            defaults={
                'crop_name': 'Maize',
                'field_section': 'North Field',
                'description': 'Planted maize with DAP fertilizer',
                'quantity_used': '10kg seeds, 50kg DAP',
                'cost': Decimal('8000'),
                'labor_hours': Decimal('8.0'),
                'workers_count': 3
            }
        )
        activities_created += 1
        
        # Activity 3: Fertilizer application
        FieldActivity.objects.get_or_create(
            farm_profile=farm,
            activity_date=date.today() - timedelta(days=16),
            activity_type='fertilizer_application',
            defaults={
                'crop_name': 'Maize',
                'field_section': 'North Field',
                'description': 'Top dressed with CAN',
                'quantity_used': '50kg CAN',
                'cost': Decimal('4500'),
                'labor_hours': Decimal('4.0'),
                'workers_count': 2
            }
        )
        activities_created += 1
        
        # Activity 4: Pesticide
        FieldActivity.objects.get_or_create(
            farm_profile=farm,
            activity_date=date.today() - timedelta(days=10),
            activity_type='pesticide_application',
            defaults={
                'crop_name': 'Maize',
                'field_section': 'North Field',
                'description': 'Sprayed for Fall Armyworm',
                'quantity_used': '200ml Emamectin',
                'cost': Decimal('2000'),
                'labor_hours': Decimal('3.0'),
                'workers_count': 1
            }
        )
        activities_created += 1
        
        self.stdout.write(self.style.SUCCESS(f'✓ Created {activities_created} field activities'))
        
        # Summary
        self.stdout.write(self.style.SUCCESS('\n📊 Journal Data Summary:'))
        self.stdout.write(self.style.SUCCESS(f'  📝 Journal Entries: {entries_created}'))
        self.stdout.write(self.style.SUCCESS(f'  🚜 Field Activities: {activities_created}'))
        
        total_cost = FieldActivity.objects.filter(farm_profile=farm).aggregate(
            models.Sum('cost')
        )['cost__sum'] or 0
        self.stdout.write(self.style.SUCCESS(f'  💰 Total Activity Cost: KES {total_cost}'))
        
        self.stdout.write(self.style.SUCCESS('\n✅ Journal dummy data created successfully!'))


# Import models at the end to avoid circular imports
from django.db import models
