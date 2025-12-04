from django.urls import path
from .views import (
    JournalEntryListCreateView,
    JournalEntryDetailView,
    FieldActivityListCreateView,
    FieldActivityDetailView,
    JournalSummaryView
)

app_name = 'journal'

urlpatterns = [
    # Journal Entries
    path('entries/', JournalEntryListCreateView.as_view(), name='entry_list'),
    path('entries/<int:pk>/', JournalEntryDetailView.as_view(), name='entry_detail'),
    
    # Field Activities
    path('activities/', FieldActivityListCreateView.as_view(), name='activity_list'),
    path('activities/<int:pk>/', FieldActivityDetailView.as_view(), name='activity_detail'),
    
    # Summary
    path('summary/', JournalSummaryView.as_view(), name='journal_summary'),
]
