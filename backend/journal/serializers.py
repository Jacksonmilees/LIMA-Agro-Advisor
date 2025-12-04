from rest_framework import serializers
from .models import JournalEntry, FieldActivity
from farms.models import FarmProfile


class JournalEntrySerializer(serializers.ModelSerializer):
    farm_name = serializers.CharField(source='farm_profile.farm_name', read_only=True)
    entry_type_display = serializers.CharField(source='get_entry_type_display', read_only=True)
    
    class Meta:
        model = JournalEntry
        fields = [
            'id', 'farm_profile', 'farm_name',
            'title', 'entry_date', 'entry_type', 'entry_type_display',
            'content', 'crop_name', 'field_section',
            'photo_url', 'tags',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class JournalEntryCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating journal entries (auto-assigns farm)"""
    class Meta:
        model = JournalEntry
        fields = [
            'title', 'entry_date', 'entry_type',
            'content', 'crop_name', 'field_section',
            'photo_url', 'tags'
        ]
    
    def create(self, validated_data):
        user = self.context['request'].user
        
        try:
            farm_profile = user.farm_profile
        except FarmProfile.DoesNotExist:
            raise serializers.ValidationError({
                'error': 'Farm profile not found. Please create a farm profile first.'
            })
        
        entry = JournalEntry.objects.create(
            farm_profile=farm_profile,
            **validated_data
        )
        return entry
    
    def to_representation(self, instance):
        """Return full entry data after creation"""
        return JournalEntrySerializer(instance, context=self.context).data


class FieldActivitySerializer(serializers.ModelSerializer):
    farm_name = serializers.CharField(source='farm_profile.farm_name', read_only=True)
    activity_type_display = serializers.CharField(source='get_activity_type_display', read_only=True)
    
    class Meta:
        model = FieldActivity
        fields = [
            'id', 'farm_profile', 'farm_name',
            'activity_date', 'activity_type', 'activity_type_display',
            'crop_name', 'field_section',
            'description', 'quantity_used', 'cost',
            'labor_hours', 'workers_count',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class FieldActivityCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating field activities (auto-assigns farm)"""
    class Meta:
        model = FieldActivity
        fields = [
            'activity_date', 'activity_type',
            'crop_name', 'field_section',
            'description', 'quantity_used', 'cost',
            'labor_hours', 'workers_count'
        ]
    
    def create(self, validated_data):
        user = self.context['request'].user
        
        try:
            farm_profile = user.farm_profile
        except FarmProfile.DoesNotExist:
            raise serializers.ValidationError({
                'error': 'Farm profile not found. Please create a farm profile first.'
            })
        
        activity = FieldActivity.objects.create(
            farm_profile=farm_profile,
            **validated_data
        )
        return activity
    
    def to_representation(self, instance):
        """Return full activity data after creation"""
        return FieldActivitySerializer(instance, context=self.context).data
