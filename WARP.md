# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a comprehensive Attendance Management System with a **hybrid architecture** featuring both a Flask backend API and dual frontend interfaces:

1. **Flask Backend** (Python) - REST API with JWT authentication
2. **Modern React Frontend** - SPA with Vite, Tailwind CSS, and modern UI components  
3. **Legacy HTML Frontend** - Traditional server-rendered interface

The system uses MySQL for data persistence and supports features like employee management, attendance tracking, reporting, and Excel/PDF exports.

## Architecture

### Backend (Flask)
- **Main Application**: `app.py` - Flask REST API with JWT authentication
- **Database Models**: Admin, Employee, Attendance (SQLAlchemy ORM)
- **Authentication**: JWT tokens with 24-hour expiration
- **Database**: MySQL with PyMySQL connector
- **Key Features**: CRUD operations, bulk attendance marking, report generation, Excel/PDF export

### Frontend Architecture
**React SPA** (`src/`):
- **Entry Point**: `src/main.jsx` → `src/App.jsx`
- **Routing**: React Router with protected routes
- **State Management**: Context API for authentication
- **UI Framework**: Tailwind CSS with custom components
- **Key Pages**: Dashboard, Employees, AttendanceOverview, Reports, LeaveOvertime

**Legacy Interface** (`templates/`, `static/`):
- **Template**: `templates/index.html` (Jinja2)
- **Scripts**: `static/script.js` (vanilla JavaScript)
- **Styles**: `static/style.css`

### Database Schema
- **Admin**: id, username, password_hash, created_at
- **Employee**: id, name, email, created_at
- **Attendance**: id, employee_id, date, status, marked_at

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

# Fix database issues if needed
python fix_database.py

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

### Attendance Management
- `POST /admin/attendance` - Mark individual attendance  
- `POST /admin/attendance/bulk` - Bulk attendance marking
- `GET /admin/attendance/report` - Generate reports

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
- Run `setup_database.py` on first setup to create schema and admin user
- Database connection credentials are hardcoded in `app.py` (change for production)

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
