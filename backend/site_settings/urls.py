from django.urls import path
from .views import StoreSettingsAPIView

urlpatterns = [
    path('store/settings/', StoreSettingsAPIView.as_view(), name='store-settings'),
]
