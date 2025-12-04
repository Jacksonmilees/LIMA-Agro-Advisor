from django.urls import path
from .views import (
    FarmProfileView,
    HarvestRecordListCreateView,
    HarvestRecordDetailView,
    ExpenseRecordListCreateView,
    ExpenseRecordDetailView,
    FarmAnalyticsView,
)

app_name = 'farms'

urlpatterns = [
    # Farm Profile
    path('profile/', FarmProfileView.as_view(), name='farm_profile'),
    
    # Harvest Records
    path('harvests/', HarvestRecordListCreateView.as_view(), name='harvest_list'),
    path('harvests/<int:pk>/', HarvestRecordDetailView.as_view(), name='harvest_detail'),
    
    # Expense Records
    path('expenses/', ExpenseRecordListCreateView.as_view(), name='expense_list'),
    path('expenses/<int:pk>/', ExpenseRecordDetailView.as_view(), name='expense_detail'),
    
    # Analytics
    path('analytics/', FarmAnalyticsView.as_view(), name='farm_analytics'),
]
