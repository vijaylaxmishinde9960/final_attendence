#!/usr/bin/env python3

import pymysql
import sys

# Database configuration
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': '1109',
    'database': 'attendance_system',
    'charset': 'utf8mb4'
}

def update_mysql_schema():
    """Update MySQL database schema to add manager_id column to departments table"""
    
    try:
        # Connect to MySQL
        print("🔄 Connecting to MySQL database...")
        connection = pymysql.connect(**DB_CONFIG)
        cursor = connection.cursor()
        print("✅ Connected to MySQL successfully")

        # Check if departments table exists
        cursor.execute("SHOW TABLES LIKE 'departments'")
        if not cursor.fetchone():
            print("❌ Departments table does not exist!")
            return False

        # Check current structure of departments table
        print("\n📋 Current departments table structure:")
        cursor.execute("DESCRIBE departments")
        columns = cursor.fetchall()
        column_names = [col[0] for col in columns]
        
        for col in columns:
            print(f"   - {col[0]}: {col[1]} {'NOT NULL' if col[2] == 'NO' else 'NULL'} {'KEY' if col[3] else ''}")

        # Check if manager_id column exists
        if 'manager_id' in column_names:
            print("\n✅ manager_id column already exists!")
        else:
            print("\n🔧 Adding manager_id column...")
            cursor.execute("""
                ALTER TABLE departments 
                ADD COLUMN manager_id INT NULL,
                ADD CONSTRAINT fk_dept_manager 
                FOREIGN KEY (manager_id) REFERENCES employees(id)
            """)
            connection.commit()
            print("✅ manager_id column added successfully!")

        # Check current data in departments table
        print("\n📊 Current departments in database:")
        cursor.execute("SELECT id, name, description, manager_id, is_active FROM departments")
        departments = cursor.fetchall()
        
        if departments:
            print(f"Found {len(departments)} departments:")
            for dept in departments:
                status = "Active" if dept[4] else "Inactive"
                manager_info = f"Manager ID: {dept[3]}" if dept[3] else "No Manager"
                print(f"   {dept[0]}. {dept[1]} - {status} - {manager_info}")
        else:
            print("   No departments found in database!")

        # Check employees table
        print("\n👥 Employees available for manager assignment:")
        cursor.execute("SELECT id, name, employee_id, position FROM employees WHERE is_active = 1 LIMIT 5")
        employees = cursor.fetchall()
        
        if employees:
            for emp in employees:
                print(f"   {emp[0]}. {emp[1]} ({emp[2]}) - {emp[3] or 'No position'}")
        else:
            print("   No active employees found!")

        return True
        
    except pymysql.Error as e:
        print(f"❌ MySQL Error: {e}")
        return False
    
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False
    
    finally:
        if 'connection' in locals():
            connection.close()
            print("\n🔒 Database connection closed")

def test_connection():
    """Test if we can connect to MySQL database"""
    try:
        connection = pymysql.connect(**DB_CONFIG)
        cursor = connection.cursor()
        cursor.execute("SELECT VERSION()")
        version = cursor.fetchone()
        print(f"✅ MySQL connection successful. Version: {version[0]}")
        connection.close()
        return True
    except Exception as e:
        print(f"❌ Cannot connect to MySQL: {e}")
        print("\nPlease check:")
        print("1. MySQL server is running")
        print("2. Database 'attendance_system' exists")
        print("3. Username/password are correct")
        print("4. pymysql is installed (pip install pymysql)")
        return False

if __name__ == "__main__":
    print("🔄 MySQL Schema Update Script")
    print("=" * 40)
    
    # First test connection
    if not test_connection():
        sys.exit(1)
    
    # Update schema
    if update_mysql_schema():
        print("\n🎉 Schema update completed successfully!")
    else:
        print("\n❌ Schema update failed!")
        sys.exit(1)