#!/usr/bin/env python3

import requests

BASE_URL = "http://localhost:5000"

def check_employee_departments():
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

    # Get employees
    emp_response = requests.get(f"{BASE_URL}/admin/employees", headers=headers)
    
    if emp_response.status_code == 200:
        employees = emp_response.json()
        
        print(f"📊 Current employees ({len(employees)} total):\n")
        
        with_dept = []
        without_dept = []
        
        for emp in employees:
            dept_name = emp.get('department_name')
            if dept_name:
                with_dept.append(emp)
            else:
                without_dept.append(emp)
        
        if with_dept:
            print(f"✅ Employees with departments ({len(with_dept)}):")
            for emp in with_dept:
                print(f"   - {emp['name']} ({emp['employee_id']}) → {emp['department_name']}")
        
        if without_dept:
            print(f"\n⚠️  Employees without departments ({len(without_dept)}):")
            for emp in without_dept:
                print(f"   - {emp['name']} ({emp['employee_id']}) → No Department")
        
        if not without_dept:
            print("\n🎉 All employees have been assigned to departments!")
        
    else:
        print(f"❌ Failed to get employees: {emp_response.status_code}")

if __name__ == "__main__":
    check_employee_departments()