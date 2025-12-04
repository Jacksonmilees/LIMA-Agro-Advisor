from django.urls import path
from .views import (
    InsurancePolicyListCreateView,
    InsurancePolicyDetailView,
    EvaluateTriggersView,
    InsuranceClaimListCreateView,
    InsuranceClaimDetailView,
    PremiumPaymentCreateView,
    PolicyRecommendationsView,
    InsuranceAnalyticsView,
)

app_name = 'insurance'

urlpatterns = [
    # Policies
    path('policies/', InsurancePolicyListCreateView.as_view(), name='policy_list'),
    path('policies/<int:pk>/', InsurancePolicyDetailView.as_view(), name='policy_detail'),
    path('policies/<int:pk>/evaluate/', EvaluateTriggersView.as_view(), name='evaluate_triggers'),
    
    # Claims
    path('claims/', InsuranceClaimListCreateView.as_view(), name='claim_list'),
    path('claims/<int:pk>/', InsuranceClaimDetailView.as_view(), name='claim_detail'),
    
    # Payments
    path('payments/', PremiumPaymentCreateView.as_view(), name='payment_create'),
    
    # Recommendations & Analytics
    path('recommendations/', PolicyRecommendationsView.as_view(), name='recommendations'),
    path('analytics/', InsuranceAnalyticsView.as_view(), name='analytics'),
]
