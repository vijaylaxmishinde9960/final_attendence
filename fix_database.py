#!/usr/bin/env python3
"""
Fix database schema for Attendance Management System
This script drops and recreates the database with the correct schema.
"""

import pymysql
from werkzeug.security import generate_password_hash

# Database configuration
DB_CONFIG = {
    'host': '127.0.0.1',
    'port': 3306,
    'user': 'root',
    'charset': 'utf8mb4'
}

DATABASE_NAME = 'attendance_system'

def fix_database():
    """Drop and recreate the database with correct schema"""
    try:
        connection = pymysql.connect(**DB_CONFIG)
        cursor = connection.cursor()
        
        # Drop database if exists
        cursor.execute(f"DROP DATABASE IF EXISTS {DATABASE_NAME}")
        print(f"[OK] Dropped database '{DATABASE_NAME}'")
        
        # Create database
        cursor.execute(f"CREATE DATABASE {DATABASE_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
        print(f"[OK] Created database '{DATABASE_NAME}'")
        
        # Use the database
        cursor.execute(f"USE {DATABASE_NAME}")
        
        # Create tables with correct schema
        create_tables(cursor)
        
        # Insert default admin
        insert_default_admin(cursor)
        
        connection.commit()
        print("[OK] Database fixed successfully!")
        
    except Exception as e:
        print(f"[ERROR] Error fixing database: {e}")
    finally:
        if 'connection' in locals():
            connection.close()

def create_tables(cursor):
    """Create all required tables with correct schema"""
    
    # Admin table
    cursor.execute("""
        CREATE TABLE admin (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(80) UNIQUE NOT NULL,
            password_hash VARCHAR(120) NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)
    print("[OK] Admin table created")
    
    # Employee table
    cursor.execute("""
        CREATE TABLE employee (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(120) UNIQUE NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)
    print("[OK] Employee table created")
    
    # Attendance table with backticks around date column
    cursor.execute("""
        CREATE TABLE attendance (
            id INT AUTO_INCREMENT PRIMARY KEY,
            employee_id INT NOT NULL,
            `date` DATE NOT NULL,
            status VARCHAR(10) NOT NULL,
            marked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (employee_id) REFERENCES employee(id) ON DELETE CASCADE,
            UNIQUE KEY unique_employee_date (employee_id, `date`)
        )
    """)
    print("[OK] Attendance table created")

def insert_default_admin(cursor):
    """Insert default admin user"""
    try:
        # Create default admin
        password_hash = generate_password_hash('admin123')
        cursor.execute("""
            INSERT INTO admin (username, password_hash) 
            VALUES (%s, %s)
        """, ('admin', password_hash))
        
        print("[OK] Default admin created - Username: admin, Password: admin123")
        
    except Exception as e:
        print(f"[ERROR] Error creating default admin: {e}")

if __name__ == "__main__":
    print("Attendance Management System - Database Fix")
    print("=" * 50)
    print("This will drop and recreate the database with the correct schema.")
    
    confirm = input("Are you sure you want to continue? (y/N): ")
    if confirm.lower() == 'y':
        fix_database()
        print("\n" + "=" * 50)
        print("Database fix complete! You can now run the Flask application.")
    else:
        print("Operation cancelled.")

