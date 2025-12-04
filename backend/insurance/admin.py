from django.contrib import admin
from .models import InsurancePolicy, PolicyTrigger, InsuranceClaim, PremiumPayment, PolicyRecommendation


class PolicyTriggerInline(admin.TabularInline):
    model = PolicyTrigger
    extra = 1
    readonly_fields = ['is_triggered', 'trigger_date']


@admin.register(InsurancePolicy)
class InsurancePolicyAdmin(admin.ModelAdmin):
    list_display = ['policy_number', 'farm_profile', 'policy_type', 'coverage_amount', 'status', 'is_paid', 'payment_date']
    list_filter = ['policy_type', 'status', 'is_paid', 'payment_frequency']
    search_fields = ['policy_number', 'farm_profile__farm_name', 'farm_profile__user__email']
    date_hierarchy = 'start_date'
    ordering = ['-created_at']
    readonly_fields = ['policy_number', 'is_valid', 'created_at', 'updated_at']
    inlines = [PolicyTriggerInline]
    
    fieldsets = (
        ('Policy Info', {'fields': ('farm_profile', 'policy_number', 'policy_type')}),
        ('Coverage', {'fields': ('coverage_amount', 'premium_amount', 'payment_frequency')}),
        ('Period', {'fields': ('start_date', 'end_date')}),
        ('Status', {'fields': ('status', 'is_paid', 'payment_date', 'is_valid')}),
        ('Metadata', {'fields': ('created_at', 'updated_at')}),
    )
    
    actions = ['activate_policies', 'mark_as_paid']
    
    def activate_policies(self, request, queryset):
        queryset.update(status='active')
    activate_policies.short_description = "Activate selected policies"
    
    def mark_as_paid(self, request, queryset):
        from datetime import date
        queryset.update(is_paid=True, payment_date=date.today())
    mark_as_paid.short_description = "Mark as paid"


@admin.register(InsuranceClaim)
class InsuranceClaimAdmin(admin.ModelAdmin):
    list_display = ['claim_number', 'policy', 'claim_type', 'claim_amount', 'status', 'filed_date', 'payout_date']
    list_filter = ['claim_type', 'status', 'filed_date']
    search_fields = ['claim_number', 'policy__policy_number']
    date_hierarchy = 'filed_date'
    ordering = ['-filed_date']
    readonly_fields = ['claim_number', 'filed_date', 'created_at']
    
    fieldsets = (
        ('Claim Info', {'fields': ('policy', 'claim_number', 'claim_type', 'trigger')}),
        ('Details', {'fields': ('claim_amount', 'description')}),
        ('Status', {'fields': ('status', 'filed_date', 'processed_date', 'payout_date')}),
        ('Admin', {'fields': ('admin_notes',)}),
    )


@admin.register(PremiumPayment)
class PremiumPaymentAdmin(admin.ModelAdmin):
    list_display = ['policy', 'amount', 'payment_date', 'payment_method', 'is_confirmed']
    list_filter = ['payment_method', 'is_confirmed', 'payment_date']
    search_fields = ['policy__policy_number', 'transaction_ref']
    date_hierarchy = 'payment_date'


@admin.register(PolicyRecommendation)
class PolicyRecommendationAdmin(admin.ModelAdmin):
    list_display = ['farm_profile', 'recommended_policy_type', 'recommended_coverage', 'confidence_score', 'generated_date']
    list_filter = ['recommended_policy_type', 'generated_date']
    search_fields = ['farm_profile__farm_name']
    readonly_fields = ['generated_date']
