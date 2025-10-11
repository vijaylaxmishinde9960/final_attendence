#!/usr/bin/env python3

import requests

BASE_URL = "http://localhost:5000"

def assign_remaining_employees():
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

    # Get employees without departments
    emp_response = requests.get(f"{BASE_URL}/admin/employees", headers=headers)
    employees = emp_response.json()
    unassigned = [emp for emp in employees if not emp.get('department_name')]
    
    if not unassigned:
        print("✅ All employees already have departments!")
        return
    
    # Get departments
    dept_response = requests.get(f"{BASE_URL}/admin/departments", headers=headers)
    departments = dept_response.json()
    
    print(f"🔧 Assigning {len(unassigned)} employees to departments...\n")
    
    # Assignment logic based on names/roles
    for emp in unassigned:
        if emp['employee_id'] == 'EMP001':
            # John Doe - assign to Sales
            sales_dept = next((d for d in departments if 'Sales' in d['name']), departments[0])
            update_data = {
                "name": emp['name'],
                "email": emp['email'],
                "department_id": sales_dept['id'],
                "position": "Sales Representative"
            }
            dept_name = sales_dept['name']
        elif emp['employee_id'] == 'EMP002':
            # Syed Ahmed Ali - already a Manager, assign to Finance
            finance_dept = next((d for d in departments if 'Finance' in d['name']), departments[0])
            update_data = {
                "name": emp['name'],
                "email": emp['email'],
                "department_id": finance_dept['id'],
                "position": emp.get('position', 'Finance Manager')
            }
            dept_name = finance_dept['name']
        else:
            # Default assignment
            general_dept = next((d for d in departments if 'General' in d['name']), departments[0])
            update_data = {
                "name": emp['name'],
                "email": emp['email'],
                "department_id": general_dept['id'],
                "position": emp.get('position', 'Employee')
            }
            dept_name = general_dept['name']
        
        # Update employee
        response = requests.put(f"{BASE_URL}/admin/employees/{emp['id']}", 
                              json=update_data, headers=headers)
        
        if response.status_code == 200:
            print(f"✅ {emp['name']} → {dept_name}")
        else:
            print(f"❌ Failed to assign {emp['name']}: {response.status_code}")

    print(f"\n📊 Final employee assignments:")
    # Show final state
    final_response = requests.get(f"{BASE_URL}/admin/employees", headers=headers)
    final_employees = final_response.json()
    
    for emp in final_employees:
        dept_name = emp.get('department_name', 'No Department')
        position = emp.get('position', 'No Position')
        print(f"   - {emp['name']} ({emp['employee_id']}) → {dept_name} - {position}")

if __name__ == "__main__":
    assign_remaining_employees()