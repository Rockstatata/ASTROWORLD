from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'full_name', 'bio', 'date_joined', 'last_login', 'email', 'is_active', 'email_verified', 'is_superuser')