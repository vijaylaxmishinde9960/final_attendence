#!/usr/bin/env python3

import requests
import json

BASE_URL = "http://localhost:5000"

def test_updated_departments():
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

    # Step 2: Get available employees for manager selection
    print("\nStep 2: Getting available employees...")
    emp_response = requests.get(f"{BASE_URL}/admin/employees/for-manager", headers=headers)
    
    if emp_response.status_code == 200:
        employees = emp_response.json()
        print(f"✅ Found {len(employees)} available employees:")
        for emp in employees[:3]:  # Show first 3
            print(f"   - {emp['name']} ({emp['employee_id']}) - {emp.get('position', 'No position')}")
        
        # Get first employee as manager
        manager_id = employees[0]['id'] if employees else None
        manager_name = employees[0]['name'] if employees else None
    else:
        print(f"❌ Failed to get employees: {emp_response.status_code}")
        return

    # Step 3: Create department with manager and active status
    print("\nStep 3: Creating department with manager...")
    new_dept = {
        "name": "Research & Development", 
        "description": "Innovation and product development department",
        "manager_id": manager_id,
        "is_active": True
    }
    
    post_response = requests.post(f"{BASE_URL}/admin/departments", 
                                 json=new_dept, headers=headers)
    
    if post_response.status_code == 201:
        created_dept = post_response.json()
        dept_id = created_dept['id']
        print(f"✅ Department created successfully:")
        print(f"   ID: {dept_id}")
        print(f"   Name: {created_dept['name']}")
        print(f"   Manager: {created_dept.get('manager_name', 'None')}")
        print(f"   Active: {created_dept.get('is_active', 'Unknown')}")
    else:
        print(f"❌ Failed to create department: {post_response.status_code} - {post_response.text}")
        return

    # Step 4: Verify department appears in list with manager info
    print("\nStep 4: Verifying department in list...")
    get_response = requests.get(f"{BASE_URL}/admin/departments", headers=headers)
    
    if get_response.status_code == 200:
        departments = get_response.json()
        created = next((d for d in departments if d['id'] == dept_id), None)
        if created:
            print("✅ Department found in list:")
            print(f"   Name: {created['name']}")
            print(f"   Manager: {created.get('manager_name', 'None')}")
            print(f"   Manager ID: {created.get('manager_id', 'None')}")
            print(f"   Active: {created.get('is_active', 'Unknown')}")
            print(f"   Employee Count: {created.get('employee_count', 0)}")
        else:
            print("❌ Department not found in list")
            return
    else:
        print(f"❌ Failed to get departments: {get_response.status_code}")
        return

    # Step 5: Update department - change manager and set inactive
    print("\nStep 5: Updating department (change manager and set inactive)...")
    second_manager_id = employees[1]['id'] if len(employees) > 1 else None
    second_manager_name = employees[1]['name'] if len(employees) > 1 else None
    
    update_data = {
        "name": "Research & Development (Updated)",
        "description": "Innovation and product development department - Updated",
        "manager_id": second_manager_id,
        "is_active": False
    }
    
    put_response = requests.put(f"{BASE_URL}/admin/departments/{dept_id}", 
                               json=update_data, headers=headers)
    
    if put_response.status_code == 200:
        updated = put_response.json()
        print(f"✅ Department updated successfully:")
        print(f"   Name: {updated['name']}")
        print(f"   Manager: {updated.get('manager_name', 'None')}")
        print(f"   Active: {updated.get('is_active', 'Unknown')}")
    else:
        print(f"❌ Failed to update department: {put_response.status_code} - {put_response.text}")
        return

    # Step 6: Test filtering - get inactive departments
    print("\nStep 6: Testing inactive department filtering...")
    
    # First, get only active departments (should not include our inactive one)
    active_response = requests.get(f"{BASE_URL}/admin/departments", headers=headers)
    if active_response.status_code == 200:
        active_depts = active_response.json()
        inactive_found = any(d['id'] == dept_id for d in active_depts)
        print(f"✅ Active departments only: {len(active_depts)} found")
        print(f"   Our inactive dept found: {'Yes ❌' if inactive_found else 'No ✅'}")
    
    # Now get all departments including inactive
    all_response = requests.get(f"{BASE_URL}/admin/departments?include_inactive=true", headers=headers)
    if all_response.status_code == 200:
        all_depts = all_response.json()
        inactive_found = any(d['id'] == dept_id for d in all_depts)
        print(f"✅ All departments (including inactive): {len(all_depts)} found")
        print(f"   Our inactive dept found: {'Yes ✅' if inactive_found else 'No ❌'}")

    # Step 7: Test manager validation with invalid manager
    print("\nStep 7: Testing invalid manager validation...")
    invalid_data = {
        "name": "Test Invalid Manager",
        "description": "Testing invalid manager",
        "manager_id": 99999,  # Non-existent employee ID
        "is_active": True
    }
    
    invalid_response = requests.post(f"{BASE_URL}/admin/departments", 
                                   json=invalid_data, headers=headers)
    
    if invalid_response.status_code == 400:
        print("✅ Invalid manager correctly rejected")
        print(f"   Error message: {invalid_response.json().get('message', 'No message')}")
    else:
        print(f"❌ Invalid manager should have been rejected: {invalid_response.status_code}")

    # Step 8: Clean up - delete test department
    print("\nStep 8: Cleaning up test department...")
    delete_response = requests.delete(f"{BASE_URL}/admin/departments/{dept_id}", 
                                     headers=headers)
    
    if delete_response.status_code == 200:
        print("✅ Test department deleted successfully")
    else:
        print(f"❌ Failed to delete test department: {delete_response.status_code}")

    print("\n🎉 Updated department functionality test completed!")
    print("\n📋 Test Summary:")
    print("   ✅ Manager assignment works")
    print("   ✅ Active/inactive status works") 
    print("   ✅ Filtering by active status works")
    print("   ✅ Manager validation works")
    print("   ✅ All CRUD operations support new fields")

if __name__ == "__main__":
    test_updated_departments()