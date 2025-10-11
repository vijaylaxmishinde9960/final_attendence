#!/usr/bin/env python3

import requests
import json

BASE_URL = "http://localhost:5000"

def add_sample_departments():
    # Login to get token
    login_response = requests.post(f"{BASE_URL}/admin/login", json={
        "username": "admin",
        "password": "admin123"
    })
    
    if login_response.status_code != 200:
        print(f"❌ Login failed: {login_response.status_code}")
        return
    
    token = login_response.json()['access_token']
    headers = {"Authorization": f"Bearer {token}"}
    print("✅ Login successful")

    # Sample departments to add
    sample_departments = [
        {
            "name": "Human Resources",
            "description": "Manages employee relations, recruitment, and HR policies"
        },
        {
            "name": "Information Technology", 
            "description": "Handles all IT operations, software development, and technical support"
        },
        {
            "name": "Marketing",
            "description": "Responsible for marketing strategies, campaigns, and brand management"
        },
        {
            "name": "Finance & Accounting",
            "description": "Manages financial operations, accounting, and budget planning"
        },
        {
            "name": "Sales",
            "description": "Handles customer acquisition, sales operations, and revenue generation"
        },
        {
            "name": "Operations",
            "description": "Manages daily operations, logistics, and process optimization"
        }
    ]

    print(f"\nAdding {len(sample_departments)} sample departments...")
    
    for dept in sample_departments:
        response = requests.post(f"{BASE_URL}/admin/departments", 
                               json=dept, headers=headers)
        
        if response.status_code == 201:
            created = response.json()
            print(f"✅ Added: {created['name']}")
        elif response.status_code == 400 and "already exists" in response.text:
            print(f"ℹ️  Skipped: {dept['name']} (already exists)")
        else:
            print(f"❌ Failed to add {dept['name']}: {response.status_code}")

    # Show final department list
    print("\nFinal department list:")
    get_response = requests.get(f"{BASE_URL}/admin/departments", headers=headers)
    
    if get_response.status_code == 200:
        departments = get_response.json()
        print(f"Total departments: {len(departments)}")
        for i, dept in enumerate(departments, 1):
            print(f"  {i}. {dept['name']}")
            if dept.get('description'):
                print(f"     {dept['description']}")
    else:
        print(f"❌ Failed to fetch departments: {get_response.status_code}")

if __name__ == "__main__":
    add_sample_departments()