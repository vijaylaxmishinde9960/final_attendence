# Attendance Management System

A comprehensive attendance management system built with Flask (backend), HTML/CSS/JavaScript (frontend), and MySQL (database) with JWT authentication.

## Features

- **Admin Authentication**: Secure login with JWT tokens
- **Employee Management**: Add, edit, delete employees
- **Attendance Tracking**: Mark employees as present or absent
- **Bulk Operations**: Mark all employees present/absent at once
- **Reports**: Generate attendance reports with statistics
- **Responsive Design**: Modern, mobile-friendly interface
- **Real-time Updates**: Dynamic attendance marking.

## Technology Stack

- **Backend**: Flask (Python)
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Tokens)
- **Styling**: Custom CSS with modern design

## Prerequisites

- Python 3.7+
- MySQL 5.7+ or 8.0+
- pip (Python package manager)

## Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Attendence-System-project_v2
```

### 2. Install Python Dependencies
```bash
pip install -r requirements.txt
```

### 3. Database Setup

#### Option A: Using the Setup Script (Recommended)
```bash
python setup_database.py
```

#### Option B: Manual Database Setup
1. Open MySQL command line or MySQL Workbench
2. Connect to MySQL with root user
3. Create the database:
```sql
CREATE DATABASE attendance_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4. Configure Database Connection
The application is pre-configured with the following database settings:
- Host: 127.0.0.1
- Port: 3306
- Username: root
- Password: viju@21
- Database: attendance_system

To change these settings, modify the `SQLALCHEMY_DATABASE_URI` in `app.py`.

### 5. Run the Application
```bash
python app.py
```

The application will be available at: `http://localhost:5000`

## Default Admin Credentials

- **Username**: admin
- **Password**: admin123

**Important**: Change the default admin password after first login for security.

## Usage Guide

### 1. Login
- Open the application in your browser
- Use the default admin credentials to log in
- The system will remember your login session.


### 2. Employee Management
- Click "Add Employee" to add new employees
- Use the edit/delete buttons on employee cards to manage existing employees
- Employee information includes name and email

### 3. Attendance Marking
- Select the date for attendance marking
- Click "Present" or "Absent" for each employee
- Use "Mark All Present" or "Mark All Absent" for bulk operations
- Click "Save Attendance" to save all changes    sdfgfsdhdfh

### 4. Reports
- Click "Generate Report" to view attendance statistics
- Reports show total employees, present count, absent count, and not marked count
- View detailed employee status in the report table

## API Endpoints

### Authentication
- `POST /admin/login` - Admin login

### Employee Management
- `GET /admin/employees` - Get all employees
- `POST /admin/employees` - Add new employee
- `PUT /admin/employees/<id>` - Update employee
- `DELETE /admin/employees/<id>` - Delete employee

### Attendance
- `POST /admin/attendance` - Mark individual attendance
- `POST /admin/attendance/bulk` - Bulk attendance marking
- `GET /admin/attendance/report` - Generate attendance report

## Database Schema

### Admin Table
- `id` (Primary Key)
- `username` (Unique)
- `password_hash`
- `created_at`

### Employee Table
- `id` (Primary Key)
- `name`
- `email` (Unique)
- `created_at`

### Attendance Table
- `id` (Primary Key)
- `employee_id` (Foreign Key)
- `date`
- `status` (present/absent)
- `marked_at`

## Security Features

- JWT-based authentication
- Password hashing with Werkzeug
- Protected API endpoints
- Session management
- Input validation

## Customization

### Changing Database Credentials
1. Edit `app.py`
2. Modify the `SQLALCHEMY_DATABASE_URI` configuration
3. Update `setup_database.py` if using the setup script

### Styling
- Modify `static/style.css` for custom styling
- The design is responsive and mobile-friendly

### Adding Features
- Backend: Add new routes in `app.py`
- Frontend: Extend `static/script.js` and `templates/index.html`

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Ensure MySQL is running
   - Verify database credentials
   - Check if the database exists

2. **Module Not Found Error**
   - Install all dependencies: `pip install -r requirements.txt`
   - Ensure you're using the correct Python version

3. **Port Already in Use**
   - Change the port in `app.py`: `app.run(port=5001)`
   - Or stop the process using port 5000

4. **JWT Token Issues**
   - Clear browser localStorage
   - Log in again

### Logs
Check the console output for detailed error messages and debugging information.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.

## Support

For support and questions, please create an issue in the repository or contact the development team.

---

**Note**: This system is designed for local use. For production deployment, ensure proper security measures, environment variables for sensitive data, and HTTPS configuration.
