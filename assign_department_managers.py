#!/usr/bin/env python3

import requests
import json

BASE_URL = "http://localhost:5000"

def assign_managers():
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

    # Get employees and departments
    emp_response = requests.get(f"{BASE_URL}/admin/employees/for-manager", headers=headers)
    dept_response = requests.get(f"{BASE_URL}/admin/departments", headers=headers)
    
    if emp_response.status_code != 200 or dept_response.status_code != 200:
        print("❌ Failed to get employees or departments")
        return
    
    employees = emp_response.json()
    departments = dept_response.json()
    
    print(f"Found {len(employees)} employees and {len(departments)} departments")

    # Manager assignments based on positions
    manager_assignments = []
    
    # Find employees by position/name for logical assignments
    for dept in departments:
        if dept['name'] == 'Information Technology':
            # Assign Robert Wilson (IT Director) to IT department
            it_manager = next((e for e in employees if e.get('position') and 'IT Director' in e['position']), None)
            if it_manager:
                manager_assignments.append((dept['id'], dept['name'], it_manager['id'], it_manager['name']))
        
        elif dept['name'] == 'Human Resources':
            # Assign Emily Davis (HR Specialist) to HR department
            hr_manager = next((e for e in employees if e.get('position') and 'HR' in e['position']), None)
            if hr_manager:
                manager_assignments.append((dept['id'], dept['name'], hr_manager['id'], hr_manager['name']))
        
        elif dept['name'] == 'Marketing':
            # Assign Sarah Johnson (Team Lead) to Marketing
            marketing_manager = next((e for e in employees if e.get('position') and 'Team Lead' in e['position']), None)
            if marketing_manager:
                manager_assignments.append((dept['id'], dept['name'], marketing_manager['id'], marketing_manager['name']))
        
        elif dept['name'] == 'Operations':
            # Assign Michael Brown (Project Manager) to Operations
            ops_manager = next((e for e in employees if e.get('position') and 'Project Manager' in e['position']), None)
            if ops_manager:
                manager_assignments.append((dept['id'], dept['name'], ops_manager['id'], ops_manager['name']))
    
    # Assign remaining department to a manager
    remaining_depts = [d for d in departments if d['name'] in ['Finance & Accounting', 'Sales']]
    senior_manager = next((e for e in employees if e.get('position') and 'Manager' in e['position']), None)
    
    if senior_manager and remaining_depts:
        # Assign to Finance & Accounting
        finance_dept = next((d for d in remaining_depts if 'Finance' in d['name']), None)
        if finance_dept:
            manager_assignments.append((finance_dept['id'], finance_dept['name'], senior_manager['id'], senior_manager['name']))

    print(f"\nAssigning {len(manager_assignments)} managers to departments:")
    
    # Execute assignments
    for dept_id, dept_name, manager_id, manager_name in manager_assignments:
        update_data = {
            "name": dept_name,
            "manager_id": manager_id,
            "is_active": True
        }
        
        response = requests.put(f"{BASE_URL}/admin/departments/{dept_id}", 
                               json=update_data, headers=headers)
        
        if response.status_code == 200:
            print(f"✅ Assigned {manager_name} as manager of {dept_name}")
        else:
            print(f"❌ Failed to assign manager to {dept_name}: {response.status_code}")

    # Show final department list with managers
    print("\nFinal department list with managers:")
    final_response = requests.get(f"{BASE_URL}/admin/departments", headers=headers)
    
    if final_response.status_code == 200:
        final_departments = final_response.json()
        for i, dept in enumerate(final_departments, 1):
            manager_info = f" - Manager: {dept['manager_name']}" if dept.get('manager_name') else " - No Manager"
            print(f"  {i}. {dept['name']}{manager_info}")

    print(f"\n🎉 Manager assignments completed!")

if __name__ == "__main__":
    assign_managers()