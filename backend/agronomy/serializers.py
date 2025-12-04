from rest_framework import serializers
from .models import CropGuide, PestDisease, AIRecommendation

class PestDiseaseSerializer(serializers.ModelSerializer):
    type_display = serializers.CharField(source='get_type_display', read_only=True)
    
    class Meta:
        model = PestDisease
        fields = [
            'id', 'crop', 'name', 'type', 'type_display',
            'symptoms', 'prevention', 'treatment_organic',
            'treatment_chemical', 'image_url'
        ]

class CropGuideSerializer(serializers.ModelSerializer):
    pests_diseases = PestDiseaseSerializer(many=True, read_only=True)
    
    class Meta:
        model = CropGuide
        fields = [
            'id', 'name', 'scientific_name',
            'planting_season', 'time_to_harvest_days',
            'seed_rate_per_acre', 'spacing',
            'soil_ph_min', 'soil_ph_max', 'water_requirement',
            'fertilizer_recommendation', 'common_challenges',
            'pests_diseases', 'created_at', 'updated_at'
        ]

class AIRecommendationSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIRecommendation
        fields = [
            'id', 'user', 'query', 'response',
            'context', 'created_at', 'feedback_score'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'response']

class AIChatRequestSerializer(serializers.Serializer):
    """
    Serializer for receiving chat input
    """
    query = serializers.CharField(required=True)
    context = serializers.CharField(default='general')
