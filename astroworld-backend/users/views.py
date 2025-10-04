from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from .serializers import RegisterSerializer, UserSerializer
from django.core.mail import send_mail
from django.conf import settings
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.contrib.auth.tokens import default_token_generator
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        user = serializer.save()
        self.send_verification_email(user)

    def send_verification_email(self, user):
        try:
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            verify_url = f"{settings.FRONTEND_URL}/verify-email/?uid={uid}&token={token}"
            
            # Check if we're using console backend
            if settings.EMAIL_BACKEND == 'django.core.mail.backends.console.EmailBackend':
                print(f"\n{'='*60}")
                print(f"VERIFICATION EMAIL FOR: {user.email}")
                print(f"Verification URL: {verify_url}")
                print(f"{'='*60}\n")
                # Auto-verify in development when using console backend
                if settings.DEBUG:
                    user.is_active = True
                    user.email_verified = True
                    user.save()
                    print(f"Auto-verified user {user.email} (development mode)\n")
            else:
                send_mail(
                    "Verify your ASTROWORLD account", 
                    f"Click to verify: {verify_url}", 
                    settings.DEFAULT_FROM_EMAIL, 
                    [user.email],
                    fail_silently=False
                )
                print(f"Verification email sent to {user.email}")
        except Exception as e:
            print(f"Failed to send verification email to {user.email}: {str(e)}")
            # In development, we can continue without email verification
            if settings.DEBUG:
                user.is_active = True
                user.email_verified = True
                user.save()
                print(f"Auto-verified user {user.email} due to email configuration issues")

class VerifyEmailView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        uid = request.data.get('uid')
        token = request.data.get('token')
        try:
            uid = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=uid)
        except Exception:
            return Response({"detail": "Invalid UID"}, status=400)
        if default_token_generator.check_token(user, token):
            user.is_active = True
            user.email_verified = True
            user.save()
            return Response({"detail": "Email verified"})
        return Response({"detail": "Invalid token"}, status=400)

class PasswordResetRequestView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        try:
            user = User.objects.get(email=email)
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            reset_url = f"{settings.FRONTEND_URL}/reset-password/?uid={uid}&token={token}"
            try:
                send_mail(
                    "Password reset", 
                    f"Reset: {reset_url}", 
                    settings.DEFAULT_FROM_EMAIL, 
                    [user.email],
                    fail_silently=False
                )
                print(f"Password reset email sent to {user.email}")
            except Exception as e:
                print(f"Failed to send password reset email to {user.email}: {str(e)}")
        except User.DoesNotExist:
            pass
        return Response({"detail": "If the email exists, a reset link was sent."})

class PasswordResetConfirmView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        uid = request.data.get('uid')
        token = request.data.get('token')
        new_password = request.data.get('new_password')
        new_password2 = request.data.get('new_password2')
        if new_password != new_password2:
            return Response({"detail": "Passwords do not match"}, status=400)
        try:
            uid = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=uid)
        except Exception:
            return Response({"detail": "Invalid uid"}, status=400)
        if default_token_generator.check_token(user, token):
            user.set_password(new_password)
            user.save()
            return Response({"detail": "Password reset success"})
        return Response({"detail": "Invalid token"}, status=400)

class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"detail": "Logged out"})
        except Exception:
            return Response({"detail": "Invalid token"}, status=400)

class UserRetrieveUpdateView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user