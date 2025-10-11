from flask import Flask, request, jsonify, render_template
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta, date
import os
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment
from flask import send_file
import io
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

app = Flask(__name__)

# Configuration
app.config['SECRET_KEY'] = 'your-secret-key-change-this'
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:viju%4021@localhost:3306/attendance_system'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'jwt-secret-string-change-this'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)

# Initialize extensions
db = SQLAlchemy(app)
jwt = JWTManager(app)

# JWT identity loader
@jwt.user_identity_loader
def user_identity_lookup(admin_id):
    return admin_id

@jwt.user_lookup_loader
def user_lookup_callback(_jwt_header, jwt_data):
    identity = jwt_data["sub"]
    return Admin.query.filter_by(id=int(identity)).one_or_none()

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
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Attendance(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    employee_id = db.Column(db.Integer, db.ForeignKey('employee.id'), nullable=False)
    date = db.Column(db.Date, nullable=False)
    status = db.Column(db.String(10), nullable=False)  # 'present' or 'absent'
    marked_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    employee = db.relationship('Employee', backref=db.backref('attendance_records', lazy=True))

# Routes
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/admin/login', methods=['POST'])
def admin_login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    admin = Admin.query.filter_by(username=username).first()
    
    if admin and check_password_hash(admin.password_hash, password):
        access_token = create_access_token(identity=str(admin.id))
        return jsonify({
            'access_token': access_token,
            'message': 'Login successful'
        }), 200
    else:
        return jsonify({'message': 'Invalid credentials'}), 401

@app.route('/admin/employees', methods=['GET'])
@jwt_required()
def get_employees():
    employees = Employee.query.all()
    return jsonify([{
        'id': emp.id,
        'name': emp.name,
        'email': emp.email,
        'created_at': emp.created_at.isoformat()
    } for emp in employees])

@app.route('/admin/employees', methods=['POST'])
@jwt_required()
def add_employee():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    
    if not name or not email:
        return jsonify({'message': 'Name and email are required'}), 400
    
    # Check if employee already exists
    existing_employee = Employee.query.filter_by(email=email).first()
    if existing_employee:
        return jsonify({'message': 'Employee with this email already exists'}), 400
    
    employee = Employee(name=name, email=email)
    db.session.add(employee)
    db.session.commit()
    
    return jsonify({
        'id': employee.id,
        'name': employee.name,
        'email': employee.email,
        'message': 'Employee added successfully'
    }), 201

@app.route('/admin/employees/<int:employee_id>', methods=['PUT'])
@jwt_required()
def update_employee(employee_id):
    employee = Employee.query.get_or_404(employee_id)
    data = request.get_json()
    
    employee.name = data.get('name', employee.name)
    employee.email = data.get('email', employee.email)
    
    db.session.commit()
    
    return jsonify({
        'id': employee.id,
        'name': employee.name,
        'email': employee.email,
        'message': 'Employee updated successfully'
    })

@app.route('/admin/employees/<int:employee_id>', methods=['DELETE'])
@jwt_required()
def delete_employee(employee_id):
    employee = Employee.query.get_or_404(employee_id)
    db.session.delete(employee)
    db.session.commit()
    
    return jsonify({'message': 'Employee deleted successfully'})

@app.route('/admin/attendance', methods=['POST'])
@jwt_required()
def mark_attendance():
    data = request.get_json()
    employee_id = data.get('employee_id')
    status = data.get('status')
    date_str = data.get('date', datetime.now().date().isoformat())
    
    # Convert string date to date object
    if isinstance(date_str, str):
        date_obj = datetime.strptime(date_str, '%Y-%m-%d').date()
    else:
        date_obj = date_str
    
    if not employee_id or not status:
        return jsonify({'message': 'Employee ID and status are required'}), 400
    
    if status not in ['present', 'absent']:
        return jsonify({'message': 'Status must be present or absent'}), 400
    
    # Check if attendance already marked for this employee on this date
    existing_attendance = Attendance.query.filter_by(
        employee_id=employee_id, 
        date=date_obj
    ).first()
    
    if existing_attendance:
        existing_attendance.status = status
        existing_attendance.marked_at = datetime.utcnow()
    else:
        attendance = Attendance(
            employee_id=employee_id,
            date=date_obj,
            status=status
        )
        db.session.add(attendance)
    
    db.session.commit()
    
    return jsonify({'message': 'Attendance marked successfully'})

@app.route('/admin/attendance/report', methods=['GET'])
@jwt_required()
def get_attendance_report():
    date_str = request.args.get('date', datetime.now().date().isoformat())
    
    # Convert string date to date object
    if isinstance(date_str, str):
        date_obj = datetime.strptime(date_str, '%Y-%m-%d').date()
    else:
        date_obj = date_str
    
    # Get all employees
    employees = Employee.query.all()
    
    # Get attendance for the specified date
    attendance_records = Attendance.query.filter_by(date=date_obj).all()
    
    # Create a dictionary for quick lookup
    attendance_dict = {record.employee_id: record.status for record in attendance_records}
    
    # Prepare report data
    report_data = []
    present_count = 0
    absent_count = 0
    
    for employee in employees:
        status = attendance_dict.get(employee.id, 'not_marked')
        if status == 'present':
            present_count += 1
        elif status == 'absent':
            absent_count += 1
            
        report_data.append({
            'id': employee.id,
            'name': employee.name,
            'email': employee.email,
            'status': status
        })
    
    return jsonify({
        'date': date_obj.isoformat(),
        'total_employees': len(employees),
        'present_count': present_count,
        'absent_count': absent_count,
        'not_marked_count': len(employees) - present_count - absent_count,
        'employees': report_data
    })

@app.route('/admin/attendance/bulk', methods=['POST'])
@jwt_required()
def bulk_mark_attendance():
    data = request.get_json()
    attendance_data = data.get('attendance_data', [])
    date_str = data.get('date', datetime.now().date().isoformat())
    
    # Convert string date to date object
    if isinstance(date_str, str):
        date_obj = datetime.strptime(date_str, '%Y-%m-%d').date()
    else:
        date_obj = date_str
    
    if not attendance_data:
        return jsonify({'message': 'Attendance data is required'}), 400
    
    # Clear existing attendance for this date
    Attendance.query.filter_by(date=date_obj).delete()
    
    # Add new attendance records
    for record in attendance_data:
        attendance = Attendance(
            employee_id=record['employee_id'],
            date=date_obj,
            status=record['status']
        )
        db.session.add(attendance)
    
    db.session.commit()
    
    return jsonify({'message': 'Bulk attendance marked successfully'})

@app.route('/admin/test-token', methods=['GET'])
@jwt_required()
def test_token():
    """Test endpoint to verify JWT token"""
    current_user_id = get_jwt_identity()
    return jsonify({
        'message': 'Token is valid',
        'user_id': current_user_id
    })

@app.route('/admin/attendance/export', methods=['GET'])
@jwt_required()
def export_attendance_report():
    """Export attendance report to Excel file"""
    try:
        date_str = request.args.get('date', datetime.now().date().isoformat())
        print(f"Export request for date: {date_str}")
        
        # Debug: Log authorization header
        auth_header = request.headers.get('Authorization', 'No Authorization header')
        print(f"Authorization header: {auth_header}")
        
        # Debug: Get current user
        current_user_id = get_jwt_identity()
        print(f"Current user ID: {current_user_id}")
        
        # Convert string date to date object
        if isinstance(date_str, str):
            date_obj = datetime.strptime(date_str, '%Y-%m-%d').date()
        else:
            date_obj = date_str
    
        # Get all employees
        employees = Employee.query.all()
        print(f"Found {len(employees)} employees")
        
        # Get attendance for the specified date
        attendance_records = Attendance.query.filter_by(date=date_obj).all()
        print(f"Found {len(attendance_records)} attendance records")
        
        # Create a dictionary for quick lookup
        attendance_dict = {record.employee_id: record.status for record in attendance_records}
        
        # Create Excel workbook
        wb = Workbook()
        ws = wb.active
        ws.title = f"Attendance Report - {date_obj.strftime('%Y-%m-%d')}"
        
        # Define styles
        header_font = Font(bold=True, color="FFFFFF")
        header_fill = PatternFill(start_color="366092", end_color="366092", fill_type="solid")
        center_alignment = Alignment(horizontal="center", vertical="center")
        
        # Set column headers
        headers = ['Employee ID', 'Employee Name', 'Email', 'Status', 'Date']
        for col, header in enumerate(headers, 1):
            cell = ws.cell(row=1, column=col, value=header)
            cell.font = header_font
            cell.fill = header_fill
            cell.alignment = center_alignment
        
        # Add data rows
        present_count = 0
        absent_count = 0
        not_marked_count = 0
        
        for row, employee in enumerate(employees, 2):
            status = attendance_dict.get(employee.id, 'Not Marked')
            
            # Count statuses
            if status == 'present':
                present_count += 1
            elif status == 'absent':
                absent_count += 1
            else:
                not_marked_count += 1
            
            # Add employee data
            ws.cell(row=row, column=1, value=employee.id)
            ws.cell(row=row, column=2, value=employee.name)
            ws.cell(row=row, column=3, value=employee.email)
            ws.cell(row=row, column=4, value=status)
            ws.cell(row=row, column=5, value=date_obj.strftime('%Y-%m-%d'))
        
        # Add summary section
        summary_row = len(employees) + 3
        ws.cell(row=summary_row, column=1, value="SUMMARY").font = Font(bold=True)
        ws.cell(row=summary_row + 1, column=1, value="Total Employees:")
        ws.cell(row=summary_row + 1, column=2, value=len(employees))
        ws.cell(row=summary_row + 2, column=1, value="Present:")
        ws.cell(row=summary_row + 2, column=2, value=present_count)
        ws.cell(row=summary_row + 3, column=1, value="Absent:")
        ws.cell(row=summary_row + 3, column=2, value=absent_count)
        ws.cell(row=summary_row + 4, column=1, value="Not Marked:")
        ws.cell(row=summary_row + 4, column=2, value=not_marked_count)
        
        # Auto-adjust column widths
        for column in ws.columns:
            max_length = 0
            column_letter = column[0].column_letter
            for cell in column:
                try:
                    if len(str(cell.value)) > max_length:
                        max_length = len(str(cell.value))
                except:
                    pass
            adjusted_width = min(max_length + 2, 50)
            ws.column_dimensions[column_letter].width = adjusted_width
        
        # Save to BytesIO buffer
        output = io.BytesIO()
        wb.save(output)
        output.seek(0)
        
        # Create filename
        filename = f"attendance_report_{date_obj.strftime('%Y%m%d')}.xlsx"
        print(f"Excel file created: {filename}")
    
        return send_file(
            output,
            as_attachment=True,
            download_name=filename,
            mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
    except Exception as e:
        print(f"Excel export error: {e}")
        return jsonify({'error': f'Failed to export Excel: {str(e)}'}), 500

@app.route('/admin/attendance/export-pdf', methods=['GET'])
@jwt_required()
def export_attendance_report_pdf():
    """Export attendance report to PDF file"""
    try:
        date_str = request.args.get('date', datetime.now().date().isoformat())
        employee_id = request.args.get('employee_id')
        
        print(f"PDF Export request for date: {date_str}, employee_id: {employee_id}")
        
        # Convert string date to date object
        if isinstance(date_str, str):
            date_obj = datetime.strptime(date_str, '%Y-%m-%d').date()
        else:
            date_obj = date_str
        
        # Get employees
        if employee_id:
            employees = Employee.query.filter_by(id=employee_id).all()
            filename = f"attendance_report_{employees[0].name.replace(' ', '_')}_{date_obj.strftime('%Y-%m-%d')}.pdf"
        else:
            employees = Employee.query.all()
            filename = f"attendance_overview_{date_obj.strftime('%Y-%m-%d')}.pdf"
        
        # Get attendance for the specified date
        attendance_records = Attendance.query.filter_by(date=date_obj).all()
        attendance_dict = {record.employee_id: record.status for record in attendance_records}
        
        # Create PDF in memory
        output = io.BytesIO()
        doc = SimpleDocTemplate(output, pagesize=A4)
        
        # Define styles
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=16,
            spaceAfter=30,
            alignment=1  # Center alignment
        )
        
        # Create content
        story = []
        
        # Title
        if employee_id:
            title = f"Attendance Report - {employees[0].name}"
        else:
            title = f"Attendance Overview - {date_obj.strftime('%B %d, %Y')}"
        
        story.append(Paragraph(title, title_style))
        story.append(Spacer(1, 20))
        
        # Create table data
        table_data = [['Employee ID', 'Employee Name', 'Email', 'Status']]
        
        for employee in employees:
            status = attendance_dict.get(employee.id, 'Not Marked')
            table_data.append([
                str(employee.id),
                employee.name,
                employee.email,
                status.replace('_', ' ').title()
            ])
        
        # Create table
        table = Table(table_data)
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('FONTSIZE', (0, 1), (-1, -1), 10),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.lightgrey])
        ]))
        
        story.append(table)
        
        # Build PDF
        doc.build(story)
        output.seek(0)
        
        return send_file(
            output,
            as_attachment=True,
            download_name=filename,
            mimetype='application/pdf'
        )
    
    except Exception as e:
        print(f"PDF Export error: {str(e)}")
        return jsonify({'error': 'Failed to export PDF report'}), 500

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        
        # Create default admin if not exists
        admin = Admin.query.filter_by(username='admin').first()
        if not admin:
            admin = Admin(
                username='admin',
                password_hash=generate_password_hash('admin123')
            )
            db.session.add(admin)
            db.session.commit()
            print("Default admin created - Username: admin, Password: admin123")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
