from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum, Count
from .models import JournalEntry, FieldActivity
from .serializers import (
    JournalEntrySerializer,
    JournalEntryCreateSerializer,
    FieldActivitySerializer,
    FieldActivityCreateSerializer
)


class JournalEntryListCreateView(generics.ListCreateAPIView):
    """
    GET /api/v1/journal/entries/
    List journal entries for user's farm
    
    POST /api/v1/journal/entries/
    Create new journal entry
    
    Query params:
    - entry_type: Filter by type
    - crop_name: Filter by crop
    - start_date: Filter from date
    - end_date: Filter to date
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        try:
            farm = self.request.user.farm_profile
            queryset = JournalEntry.objects.filter(farm_profile=farm)
            
            # Apply filters
            entry_type = self.request.query_params.get('entry_type')
            if entry_type:
                queryset = queryset.filter(entry_type=entry_type)
            
            crop_name = self.request.query_params.get('crop_name')
            if crop_name:
                queryset = queryset.filter(crop_name__icontains=crop_name)
            
            start_date = self.request.query_params.get('start_date')
            if start_date:
                queryset = queryset.filter(entry_date__gte=start_date)
            
            end_date = self.request.query_params.get('end_date')
            if end_date:
                queryset = queryset.filter(entry_date__lte=end_date)
            
            return queryset
        except:
            return JournalEntry.objects.none()
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return JournalEntryCreateSerializer
        return JournalEntrySerializer


class JournalEntryDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET/PUT/PATCH/DELETE /api/v1/journal/entries/{id}/
    """
    serializer_class = JournalEntrySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        try:
            farm = self.request.user.farm_profile
            return JournalEntry.objects.filter(farm_profile=farm)
        except:
            return JournalEntry.objects.none()


class FieldActivityListCreateView(generics.ListCreateAPIView):
    """
    GET /api/v1/journal/activities/
    List field activities
    
    POST /api/v1/journal/activities/
    Create new activity
    
    Query params:
    - activity_type: Filter by type
    - start_date: Filter from date
    - end_date: Filter to date
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        try:
            farm = self.request.user.farm_profile
            queryset = FieldActivity.objects.filter(farm_profile=farm)
            
            # Apply filters
            activity_type = self.request.query_params.get('activity_type')
            if activity_type:
                queryset = queryset.filter(activity_type=activity_type)
            
            start_date = self.request.query_params.get('start_date')
            if start_date:
                queryset = queryset.filter(activity_date__gte=start_date)
            
            end_date = self.request.query_params.get('end_date')
            if end_date:
                queryset = queryset.filter(activity_date__lte=end_date)
            
            return queryset
        except:
            return FieldActivity.objects.none()
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return FieldActivityCreateSerializer
        return FieldActivitySerializer


class FieldActivityDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET/PUT/PATCH/DELETE /api/v1/journal/activities/{id}/
    """
    serializer_class = FieldActivitySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        try:
            farm = self.request.user.farm_profile
            return FieldActivity.objects.filter(farm_profile=farm)
        except:
            return FieldActivity.objects.none()


class JournalSummaryView(APIView):
    """
    GET /api/v1/journal/summary/
    Get journal statistics
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        try:
            farm = request.user.farm_profile
        except:
            return Response({'error': 'Farm profile not found'}, status=404)
        
        # Entries summary
        total_entries = JournalEntry.objects.filter(farm_profile=farm).count()
        entries_by_type = {}
        for et, label in JournalEntry.ENTRY_TYPE_CHOICES:
            count = JournalEntry.objects.filter(farm_profile=farm, entry_type=et).count()
            if count > 0:
                entries_by_type[et] = count
        
        # Activities summary
        total_activities = FieldActivity.objects.filter(farm_profile=farm).count()
        activities_by_type = {}
        for at, label in FieldActivity.ACTIVITY_TYPE_CHOICES:
            count = FieldActivity.objects.filter(farm_profile=farm, activity_type=at).count()
            if count > 0:
                activities_by_type[at] = count
        
        # Cost summary
        total_activity_cost = FieldActivity.objects.filter(farm_profile=farm).aggregate(
            Sum('cost')
        )['cost__sum'] or 0
        
        total_labor_hours = FieldActivity.objects.filter(farm_profile=farm).aggregate(
            Sum('labor_hours')
        )['labor_hours__sum'] or 0
        
        return Response({
            'farm_name': farm.farm_name or farm.location,
            'total_entries': total_entries,
            'entries_by_type': entries_by_type,
            'total_activities': total_activities,
            'activities_by_type': activities_by_type,
            'total_activity_cost': float(total_activity_cost),
            'total_labor_hours': float(total_labor_hours)
        })
