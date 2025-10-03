#!/usr/bin/env python3
"""
Simple script to test NASA API endpoints
"""
import requests
import json

BASE_URL = "http://localhost:8000"

def test_endpoint(endpoint, description):
    """Test a single API endpoint"""
    url = f"{BASE_URL}{endpoint}"
    print(f"\n🧪 Testing: {description}")
    print(f"📍 URL: {url}")
    
    try:
        response = requests.get(url, timeout=10)
        print(f"📊 Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Success! Response keys: {list(data.keys()) if isinstance(data, dict) else 'List data'}")
            if isinstance(data, dict) and 'results' in data:
                print(f"📦 Results count: {len(data.get('results', []))}")
            elif isinstance(data, list):
                print(f"📦 Items count: {len(data)}")
        else:
            print(f"❌ Error: {response.text}")
            
    except requests.RequestException as e:
        print(f"❌ Connection error: {e}")

def main():
    """Test main API endpoints"""
    print("🚀 Testing ASTROWORLD NASA API Endpoints")
    print("=" * 50)
    
    # Test basic endpoints
    endpoints = [
        ("/api/nasa/status/", "API Status"),
        ("/api/nasa/apod/", "APOD List"),
        ("/api/nasa/apod/latest/", "Latest APOD"),
        ("/api/nasa/neo/", "Near Earth Objects"),
        ("/api/nasa/mars-photos/", "Mars Photos"),
        ("/api/nasa/epic/", "EPIC Images"),
        ("/api/nasa/exoplanets/", "Exoplanets"),
        ("/api/nasa/space-weather/", "Space Weather"),
        ("/api/nasa/natural-events/", "Natural Events"),
    ]
    
    for endpoint, description in endpoints:
        test_endpoint(endpoint, description)
    
    print(f"\n🎯 Test completed!")

if __name__ == "__main__":
    main()