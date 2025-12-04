from django.core.management.base import BaseCommand
from agronomy.models import CropGuide, PestDisease

class Command(BaseCommand):
    help = 'Create dummy agronomy data'

    def handle(self, *args, **kwargs):
        self.stdout.write('Creating agronomy data...')

        # 1. Maize
        maize, created = CropGuide.objects.get_or_create(
            name='Maize',
            defaults={
                'scientific_name': 'Zea mays',
                'planting_season': 'Long rains (March-May) or Short rains (Oct-Nov)',
                'time_to_harvest_days': 120,
                'seed_rate_per_acre': '10kg',
                'spacing': '75cm x 25cm',
                'soil_ph_min': 5.5,
                'soil_ph_max': 7.0,
                'water_requirement': 'medium',
                'fertilizer_recommendation': 'DAP at planting, CAN for top dressing.',
                'common_challenges': 'Fall Armyworm, erratic rainfall.'
            }
        )
        
        PestDisease.objects.get_or_create(
            crop=maize,
            name='Fall Armyworm',
            type='pest',
            defaults={
                'symptoms': 'Ragged holes in leaves, sawdust-like frass.',
                'prevention': 'Early planting, push-pull technology.',
                'treatment_chemical': 'Apply Emamectin benzoate or Spinetoram.'
            }
        )

        # 2. Beans
        beans, created = CropGuide.objects.get_or_create(
            name='Common Beans',
            defaults={
                'scientific_name': 'Phaseolus vulgaris',
                'planting_season': 'Onset of rains',
                'time_to_harvest_days': 75,
                'seed_rate_per_acre': '20kg',
                'spacing': '50cm x 10cm',
                'soil_ph_min': 6.0,
                'soil_ph_max': 7.5,
                'water_requirement': 'medium',
                'fertilizer_recommendation': 'DAP at planting.',
                'common_challenges': 'Bean Fly, Anthracnose.'
            }
        )

        PestDisease.objects.get_or_create(
            crop=beans,
            name='Anthracnose',
            type='disease',
            defaults={
                'symptoms': 'Dark sunken lesions on pods and leaves.',
                'prevention': 'Use certified seeds, crop rotation.',
                'treatment_chemical': 'Fungicides containing Copper or Mancozeb.'
            }
        )

        # 3. Tomatoes
        tomatoes, created = CropGuide.objects.get_or_create(
            name='Tomato',
            defaults={
                'scientific_name': 'Solanum lycopersicum',
                'planting_season': 'Year round with irrigation',
                'time_to_harvest_days': 90,
                'seed_rate_per_acre': '50g (seeds)',
                'spacing': '60cm x 45cm',
                'soil_ph_min': 6.0,
                'soil_ph_max': 6.8,
                'water_requirement': 'high',
                'fertilizer_recommendation': 'Manure + NPK.',
                'common_challenges': 'Blight, Tuta Absoluta.'
            }
        )

        PestDisease.objects.get_or_create(
            crop=tomatoes,
            name='Late Blight',
            type='disease',
            defaults={
                'symptoms': 'Water-soaked spots on leaves, turning brown.',
                'prevention': 'Avoid overhead irrigation.',
                'treatment_chemical': 'Metalaxyl + Mancozeb fungicides.'
            }
        )

        self.stdout.write(self.style.SUCCESS('Successfully created agronomy dummy data'))
