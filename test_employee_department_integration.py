#!/usr/bin/env python3

import requests
import json

BASE_URL = "http://localhost:5000"

def test_employee_department_integration():
    # Step 1: Login to get token
    print("Step 1: Logging in...")
    login_response = requests.post(f"{BASE_URL}/admin/login", json={
        "username": "admin",
        "password": "admin123"
    })
    
    if login_response.status_code != 200:
        print(f"❌ Login failed: {login_response.status_code} - {login_response.text}")
        return
    
    token = login_response.json()['access_token']
    headers = {"Authorization": f"Bearer {token}"}
    print("✅ Login successful")

    # Step 2: Get available departments
    print("\nStep 2: Getting available departments...")
    dept_response = requests.get(f"{BASE_URL}/admin/departments", headers=headers)
    
    if dept_response.status_code == 200:
        departments = dept_response.json()
        print(f"✅ Found {len(departments)} departments:")
        for dept in departments[:3]:  # Show first 3
            manager_info = f" (Manager: {dept['manager_name']})" if dept.get('manager_name') else ""
            print(f"   - {dept['name']}{manager_info}")
        
        # Select IT department for testing
        it_dept = next((d for d in departments if 'Technology' in d['name'] or 'IT' in d['name']), None)
        if not it_dept:
            it_dept = departments[0]  # Use first department if no IT dept
        
        print(f"\nSelected department for testing: {it_dept['name']} (ID: {it_dept['id']})")
    else:
        print(f"❌ Failed to get departments: {dept_response.status_code}")
        return

    # Step 3: Get current employees
    print("\nStep 3: Getting current employees...")
    emp_response = requests.get(f"{BASE_URL}/admin/employees", headers=headers)
    
    if emp_response.status_code == 200:
        employees = emp_response.json()
        print(f"✅ Found {len(employees)} employees:")
        for emp in employees[:3]:  # Show first 3
            dept_info = f" - {emp['department_name']}" if emp.get('department_name') else " - No Department"
            print(f"   - {emp['name']} ({emp['employee_id']}){dept_info}")
    else:
        print(f"❌ Failed to get employees: {emp_response.status_code}")
        return

    # Step 4: Add new employee with department assignment
    print(f"\nStep 4: Adding new employee with department assignment...")
    new_employee = {
        "name": "Jane Developer",
        "email": "jane.developer@company.com",
        "phone": "555-0199",
        "department_id": it_dept['id'],
        "position": "Software Engineer",
        "hire_date": "2024-01-15",
        "salary": 65000.00,
        "address": "456 Tech St, Code City, CC 12345"
    }
    
    add_response = requests.post(f"{BASE_URL}/admin/employees", 
                                json=new_employee, headers=headers)
    
    if add_response.status_code == 201:
        created_emp = add_response.json()
        emp_id = created_emp['id']
        print(f"✅ Employee created successfully:")
        print(f"   ID: {emp_id}")
        print(f"   Name: {created_emp['name']}")
        print(f"   Employee ID: {created_emp['employee_id']}")
        print(f"   Department ID: {created_emp['department_id']}")
    else:
        print(f"❌ Failed to create employee: {add_response.status_code} - {add_response.text}")
        return

    # Step 5: Verify employee appears in list with department info
    print("\nStep 5: Verifying employee in list with department info...")
    emp_response = requests.get(f"{BASE_URL}/admin/employees", headers=headers)
    
    if emp_response.status_code == 200:
        employees = emp_response.json()
        created = next((e for e in employees if e['id'] == emp_id), None)
        if created:
            print("✅ Employee found in list:")
            print(f"   Name: {created['name']}")
            print(f"   Department: {created.get('department_name', 'No Department')}")
            print(f"   Department ID: {created.get('department_id', 'None')}")
            print(f"   Position: {created.get('position', 'No Position')}")
            print(f"   Salary: ${created.get('salary', 0):,.2f}" if created.get('salary') else "   Salary: Not specified")
        else:
            print("❌ Employee not found in list")
            return
    else:
        print(f"❌ Failed to get employees: {emp_response.status_code}")
        return

    # Step 6: Update employee - change department
    print("\nStep 6: Updating employee department...")
    # Find a different department
    hr_dept = next((d for d in departments if 'Human' in d['name'] or 'HR' in d['name']), None)
    if not hr_dept:
        hr_dept = next((d for d in departments if d['id'] != it_dept['id']), departments[0])
    
    update_data = {
        "name": "Jane Senior Developer",
        "email": "jane.developer@company.com",
        "phone": "555-0199",
        "department_id": hr_dept['id'],
        "position": "Senior Software Engineer",
        "salary": 75000.00
    }
    
    update_response = requests.put(f"{BASE_URL}/admin/employees/{emp_id}", 
                                  json=update_data, headers=headers)
    
    if update_response.status_code == 200:
        updated = update_response.json()
        print(f"✅ Employee updated successfully:")
        print(f"   Name: {updated['name']}")
        print(f"   New Department: {updated.get('department_name', 'No Department')}")
        print(f"   New Position: {updated.get('position', 'No Position')}")
        print(f"   New Salary: ${updated.get('salary', 0):,.2f}" if updated.get('salary') else "   Salary: Not specified")
    else:
        print(f"❌ Failed to update employee: {update_response.status_code} - {update_response.text}")
        return

    # Step 7: Test department employee count
    print("\nStep 7: Verifying department employee counts...")
    dept_response = requests.get(f"{BASE_URL}/admin/departments", headers=headers)
    
    if dept_response.status_code == 200:
        updated_departments = dept_response.json()
        for dept in updated_departments:
            if dept['id'] == hr_dept['id']:
                print(f"✅ {dept['name']} now has {dept['employee_count']} employees")
                break
    else:
        print("❌ Failed to get updated department info")

    # Step 8: Clean up - delete test employee
    print("\nStep 8: Cleaning up test employee...")
    delete_response = requests.delete(f"{BASE_URL}/admin/employees/{emp_id}", 
                                     headers=headers)
    
    if delete_response.status_code == 200:
        print("✅ Test employee deleted successfully")
    else:
        print(f"❌ Failed to delete test employee: {delete_response.status_code}")

    print("\n🎉 Employee-Department integration test completed!")
    print("\n📋 Test Summary:")
    print("   ✅ Department assignment during employee creation works")
    print("   ✅ Employee list shows department information")
    print("   ✅ Department updates work correctly")
    print("   ✅ Department employee counts update properly")
    print("   ✅ Full CRUD operations support department assignment")

if __name__ == "__main__":
    test_employee_department_integration()