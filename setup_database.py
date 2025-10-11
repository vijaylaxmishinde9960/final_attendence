#!/usr/bin/env python3
"""
Database setup script for Attendance Management System
This script creates the MySQL database and tables required for the system.
"""

import pymysql
from werkzeug.security import generate_password_hash

# Database configuration
DB_CONFIG = {
    'host': 'localhost',
    'port': 3306,
    'user': 'root',
    'password': 'viju@21',
    'charset': 'utf8mb4'
}

DATABASE_NAME = 'attendance_system'

def create_database():
    """Create the database if it doesn't exist"""
    try:
        connection = pymysql.connect(**DB_CONFIG)
        cursor = connection.cursor()
        
        # Create database
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {DATABASE_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
        print(f"[OK] Database '{DATABASE_NAME}' created or already exists")
        
        # Use the database
        cursor.execute(f"USE {DATABASE_NAME}")
        
        # Create tables
        create_tables(cursor)
        
        # Insert default admin
        insert_default_admin(cursor)
        
        connection.commit()
        print("[OK] Database setup completed successfully!")
        
    except Exception as e:
        print(f"[ERROR] Error setting up database: {e}")
    finally:
        if 'connection' in locals():
            connection.close()

def create_tables(cursor):
    """Create all required tables"""
    
    # Admin table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS admin (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(80) UNIQUE NOT NULL,
            password_hash VARCHAR(120) NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)
    print("[OK] Admin table created")
    
    # Employee table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS employee (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(120) UNIQUE NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)
    print("[OK] Employee table created")
    
    # Attendance table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS attendance (
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
        # Check if admin already exists
        cursor.execute("SELECT id FROM admin WHERE username = 'admin'")
        if cursor.fetchone():
            print("[OK] Default admin already exists")
            return
        
        # Create default admin
        password_hash = generate_password_hash('admin123')
        cursor.execute("""
            INSERT INTO admin (username, password_hash) 
            VALUES (%s, %s)
        """, ('admin', password_hash))
        
        print("[OK] Default admin created - Username: admin, Password: admin123")
        
    except Exception as e:
        print(f"[ERROR] Error creating default admin: {e}")

def test_connection():
    """Test database connection"""
    try:
        connection = pymysql.connect(**DB_CONFIG)
        cursor = connection.cursor()
        cursor.execute("SELECT VERSION()")
        version = cursor.fetchone()
        print(f"[OK] MySQL connection successful - Version: {version[0]}")
        return True
    except Exception as e:
        print(f"[ERROR] MySQL connection failed: {e}")
        print("Please ensure MySQL is running and the credentials are correct.")
        return False
    finally:
        if 'connection' in locals():
            connection.close()

if __name__ == "__main__":
    print("Attendance Management System - Database Setup")
    print("=" * 50)
    
    # Test connection first
    if test_connection():
        print("\nSetting up database...")
        create_database()
        print("\n" + "=" * 50)
        print("Setup complete! You can now run the Flask application.")
        print("Default admin credentials:")
        print("Username: admin")
        print("Password: admin123")
    else:
        print("\nPlease fix the database connection issues and try again.")