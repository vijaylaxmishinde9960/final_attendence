# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a comprehensive Attendance Management System with a **hybrid architecture** featuring both a Flask backend API and dual frontend interfaces:

1. **Flask Backend** (Python) - REST API with JWT authentication
2. **Modern React Frontend** - SPA with Vite, Tailwind CSS, and modern UI components  
3. **Legacy HTML Frontend** - Traditional server-rendered interface

The system uses MySQL for data persistence (managed via MySQL Workbench) and supports features like employee management, department management, attendance tracking, leave management, overtime tracking, reporting, and Excel/PDF exports.

## Architecture

### Backend (Flask)
- **Main Application**: `app.py` - Flask REST API with JWT authentication
- **Database Models**: Admin, Employee, Department, Attendance, Leave, AuditLog, FileStorage (SQLAlchemy ORM)
- **Authentication**: JWT tokens with 24-hour expiration
- **Database**: MySQL with PyMySQL connector
- **Key Features**: CRUD operations, bulk attendance marking, department management, leave tracking, overtime management, audit logging, file storage, report generation, Excel/PDF export

### Frontend Architecture
**React SPA** (`src/`):
- **Entry Point**: `src/main.jsx` → `src/App.jsx`
- **Routing**: React Router with protected routes and navigation guards
- **State Management**: Context API for authentication (`AuthContext`) and attendance (`AttendanceContext`)
- **UI Framework**: Tailwind CSS with custom components and utility classes
- **Key Pages**: Dashboard, Employees, Departments, AttendanceOverview, Attendance, Reports, LeaveOvertime, Login
- **Components**: Header, Sidebar, AttendanceCell, StatusDropdown (reusable UI components)
- **Features**: Real-time updates, toast notifications, responsive design, dark mode support

**Legacy Interface** (`templates/`, `static/`):
- **Template**: `templates/index.html` (Jinja2)
- **Scripts**: `static/script.js` (vanilla JavaScript)
- **Styles**: `static/style.css`

### Database Schema
- **Admin**: id, username, password_hash, email, full_name, is_active, last_login, created_at, updated_at
- **Department**: id, name, description, manager_id, is_active, created_at, updated_at
- **Employee**: id, employee_id, name, email, phone, address, department_id, position, hire_date, salary, is_active, created_at, updated_at
- **Attendance**: id, employee_id, date, status (present/absent/half_day/leave/overtime), check_in_time, check_out_time, total_hours, overtime_hours, notes, marked_by, created_at, updated_at
- **Leave**: id, employee_id, leave_type, start_date, end_date, days_count, reason, status, approved_by, approved_at, created_at, updated_at
- **AuditLog**: Tracks all system changes with user_id, action, table_name, record_id, old_values, new_values, ip_address, user_agent
- **FileStorage**: Manages exported files and documents

## Development Commands

### Start Development Environment
```bash
# Start both servers (Windows)
start_servers.bat

# Manual startup - Flask backend
python app.py
# Backend runs at http://localhost:5000

# Manual startup - React frontend  
npm run dev
# Frontend runs at http://localhost:3000
```

### Python Backend Commands
```bash
# Install Python dependencies
pip install -r requirements.txt

# Set up database (creates tables and admin user)
python setup_database.py

# Add sample data for testing
python add_sample_data.py
python add_sample_departments.py
python add_sample_employees.py

# Database management and fixes
python fix_database.py
python migrate_departments.py
python init_database.py

# Employee and department assignment
python assign_department_managers.py
python assign_remaining_employees.py
python check_employee_departments.py

# Database verification and testing
python show_department_counts.py
python test_departments.py
python test_employee_department_integration.py
python update_mysql_schema.py

# Run Flask application
python app.py
python run.py  # alternative runner
```

### React Frontend Commands
```bash
# Install dependencies
npm install

# Start development server (with hot reload)
npm run dev
npm start  # alias for npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Testing
```bash
# Test system functionality
python test_system.py

# Test login endpoint specifically  
python test_login.py
```

## Key API Endpoints

### Authentication
- `POST /admin/login` - Admin login (returns JWT token)

### Employee Management  
- `GET /admin/employees` - List all employees
- `POST /admin/employees` - Add new employee
- `PUT /admin/employees/<id>` - Update employee
- `DELETE /admin/employees/<id>` - Delete employee

### Department Management
- `GET /admin/departments` - List all departments
- `POST /admin/departments` - Add new department
- `PUT /admin/departments/<id>` - Update department
- `DELETE /admin/departments/<id>` - Delete department

### Attendance Management
- `POST /admin/attendance` - Mark individual attendance  
- `POST /admin/attendance/bulk` - Bulk attendance marking
- `GET /admin/attendance/report` - Generate reports
- `GET /admin/attendance/overview` - Monthly attendance overview
- `GET /admin/attendance/export/excel` - Export Excel report
- `GET /admin/attendance/export/pdf` - Export PDF report

### Leave Management
- `GET /admin/leaves` - List leave requests
- `POST /admin/leaves` - Create leave request
- `PUT /admin/leaves/<id>/approve` - Approve leave request
- `PUT /admin/leaves/<id>/reject` - Reject leave request

## Development Workflow

### Default Credentials
- **Username**: `admin`
- **Password**: `admin123`

### Database Configuration
Current setup uses MySQL with connection string in `app.py`:
```python
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:viju%4021@localhost:3306/attendance_system'
```

### Proxy Configuration
React dev server proxies `/admin` requests to Flask backend (port 5000) via Vite configuration.

### File Structure Context
```
├── app.py                    # Flask API server
├── src/                      # React application source
│   ├── App.jsx              # Main React component with routing
│   ├── main.jsx             # React entry point
│   ├── contexts/            # React Context providers
│   ├── components/          # Reusable UI components  
│   └── pages/               # Route components
├── templates/index.html      # Legacy HTML interface
├── static/                   # Static assets for legacy interface
├── package.json             # Node.js dependencies and scripts
├── requirements.txt         # Python dependencies
├── vite.config.js           # Vite build configuration
├── tailwind.config.js       # Tailwind CSS configuration
└── start_servers.bat        # Convenience script for Windows
```

## Important Development Notes

### Running Both Interfaces
- **React (Modern)**: http://localhost:3000 - Full-featured SPA with modern UI
- **Flask (Legacy)**: http://localhost:5000 - Server-rendered HTML interface
- Both interfaces connect to the same Flask API backend

### Database Dependencies
- Requires MySQL server running locally
- **Database Management Tool**: MySQL Workbench (preferred for database administration)
- Run `setup_database.py` on first setup to create schema and admin user
- Database connection credentials are hardcoded in `app.py` (change for production)
- **Database Name**: `attendance_system`
- **Current Connection**: `mysql+pymysql://root:1109@localhost:3306/attendance_system`

### Database Management with MySQL Workbench
```bash
# Connect to MySQL Workbench with:
# Host: 127.0.0.1 (localhost)
# Port: 3306
# Username: root
# Password: 1109
# Database: attendance_system

# Useful MySQL Workbench operations:
# - View/edit table schemas
# - Run direct SQL queries for debugging
# - Monitor database performance
# - Export/import database backups
# - Manage user permissions
```

### Windows-Specific Features
- `start_servers.bat` automatically starts both Flask and React servers
- Paths in batch file may need adjustment for your environment

### Testing Strategy
- `test_system.py` provides comprehensive API testing
- `test_login.py` specifically tests authentication endpoints  
- Test scripts verify backend functionality before frontend development

### Modern React Features Used
- **React 18** with hooks and context
- **Vite** for fast development and building
- **React Router** for client-side routing
- **Tailwind CSS** for utility-first styling
- **Framer Motion** for animations
- **React Hot Toast** for notifications
- **Recharts** for data visualization
- **Axios** for HTTP requests
- **Lucide React** for modern icons
- **Date-fns** for date manipulation

## Development Patterns

### Component Architecture
- **Pages**: Route-level components in `src/pages/`
- **Components**: Reusable UI components in `src/components/`
- **Contexts**: Global state management in `src/contexts/`
- **Hooks**: Custom React hooks for shared logic

### State Management Strategy
- **AuthContext**: Handles user authentication and JWT token management
- **AttendanceContext**: Manages attendance data and UI state
- **Local State**: Component-level state for forms and UI interactions
- **Optimistic Updates**: UI updates immediately before API confirmation

### API Integration Patterns
- **Centralized Axios Config**: Base URL and interceptors for JWT tokens
- **Error Handling**: Consistent error messages via toast notifications
- **Loading States**: Proper loading indicators for async operations
- **Retry Logic**: Automatic retries for failed network requests

## Troubleshooting Common Issues

### Attendance Not Saving
```bash
# Check if Flask backend is running
curl http://localhost:5000/admin/employees

# Verify MySQL connection
python -c "from app import db; print('DB connected')" 

# Check browser console for JavaScript errors
# Verify JWT token in localStorage
```

### Database Connection Issues
```bash
# Test database connectivity
python test_system.py

# Reset database if corrupted
python fix_database.py

# Check MySQL service status
# Verify credentials in MySQL Workbench
```

### React Development Issues
```bash
# Clear node modules and reinstall
rmdir /S node_modules
npm install

# Clear Vite cache
npm run dev -- --force

# Check for port conflicts
netstat -ano | findstr :3000
netstat -ano | findstr :5000
```
