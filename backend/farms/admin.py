from django.contrib import admin
from .models import FarmProfile, HarvestRecord, ExpenseRecord


@admin.register(FarmProfile)
class FarmProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'farm_name', 'county', 'location', 'size_acres', 'farming_type', 'created_at']
    list_filter = ['county', 'farming_type', 'created_at']
    search_fields = ['user__email', 'farm_name', 'location']
    readonly_fields = ['created_at', 'updated_at', 'total_harvests', 'total_expenses']
    
    fieldsets = (
        ('User', {'fields': ('user',)}),
        ('Farm Details', {'fields': ('farm_name', 'county', 'location', 'latitude', 'longitude', 'size_acres')}),
        ('Crops & Type', {'fields': ('crops', 'farming_type')}),
        ('Statistics', {'fields': ('total_harvests', 'total_expenses')}),
        ('Timestamps', {'fields': ('created_at', 'updated_at')}),
    )


@admin.register(HarvestRecord)
class HarvestRecordAdmin(admin.ModelAdmin):
    list_display = ['farm_profile', 'crop', 'quantity_kg', 'harvest_date', 'price_per_kg', 'estimated_value', 'created_at']
    list_filter = ['crop', 'harvest_date', 'created_at']
    search_fields = ['farm_profile__user__email', 'farm_profile__farm_name', 'crop', 'notes']
    readonly_fields = ['estimated_value', 'created_at', 'updated_at']
    date_hierarchy = 'harvest_date'
    
    fieldsets = (
        ('Farm', {'fields': ('farm_profile',)}),
        ('Harvest Details', {'fields': ('crop', 'quantity_kg', 'harvest_date')}),
        ('Value', {'fields': ('price_per_kg', 'estimated_value')}),
        ('Notes', {'fields': ('notes',)}),
        ('Timestamps', {'fields': ('created_at', 'updated_at')}),
    )


@admin.register(ExpenseRecord)
class ExpenseRecordAdmin(admin.ModelAdmin):
    list_display = ['farm_profile', 'category', 'amount', 'date', 'description', 'created_at']
    list_filter = ['category', 'date', 'created_at']
    search_fields = ['farm_profile__user__email', 'farm_profile__farm_name', 'category', 'description']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'date'
    
    fieldsets = (
        ('Farm', {'fields': ('farm_profile',)}),
        ('Expense Details', {'fields': ('category', 'amount', 'date', 'description')}),
        ('Timestamps', {'fields': ('created_at', 'updated_at')}),
    )
