from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView

urlpatterns = [
    # Django Admin
    path('admin/', admin.site.urls),
    
    # API Documentation (Swagger/Redoc)
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
    
    # API v1 Endpoints
    path('api/v1/auth/', include('users.urls')),
    # path('api/v1/farms/', include('farms.urls')),           # Coming next
    # path('api/v1/climate/', include('climate.urls')),       # Coming next
    # path('api/v1/insurance/', include('insurance.urls')),   # Coming next
    # path('api/v1/market/', include('market.urls')),         # Coming next
    # path('api/v1/agronomy/', include('agronomy.urls')),     # Coming next
    # path('api/v1/communication/', include('communication.urls')),  # Coming next
    # path('api/v1/journal/', include('journal.urls')),       # Coming next
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
