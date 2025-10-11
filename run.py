#!/usr/bin/env python3
"""
Startup script for Attendance Management System
This script sets up the database and starts the Flask application.
"""

import subprocess
import sys
import os
import time

def check_dependencies():
    """Check if required packages are installed"""
    print("Checking dependencies...")
    
    try:
        import flask
        import flask_sqlalchemy
        import flask_jwt_extended
        import pymysql
        import werkzeug
        print("[OK] All required packages are installed")
        return True
    except ImportError as e:
        print(f"[ERROR] Missing package: {e}")
        print("Please install requirements: pip install -r requirements.txt")
        return False

def setup_database():
    """Set up the database"""
    print("\nSetting up database...")
    
    try:
        result = subprocess.run([sys.executable, "setup_database.py"], 
                              capture_output=True, text=True)
        if result.returncode == 0:
            print("[OK] Database setup completed")
            return True
        else:
            print(f"[ERROR] Database setup failed: {result.stderr}")
            return False
    except Exception as e:
        print(f"[ERROR] Error setting up database: {e}")
        return False

def start_application():
    """Start the Flask application"""
    print("\nStarting Flask application...")
    print("=" * 50)
    print("Attendance Management System is starting!")
    print("=" * 50)
    print("Web Interface: http://localhost:5000")
    print("Admin Username: admin")
    print("Admin Password: admin123")
    print("=" * 50)
    print("Press Ctrl+C to stop the server")
    print("=" * 50)
    
    try:
        # Start the Flask app
        subprocess.run([sys.executable, "app.py"])
    except KeyboardInterrupt:
        print("\n\nServer stopped. Goodbye!")
    except Exception as e:
        print(f"\n[ERROR] Error starting application: {e}")

def main():
    """Main startup function"""
    print("Attendance Management System - Startup")
    print("=" * 50)
    
    # Check if we're in the right directory
    if not os.path.exists("app.py"):
        print("[ERROR] app.py not found. Please run this script from the project directory.")
        sys.exit(1)
    
    # Check dependencies
    if not check_dependencies():
        sys.exit(1)
    
    # Setup database
    if not setup_database():
        print("\n[WARNING] Database setup failed, but continuing...")
        print("You may need to set up the database manually.")
        time.sleep(2)
    
    # Start application
    start_application()

if __name__ == "__main__":
    main()
