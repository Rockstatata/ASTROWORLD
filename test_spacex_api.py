#!/usr/bin/env python3
"""Test script for SpaceX API endpoints"""

import requests
import json

def test_spacex_api():
    base_url = "http://127.0.0.1:8000/api/spacex"
    
    endpoints = [
        "/launches/?page_size=3",
        "/rockets/",
        "/history/",
        "/launches/upcoming/",
        "/stats/"
    ]
    
    for endpoint in endpoints:
        try:
            url = base_url + endpoint
            print(f"\n🚀 Testing: {url}")
            response = requests.get(url, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if 'results' in data:
                    print(f"✅ Success: Found {len(data['results'])} items")
                    if data['results']:
                        print(f"   Sample: {data['results'][0].get('mission_name', data['results'][0].get('name', 'Unknown'))}")
                elif isinstance(data, list):
                    print(f"✅ Success: Found {len(data)} items")
                    if data:
                        print(f"   Sample: {data[0].get('mission_name', data[0].get('name', 'Unknown'))}")
                else:
                    print(f"✅ Success: {data}")
            else:
                print(f"❌ Error: {response.status_code}")
                print(f"   Response: {response.text[:200]}")
        except Exception as e:
            print(f"❌ Exception: {e}")

if __name__ == "__main__":
    test_spacex_api()