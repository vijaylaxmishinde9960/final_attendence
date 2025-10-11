#!/usr/bin/env python3

import requests
import json

BASE_URL = "http://localhost:5000"

def add_sample_employees():
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

    # Get departments first
    dept_response = requests.get(f"{BASE_URL}/admin/departments", headers=headers)
    if dept_response.status_code != 200:
        print("❌ Failed to get departments")
        return
    
    departments = dept_response.json()
    general_dept_id = next((d['id'] for d in departments if d['name'] == 'General'), None)
    
    if not general_dept_id:
        print("❌ General department not found")
        return

    # Sample employees to add
    sample_employees = [
        {
            "employee_id": "EMP001",
            "name": "John Smith",
            "email": "john.smith@company.com", 
            "phone": "555-0101",
            "position": "Senior Manager",
            "department_id": general_dept_id,
            "hire_date": "2020-01-15",
            "salary": 75000,
            "address": "123 Main St, City, State 12345"
        },
        {
            "employee_id": "EMP002", 
            "name": "Sarah Johnson",
            "email": "sarah.johnson@company.com",
            "phone": "555-0102", 
            "position": "Team Lead",
            "department_id": general_dept_id,
            "hire_date": "2021-03-10",
            "salary": 65000,
            "address": "456 Oak Ave, City, State 12345"
        },
        {
            "employee_id": "EMP003",
            "name": "Michael Brown", 
            "email": "michael.brown@company.com",
            "phone": "555-0103",
            "position": "Project Manager",
            "department_id": general_dept_id, 
            "hire_date": "2019-06-01",
            "salary": 70000,
            "address": "789 Pine St, City, State 12345"
        },
        {
            "employee_id": "EMP004",
            "name": "Emily Davis",
            "email": "emily.davis@company.com",
            "phone": "555-0104",
            "position": "HR Specialist",
            "department_id": general_dept_id,
            "hire_date": "2022-09-15", 
            "salary": 55000,
            "address": "321 Elm St, City, State 12345"
        },
        {
            "employee_id": "EMP005",
            "name": "Robert Wilson",
            "email": "robert.wilson@company.com", 
            "phone": "555-0105",
            "position": "IT Director",
            "department_id": general_dept_id,
            "hire_date": "2018-11-20",
            "salary": 85000,
            "address": "654 Maple Dr, City, State 12345"
        }
    ]

    print(f"\nAdding {len(sample_employees)} sample employees...")
    
    for emp in sample_employees:
        response = requests.post(f"{BASE_URL}/admin/employees", 
                               json=emp, headers=headers)
        
        if response.status_code == 201:
            created = response.json()
            print(f"✅ Added: {created['name']} ({created['employee_id']})")
        elif response.status_code == 400 and "already exists" in response.text:
            print(f"ℹ️  Skipped: {emp['name']} (already exists)")
        else:
            print(f"❌ Failed to add {emp['name']}: {response.status_code}")
            print(f"   Response: {response.text}")

    print(f"\n🎉 Sample employees added successfully!")

if __name__ == "__main__":
    add_sample_employees()