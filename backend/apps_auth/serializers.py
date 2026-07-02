from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers
from .models import CustomUser


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Inject custom user role claims into the encrypted JWT token payload
        token['is_staff'] = user.is_staff
        token['is_superuser'] = user.is_superuser
        token['email'] = user.email
        token['approval_status'] = user.approval_status
        
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user

        if not user.is_active:
            raise serializers.ValidationError({'error': 'Your account has been disabled. Please contact support.'})

        if user.approval_status == 'pending':
            raise serializers.ValidationError({'error': 'Your account is still pending approval. Please wait for admin confirmation.'})

        if user.approval_status == 'rejected':
            raise serializers.ValidationError({'error': 'Your account has been rejected. Please contact support.'})

        return data


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['email', 'phone_number', 'first_name', 'last_name', 'addresse', 'created_at']
        # The email address acts as the unique username field; it should remain read-only
        read_only_fields = ['email', 'created_at']
    