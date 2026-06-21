
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    #Authentication Application Route point
    path('api/auth/', include('apps_auth.urls')),
    
]
