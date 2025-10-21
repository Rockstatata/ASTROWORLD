#!/usr/bin/env python
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'astroworld.settings')
sys.path.insert(0, os.path.dirname(__file__))
django.setup()

from skymap.models import SkyMarker
from django.contrib.auth import get_user_model

User = get_user_model()

def test_marker_creation():
    user = User.objects.first()
    if not user:
        print("No users found")
        return

    print(f"Testing marker creation for user: {user.username}")

    try:
        marker = SkyMarker.objects.create(
            user=user,
            name='Test Object',
            object_type='star',
            ra=0,
            dec=0,
            alt=45,
            az=90,
            notes='Test marker'
        )
        print(f'Marker created successfully: {marker.id}')
        print(f'Coordinate string: {marker.coordinate_string}')
    except Exception as e:
        print(f'Error creating marker: {str(e)}')
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    test_marker_creation()