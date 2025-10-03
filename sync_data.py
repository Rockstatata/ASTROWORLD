#!/usr/bin/env python3
"""
Script to sync NASA data
"""
import requests
import json

BASE_URL = "http://localhost:8000"

def sync_nasa_data():
    """Sync NASA data"""
    url = f"{BASE_URL}/api/nasa/sync/"
    print(f"🔄 Syncing NASA data...")
    print(f"📍 URL: {url}")
    
    try:
        response = requests.post(url, json={"type": "apod"}, timeout=30)
        print(f"📊 Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Success! {data}")
        else:
            print(f"❌ Error: {response.text}")
            
    except requests.RequestException as e:
        print(f"❌ Connection error: {e}")

if __name__ == "__main__":
    sync_nasa_data()