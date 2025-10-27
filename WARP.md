# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Attendance Management System - Full-stack app with Flask backend and React (Vite) frontend.

**Architecture:**
- Backend: Flask REST API with SQLAlchemy ORM, JWT authentication
- Database: Flexible - MySQL/SQLite via environment config
- Frontend: React SPA with React Router, Axios, TailwindCSS
- Two UIs exist:
  - Legacy Flask-rendered UI at GET / using templates/ and static/
  - Modern React SPA under src/ (dev on port 3000, built to dist/)
- Backend API namespaced under /admin, proxied from Vite dev server

## Common Commands

**Quick Start (Windows):**
```powershell path=null start=null
start_servers.bat
```
Starts both Flask backend and React frontend in separate terminal windows.

**Backend (Flask):**
```powershell path=null start=null
# Install dependencies
pip install -r requirements.txt

# Run API server (http://localhost:5000)
python app.py
```

**Frontend (Vite + React):**
```powershell path=null start=null
# Install dependencies
npm install

# Dev server (http://localhost:3000) - proxies /admin → http://localhost:5000
npm run dev

# Build for production (outputs to dist/)
npm run build

# Preview production build
npm run preview
```

**Testing & Linting:**
- No test runner or linter currently configured

## High-Level Architecture

**Backend (Flask - app.py):**
- Database Configuration (environment-based with fallbacks):
  1. Reads DATABASE_URL from .env (e.g., mysql+pymysql://user:pass@host:3306/db)
  2. Falls back to composed MYSQL_* variables (MYSQL_USER, MYSQL_PASSWORD, MYSQL_HOST, MYSQL_PORT, MYSQL_DB)
  3. Final fallback: SQLite at ./attendance.db
- CORS enabled for http://localhost:3000
- JWT authentication via Flask-JWT-Extended (24h access tokens)
- Connection pooling with pre-ping and 300s recycle
- **Database Models**: Admin, Department, Employee, Attendance, Leave, Holiday, FileStorage, AuditLog
- **Authentication**: POST /admin/login returns JWT; protected endpoints use @jwt_required()
- **Database Initialization**: Tables created automatically on startup; seeds default admin user, "General" department, and current year's holidays
- **API Endpoints** (all under /admin):
  - **Auth**: POST /admin/login, GET /admin/test-token
  - **Employees**: GET/POST /admin/employees, PUT/DELETE /admin/employees/<id>
  - **Departments**: GET/POST /admin/departments, PUT/DELETE /admin/departments/<id>
  - **Attendance**:
    - POST /admin/attendance (single record)
    - POST /admin/attendance/bulk (batch marking)
    - GET /admin/attendance/report?date=YYYY-MM-DD
    - GET /admin/attendance/overview
    - GET /admin/attendance/validate
    - DELETE /admin/attendance/* (by employee/date or month)
    - GET /admin/attendance/export (Excel)
    - GET /admin/attendance/export-pdf (PDF)
  - **Leaves**: GET/POST /admin/leaves, POST /admin/leaves/<id>/approve
  - **Holidays**: GET/POST/PUT/DELETE /admin/holidays
  - **Files**: GET /admin/files, GET /admin/files/<id>
- **Helper Functions**:
  - `log_audit_action()`: Logs user actions with IP, user agent, old/new values
  - `save_file_to_db()`: Persists generated reports as binary in FileStorage table

**Frontend (React + Vite):**
- **Structure**: src/ with pages/, components/, contexts/
  - Pages: Dashboard, Employees, Departments, Attendance, AttendanceOverview, Reports, LeaveOvertime
- **State Management**:
  - `AuthContext`: JWT persistence in localStorage, sets axios Authorization header, verifies tokens via /admin/test-token
  - `AttendanceContext`: Client-side attendance cache by month/date, provides helpers for marking attendance
- **Networking**:
  - Axios configured to call /admin/* endpoints
  - Vite dev server proxies /admin → http://localhost:5000
  - ⚠️ **Known Issue**: Some AttendanceContext code may call /api/admin/... (incorrect); should be /admin/... to match proxy
- **Styling**: TailwindCSS with PostCSS, custom components, Framer Motion animations

**Legacy UI:**
- Flask-rendered template at GET / (templates/index.html)
- Uses static/script.js and static/style.css
- Calls same /admin API endpoints as React app
- Can be accessed at http://localhost:5000 when Flask is running

## Development Workflow

**Option 1: Automated (Windows)**
```powershell path=null start=null
start_servers.bat
```

**Option 2: Manual (run in separate terminals)**
```powershell path=null start=null
# Terminal 1: Flask backend
python app.py

# Terminal 2: React frontend
npm run dev
```

**Access Points:**
- React SPA: http://localhost:3000 (proxies API calls)
- Flask API: http://localhost:5000 (CORS enabled)
- Legacy UI: http://localhost:5000/ (Flask template)

**Default Credentials:**
- Username: `admin`
- Password: `admin123`

## Environment Configuration

Create a `.env` file in the project root for database configuration:

```env path=null start=null
# Option 1: Full database URL
DATABASE_URL=mysql+pymysql://user:password@localhost:3306/attendance_system

# Option 2: Individual MySQL variables
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DB=attendance_system

# Option 3: SQLite (default if neither above is set)
SQLITE_URL=sqlite:///attendance.db
```

**Database Setup:**
- Tables are auto-created on first run via SQLAlchemy
- Default data seeded: admin user (admin/admin123), "General" department, current year holidays
- For MySQL: create database manually first: `CREATE DATABASE attendance_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
- For SQLite: no manual setup needed, file created automatically

## Important Notes

- **Security**: Change JWT_SECRET_KEY and SECRET_KEY in app.py for production. Change default admin password after first login.
- **Database fallback**: If no .env file exists, app falls back to SQLite (./attendance.db)
- **Frontend builds**: dist/ contains production build but Flask doesn't serve it; use Vite dev server or configure Flask to serve static files
- **API path bug**: If frontend requests fail, check that code uses /admin/* not /api/admin/* (vite.config.js only proxies /admin)
