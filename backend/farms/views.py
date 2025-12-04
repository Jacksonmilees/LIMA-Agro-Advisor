from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Sum, Count, Q, Avg
from django.utils import timezone
from datetime import timedelta, datetime
from decimal import Decimal

from .models import FarmProfile, HarvestRecord, ExpenseRecord
from .serializers import (
    FarmProfileSerializer,
    HarvestRecordSerializer,
    HarvestRecordCreateSerializer,
    ExpenseRecordSerializer,
    ExpenseRecordCreateSerializer,
    FarmAnalyticsSerializer,
)


class FarmProfileView(generics.RetrieveUpdateAPIView):
    """
    GET /api/v1/farms/profile/
    Get current user's farm profile
    
    PATCH /api/v1/farms/profile/
    Update farm profile
    
    POST /api/v1/farms/profile/  (create if doesn't exist)
    Create farm profile
    """
    serializer_class = FarmProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        """Get or create farm profile for current user"""
        farm_profile, created = FarmProfile.objects.get_or_create(
            user=self.request.user
        )
        return farm_profile
    
    def post(self, request, *args, **kwargs):
        """Create farm profile (or update if exists)"""
        farm_profile, created = FarmProfile.objects.get_or_create(
            user=request.user
        )
        
        serializer = self.get_serializer(farm_profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return Response({
            'message': 'Farm profile created successfully' if created else 'Farm profile updated',
            'data': serializer.data
        }, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


class HarvestRecordListCreateView(generics.ListCreateAPIView):
    """
    GET /api/v1/farms/harvests/
    List all harvest records for current user
    
    POST /api/v1/farms/harvests/
    Create a new harvest record
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Get harvests for current user's farm"""
        try:
            farm_profile = self.request.user.farm_profile
            queryset = HarvestRecord.objects.filter(farm_profile=farm_profile)
            
            # Filter by crop (optional query param)
            crop = self.request.query_params.get('crop')
            if crop:
                queryset = queryset.filter(crop=crop)
            
            # Filter by date range (optional)
            date_from = self.request.query_params.get('date_from')
            date_to = self.request.query_params.get('date_to')
            
            if date_from:
                queryset = queryset.filter(harvest_date__gte=date_from)
            if date_to:
                queryset = queryset.filter(harvest_date__lte=date_to)
            
            return queryset
        except FarmProfile.DoesNotExist:
            return HarvestRecord.objects.none()
    
    def get_serializer_class(self):
        """Use different serializer for create vs list"""
        if self.request.method == 'POST':
            return HarvestRecordCreateSerializer
        return HarvestRecordSerializer


class HarvestRecordDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET /api/v1/farms/harvests/{id}/
    Get specific harvest record
    
    PATCH /api/v1/farms/harvests/{id}/
    Update harvest record
    
    DELETE /api/v1/farms/harvests/{id}/
    Delete harvest record
    """
    serializer_class = HarvestRecordSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Only allow access to user's own harvests"""
        try:
            farm_profile = self.request.user.farm_profile
            return HarvestRecord.objects.filter(farm_profile=farm_profile)
        except FarmProfile.DoesNotExist:
            return HarvestRecord.objects.none()


class ExpenseRecordListCreateView(generics.ListCreateAPIView):
    """
    GET /api/v1/farms/expenses/
    List all expense records for current user
    
    POST /api/v1/farms/expenses/
    Create a new expense record
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Get expenses for current user's farm"""
        try:
            farm_profile = self.request.user.farm_profile
            queryset = ExpenseRecord.objects.filter(farm_profile=farm_profile)
            
            # Filter by category (optional)
            category = self.request.query_params.get('category')
            if category:
                queryset = queryset.filter(category=category)
            
            # Filter by date range (optional)
            date_from = self.request.query_params.get('date_from')
            date_to = self.request.query_params.get('date_to')
            
            if date_from:
                queryset = queryset.filter(date__gte=date_from)
            if date_to:
                queryset = queryset.filter(date__lte=date_to)
            
            return queryset
        except FarmProfile.DoesNotExist:
            return ExpenseRecord.objects.none()
    
    def get_serializer_class(self):
        """Use different serializer for create vs list"""
        if self.request.method == 'POST':
            return ExpenseRecordCreateSerializer
        return ExpenseRecordSerializer


class ExpenseRecordDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET /api/v1/farms/expenses/{id}/
    Get specific expense record
    
    PATCH /api/v1/farms/expenses/{id}/
    Update expense record
    
    DELETE /api/v1/farms/expenses/{id}/
    Delete expense record
    """
    serializer_class = ExpenseRecordSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Only allow access to user's own expenses"""
        try:
            farm_profile = self.request.user.farm_profile
            return ExpenseRecord.objects.filter(farm_profile=farm_profile)
        except FarmProfile.DoesNotExist:
            return ExpenseRecord.objects.none()


class FarmAnalyticsView(APIView):
    """
    GET /api/v1/farms/analytics/
    Get farm analytics (revenue, expenses, profit, trends)
    
    Query params:
    - date_from: Start date (default: 30 days ago)
    - date_to: End date (default: today)
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        try:
            farm_profile = request.user.farm_profile
        except FarmProfile.DoesNotExist:
            return Response({
                'error': 'Farm profile not found. Please create a farm profile first.'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Get date range from query params
        date_to = request.query_params.get('date_to')
        date_from = request.query_params.get('date_from')
        
        if date_to:
            date_to = datetime.strptime(date_to, '%Y-%m-%d').date()
        else:
            date_to = timezone.now().date()
        
        if date_from:
            date_from = datetime.strptime(date_from, '%Y-%m-%d').date()
        else:
            date_from = date_to - timedelta(days=30)
        
        # Get harvests in date range
        harvests = HarvestRecord.objects.filter(
            farm_profile=farm_profile,
            harvest_date__gte=date_from,
            harvest_date__lte=date_to
        )
        
        # Calculate revenue
        harvest_stats = harvests.aggregate(
            total_value=Sum('estimated_value'),
            total_quantity=Sum('quantity_kg'),
            count=Count('id')
        )
        
        total_harvest_value = harvest_stats['total_value'] or Decimal('0.00')
        total_harvest_quantity = harvest_stats['total_quantity'] or Decimal('0.00')
        harvest_count = harvest_stats['count']
        
        # Get expenses in date range
        expenses = ExpenseRecord.objects.filter(
            farm_profile=farm_profile,
            date__gte=date_from,
            date__lte=date_to
        )
        
        # Calculate expenses
        expense_stats = expenses.aggregate(
            total=Sum('amount'),
            count=Count('id')
        )
        
        total_expenses = expense_stats['total'] or Decimal('0.00')
        expense_count = expense_stats['count']
        
        # Expenses by category
        expenses_by_category = {}
        for expense in expenses.values('category').annotate(total=Sum('amount')):
            expenses_by_category[expense['category']] = float(expense['total'])
        
        # Calculate profit
        gross_profit = total_harvest_value - total_expenses
        
        if total_harvest_value > 0:
            profit_margin = (gross_profit / total_harvest_value) * 100
        else:
            profit_margin = Decimal('0.00')
        
        # Top crops by quantity
        top_crops_data = harvests.values('crop').annotate(
            total_quantity=Sum('quantity_kg'),
            total_value=Sum('estimated_value')
        ).order_by('-total_quantity')[:5]
        
        top_crops = [
            {
                'crop': item['crop'],
                'quantity_kg': float(item['total_quantity']),
                'value': float(item['total_value'] or 0)
            }
            for item in top_crops_data
        ]
        
        # Prepare analytics data
        analytics_data = {
            'total_harvest_value': total_harvest_value,
            'total_harvest_quantity': total_harvest_quantity,
            'harvest_count': harvest_count,
            'total_expenses': total_expenses,
            'expense_count': expense_count,
            'expenses_by_category': expenses_by_category,
            'gross_profit': gross_profit,
            'profit_margin': profit_margin,
            'top_crops': top_crops,
            'date_from': date_from,
            'date_to': date_to,
        }
        
        serializer = FarmAnalyticsSerializer(analytics_data)
        return Response(serializer.data, status=status.HTTP_200_OK)
