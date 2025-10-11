#!/usr/bin/env python3

import requests
import json

BASE_URL = "http://localhost:5000"

def test_departments():
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

    # Step 2: Fetch existing departments
    print("\nStep 2: Fetching departments...")
    get_response = requests.get(f"{BASE_URL}/admin/departments", headers=headers)
    
    if get_response.status_code == 200:
        departments = get_response.json()
        print(f"✅ Found {len(departments)} existing departments")
        for dept in departments:
            print(f"   - {dept['name']}: {dept.get('description', 'No description')}")
    else:
        print(f"❌ Failed to fetch departments: {get_response.status_code} - {get_response.text}")
        return

    # Step 3: Add a new department
    print("\nStep 3: Adding new department...")
    new_dept = {
        "name": "Information Technology", 
        "description": "Handles all IT operations and software development"
    }
    
    post_response = requests.post(f"{BASE_URL}/admin/departments", 
                                 json=new_dept, headers=headers)
    
    if post_response.status_code == 201:
        created_dept = post_response.json()
        dept_id = created_dept['id']
        print(f"✅ Department created successfully with ID: {dept_id}")
        print(f"   Name: {created_dept['name']}")
        print(f"   Description: {created_dept['description']}")
    else:
        print(f"❌ Failed to create department: {post_response.status_code} - {post_response.text}")
        return

    # Step 4: Update the department
    print("\nStep 4: Updating department...")
    updated_dept = {
        "name": "IT & Technology", 
        "description": "Information Technology and Digital Innovation Department"
    }
    
    put_response = requests.put(f"{BASE_URL}/admin/departments/{dept_id}", 
                               json=updated_dept, headers=headers)
    
    if put_response.status_code == 200:
        updated = put_response.json()
        print(f"✅ Department updated successfully:")
        print(f"   Name: {updated['name']}")
        print(f"   Description: {updated['description']}")
    else:
        print(f"❌ Failed to update department: {put_response.status_code} - {put_response.text}")
        return

    # Step 5: Fetch departments again to verify update
    print("\nStep 5: Verifying update...")
    get_response = requests.get(f"{BASE_URL}/admin/departments", headers=headers)
    
    if get_response.status_code == 200:
        departments = get_response.json()
        found_dept = next((d for d in departments if d['id'] == dept_id), None)
        if found_dept and found_dept['name'] == "IT & Technology":
            print("✅ Department update verified")
        else:
            print("❌ Department update verification failed")
    else:
        print(f"❌ Failed to verify update: {get_response.status_code} - {get_response.text}")

    # Step 6: Delete the department
    print("\nStep 6: Deleting department...")
    delete_response = requests.delete(f"{BASE_URL}/admin/departments/{dept_id}", 
                                     headers=headers)
    
    if delete_response.status_code == 200:
        print("✅ Department deleted successfully")
        print(f"   Message: {delete_response.json()['message']}")
    else:
        print(f"❌ Failed to delete department: {delete_response.status_code} - {delete_response.text}")

    # Step 7: Verify deletion
    print("\nStep 7: Verifying deletion...")
    get_response = requests.get(f"{BASE_URL}/admin/departments", headers=headers)
    
    if get_response.status_code == 200:
        departments = get_response.json()
        found_dept = next((d for d in departments if d['id'] == dept_id), None)
        if not found_dept:
            print("✅ Department deletion verified")
        else:
            print("❌ Department deletion verification failed")
    else:
        print(f"❌ Failed to verify deletion: {get_response.status_code} - {get_response.text}")

    print("\n🎉 Department CRUD operations test completed!")

if __name__ == "__main__":
    test_departments()