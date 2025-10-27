from app import app, db, Admin, Employee, Department, Attendance, Holiday
from werkzeug.security import generate_password_hash
from datetime import datetime, timedelta, date
import random

def add_dummy_data():
    with app.app_context():
        print("Starting to add dummy data...")
        
        # Get or create admin user
        admin = Admin.query.filter_by(username='admin').first()
        if not admin:
            admin = Admin(
                username='admin',
                password_hash=generate_password_hash('admin123'),
                email='admin@company.com',
                full_name='System Administrator'
            )
            db.session.add(admin)
            db.session.commit()
            print("✓ Admin user created")
        
        # Create departments
        departments_data = [
            {'name': 'Engineering', 'description': 'Software development and engineering team'},
            {'name': 'Human Resources', 'description': 'HR and recruitment team'},
            {'name': 'Sales', 'description': 'Sales and business development team'},
            {'name': 'Marketing', 'description': 'Marketing and communications team'},
            {'name': 'Finance', 'description': 'Finance and accounting team'},
            {'name': 'Operations', 'description': 'Operations and logistics team'}
        ]
        
        departments = []
        for dept_data in departments_data:
            existing_dept = Department.query.filter_by(name=dept_data['name']).first()
            if not existing_dept:
                dept = Department(
                    name=dept_data['name'],
                    description=dept_data['description'],
                    is_active=True
                )
                db.session.add(dept)
                departments.append(dept)
            else:
                departments.append(existing_dept)
        
        db.session.commit()
        print(f"✓ {len(departments)} departments created/verified")
        
        # Create employees
        employees_data = [
            # Engineering
            {'name': 'John Smith', 'email': 'john.smith@company.com', 'phone': '555-0101', 'position': 'Senior Software Engineer', 'salary': 95000, 'dept': 'Engineering'},
            {'name': 'Sarah Johnson', 'email': 'sarah.johnson@company.com', 'phone': '555-0102', 'position': 'Frontend Developer', 'salary': 75000, 'dept': 'Engineering'},
            {'name': 'Michael Chen', 'email': 'michael.chen@company.com', 'phone': '555-0103', 'position': 'Backend Developer', 'salary': 80000, 'dept': 'Engineering'},
            {'name': 'Emily Davis', 'email': 'emily.davis@company.com', 'phone': '555-0104', 'position': 'DevOps Engineer', 'salary': 85000, 'dept': 'Engineering'},
            {'name': 'David Wilson', 'email': 'david.wilson@company.com', 'phone': '555-0105', 'position': 'QA Engineer', 'salary': 70000, 'dept': 'Engineering'},
            
            # HR
            {'name': 'Jessica Martinez', 'email': 'jessica.martinez@company.com', 'phone': '555-0201', 'position': 'HR Manager', 'salary': 80000, 'dept': 'Human Resources'},
            {'name': 'Robert Taylor', 'email': 'robert.taylor@company.com', 'phone': '555-0202', 'position': 'Recruiter', 'salary': 60000, 'dept': 'Human Resources'},
            
            # Sales
            {'name': 'Amanda White', 'email': 'amanda.white@company.com', 'phone': '555-0301', 'position': 'Sales Manager', 'salary': 90000, 'dept': 'Sales'},
            {'name': 'James Brown', 'email': 'james.brown@company.com', 'phone': '555-0302', 'position': 'Sales Executive', 'salary': 65000, 'dept': 'Sales'},
            {'name': 'Linda Garcia', 'email': 'linda.garcia@company.com', 'phone': '555-0303', 'position': 'Account Manager', 'salary': 70000, 'dept': 'Sales'},
            
            # Marketing
            {'name': 'Christopher Lee', 'email': 'christopher.lee@company.com', 'phone': '555-0401', 'position': 'Marketing Director', 'salary': 95000, 'dept': 'Marketing'},
            {'name': 'Jennifer Anderson', 'email': 'jennifer.anderson@company.com', 'phone': '555-0402', 'position': 'Content Writer', 'salary': 55000, 'dept': 'Marketing'},
            {'name': 'Daniel Thomas', 'email': 'daniel.thomas@company.com', 'phone': '555-0403', 'position': 'Social Media Manager', 'salary': 60000, 'dept': 'Marketing'},
            
            # Finance
            {'name': 'Patricia Moore', 'email': 'patricia.moore@company.com', 'phone': '555-0501', 'position': 'Finance Manager', 'salary': 90000, 'dept': 'Finance'},
            {'name': 'Richard Jackson', 'email': 'richard.jackson@company.com', 'phone': '555-0502', 'position': 'Accountant', 'salary': 65000, 'dept': 'Finance'},
            
            # Operations
            {'name': 'Mary Martin', 'email': 'mary.martin@company.com', 'phone': '555-0601', 'position': 'Operations Manager', 'salary': 85000, 'dept': 'Operations'},
            {'name': 'Kevin Thompson', 'email': 'kevin.thompson@company.com', 'phone': '555-0602', 'position': 'Logistics Coordinator', 'salary': 58000, 'dept': 'Operations'},
        ]
        
        employees = []
        for i, emp_data in enumerate(employees_data, 1):
            existing_emp = Employee.query.filter_by(email=emp_data['email']).first()
            if not existing_emp:
                dept = Department.query.filter_by(name=emp_data['dept']).first()
                emp = Employee(
                    employee_id=f'EMP{i:03d}',
                    name=emp_data['name'],
                    email=emp_data['email'],
                    phone=emp_data['phone'],
                    position=emp_data['position'],
                    salary=emp_data['salary'],
                    department_id=dept.id if dept else None,
                    hire_date=date.today() - timedelta(days=random.randint(30, 730)),
                    address=f'{random.randint(100, 999)} Main Street, City, State {random.randint(10000, 99999)}',
                    is_active=True
                )
                db.session.add(emp)
                employees.append(emp)
            else:
                employees.append(existing_emp)
        
        db.session.commit()
        print(f"✓ {len(employees)} employees created/verified")
        
        # Create attendance records for the past 30 days
        today = date.today()
        start_date = today - timedelta(days=30)
        
        attendance_count = 0
        statuses = ['present', 'present', 'present', 'present', 'absent', 'half_day']  # Weighted towards present
        
        current_date = start_date
        while current_date <= today:
            # Skip weekends
            if current_date.weekday() < 5:
                for employee in Employee.query.all():
                    # Check if attendance already exists
                    existing_attendance = Attendance.query.filter_by(
                        employee_id=employee.id,
                        date=current_date
                    ).first()
                    
                    if not existing_attendance:
                        status = random.choice(statuses)
                        
                        attendance = Attendance(
                            employee_id=employee.id,
                            date=current_date,
                            status=status,
                            check_in_time=datetime.strptime('09:00', '%H:%M').time() if status in ['present', 'overtime'] else None,
                            check_out_time=datetime.strptime('17:30', '%H:%M').time() if status in ['present', 'overtime'] else None,
                            total_hours=8.5 if status in ['present', 'overtime'] else (4.0 if status == 'half_day' else 0),
                            overtime_hours=1.5 if status == 'overtime' else 0,
                            marked_by=admin.id
                        )
                        db.session.add(attendance)
                        attendance_count += 1
            
            current_date += timedelta(days=1)
        
        db.session.commit()
        print(f"✓ {attendance_count} attendance records created")
        
        # Create some holidays
        current_year = datetime.now().year
        holidays_data = [
            {'name': 'New Year Day', 'date': f'{current_year}-01-01', 'description': 'New Year celebration'},
            {'name': 'Independence Day', 'date': f'{current_year}-07-04', 'description': 'National holiday'},
            {'name': 'Thanksgiving', 'date': f'{current_year}-11-28', 'description': 'Thanksgiving Day'},
            {'name': 'Christmas Day', 'date': f'{current_year}-12-25', 'description': 'Christmas celebration'},
        ]
        
        holidays_created = 0
        for holiday_data in holidays_data:
            try:
                holiday_date = datetime.strptime(holiday_data['date'], '%Y-%m-%d').date()
                existing_holiday = Holiday.query.filter_by(date=holiday_date).first()
                
                if not existing_holiday:
                    holiday = Holiday(
                        name=holiday_data['name'],
                        date=holiday_date,
                        description=holiday_data['description'],
                        is_recurring=True,
                        created_by=admin.id
                    )
                    db.session.add(holiday)
                    holidays_created += 1
            except Exception as e:
                print(f"Warning: Could not create holiday {holiday_data['name']}: {e}")
        
        db.session.commit()
        print(f"✓ {holidays_created} holidays created")
        
        print("\n" + "="*50)
        print("✓ Dummy data added successfully!")
        print("="*50)
        print(f"\nSummary:")
        print(f"  • Departments: {len(departments)}")
        print(f"  • Employees: {len(employees)}")
        print(f"  • Attendance records: {attendance_count}")
        print(f"  • Holidays: {holidays_created}")
        print(f"\nLogin credentials:")
        print(f"  Username: admin")
        print(f"  Password: admin123")
        print(f"\nAccess the application at: http://localhost:5000")

if __name__ == '__main__':
    add_dummy_data()
