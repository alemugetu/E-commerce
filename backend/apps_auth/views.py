from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
import logging

logger = logging.getLogger(__name__)

User = get_user_model()

class RegisterView(APIView):
    """
    Handles user registration by collecting credentials, creating an account,
    and returning a fresh JWT token payload for immediate login.
    """
    permission_classes = [permissions.AllowAny]  # Public endpoint

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        phone_number = request.data.get('phone_number')
        first_name = request.data.get('first_name', '')
        last_name = request.data.get('last_name', '')
        addresse = request.data.get('addresse')

        #  Structural Sanity Checks
        if not email or not password:
            return Response(
                {"error": "Both email and password fields are strictly required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Prevent Duplicate Accounts
        if User.objects.filter(email=email).exists():
            return Response(
                {"error": "An account with this email address already exists."},
                status=status.HTTP_400_BAD_REQUEST
            )

        #  Enforce Basic Password Length Safety
        if len(password) < 8:
            return Response(
                {"error": "Password must contain a minimum of 8 characters."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            #  Save New User Account using our Custom Model Manager
            user = User.objects.create_user(
                email=email,
                password=password,
                phone_number=phone_number,
                first_name=first_name,
                last_name=last_name,
                addresse=addresse
            )

            #  Programmatically Generate a Fresh Token Bundle
            refresh = RefreshToken.for_user(user)

            return Response({
                "message": "User registered successfully.",
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "phone_number": user.phone_number,
                    "first_name": user.first_name,
                    "last_name": user.last_name
                },
                "tokens": {
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                }
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            # INTERNAL LOGGING ONLY
            logger.exception("User registration failed")

            return Response(
                {"error": "Registration failed. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        