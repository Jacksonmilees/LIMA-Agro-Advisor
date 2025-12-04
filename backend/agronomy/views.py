from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import CropGuide, PestDisease, AIRecommendation
from .serializers import (
    CropGuideSerializer, 
    PestDiseaseSerializer, 
    AIRecommendationSerializer,
    AIChatRequestSerializer
)
import random

class CropGuideListView(generics.ListAPIView):
    """
    GET /api/v1/agronomy/crops/
    List all available crop guides
    """
    queryset = CropGuide.objects.all()
    serializer_class = CropGuideSerializer
    permission_classes = [permissions.IsAuthenticated]

class CropGuideDetailView(generics.RetrieveAPIView):
    """
    GET /api/v1/agronomy/crops/{id}/
    Get detailed guide for a specific crop
    """
    queryset = CropGuide.objects.all()
    serializer_class = CropGuideSerializer
    permission_classes = [permissions.IsAuthenticated]

class PestDiseaseListView(generics.ListAPIView):
    """
    GET /api/v1/agronomy/pests/
    List all pests and diseases
    Filter by crop_id query param
    """
    serializer_class = PestDiseaseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = PestDisease.objects.all()
        crop_id = self.request.query_params.get('crop_id')
        if crop_id:
            queryset = queryset.filter(crop_id=crop_id)
        return queryset

class AIChatView(APIView):
    """
    POST /api/v1/agronomy/chat/
    Simulate AI Agronomist chat
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = AIChatRequestSerializer(data=request.data)
        if serializer.is_valid():
            query = serializer.validated_data['query']
            context = serializer.validated_data['context']
            
            # Mock AI Response Logic
            response_text = self.generate_mock_response(query, context)
            
            # Save interaction
            recommendation = AIRecommendation.objects.create(
                user=request.user,
                query=query,
                response=response_text,
                context=context
            )
            
            return Response(AIRecommendationSerializer(recommendation).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def generate_mock_response(self, query, context):
        """
        Simple keyword-based mock response generator
        """
        query_lower = query.lower()
        
        if "maize" in query_lower:
            return "Maize requires well-drained soil with pH 5.5-7.0. Ensure adequate nitrogen fertilizer application at planting and top dressing."
        elif "pest" in query_lower or "disease" in query_lower:
            return "For pest control, integrated pest management is recommended. Could you describe the symptoms or upload a photo?"
        elif "water" in query_lower or "irrigation" in query_lower:
            return "Most crops require consistent moisture. Drip irrigation is efficient for water conservation."
        else:
            return "That's an interesting question. As an AI Agronomist, I recommend checking our Crop Guides for specific details or consulting a local expert."

class AIRecommendationListView(generics.ListAPIView):
    """
    GET /api/v1/agronomy/history/
    Get user's chat history
    """
    serializer_class = AIRecommendationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return AIRecommendation.objects.filter(user=self.request.user)
