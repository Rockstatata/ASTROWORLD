from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    # Matches schema.sql users table
    full_name = models.CharField(max_length=100, blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    profile_picture = models.TextField(blank=True, null=True)  # URL as TEXT
    date_joined = models.DateTimeField(auto_now_add=True)
    last_login = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    is_superuser = models.BooleanField(default=False)
    email_verified = models.BooleanField(default=False)

    class Meta:
        db_table = 'users'  # Match your schema table name

    def __str__(self):
        return self.username