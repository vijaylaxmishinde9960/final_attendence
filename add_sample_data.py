#!/usr/bin/env python3
"""
Script to add sample employees and attendance data to the database
"""

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, date, timedelta
import os

# Create Flask app
app = Flask(__name__)

# Configuration - using SQLite for simplicity
app.config['SECRET_KEY'] = 'your-secret-key-change-this'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///attendance_system.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize extensions
db = SQLAlchemy(app)

# Database Models
class Admin(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(120), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Employee(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone = db.Column(db.String(20))
    department = db.Column(db.String(50))
    position = db.Column(db.String(50))
    joining_date = db.Column(db.Date)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Attendance(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    employee_id = db.Column(db.Integer, db.ForeignKey('employee.id'), nullable=False)
    date = db.Column(db.Date, nullable=False)
    status = db.Column(db.String(20), nullable=False)  # present, absent, halfday, leave, overtime
    check_in_time = db.Column(db.Time)
    check_out_time = db.Column(db.Time)
    overtime_hours = db.Column(db.Float, default=0.0)
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

def add_sample_data():
    """Add sample employees and attendance data"""
    
    with app.app_context():
        # Create tables
        db.create_all()
        
        # Check if admin already exists
        admin = Admin.query.filter_by(username='admin').first()
        if not admin:
            from werkzeug.security import generate_password_hash
            admin = Admin(
                username='admin',
                password_hash=generate_password_hash('admin123')
            )
            db.session.add(admin)
            db.session.commit()
            print("Admin user created: admin/admin123")
        else:
            print("Admin user already exists")
        
        # Sample employees
        sample_employees = [
            {
                'name': 'John Doe',
                'email': 'john.doe@company.com',
                'phone': '+1-555-0101',
                'department': 'Engineering',
                'position': 'Software Developer',
                'joining_date': date(2024, 1, 15)
            },
            {
                'name': 'Jane Smith',
                'email': 'jane.smith@company.com',
                'phone': '+1-555-0102',
                'department': 'Marketing',
                'position': 'Marketing Manager',
                'joining_date': date(2024, 2, 1)
            },
            {
                'name': 'Mike Johnson',
                'email': 'mike.johnson@company.com',
                'phone': '+1-555-0103',
                'department': 'Sales',
                'position': 'Sales Executive',
                'joining_date': date(2024, 1, 20)
            },
            {
                'name': 'Sarah Wilson',
                'email': 'sarah.wilson@company.com',
                'phone': '+1-555-0104',
                'department': 'HR',
                'position': 'HR Specialist',
                'joining_date': date(2024, 3, 1)
            },
            {
                'name': 'David Brown',
                'email': 'david.brown@company.com',
                'phone': '+1-555-0105',
                'department': 'Engineering',
                'position': 'DevOps Engineer',
                'joining_date': date(2024, 2, 15)
            },
            {
                'name': 'Lisa Davis',
                'email': 'lisa.davis@company.com',
                'phone': '+1-555-0106',
                'department': 'Finance',
                'position': 'Accountant',
                'joining_date': date(2024, 1, 10)
            }
        ]
        
        # Add employees
        employees_added = 0
        for emp_data in sample_employees:
            existing = Employee.query.filter_by(email=emp_data['email']).first()
            if not existing:
                employee = Employee(**emp_data)
                db.session.add(employee)
                employees_added += 1
        
        db.session.commit()
        print(f"Added {employees_added} new employees")
        
        # Add some sample attendance data for the last 7 days
        employees = Employee.query.all()
        today = date.today()
        
        attendance_added = 0
        for i in range(7):
            attendance_date = today - timedelta(days=i)
            
            for employee in employees:
                # Skip weekends
                if attendance_date.weekday() >= 5:
                    continue
                
                # Check if attendance already exists
                existing = Attendance.query.filter_by(
                    employee_id=employee.id,
                    date=attendance_date
                ).first()
                
                if not existing:
                    # Random attendance status
                    import random
                    statuses = ['present', 'present', 'present', 'present', 'absent']  # 80% present
                    status = random.choice(statuses)
                    
                    attendance = Attendance(
                        employee_id=employee.id,
                        date=attendance_date,
                        status=status,
                        check_in_time=datetime.strptime('09:00', '%H:%M').time() if status == 'present' else None
                    )
                    db.session.add(attendance)
                    attendance_added += 1
        
        db.session.commit()
        print(f"Added {attendance_added} attendance records")
        
        print("\nSample data added successfully!")
        print(f"Total employees: {Employee.query.count()}")
        print(f"Total attendance records: {Attendance.query.count()}")
        print("\nLogin credentials:")
        print("   Username: admin")
        print("   Password: admin123")

if __name__ == '__main__':
    add_sample_data()
