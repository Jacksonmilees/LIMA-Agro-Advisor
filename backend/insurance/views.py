from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Sum, Count, Q
from datetime import date, timedelta
from decimal import Decimal

from .models import InsurancePolicy, PolicyTrigger, InsuranceClaim, PremiumPayment, PolicyRecommendation
from climate.models import WeatherData, ClimateRisk
from .serializers import (
    InsurancePolicySerializer,
    PolicyCreateSerializer,
    PolicyTriggerSerializer,
    InsuranceClaimSerializer,
    PremiumPaymentSerializer,
    PolicyRecommendationSerializer,
    InsuranceAnalyticsSerializer,
)


class InsurancePolicyListCreateView(generics.ListCreateAPIView):
    """
    GET /api/v1/insurance/policies/
    List user's insurance policies
    
    POST /api/v1/insurance/policies/
    Create new insurance policy
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        try:
            farm = self.request.user.farm_profile
            return InsurancePolicy.objects.filter(farm_profile=farm)
        except:
            return InsurancePolicy.objects.none()
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return PolicyCreateSerializer
        return InsurancePolicySerializer


class InsurancePolicyDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET/PATCH/DELETE /api/v1/insurance/policies/{id}/
    """
    serializer_class = InsurancePolicySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        try:
            farm = self.request.user.farm_profile
            return InsurancePolicy.objects.filter(farm_profile=farm)
        except:
            return InsurancePolicy.objects.none()


class EvaluateTriggersView(APIView):
    """
    POST /api/v1/insurance/policies/{id}/evaluate/
    Evaluate policy triggers against weather data
    Automatically create claims if triggered
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, pk):
        try:
            farm = request.user.farm_profile
            policy = InsurancePolicy.objects.get(pk=pk, farm_profile=farm)
        except:
            return Response({
                'error': 'Policy not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        if not policy.is_valid:
            return Response({
                'error': 'Policy is not active or has expired'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get weather data for farm location
        triggers_activated = []
        
        for trigger in policy.triggers.filter(is_triggered=False):
            is_activated = False
            trigger_value = None
            
            # Get weather data for measurement period
            period_start = date.today() - timedelta(days=trigger.measurement_period_days)
            weather_data = WeatherData.objects.filter(
                latitude=farm.latitude,
                longitude=farm.longitude,
                date__gte=period_start,
                date__lte=date.today(),
                forecast_date__isnull=True
            )
            
            if weather_data.exists():
                if trigger.trigger_type == 'rainfall_deficit':
                    # Sum total rainfall
                    total_rainfall = weather_data.aggregate(Sum('rainfall'))['rainfall__sum'] or 0
                    trigger_value = float(total_rainfall)
                    
                    if total_rainfall < trigger.threshold_value:
                        is_activated = True
                
                elif trigger.trigger_type == 'rainfall_excess':
                    total_rainfall = weather_data.aggregate(Sum('rainfall'))['rainfall__sum'] or 0
                    trigger_value = float(total_rainfall)
                    
                    if total_rainfall > trigger.threshold_value:
                        is_activated = True
                
                elif trigger.trigger_type == 'temperature_high':
                    from django.db.models import Avg
                    avg_temp = weather_data.aggregate(Avg('temp_avg'))['temp_avg__avg'] or 0
                    trigger_value = float(avg_temp)
                    
                    if avg_temp > trigger.threshold_value:
                        is_activated = True
                
                elif trigger.trigger_type == 'temperature_low':
                    from django.db.models import Avg
                    avg_temp = weather_data.aggregate(Avg('temp_avg'))['temp_avg__avg'] or 0
                    trigger_value = float(avg_temp)
                    
                    if avg_temp < trigger.threshold_value:
                        is_activated = True
                
                elif trigger.trigger_type == 'consecutive_dry_days':
                    # Count consecutive days with rainfall < 1mm
                    dry_days = 0
                    max_dry_days = 0
                    
                    for day in weather_data.order_by('date'):
                        if day.rainfall < 1:
                            dry_days += 1
                            max_dry_days = max(max_dry_days, dry_days)
                        else:
                            dry_days = 0
                    
                    trigger_value = max_dry_days
                    
                    if max_dry_days >= trigger.threshold_value:
                        is_activated = True
                
                # If trigger activated, create claim
                if is_activated:
                    trigger.is_triggered = True
                    trigger.trigger_date = date.today()
                    trigger.save()
                    
                    # Calculate payout
                    payout_amount = (policy.coverage_amount * trigger.payout_percentage) / 100
                    
                    # Create automatic claim
                    claim = InsuranceClaim.objects.create(
                        policy=policy,
                        claim_number=f"CLM{date.today().strftime('%Y%m%d')}{policy.id}",
                        claim_type='automatic',
                        trigger=trigger,
                        claim_amount=payout_amount,
                        description=f"Automatic claim: {trigger.get_trigger_type_display()}. Measured value: {trigger_value}, Threshold: {trigger.threshold_value}",
                        status='approved'  # Auto-approved for parametric
                    )
                    
                    # Update policy status
                    policy.status = 'claimed'
                    policy.save()
                    
                    triggers_activated.append({
                        'trigger_type': trigger.get_trigger_type_display(),
                        'measured_value': trigger_value,
                        'threshold': float(trigger.threshold_value),
                        'payout_percentage': float(trigger.payout_percentage),
                        'claim_amount': float(payout_amount),
                        'claim_number': claim.claim_number
                    })
        
        if triggers_activated:
            return Response({
                'message': f'{len(triggers_activated)} trigger(s) activated',
                'triggers_activated': triggers_activated,
                'policy_status': policy.status
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'message': 'No triggers activated',
                'policy_status': policy.status
            }, status=status.HTTP_200_OK)


class InsuranceClaimListCreateView(generics.ListCreateAPIView):
    """
    GET /api/v1/insurance/claims/
    List insurance claims
    
    POST /api/v1/insurance/claims/
    Create manual claim
    """
    serializer_class = InsuranceClaimSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        try:
            farm = self.request.user.farm_profile
            return InsuranceClaim.objects.filter(policy__farm_profile=farm)
        except:
            return InsuranceClaim.objects.none()


class InsuranceClaimDetailView(generics.RetrieveUpdateAPIView):
    """
    GET/PATCH /api/v1/insurance/claims/{id}/
    """
    serializer_class = InsuranceClaimSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        try:
            farm = self.request.user.farm_profile
            return InsuranceClaim.objects.filter(policy__farm_profile=farm)
        except:
            return InsuranceClaim.objects.none()


class PremiumPaymentCreateView(generics.CreateAPIView):
    """
    POST /api/v1/insurance/payments/
    Record premium payment
    """
    serializer_class = PremiumPaymentSerializer
    permission_classes = [permissions.IsAuthenticated]


class PolicyRecommendationsView(APIView):
    """
    GET /api/v1/insurance/recommendations/
    Get AI-generated policy recommendations based on climate risk
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        try:
            farm = request.user.farm_profile
        except:
            return Response({
                'error': 'Farm profile not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Get latest climate risk
        latest_risk = ClimateRisk.objects.filter(farm_profile=farm).order_by('-assessment_date').first()
        
        recommendations = []
        
        # Drought insurance recommendation
        if latest_risk and latest_risk.drought_risk > 40:
            coverage = farm.size_acres * Decimal('50000')  # 50K per acre
            premium = coverage * Decimal('0.05')  # 5% of coverage
            
            recommendation = PolicyRecommendation.objects.create(
                farm_profile=farm,
                recommended_policy_type='drought',
                recommended_coverage=coverage,
                recommended_premium=premium,
                risk_assessment_summary=f"High drought risk detected ({latest_risk.drought_risk}/100). Drought insurance recommended to protect against rainfall deficit.",
                confidence_score=min(95, 50 + latest_risk.drought_risk)
            )
            recommendations.append(recommendation)
        
        # Flood insurance recommendation
        if latest_risk and latest_risk.flood_risk > 40:
            coverage = farm.size_acres * Decimal('45000')
            premium = coverage * Decimal('0.04')
            
            recommendation = PolicyRecommendation.objects.create(
                farm_profile=farm,
                recommended_policy_type='flood',
                recommended_coverage=coverage,
                recommended_premium=premium,
                risk_assessment_summary=f"Elevated flood risk ({latest_risk.flood_risk}/100). Flood insurance recommended to protect against excessive rainfall.",
                confidence_score=min(95, 50 + latest_risk.flood_risk)
            )
            recommendations.append(recommendation)
        
        # Multi-peril recommendation
        if latest_risk and (latest_risk.drought_risk > 30 or latest_risk.flood_risk > 30):
            coverage = farm.size_acres * Decimal('60000')
            premium = coverage * Decimal('0.07')
            
            recommendation = PolicyRecommendation.objects.create(
                farm_profile=farm,
                recommended_policy_type='multi_peril',
                recommended_coverage=coverage,
                recommended_premium=premium,
                risk_assessment_summary=f"Multiple climate risks detected (Drought: {latest_risk.drought_risk}, Flood: {latest_risk.flood_risk}). Multi-peril insurance provides comprehensive protection.",
                confidence_score=70
            )
            recommendations.append(recommendation)
        
        if not recommendations:
            return Response({
                'message': 'No immediate insurance needs detected. Climate risk is low.',
                'recommendations': []
            }, status=status.HTTP_200_OK)
        
        serializer = PolicyRecommendationSerializer(recommendations, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class InsuranceAnalyticsView(APIView):
    """
    GET /api/v1/insurance/analytics/
    Get insurance statistics for farm
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        try:
            farm = request.user.farm_profile
        except:
            return Response({
                'error': 'Farm profile not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        policies = InsurancePolicy.objects.filter(farm_profile=farm)
        claims = InsuranceClaim.objects.filter(policy__farm_profile=farm)
        
        # Calculate stats
        total_policies = policies.count()
        active_policies = policies.filter(status='active').count()
        total_coverage = policies.aggregate(Sum('coverage_amount'))['coverage_amount__sum'] or Decimal('0')
        total_premiums = policies.aggregate(Sum('premium_amount'))['premium_amount__sum'] or Decimal('0')
        
        total_claims = claims.count()
        approved_claims = claims.filter(status__in=['approved', 'paid']).count()
        total_payouts = claims.filter(status__in=['approved', 'paid']).aggregate(Sum('claim_amount'))['claim_amount__sum'] or Decimal('0')
        
        # Policies by type
        policies_by_type = {}
        for policy_type, _ in InsurancePolicy.POLICY_TYPE_CHOICES:
            count = policies.filter(policy_type=policy_type).count()
            if count > 0:
                policies_by_type[policy_type] = count
        
        # Claims by status
        claims_by_status = {}
        for status_choice, _ in InsuranceClaim.STATUS_CHOICES:
            count = claims.filter(status=status_choice).count()
            if count > 0:
                claims_by_status[status_choice] = count
        
        analytics_data = {
            'farm_name': farm.farm_name or farm.location,
            'total_policies': total_policies,
            'active_policies': active_policies,
            'total_coverage': total_coverage,
            'total_premiums': total_premiums,
            'total_claims': total_claims,
            'approved_claims': approved_claims,
            'total_payouts': total_payouts,
            'policies_by_type': policies_by_type,
            'claims_by_status': claims_by_status
        }
        
        serializer = InsuranceAnalyticsSerializer(analytics_data)
        return Response(serializer.data, status=status.HTTP_200_OK)
