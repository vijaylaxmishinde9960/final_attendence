# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

Project overview
- Full-stack app: Flask backend (MySQL, JWT) and a React (Vite) dashboard frontend.
- Two UIs exist:
  - Legacy Flask-rendered UI at GET / using templates/ and static/.
  - Modern React SPA under src/ built/served by Vite (dev on port 3000).
- Backend API is namespaced under /admin and is proxied from the Vite dev server.

Common commands
- Backend (Flask)
  - Install deps
    ```powershell path=null start=null
    pip install -r requirements.txt
    ```
  - Run API server (default: http://localhost:5000)
    ```powershell path=null start=null
    python app.py
    ```
  - Optional launcher (tries to run a missing setup script; use app.py directly if this fails)
    ```powershell path=null start=null
    python run.py
    ```

- Frontend (Vite + React)
  - Install deps
    ```powershell path=null start=null
    npm install
    ```
  - Dev server (http://localhost:3000). Proxies /admin → http://localhost:5000
    ```powershell path=null start=null
    npm run dev
    ```
  - Build (outputs to dist/)
    ```powershell path=null start=null
    npm run build
    ```
  - Preview build locally
    ```powershell path=null start=null
    npm run preview
    ```

- Linting & tests
  - No JavaScript test runner or linter is configured in this repo.

High-level architecture
- Backend (Flask)
  - Entrypoint: app.py. Configures:
    - CORS for http://localhost:3000.
    - SQLAlchemy connection via SQLALCHEMY_DATABASE_URI (MySQL).
    - JWT via Flask-JWT-Extended with 24h access tokens.
  - Data model (SQLAlchemy): Admin, Department, Employee, Attendance, Leave, Holiday, FileStorage, AuditLog.
  - Auth: POST /admin/login returns a JWT. Protected endpoints use @jwt_required().
  - API surface under /admin:
    - Employees CRUD: /admin/employees, /admin/employees/<id>
    - Attendance:
      - POST /admin/attendance (single)
      - POST /admin/attendance/bulk
      - GET /admin/attendance/report?date=YYYY-MM-DD
      - GET /admin/attendance/overview
      - GET /admin/attendance/validate
      - DELETE endpoints to remove records by employee/date or by date/month
      - Export: GET /admin/attendance/export (Excel), GET /admin/attendance/export-pdf (PDF)
    - Departments CRUD: /admin/departments
    - Leaves approval: /admin/leaves, /admin/leaves/<id>/approve
    - Holidays CRUD: /admin/holidays
    - Files: list/download under /admin/files
    - Token check: GET /admin/test-token
  - Startup behavior:
    - Creates tables on boot.
    - Ensures a default admin user, a "General" department, and year-based default holidays.
  - Auditing & files:
    - log_audit_action(...) captures user actions with metadata.
    - save_file_to_db(...) persists generated reports (binary) into FileStorage.

- Frontend (React + Vite)
  - Location: src/ with Router-based pages (Dashboard, Employees, Departments, Attendance, AttendanceOverview, Reports, LeaveOvertime).
  - State/context:
    - AuthContext: persists JWT in localStorage, sets axios Authorization header, verifies with /admin/test-token.
    - AttendanceContext: client-side month/status cache and helpers.
  - Networking:
    - axios calls to /admin/* are proxied to the Flask server per vite.config.js.
    - Note: AttendanceContext currently calls /api/admin/... which will not match vite.config.js proxy or backend routes; calls should use /admin/... to work with the proxy and server.
  - Vite dev server proxy (vite.config.js):
    - Proxies /admin → http://localhost:5000.

- Legacy Flask-rendered UI
  - GET / returns templates/index.html, which uses static/script.js and static/style.css to operate against /admin APIs.
  - Exists alongside the React SPA; during development you typically run the Flask API and the Vite dev server separately.

Development workflow
- Run backend and frontend concurrently in separate panes:
  ```powershell path=null start=null
  # Pane 1: Flask API
  pip install -r requirements.txt
  python app.py
  ```
  ```powershell path=null start=null
  # Pane 2: React dev server
  npm install
  npm run dev
  ```
- Access points:
  - API: http://localhost:5000 (CORS enabled for the SPA).
  - React SPA (dev): http://localhost:3000 (uses axios to call /admin/* via proxy).
  - Legacy UI: http://localhost:5000/ (server-rendered template).

Repository-specific notes
- README highlights MySQL usage and mentions a setup_database.py script; that script is not present here. Create the database manually to match SQLALCHEMY_DATABASE_URI in app.py, or add that setup script if desired.
- Database credentials are configured directly in app.py; update them there (and restart) if your local MySQL differs.
- The dist/ directory contains a built SPA; Flask does not serve it by default. Use npm run dev for SPA development, or deploy dist/ via a static host or Flask blueprint if desired.
- No CLAUDE.md, Cursor rules, or GitHub Copilot instruction files were found in this repository.
