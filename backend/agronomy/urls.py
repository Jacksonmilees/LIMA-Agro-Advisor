from django.urls import path
from .views import (
    CropGuideListView,
    CropGuideDetailView,
    PestDiseaseListView,
    AIChatView,
    AIRecommendationListView
)

app_name = 'agronomy'

urlpatterns = [
    # Crop Guides
    path('crops/', CropGuideListView.as_view(), name='crop_list'),
    path('crops/<int:pk>/', CropGuideDetailView.as_view(), name='crop_detail'),
    
    # Pests & Diseases
    path('pests/', PestDiseaseListView.as_view(), name='pest_list'),
    
    # AI Chat
    path('chat/', AIChatView.as_view(), name='ai_chat'),
    path('history/', AIRecommendationListView.as_view(), name='chat_history'),
]
