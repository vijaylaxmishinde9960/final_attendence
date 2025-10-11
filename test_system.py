#!/usr/bin/env python3
"""
Test script for Attendance Management System
This script tests the basic functionality of the system.
"""

import requests
import json
import sys

BASE_URL = "http://localhost:5000"

def test_login():
    """Test admin login"""
    print("Testing admin login...")
    
    login_data = {
        "username": "admin",
        "password": "admin123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/admin/login", json=login_data)
        if response.status_code == 200:
            data = response.json()
            print("[OK] Login successful")
            return data.get('access_token')
        else:
            print(f"[ERROR] Login failed: {response.text}")
            return None
    except requests.exceptions.ConnectionError:
        print("[ERROR] Cannot connect to server. Make sure Flask app is running.")
        return None

def test_employees(token):
    """Test employee management"""
    print("\nTesting employee management...")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Test adding an employee
    import time
    employee_data = {
        "name": "John Doe",
        "email": f"john.doe.{int(time.time())}@example.com"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/admin/employees", 
                               json=employee_data, headers=headers)
        if response.status_code == 201:
            print("[OK] Employee added successfully")
            employee = response.json()
            employee_id = employee['id']
        else:
            print(f"[ERROR] Failed to add employee: {response.text}")
            return None
    except Exception as e:
        print(f"[ERROR] Error adding employee: {e}")
        return None
    
    # Test getting employees
    try:
        response = requests.get(f"{BASE_URL}/admin/employees", headers=headers)
        if response.status_code == 200:
            employees = response.json()
            print(f"[OK] Retrieved {len(employees)} employees")
        else:
            print(f"[ERROR] Failed to get employees: {response.text}")
    except Exception as e:
        print(f"[ERROR] Error getting employees: {e}")
    
    return employee_id

def test_attendance(token, employee_id):
    """Test attendance marking"""
    print("\nTesting attendance marking...")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Test marking attendance
    attendance_data = {
        "attendance_data": [
            {
                "employee_id": employee_id,
                "status": "present"
            }
        ],
        "date": "2024-01-01"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/admin/attendance/bulk", 
                               json=attendance_data, headers=headers)
        if response.status_code == 200:
            print("[OK] Attendance marked successfully")
        else:
            print(f"[ERROR] Failed to mark attendance: {response.text}")
    except Exception as e:
        print(f"[ERROR] Error marking attendance: {e}")

def test_report(token):
    """Test report generation"""
    print("\nTesting report generation...")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        response = requests.get(f"{BASE_URL}/admin/attendance/report?date=2024-01-01", 
                              headers=headers)
        if response.status_code == 200:
            report = response.json()
            print(f"[OK] Report generated successfully")
            print(f"  Total employees: {report['total_employees']}")
            print(f"  Present: {report['present_count']}")
            print(f"  Absent: {report['absent_count']}")
            print(f"  Not marked: {report['not_marked_count']}")
        else:
            print(f"[ERROR] Failed to generate report: {response.text}")
    except Exception as e:
        print(f"[ERROR] Error generating report: {e}")

def main():
    """Run all tests"""
    print("Attendance Management System - Test Suite")
    print("=" * 50)
    
    # Test login
    token = test_login()
    if not token:
        print("\n[ERROR] Login test failed. Cannot proceed with other tests.")
        sys.exit(1)
    
    # Test employee management
    employee_id = test_employees(token)
    if not employee_id:
        print("\n[ERROR] Employee management test failed.")
        sys.exit(1)
    
    # Test attendance marking
    test_attendance(token, employee_id)
    
    # Test report generation
    test_report(token)
    
    print("\n" + "=" * 50)
    print("[SUCCESS] All tests completed!")
    print("\nYou can now access the web interface at:")
    print(f"Web Interface: {BASE_URL}")
    print("\nDefault admin credentials:")
    print("Username: admin")
    print("Password: admin123")

if __name__ == "__main__":
    main()
