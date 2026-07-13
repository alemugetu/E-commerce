from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
import logging
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from django.conf import settings
from django.db.models import Q

from .serializers import UserProfileSerializer
from .models import CustomUser
from .permissions import IsSeller

logger = logging.getLogger(__name__)

User = get_user_model()


def _get_audit_log():
    """
    Lazy import to avoid circular dependency between apps_auth and custom_admin.
    Returns the AuditLog class or None if unavailable.
    """
    try:
        from custom_admin.models import AuditLog
        return AuditLog
    except ImportError:
        return None

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

            #  Only return tokens if user is approved (auto-approval disabled)
            if user.approval_status == 'approved':
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
            else:
                # Pending approval - return user data but no tokens
                return Response({
                    "message": "Registration successful. Your account is pending approval.",
                    "user": {
                        "id": user.id,
                        "email": user.email,
                        "phone_number": user.phone_number,
                        "first_name": user.first_name,
                        "last_name": user.last_name,
                        "approval_status": user.approval_status
                    }
                }, status=status.HTTP_201_CREATED)

        except Exception as e:
            # INTERNAL LOGGING ONLY
            logger.exception("User registration failed")

            return Response(
                {"error": "Registration failed. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        

class CustomerApprovalManagementView(APIView):
    """
    Seller-level endpoint for reviewing and approving/rejecting customer accounts.
    Superusers inherit this capability via the IsSeller permission class.
    """
    permission_classes = [IsSeller]

    def _serialize_customer(self, user):
        return {
            'id': user.id,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'approval_status': user.approval_status,
            'is_active': user.is_active,
            'created_at': user.created_at.isoformat() if hasattr(user, 'created_at') else None,
        }

    def get(self, request):
        customers = User.objects.filter(
            Q(is_staff=False) & Q(is_superuser=False)
        ).order_by('-created_at')

        return Response({
            'results': [self._serialize_customer(customer) for customer in customers],
            'summary': {
                'total': customers.count(),
                'pending': customers.filter(approval_status='pending').count(),
                'approved': customers.filter(approval_status='approved').count(),
                'rejected': customers.filter(approval_status='rejected').count(),
            },
        }, status=status.HTTP_200_OK)

    def patch(self, request, pk):
        try:
            customer = User.objects.get(pk=pk, is_staff=False, is_superuser=False)
        except User.DoesNotExist:
            return Response({'error': 'Customer account not found.'}, status=status.HTTP_404_NOT_FOUND)

        new_status = request.data.get('approval_status')
        if new_status not in dict(User.APPROVAL_CHOICES):
            return Response({'error': 'Invalid approval status.'}, status=status.HTTP_400_BAD_REQUEST)

        old_status = customer.approval_status
        customer.approval_status = new_status
        customer.is_active = (new_status == 'approved')
        customer.save()

        # ── Audit log ────────────────────────────────────────────────────────
        AuditLog = _get_audit_log()
        if AuditLog:
            action = 'customer_approved' if new_status == 'approved' else 'customer_rejected'
            AuditLog.log(
                actor=request.user,
                action=action,
                target=customer.email,
                details={
                    'old_status': old_status,
                    'new_status': new_status,
                    'changed_by': request.user.email,
                },
                request=request,
            )

        return Response(self._serialize_customer(customer), status=status.HTTP_200_OK)


class CustomerProfileDetailView(APIView):
    """
    Handles secure read and write operations for the authenticated 
    user's personal account profile settings.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Serialize the requesting user instance directly
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request):
        # Perform partial or complete field updates on the active user record
        serializer = UserProfileSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST) 
    
class ForgotPasswordView(APIView):
    """
    Accepts an email address, generates a secure, timed recovery token, 
    and sends a recovery URL to the target user account.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({"error": "Please provide a valid email address."}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            # Security Best Practice: Don't explicitly reveal if an email doesn't exist
            return Response({"message": "If this account is registered, a password reset link has been dispatched."}, status=status.HTTP_200_OK)

        # Generate secure encoded identifiers
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        
        # Build the dynamic URL pointing back to your React client layout routing
        frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')
        reset_link = f"{frontend_url}/reset-password/{uid}/{token}"

        # Fire email using standard Django backend email mechanisms
        try:
            send_mail(
                subject="Reset Your Store Password",
                message=f"Click the link below to securely update your credentials:\n\n{reset_link}\n\nThis link will expire shortly.",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=False,
                html_message=f"<p>Click the link below to securely update your credentials:</p><p><a href='{reset_link}'>{reset_link}</a></p><p>This link will expire shortly.</p>"
            )
        except Exception:
            return Response({"error": "Email dispatcher failed. Check system SMTP profiles."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({"message": "If this account is registered, a password reset link has been dispatched."}, status=status.HTTP_200_OK)


class ConfirmPasswordResetView(APIView):
    """
    Validates the uid and cryptographically signed token sent from React, 
    then commits the new hashed password sequence.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        uidb64 = request.data.get('uid')
        token = request.data.get('token')
        new_password = request.data.get('new_password')

        if not all([uidb64, token, new_password]):
            return Response({"error": "Missing critical parameters required for reset execution."}, status=status.HTTP_400_BAD_REQUEST)

        try: 
            # Decode user primary key from base64
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = CustomUser.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, CustomUser.DoesNotExist):
            return Response({"error": "The recovery link is invalid or corrupted."}, status=status.HTTP_400_BAD_REQUEST)

        # Check cryptographic token status validity against user profile state
        if not default_token_generator.check_token(user, token):
            return Response({"error": "The recovery link is invalid or has expired."}, status=status.HTTP_400_BAD_REQUEST)

        # Encrypt and update the new credentials cleanly
        user.set_password(new_password)
        user.save()

        return Response({"message": "Your password has been reset successfully. You may now log in."}, status=status.HTTP_200_OK)
    
        

class UserPermissionsView(APIView):
    """Return a list of permission codenames the authenticated user possesses.

    Used by the frontend to build permission‑driven navigation.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.user.is_authenticated:
            return Response({"permissions": []}, status=status.HTTP_200_OK)
        # Django returns strings like "app_label.codename"
        perms = request.user.get_all_permissions()
        codename_list = [p.split('.')[-1] for p in perms]
        return Response({"permissions": codename_list}, status=status.HTTP_200_OK)


class UserGroupsView(APIView):
    """Return the authenticated user's Django groups and dashboard type information.

    Used by the frontend for permission-driven dashboard routing.
    Returns dashboard type instead of specific routes for better flexibility.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.user.is_authenticated:
            return Response({
                "groups": [], 
                "primary_group": None, 
                "dashboard_type": "unauthorized",
                "is_superuser": False,
                "is_staff": False,
            }, status=status.HTTP_200_OK)
        
        # Get user's group names
        group_names = list(request.user.groups.values_list('name', flat=True))
        
        # Define operational groups that should use the shared Operations Dashboard
        OPERATIONAL_GROUPS = {
            'Seller', 'Warehouse Manager', 'Finance Manager', 
            'Marketing Manager', 'Customer Support', 
            'Delivery Manager', 'Content Manager'
        }
        
        # Determine dashboard type
        dashboard_type = 'unauthorized'
        
        if request.user.is_superuser:
            dashboard_type = 'superuser'
        elif not group_names or group_names == []:
            # No groups = regular customer
            dashboard_type = 'customer'
        elif any(group in OPERATIONAL_GROUPS for group in group_names):
            # User belongs to operational groups
            dashboard_type = 'operations'
        else:
            # Unknown groups - treat as unauthorized for now
            dashboard_type = 'unauthorized'
        
        # Determine primary group (first group if multiple)
        primary_group = group_names[0] if group_names else None
        
        return Response({
            "groups": group_names,
            "primary_group": primary_group,
            "dashboard_type": dashboard_type,
            "is_superuser": request.user.is_superuser,
            "is_staff": request.user.is_staff,
        }, status=status.HTTP_200_OK)
