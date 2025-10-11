# React Attendance Management System Setup

This is a modern React-based attendance management system with a beautiful UI and comprehensive features.

## 🚀 Features

- **Modern Dashboard** with real-time statistics and charts
- **Employee Management** with detailed profiles
- **Interactive Calendar** for attendance tracking
- **Monthly Reports** with export functionality
- **Leave & Overtime Management** with approval workflows
- **Responsive Design** that works on all devices
- **Real-time Updates** and notifications

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Your existing Flask backend running on port 5000

## 🛠️ Installation

1. **Navigate to the React project directory:**
   ```bash
   cd attendence_management
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser and visit:**
   ```
   http://localhost:3000
   ```

## 🔧 Configuration

The React app is configured to proxy API requests to your Flask backend running on port 5000. Make sure your Flask server is running before starting the React app.

## 📱 Pages Overview

### 🏠 Dashboard
- Real-time statistics cards
- Attendance trends with charts
- Department distribution
- Recent activity feed

### 👥 Employees
- Employee list with search functionality
- Detailed employee profiles
- Add/Edit/Delete employees
- Quick stats for each employee

### 📅 Attendance
- Interactive monthly calendar
- Multiple attendance statuses (Present, Absent, Half Day, Leave, Overtime)
- Bulk attendance marking
- Employee selection and filtering

### 📊 Monthly Reports
- Detailed attendance reports per employee
- Visual charts and analytics
- Export to PDF and Excel
- Performance indicators

### 🕒 Leave & Overtime
- Leave request management
- Overtime tracking
- Approval/rejection workflows
- Status filtering and management

## 🎨 UI Features

- **Glassmorphism Design** with modern aesthetics
- **Smooth Animations** and transitions
- **Responsive Layout** for all screen sizes
- **Interactive Components** with hover effects
- **Loading States** and skeleton screens
- **Toast Notifications** for user feedback

## 🔗 Backend Integration

The React app connects to your existing Flask backend through the following API endpoints:

- `GET /api/admin/employees` - Fetch all employees
- `POST /api/admin/employees` - Add new employee
- `PUT /api/admin/employees/:id` - Update employee
- `DELETE /api/admin/employees/:id` - Delete employee
- `GET /api/admin/attendance/report` - Get attendance report
- `POST /api/admin/attendance` - Mark attendance
- `GET /api/admin/attendance/export` - Export attendance data

## 📦 Build for Production

To create a production build:

```bash
npm run build
```

The built files will be in the `dist` directory.

## 🚀 Deployment

1. Build the React app: `npm run build`
2. Serve the `dist` directory with your web server
3. Configure your Flask backend to serve the static files from the React build

## 🎯 Key Improvements Over Original

1. **Modern React Architecture** with hooks and context
2. **Beautiful UI/UX** with Tailwind CSS and animations
3. **Interactive Calendar** for better attendance visualization
4. **Comprehensive Reports** with charts and export options
5. **Leave & Overtime Management** with approval workflows
6. **Real-time Updates** and better state management
7. **Responsive Design** for mobile and desktop
8. **Professional Dashboard** with statistics and trends

## 🔧 Customization

You can easily customize:
- Colors and themes in `tailwind.config.js`
- API endpoints in the components
- Chart configurations in the dashboard
- Form validation and styling
- Animation timings and effects

## 📞 Support

If you encounter any issues:
1. Check that your Flask backend is running on port 5000
2. Verify all dependencies are installed correctly
3. Check the browser console for any errors
4. Ensure your backend API endpoints are working correctly

Enjoy your new modern attendance management system! 🎉

