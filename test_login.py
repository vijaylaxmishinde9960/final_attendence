#!/usr/bin/env python3
"""
Test script to check if Flask API login endpoint is working
"""

import requests
import json

def test_login():
    """Test the login endpoint"""
    url = "http://localhost:5000/admin/login"
    data = {
        "username": "admin",
        "password": "admin123"
    }
    
    try:
        print("Testing login endpoint...")
        print(f"URL: {url}")
        print(f"Data: {json.dumps(data, indent=2)}")
        
        response = requests.post(url, json=data)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"Success! Response: {json.dumps(result, indent=2)}")
            return True
        else:
            print(f"Error! Response: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("ERROR: Cannot connect to Flask server. Is it running on port 5000?")
        return False
    except Exception as e:
        print(f"ERROR: {e}")
        return False

def test_root():
    """Test the root endpoint"""
    try:
        print("\nTesting root endpoint...")
        response = requests.get("http://localhost:5000/")
        print(f"Root endpoint status: {response.status_code}")
        print(f"Root endpoint content type: {response.headers.get('content-type', 'unknown')}")
        
        if "html" in response.headers.get('content-type', ''):
            print("Root endpoint is serving HTML (old Flask app)")
            return False
        else:
            print("Root endpoint is serving API (new Flask app)")
            return True
            
    except Exception as e:
        print(f"Root endpoint error: {e}")
        return False

if __name__ == "__main__":
    print("=" * 50)
    print("Flask API Test")
    print("=" * 50)
    
    # Test root endpoint first
    root_ok = test_root()
    
    # Test login endpoint
    login_ok = test_login()
    
    print("\n" + "=" * 50)
    print("RESULTS:")
    print(f"Root endpoint working: {'YES' if root_ok else 'NO'}")
    print(f"Login endpoint working: {'YES' if login_ok else 'NO'}")
    
    if not root_ok:
        print("\nISSUE: Root endpoint is serving HTML instead of API")
        print("This means the old Flask app is running, not the new one with API endpoints")
        print("SOLUTION: Kill the Flask process and restart with: python app.py")
    
    if not login_ok:
        print("\nISSUE: Login endpoint is not working")
        if root_ok:
            print("This might be a database or authentication issue")
        else:
            print("This is likely because the wrong Flask app is running")
    
    print("=" * 50)

