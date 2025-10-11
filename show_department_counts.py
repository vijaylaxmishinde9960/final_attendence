#!/usr/bin/env python3

import requests

BASE_URL = "http://localhost:5000"

def show_department_counts():
    # Login
    login_response = requests.post(f"{BASE_URL}/admin/login", json={
        "username": "admin",
        "password": "admin123"
    })
    
    if login_response.status_code != 200:
        print("❌ Login failed")
        return
    
    token = login_response.json()['access_token']
    headers = {"Authorization": f"Bearer {token}"}

    # Get departments
    dept_response = requests.get(f"{BASE_URL}/admin/departments", headers=headers)
    
    if dept_response.status_code == 200:
        departments = dept_response.json()
        
        print("📊 Department Employee Counts:\n")
        
        for dept in departments:
            manager_info = f" (Manager: {dept['manager_name']})" if dept.get('manager_name') else " (No Manager)"
            print(f"   {dept['name']}: {dept['employee_count']} employees{manager_info}")
            
        print(f"\nTotal Departments: {len(departments)}")
        total_employees = sum(dept['employee_count'] for dept in departments)
        print(f"Total Employees: {total_employees}")
        
    else:
        print(f"❌ Failed to get departments: {dept_response.status_code}")

if __name__ == "__main__":
    show_department_counts()