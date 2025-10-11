// Global variables
let authToken = localStorage.getItem('authToken');
let employees = [];
let currentDate = new Date().toISOString().split('T')[0];

// DOM elements
const loginSection = document.getElementById('loginSection');
const dashboardSection = document.getElementById('dashboardSection');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const employeesList = document.getElementById('employeesList');
const attendanceDate = document.getElementById('attendanceDate');
const addEmployeeModal = document.getElementById('addEmployeeModal');
const addEmployeeForm = document.getElementById('addEmployeeForm');
const reportModal = document.getElementById('reportModal');
const reportSummary = document.getElementById('reportSummary');
const reportTableBody = document.getElementById('reportTableBody');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Set today's date as default
    attendanceDate.value = currentDate;
    
    // Check if user is already logged in
    if (authToken) {
        showDashboard();
        loadEmployees();
    } else {
        showLogin();
    }
    
    // Event listeners
    setupEventListeners();
});

function setupEventListeners() {
    // Login form
    loginForm.addEventListener('submit', handleLogin);
    
    // Dashboard buttons
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    document.getElementById('addEmployeeBtn').addEventListener('click', showAddEmployeeModal);
    document.getElementById('generateReportBtn').addEventListener('click', generateReport);
    document.getElementById('exportExcelBtn').addEventListener('click', exportToExcel);
    document.getElementById('markAllPresentBtn').addEventListener('click', markAllPresent);
    document.getElementById('markAllAbsentBtn').addEventListener('click', markAllAbsent);
    document.getElementById('saveAttendanceBtn').addEventListener('click', saveAttendance);
    
    // Date change
    attendanceDate.addEventListener('change', function() {
        currentDate = this.value;
        loadEmployees();
    });
    
    // Modal close buttons
    document.getElementById('closeAddModal').addEventListener('click', hideAddEmployeeModal);
    document.getElementById('closeReportModal').addEventListener('click', hideReportModal);
    document.getElementById('cancelAddEmployee').addEventListener('click', hideAddEmployeeModal);
    document.getElementById('closeNotification').addEventListener('click', hideMessage);
    
    // Add employee form
    addEmployeeForm.addEventListener('submit', handleAddEmployee);
    
    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === addEmployeeModal) {
            hideAddEmployeeModal();
        }
        if (event.target === reportModal) {
            hideReportModal();
        }
    });
}

// Authentication functions
async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    try {
        const response = await fetch('/admin/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            authToken = data.access_token;
            localStorage.setItem('authToken', authToken);
            showDashboard();
            loadEmployees();
            showMessage('Login successful!', 'success');
        } else {
            showMessage(data.message || 'Login failed', 'error');
        }
    } catch (error) {
        showMessage('Network error. Please try again.', 'error');
    }
}

function handleLogout() {
    authToken = null;
    localStorage.removeItem('authToken');
    showLogin();
    showMessage('Logged out successfully', 'success');
}

function showLogin() {
    loginSection.classList.remove('hidden');
    dashboardSection.classList.add('hidden');
    loginForm.reset();
    hideMessage();
}

function showDashboard() {
    loginSection.classList.add('hidden');
    dashboardSection.classList.remove('hidden');
}

// Employee management functions
async function loadEmployees() {
    try {
        const response = await fetch('/admin/employees', {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            employees = await response.json();
            renderEmployees();
        } else if (response.status === 401) {
            handleLogout();
        } else {
            showMessage('Failed to load employees', 'error');
        }
    } catch (error) {
        showMessage('Network error loading employees', 'error');
    }
}

function renderEmployees() {
    employeesList.innerHTML = '';
    
    if (employees.length === 0) {
        employeesList.innerHTML = '<div class="no-employees"><p>No employees found. Add some employees to get started.</p></div>';
        updateStats();
        return;
    }
    
    // Show loading skeleton first
    showLoadingSkeleton();
    
    // Simulate loading delay for better UX
    setTimeout(() => {
        employeesList.innerHTML = '';
        employees.forEach(employee => {
            const employeeCard = createEmployeeCard(employee);
            employeesList.appendChild(employeeCard);
        });
        updateStats();
    }, 500);
}

function showLoadingSkeleton() {
    const skeletonHTML = Array(6).fill(0).map(() => `
        <div class="employee-card skeleton-card">
            <div class="skeleton skeleton-text" style="height: 1.3rem; width: 60%; margin-bottom: 12px;"></div>
            <div class="skeleton skeleton-text" style="height: 1rem; width: 80%; margin-bottom: 18px;"></div>
            <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                <div class="skeleton" style="height: 2rem; width: 60px;"></div>
                <div class="skeleton" style="height: 2rem; width: 60px;"></div>
            </div>
            <div style="display: flex; gap: 10px;">
                <div class="skeleton" style="height: 2.5rem; flex: 1;"></div>
                <div class="skeleton" style="height: 2.5rem; flex: 1;"></div>
            </div>
        </div>
    `).join('');
    
    employeesList.innerHTML = skeletonHTML;
}

function updateStats() {
    const totalEmployees = employees.length;
    const presentToday = document.querySelectorAll('.status-btn.present.active').length;
    const absentToday = document.querySelectorAll('.status-btn.absent.active').length;
    const attendanceRate = totalEmployees > 0 ? Math.round((presentToday / totalEmployees) * 100) : 0;
    
    // Animate numbers
    animateNumber(document.getElementById('totalEmployees'), totalEmployees);
    animateNumber(document.getElementById('presentToday'), presentToday);
    animateNumber(document.getElementById('absentToday'), absentToday);
    animateNumber(document.getElementById('attendanceRate'), attendanceRate, '%');
}

function animateNumber(element, targetValue, suffix = '') {
    const startValue = 0;
    const duration = 1000;
    const startTime = performance.now();
    
    function updateNumber(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Use easing function for smooth animation
        const easeOutCubic = 1 - Math.pow(1 - progress, 3);
        const currentValue = Math.round(startValue + (targetValue - startValue) * easeOutCubic);
        
        element.textContent = currentValue + suffix;
        
        if (progress < 1) {
            requestAnimationFrame(updateNumber);
        }
    }
    
    requestAnimationFrame(updateNumber);
}

function createEmployeeCard(employee) {
    const card = document.createElement('div');
    card.className = 'employee-card';
    card.dataset.employeeId = employee.id;
    
    card.innerHTML = `
        <h3>${employee.name}</h3>
        <p><i class="fas fa-envelope"></i> ${employee.email}</p>
        <div class="employee-actions">
            <button class="btn btn-secondary" onclick="editEmployee(${employee.id})">
                <i class="fas fa-edit"></i> Edit
            </button>
            <button class="btn btn-danger" onclick="deleteEmployee(${employee.id})">
                <i class="fas fa-trash"></i> Delete
            </button>
        </div>
        <div class="attendance-status">
            <button class="status-btn present" onclick="markStatus(${employee.id}, 'present')">
                <i class="fas fa-check"></i> Present
            </button>
            <button class="status-btn absent" onclick="markStatus(${employee.id}, 'absent')">
                <i class="fas fa-times"></i> Absent
            </button>
        </div>
    `;
    
    return card;
}

function markStatus(employeeId, status) {
    const card = document.querySelector(`[data-employee-id="${employeeId}"]`);
    const presentBtn = card.querySelector('.status-btn.present');
    const absentBtn = card.querySelector('.status-btn.absent');
    
    // Update button states
    presentBtn.classList.toggle('active', status === 'present');
    absentBtn.classList.toggle('active', status === 'absent');
    
    // Store the status in the card data
    card.dataset.attendanceStatus = status;
    
    // Update stats
    updateStats();
}

async function markAllPresent() {
    const cards = document.querySelectorAll('.employee-card');
    cards.forEach(card => {
        markStatus(parseInt(card.dataset.employeeId), 'present');
    });
    showMessage('All employees marked as present', 'success');
}

async function markAllAbsent() {
    const cards = document.querySelectorAll('.employee-card');
    cards.forEach(card => {
        markStatus(parseInt(card.dataset.employeeId), 'absent');
    });
    showMessage('All employees marked as absent', 'success');
}

async function saveAttendance() {
    const attendanceData = [];
    const cards = document.querySelectorAll('.employee-card');
    
    cards.forEach(card => {
        const employeeId = parseInt(card.dataset.employeeId);
        const status = card.dataset.attendanceStatus;
        
        if (status) {
            attendanceData.push({
                employee_id: employeeId,
                status: status
            });
        }
    });
    
    if (attendanceData.length === 0) {
        showMessage('Please mark attendance for at least one employee', 'error');
        return;
    }
    
    try {
        const response = await fetch('/admin/attendance/bulk', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                attendance_data: attendanceData,
                date: currentDate
            })
        });
        
        if (response.ok) {
            showMessage('Attendance saved successfully!', 'success');
        } else if (response.status === 401) {
            handleLogout();
        } else {
            const data = await response.json();
            showMessage(data.message || 'Failed to save attendance', 'error');
        }
    } catch (error) {
        showMessage('Network error saving attendance', 'error');
    }
}

// Employee CRUD functions
function showAddEmployeeModal() {
    addEmployeeModal.classList.remove('hidden');
    addEmployeeForm.reset();
}

function hideAddEmployeeModal() {
    addEmployeeModal.classList.add('hidden');
}

async function handleAddEmployee(e) {
    e.preventDefault();
    
    const formData = new FormData(addEmployeeForm);
    const employeeData = {
        name: formData.get('name'),
        email: formData.get('email')
    };
    
    try {
        const response = await fetch('/admin/employees', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(employeeData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showMessage('Employee added successfully!', 'success');
            hideAddEmployeeModal();
            loadEmployees();
        } else if (response.status === 401) {
            handleLogout();
        } else {
            showMessage(data.message || 'Failed to add employee', 'error');
        }
    } catch (error) {
        showMessage('Network error adding employee', 'error');
    }
}

async function editEmployee(employeeId) {
    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee) return;
    
    const newName = prompt('Enter new name:', employee.name);
    if (newName === null) return;
    
    const newEmail = prompt('Enter new email:', employee.email);
    if (newEmail === null) return;
    
    try {
        const response = await fetch(`/admin/employees/${employeeId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                name: newName,
                email: newEmail
            })
        });
        
        if (response.ok) {
            showMessage('Employee updated successfully!', 'success');
            loadEmployees();
        } else if (response.status === 401) {
            handleLogout();
        } else {
            const data = await response.json();
            showMessage(data.message || 'Failed to update employee', 'error');
        }
    } catch (error) {
        showMessage('Network error updating employee', 'error');
    }
}

async function deleteEmployee(employeeId) {
    if (!confirm('Are you sure you want to delete this employee?')) return;
    
    try {
        const response = await fetch(`/admin/employees/${employeeId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            showMessage('Employee deleted successfully!', 'success');
            loadEmployees();
        } else if (response.status === 401) {
            handleLogout();
        } else {
            const data = await response.json();
            showMessage(data.message || 'Failed to delete employee', 'error');
        }
    } catch (error) {
        showMessage('Network error deleting employee', 'error');
    }
}

// Report functions
async function generateReport() {
    try {
        const response = await fetch(`/admin/attendance/report?date=${currentDate}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            const reportData = await response.json();
            displayReport(reportData);
            showReportModal();
        } else if (response.status === 401) {
            handleLogout();
        } else {
            showMessage('Failed to generate report', 'error');
        }
    } catch (error) {
        showMessage('Network error generating report', 'error');
    }
}

function displayReport(reportData) {
    // Update summary
    reportSummary.innerHTML = `
        <div class="summary-item">
            <h4>${reportData.total_employees}</h4>
            <p>Total Employees</p>
        </div>
        <div class="summary-item">
            <h4>${reportData.present_count}</h4>
            <p>Present</p>
        </div>
        <div class="summary-item">
            <h4>${reportData.absent_count}</h4>
            <p>Absent</p>
        </div>
        <div class="summary-item">
            <h4>${reportData.not_marked_count}</h4>
            <p>Not Marked</p>
        </div>
    `;
    
    // Update table
    reportTableBody.innerHTML = '';
    reportData.employees.forEach(employee => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${employee.name}</td>
            <td>${employee.email}</td>
            <td><span class="status-badge ${employee.status}">${employee.status.replace('_', ' ')}</span></td>
        `;
        reportTableBody.appendChild(row);
    });
}

function showReportModal() {
    reportModal.classList.remove('hidden');
}

function hideReportModal() {
    reportModal.classList.add('hidden');
}

// Test JWT token
async function testToken() {
    try {
        const response = await fetch('/admin/test-token', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('Token test successful:', data);
            return true;
        } else {
            console.log('Token test failed:', response.status);
            const errorData = await response.json();
            console.log('Token test error:', errorData);
            return false;
        }
    } catch (error) {
        console.error('Token test error:', error);
        return false;
    }
}

// Excel Export functionality
async function exportToExcel() {
    try {
        const selectedDate = document.getElementById('attendanceDate').value;
        if (!authToken) {
            showMessage('Please login first', 'error');
            return;
        }
        
        if (!selectedDate) {
            showMessage('Please select a date first', 'error');
            return;
        }
        
        showMessage('Generating Excel report...', 'info');
        
        // Debug: Log the token
        console.log('Auth token:', authToken);
        console.log('Token length:', authToken ? authToken.length : 'null');
        console.log('Token type:', typeof authToken);
        console.log('Token starts with:', authToken ? authToken.substring(0, 20) + '...' : 'null');
        
        // Test token first
        console.log('Testing token...');
        const tokenValid = await testToken();
        if (!tokenValid) {
            showMessage('Token validation failed. Please login again.', 'error');
            return;
        }
        
        // Create download link
        const url = `/admin/attendance/export?date=${selectedDate}`;
        
        // Add authorization header
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const blob = await response.blob();
            console.log('Response blob type:', blob.type);
            console.log('Response blob size:', blob.size);
            
            // Check if it's actually an Excel file
            if (blob.type.includes('spreadsheet') || blob.type.includes('excel') || blob.type.includes('openxml') || blob.type === 'application/octet-stream') {
                const downloadUrl = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = downloadUrl;
                link.download = `attendance_report_${selectedDate}.xlsx`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(downloadUrl);
                
                showMessage('Excel report downloaded successfully!', 'success');
            } else {
                // If it's not an Excel file, it might be an error response
                const text = await blob.text();
                console.log('Response text:', text);
                try {
                    const errorData = JSON.parse(text);
                    showMessage(errorData.message || errorData.error || 'Failed to export report', 'error');
                } catch {
                    showMessage('Failed to export report - invalid response', 'error');
                }
            }
        } else {
            console.log('Response status:', response.status);
            console.log('Response headers:', response.headers);
            
            let errorMessage = 'Failed to export report';
            try {
                const errorData = await response.json();
                console.log('Error data:', errorData);
                errorMessage = errorData.message || errorData.msg || errorData.error || errorMessage;
            } catch (e) {
                console.log('Could not parse error response as JSON');
                const textResponse = await response.text();
                console.log('Text response:', textResponse);
                errorMessage = textResponse || errorMessage;
            }
            
            showMessage(errorMessage, 'error');
        }
    } catch (error) {
        console.error('Export error:', error);
        showMessage('Failed to export report: ' + error.message, 'error');
    }
}

// Utility functions
function showMessage(message, type) {
    const notification = document.getElementById('notification');
    const messageElement = document.getElementById('notificationMessage');
    
    messageElement.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.remove('hidden');
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        hideMessage();
    }, 5000);
}

function hideMessage() {
    const notification = document.getElementById('notification');
    notification.classList.add('hidden');
}

// Add some CSS for the no-employees message
const style = document.createElement('style');
style.textContent = `
    .no-employees {
        text-align: center;
        padding: 40px;
        color: #666;
        font-size: 1.1rem;
    }
    
    .no-employees p {
        margin: 0;
    }
`;
document.head.appendChild(style);
