Great — let’s build a **robust, syllabus-aligned authentication system** for ASTROWORLD (Django backend + React frontend). I’ll give you a complete, practical plan with code snippets, endpoints, DB notes, email/password-reset flows, security best practices, and how this maps to your course topics (migrations, models, controllers/views, middleware, sessions, CSRF, REST API). Use this as a reference while you implement.

---

# Overview — what we’ll deliver

1. Register (create account) with email + user details
2. Email verification after registration (confirm account)
3. Login (issue JWT access + refresh tokens)
4. Refresh token flow (keep sessions secure)
5. Logout (revoke / delete refresh cookie)
6. Forgot password (request reset email) + reset-confirm (set new password)
7. User profile endpoints (view/update)
8. Security hardening: rate limiting, password rules, email backend, HTTPS notes
9. Frontend flow (React): forms, axios usage, token handling

We’ll use Django + Django REST Framework (DRF) + `djangorestframework-simplejwt` for JWT tokens, plus email token flows using Django’s built-in token generator.

---

# Packages to install

Run inside your backend virtualenv:

```bash
pip install django djangorestframework djangorestframework-simplejwt django-cors-headers django-environ psycopg2-binary
# optional security/tools:
pip install django-ratelimit django-axes
```

Add to `INSTALLED_APPS`:

```py
INSTALLED_APPS = [
  ...,
  'rest_framework',
  'corsheaders',
  'users',         # your auth app
]
```

Configure CORS for React frontend:

```py
MIDDLEWARE = ['corsheaders.middleware.CorsMiddleware', ...]
CORS_ALLOWED_ORIGINS = ["http://localhost:5173"]
```

---

# Database model — Custom user (recommended)

Use Django’s `AbstractUser` to add fields; it cleanly matches syllabus (models, migrations):

`users/models.py`

```py
from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    # default fields: username, email, first_name, last_name, password, is_active, etc.
    bio = models.TextField(blank=True, null=True)
    profile_picture = models.URLField(blank=True, null=True)
    email_verified = models.BooleanField(default=False)
    # add any other fields you need

    def __str__(self):
        return self.username
```

In `settings.py`:

```py
AUTH_USER_MODEL = 'users.User'
```

Create migrations:

```bash
python manage.py makemigrations users
python manage.py migrate
```

(These demonstrate migrations & schema design as per syllabus.)

---

# Serializers (DRF)

`users/serializers.py`

```py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('username','email','first_name','last_name','password','password2')

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError({"password":"Password fields didn't match."})
        return data

    def create(self, validated_data):
        validated_data.pop('password2')
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.is_active = True  # still false if you require email confirm
        user.save()
        return user

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id','username','email','first_name','last_name','bio','profile_picture','email_verified')
        read_only_fields = ('email_verified','id')
```

---

# Views & Endpoints (DRF)

We'll implement endpoints:

* `POST /api/auth/register/` — create account
* `POST /api/auth/login/` — JWT token obtain
* `POST /api/auth/token/refresh/` — refresh
* `POST /api/auth/logout/` — logout (server side cookie delete)
* `GET/PUT /api/auth/user/` — profile
* `POST /api/auth/email-verify/` — verify email (link flow)
* `POST /api/auth/password-reset/` — request reset email
* `POST /api/auth/password-reset-confirm/` — send new password

`users/views.py` (key snippets)

```py
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .serializers import RegisterSerializer, UserSerializer
from django.contrib.sites.shortcuts import get_current_site
from django.urls import reverse
from django.core.mail import send_mail
from django.conf import settings
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.contrib.auth.tokens import default_token_generator

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        user = serializer.save()
        # Optionally set user.is_active=False until email is verified
        user.is_active = False
        user.save()
        self.send_verification_email(user)

    def send_verification_email(self, user):
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        domain = settings.FRONTEND_URL  # or get_current_site(self.request).domain
        verify_url = f"{domain}/verify-email/?uid={uid}&token={token}"
        subject = "Verify your ASTROWORLD account"
        message = f"Click to verify: {verify_url}"
        send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [user.email])
```

**Email verification endpoint**
`users/views.py`

```py
from rest_framework.views import APIView

class VerifyEmailView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        uid = request.data.get('uid')
        token = request.data.get('token')
        try:
            uid = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=uid)
        except Exception:
            return Response({"detail":"Invalid UID"}, status=400)
        if default_token_generator.check_token(user, token):
            user.is_active = True
            user.email_verified = True
            user.save()
            return Response({"detail":"Email verified"})
        return Response({"detail":"Invalid token"}, status=400)
```

**Password reset request and confirm**

```py
class PasswordResetRequestView(APIView):
    permission_classes = [permissions.AllowAny]
    def post(self, request):
        email = request.data.get('email')
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"detail":"If the email exists, a reset link was sent."})
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        reset_url = f"{settings.FRONTEND_URL}/reset-password/?uid={uid}&token={token}"
        send_mail("Password reset", f"Reset: {reset_url}", settings.DEFAULT_FROM_EMAIL, [user.email])
        return Response({"detail":"If the email exists, a reset link was sent."})

class PasswordResetConfirmView(APIView):
    permission_classes = [permissions.AllowAny]
    def post(self, request):
        uid = request.data.get('uid'); token = request.data.get('token')
        new_password = request.data.get('new_password'); new_password2 = request.data.get('new_password2')
        if new_password != new_password2:
            return Response({"detail":"Passwords do not match"}, status=400)
        try:
            uid = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=uid)
        except Exception:
            return Response({"detail":"Invalid uid"}, status=400)
        if default_token_generator.check_token(user, token):
            user.set_password(new_password)
            user.save()
            return Response({"detail":"Password reset success"})
        return Response({"detail":"Invalid token"}, status=400)
```

---

# JWT Authentication (simplejwt)

In `settings.py`:

```py
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
}

from datetime import timedelta
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=15),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'AUTH_HEADER_TYPES': ('Bearer',),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
}
```

Add token views in `urls.py`:

```py
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns += [
    path('api/auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
```

For logout / revoking refresh tokens you can use `simplejwt`’s blacklist app (install `djangorestframework-simplejwt[crypto]` and add `'rest_framework_simplejwt.token_blacklist'` to `INSTALLED_APPS`) and then blacklist a refresh token on logout.

---

# URLs (summary)

```py
# backend/urls.py
urlpatterns = [
  path('api/auth/register/', RegisterView.as_view()),
  path('api/auth/email-verify/', VerifyEmailView.as_view()),
  path('api/auth/password-reset/', PasswordResetRequestView.as_view()),
  path('api/auth/password-reset-confirm/', PasswordResetConfirmView.as_view()),
  path('api/auth/login/', TokenObtainPairView.as_view()),
  path('api/auth/token/refresh/', TokenRefreshView.as_view()),
  path('api/auth/logout/', LogoutView.as_view()),  # implement blacklisting
  path('api/auth/user/', UserRetrieveUpdateView.as_view()),  # GET/PUT
]
```

`UserRetrieveUpdateView` — a `RetrieveUpdateAPIView` using `UserSerializer` with `permission_classes=[IsAuthenticated]`.

---

# Email backend (dev & production)

In development, use console backend to see emails:

`settings.py`

```py
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
DEFAULT_FROM_EMAIL = 'no-reply@astroworld.local'
```

For production, configure SMTP or an email service (SendGrid, Mailgun). Use env vars for credentials.

---

# Frontend (React) flow — concise

Use React forms with axios. Example flows:

1. Register

   * POST `/api/auth/register/` with form data
   * On success: show message to check email
2. Verify Email

   * Frontend reads `uid` and `token` from URL params (link clicked in email)
   * POST to `/api/auth/email-verify/` with `{uid, token}`
3. Login

   * POST to `/api/auth/login/` → returns `{ access, refresh }`
   * Store `access` in memory (React state or a short-lived storage), store `refresh` in httpOnly cookie (recommended) OR both in memory/localStorage (less secure)
4. Authenticated requests

   * Use axios interceptor to set `Authorization: Bearer <access>`
   * On 401, call `/api/auth/token/refresh/` with refresh token to obtain new access
5. Logout

   * POST `/api/auth/logout/` to backend (blacklist refresh), clear tokens on client
6. Forgot Password

   * POST `/api/auth/password-reset/` with email
   * Click link in email → frontend page collects new password and does POST `/api/auth/password-reset-confirm/`

**Axios example:**

```js
axios.defaults.baseURL = import.meta.env.VITE_API_URL;

axios.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

**Refreshing**: handle 401 in response interceptor -> call refresh endpoint -> retry original request.

---

# Security best practices (mandatory)

* **Store refresh tokens in httpOnly, secure cookies** (prevents XSS theft). Configure backend to set cookie on login with `Set-Cookie` (requires CORS and SameSite config).
* **CSRF**: if using cookie auth, protect endpoints with CSRF tokens. If using JWT in header, CSRF is less relevant but still use HTTPS.
* **Password policy**: use Django’s `AUTH_PASSWORD_VALIDATORS`.
* **Rate limiting**: add `django-ratelimit` on login/password-reset endpoints to prevent brute force.
* **Account lockout**: optional `django-axes` to lock accounts after failed attempts.
* **HTTPS** in production — configure `SECURE_SSL_REDIRECT`, `SESSION_COOKIE_SECURE`, `CSRF_COOKIE_SECURE`.
* **Email verification**: set `is_active=False` until email verified to prevent spam accounts.
* **Token rotation & blacklist**: enable rotation & blacklist in `SIMPLE_JWT`.

---

# Middleware & Syllabus mapping

* **Middleware**: `corsheaders.middleware.CorsMiddleware` (cross-origin), built-in `AuthenticationMiddleware`, and any custom middleware for logging or checking email verification.
* This demonstrates syllabus items: middleware usage, request manipulation, route protection.

---

# Tests (example)

Use DRF’s `APIClient`:

`users/tests.py`

```py
from rest_framework.test import APITestCase
from django.urls import reverse

class AuthTests(APITestCase):
    def test_register_and_login(self):
        url = reverse('register')
        data = {'username':'test','email':'t@example.com','password':'Str0ngPa$$','password2':'Str0ngPa$$'}
        r = self.client.post(url, data)
        self.assertEqual(r.status_code, 201)
        # further tests: login, token endpoints
```

Covers syllabus: REST API testing, request-response handling.

---

# Extra features (nice-to-have)

* **Two-Factor Authentication (2FA)** with TOTP (django-otp)
* **Social login** (Google/GitHub) using `django-allauth`
* **Device/session management**: show active sessions, allow logout from all devices
* **Audit logs**: record auth events (logins, failed attempts)

---

# Implementation checklist (step-by-step)

1. Create `users` app and custom `User` model extending `AbstractUser`. Add `AUTH_USER_MODEL`.
2. Install & configure DRF, simplejwt, corsheaders.
3. Implement serializers: register, user, password reset.
4. Implement views: register (send verification email), verify, password reset request & confirm, user profile.
5. Add JWT login/refresh endpoints and configure `SIMPLE_JWT`.
6. Implement logout view blacklisting refresh token.
7. Configure email backend (console for dev).
8. Implement frontend forms and axios logic for tokens and flows.
9. Add rate-limiting middleware for sensitive endpoints.
10. Write tests for register/login/reset flows.
11. Document endpoints in README and optionally add OpenAPI/Swagger (DRF schema).

---

# Minimal working example summary (quick copy)

* `POST /api/auth/register/` — body: `{username,email,password,password2}` → creates user, sends verification email.
* `POST /api/auth/email-verify/` — body: `{uid,token}` → activates user.
* `POST /api/auth/login/` — returns `{access,refresh}`
* `POST /api/auth/token/refresh/` — returns new access (and refresh if rotation)
* `POST /api/auth/logout/` — blacklists refresh token, server deletes refresh cookie
* `POST /api/auth/password-reset/` — request reset email
* `POST /api/auth/password-reset-confirm/` — body `{uid,token,new_password,new_password2}`

---

If you want, I can now:

* Generate full **Django code files** (models, serializers, views, urls, settings snippets) ready to paste, **including logout/blacklist implementation**.
* Or produce **React form components** (Register/Login/PasswordReset) with axios and token handling.
* Or create **Postman collection / OpenAPI schema** for these endpoints.

Which of those would you like me to generate right now?
