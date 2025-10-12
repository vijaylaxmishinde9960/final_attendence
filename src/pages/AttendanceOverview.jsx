import React, { useState, useEffect } from 'react'
import { 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  FileText,
  Search,
  Users,
  CheckCircle,
  Clock,
  XCircle,
  Leaf,
  Zap,
  ArrowLeft
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'

const attendanceStatuses = {
  present: { 
    label: 'Present', 
    short: '✅', 
    color: 'bg-green-500'
  },
  half_day: { 
    label: 'Half Day', 
    short: '🌗', 
    color: 'bg-yellow-500'
  },
  absent: { 
    label: 'Absent', 
    short: '❌', 
    color: 'bg-red-500'
  },
  leave: { 
    label: 'Leave', 
    short: '🌴', 
    color: 'bg-blue-500'
  },
  overtime: { 
    label: 'Overtime', 
    short: '⏰', 
    color: 'bg-purple-500'
  }
}

export default function AttendanceOverview() {
  const navigate = useNavigate()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [employees, setEmployees] = useState([])
  const [attendanceData, setAttendanceData] = useState({})
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('')
  const [selectedCell, setSelectedCell] = useState(null)
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)
  const [departments, setDepartments] = useState([])

  useEffect(() => {
    fetchEmployees()
  }, [])

  useEffect(() => {
    if (employees.length > 0) {
      fetchAttendanceData()
    }
  }, [employees, currentMonth])

  const fetchEmployees = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/admin/employees')
      setEmployees(response.data || [])
      
      // Extract unique departments
      const uniqueDepartments = [...new Set(response.data.map(emp => emp.department).filter(Boolean))]
      setDepartments(uniqueDepartments)
      
    } catch (error) {
      console.error('Failed to fetch employees:', error)
      toast.error('Failed to fetch employees')
      // Set mock data for testing
      setEmployees([
        { id: 1, name: 'John Doe', email: 'john@example.com', department: 'Engineering' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', department: 'Marketing' },
        { id: 3, name: 'Bob Johnson', email: 'bob@example.com', department: 'Sales' }
      ])
    } finally {
      setLoading(false)
    }
  }

  const fetchAttendanceData = async () => {
    try {
      const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
        .toISOString().split('T')[0]
      
      // Use the new attendance overview endpoint for better performance
      const response = await axios.get(`/admin/attendance/overview?date=${startDate}`)
      
      if (response.data && response.data.attendance_data) {
        setAttendanceData(response.data.attendance_data)
        
        // Update employees list if needed
        if (response.data.employees && response.data.employees.length > 0) {
          setEmployees(response.data.employees)
        }
      } else {
        setAttendanceData({})
      }
    } catch (error) {
      console.error('Failed to fetch attendance data:', error)
      setAttendanceData({})
      
      // Fall back to fetching employees separately if overview fails
      if (employees.length === 0) {
        fetchEmployees()
      }
    }
  }

  const markAttendance = async (employeeId, date, status) => {
    try {
      const dateString = date.toISOString().split('T')[0]
      
      // Call backend API to mark attendance
      await axios.post('/admin/attendance', {
        employee_id: employeeId,
        date: dateString,
        status: status
      })
      
      // Update local state after successful API call
      setAttendanceData(prev => ({
        ...prev,
        [employeeId]: {
          ...prev[employeeId],
          [dateString]: status
        }
      }))
      
      const employee = employees.find(emp => emp.id === employeeId)
      toast.success(`${attendanceStatuses[status].label} marked for ${employee?.name} on ${date.toLocaleDateString()}`)
      
      setShowStatusDropdown(false)
      setSelectedCell(null)
      
    } catch (error) {
      console.error('Failed to mark attendance:', error)
      toast.error('Failed to mark attendance. Please try again.')
      
      // Revert local state change if API call failed
      fetchAttendanceData()
    }
  }

  const navigateMonth = (direction) => {
    const newMonth = new Date(currentMonth)
    if (direction === 'next') {
      newMonth.setMonth(newMonth.getMonth() + 1)
    } else {
      newMonth.setMonth(newMonth.getMonth() - 1)
    }
    setCurrentMonth(newMonth)
  }

  const handleCellClick = (employeeId, date, event) => {
    event.stopPropagation()
    
    // Don't allow marking on weekends
    const isWeekend = date.getDay() === 0 || date.getDay() === 6
    if (isWeekend) {
      return
    }
    
    setSelectedCell({ employeeId, date })
    setShowStatusDropdown(true)
  }

  const getAttendanceStatus = (employeeId, date) => {
    const dateString = date.toISOString().split('T')[0]
    return attendanceData[employeeId]?.[dateString] || null
  }

  const getEmployeeStats = (employeeId) => {
    const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate()
    
    const stats = {
      present: 0,
      half_day: 0,
      absent: 0,
      leave: 0,
      overtime: 0
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
      const status = getAttendanceStatus(employeeId, date)
      if (status && stats.hasOwnProperty(status)) {
        stats[status]++
      }
    }

    return stats
  }

  const exportToPDF = async () => {
    try {
      const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
        .toISOString().split('T')[0]
      
      const response = await axios.get(`/admin/attendance/export-pdf?date=${startDate}`, {
        responseType: 'blob'
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `attendance_overview_${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      toast.success('PDF report downloaded successfully!')
    } catch (error) {
      console.error('PDF Export error:', error)
      toast.error('Failed to export PDF report. Please try again.')
    }
  }

  const exportToExcel = async () => {
    try {
      const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
        .toISOString().split('T')[0]
      
      const response = await axios.get(`/admin/attendance/export?date=${startDate}`, {
        responseType: 'blob'
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `attendance_overview_${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      toast.success('Excel report downloaded successfully!')
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export Excel report. Please try again.')
    }
  }

  // Filter employees based on search and department
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDepartment = !departmentFilter || employee.department === departmentFilter
    return matchesSearch && matchesDepartment
  })

  // Generate calendar days for the current month
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate()
  const calendarDays = []
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day))
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </button>
        </div>
        <div className="card animate-pulse">
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Dashboard</span>
        </button>
      </div>

      {/* Title */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance Overview</h1>
          <p className="text-gray-600">Manage attendance for all employees in one view</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold text-gray-900 min-w-[140px] text-center">
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={exportToPDF}
              className="btn-secondary flex items-center space-x-2"
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">PDF</span>
            </button>
            <button
              onClick={exportToExcel}
              className="btn-primary flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Excel</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <div className="sm:w-48">
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="input-field"
            >
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="card" style={{ maxWidth: '100vw', overflowX: 'visible' }}>
        <div className="mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Monthly Attendance Grid</h3>
              <p className="text-sm text-gray-600">Click on any date to mark attendance. Weekends are disabled.</p>
            </div>
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 rounded bg-green-500"></div>
                <span>Present</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 rounded bg-yellow-500"></div>
                <span>Half Day</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 rounded bg-red-500"></div>
                <span>Absent</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 rounded bg-blue-500"></div>
                <span>Leave</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 rounded bg-purple-500"></div>
                <span>Overtime</span>
              </div>
            </div>
          </div>
          
          {/* Scroll hint */}
          <div className="mt-2 flex items-center space-x-2 text-xs text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            <span>Scroll horizontally within the table to view dates beyond the 16th</span>
          </div>
        </div>
        
        {/* Horizontally Scrollable Table Container - Shows 16 dates initially */}
        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
          <div 
            className="overflow-x-auto overflow-y-auto attendance-scroll smooth-scroll" 
            style={{ 
              maxHeight: '600px', 
              width: `min(${200 + 120 + (16 * 60)}px, calc(100vw - 96px))`, // Shows 16 dates or available width
              backgroundColor: 'white'
            }}
          >
            <table className="border-collapse" style={{ width: 'max-content', tableLayout: 'fixed' }}>
              {/* Header */}
              <thead className="bg-gray-50 sticky top-0 z-20">
                <tr>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-30 border-r border-gray-200" 
                    style={{ width: '200px', minWidth: '200px', maxWidth: '200px', boxShadow: '2px 0 4px rgba(0,0,0,0.1)' }}
                  >
                    Employee
                  </th>
                  <th 
                    className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-[200px] bg-gray-50 z-30 border-r border-gray-200" 
                    style={{ width: '120px', minWidth: '120px', maxWidth: '120px', boxShadow: '2px 0 4px rgba(0,0,0,0.1)' }}
                  >
                    Stats
                  </th>
                  {calendarDays.map(day => (
                    <th 
                      key={day.toISOString()} 
                      className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-100"
                      style={{ width: '60px', minWidth: '60px', maxWidth: '60px' }}
                    >
                      <div className="flex flex-col items-center">
                        <span className="font-semibold text-gray-700">{day.getDate()}</span>
                        <span className="text-[9px] text-gray-400 mt-0.5">
                          {day.toLocaleDateString('en-US', { weekday: 'short' })}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              
              {/* Body */}
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredEmployees.map((employee, rowIndex) => {
                  const stats = getEmployeeStats(employee.id)
                  
                  return (
                    <tr key={employee.id} className={`hover:bg-gray-50 transition-colors duration-150 ${rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                      {/* Employee Info - Sticky Left */}
                      <td 
                        className="px-4 py-3 sticky left-0 border-r border-gray-200 z-20" 
                        style={{ 
                          width: '200px', 
                          minWidth: '200px', 
                          maxWidth: '200px',
                          backgroundColor: rowIndex % 2 === 0 ? '#ffffff' : '#f9fafb',
                          boxShadow: '2px 0 4px rgba(0,0,0,0.1)'
                        }}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <Users className="w-4 h-4 text-white" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 truncate">{employee.name}</p>
                            <p className="text-xs text-gray-500 truncate">{employee.email}</p>
                            {employee.department && (
                              <p className="text-xs text-gray-400 truncate">{employee.department}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      
                      {/* Stats - Sticky Left */}
                      <td 
                        className="px-2 py-3 sticky left-[200px] border-r border-gray-200 z-20" 
                        style={{ 
                          width: '120px', 
                          minWidth: '120px', 
                          maxWidth: '120px',
                          backgroundColor: rowIndex % 2 === 0 ? '#ffffff' : '#f9fafb',
                          boxShadow: '2px 0 4px rgba(0,0,0,0.1)'
                        }}
                      >
                        <div className="grid grid-cols-2 gap-1 text-xs">
                          <div className="flex items-center space-x-1" title="Present Days">
                            <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                            <span className="font-medium">{stats.present}</span>
                          </div>
                          <div className="flex items-center space-x-1" title="Half Days">
                            <Clock className="w-3 h-3 text-yellow-500 flex-shrink-0" />
                            <span className="font-medium">{stats.half_day}</span>
                          </div>
                          <div className="flex items-center space-x-1" title="Absent Days">
                            <XCircle className="w-3 h-3 text-red-500 flex-shrink-0" />
                            <span className="font-medium">{stats.absent}</span>
                          </div>
                          <div className="flex items-center space-x-1" title="Leave Days">
                            <Leaf className="w-3 h-3 text-blue-500 flex-shrink-0" />
                            <span className="font-medium">{stats.leave}</span>
                          </div>
                          <div className="flex items-center space-x-1 col-span-2" title="Overtime Days">
                            <Zap className="w-3 h-3 text-purple-500 flex-shrink-0" />
                            <span className="font-medium">{stats.overtime}</span>
                          </div>
                        </div>
                      </td>
                      
                      {/* Calendar Days - Scrollable horizontally */}
                      {calendarDays.map(day => {
                        const status = getAttendanceStatus(employee.id, day)
                        const isSelected = selectedCell?.employeeId === employee.id && 
                                         selectedCell?.date.toDateString() === day.toDateString()
                        const isToday = day.toDateString() === new Date().toDateString()
                        const isWeekend = day.getDay() === 0 || day.getDay() === 6
                        
                        return (
                          <td 
                            key={day.toISOString()} 
                            className={`px-2 py-3 text-center border-r border-gray-100 ${isWeekend ? 'bg-gray-50' : ''}`}
                            style={{ width: '60px', minWidth: '60px', maxWidth: '60px' }}
                          >
                            <button
                              onClick={(e) => handleCellClick(employee.id, day, e)}
                              className={`
                                w-9 h-9 rounded-lg text-xs font-medium transition-all duration-200 hover:scale-105 hover:shadow-md relative
                                ${status 
                                  ? `${attendanceStatuses[status].color} text-white shadow-sm` 
                                  : isToday 
                                    ? 'bg-primary-100 text-primary-700 border-2 border-primary-400 shadow-sm' 
                                    : isWeekend
                                      ? 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                                }
                                ${isSelected ? 'ring-2 ring-primary-500 ring-offset-1' : ''}
                                ${isWeekend ? 'cursor-default' : 'cursor-pointer'}
                              `}
                              title={
                                isWeekend 
                                  ? `${day.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })} - Weekend`
                                  : status 
                                    ? `${attendanceStatuses[status].label} - ${day.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}`
                                    : isToday 
                                      ? `Today - ${day.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} - Click to mark attendance`
                                      : `${day.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} - Click to mark attendance`
                              }
                              disabled={isWeekend}
                            >
                              {status ? (
                                <span className="text-lg">{attendanceStatuses[status].short}</span>
                              ) : (
                                <span className={`${isToday ? 'font-bold' : ''}`}>{day.getDate()}</span>
                              )}
                              {isToday && !status && (
                                <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary-500 rounded-full"></div>
                              )}
                            </button>
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-800">Total Present</p>
                <p className="text-lg font-bold text-green-900">{filteredEmployees.reduce((sum, emp) => sum + getEmployeeStats(emp.id).present, 0)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                <XCircle className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-red-800">Total Absent</p>
                <p className="text-lg font-bold text-red-900">{filteredEmployees.reduce((sum, emp) => sum + getEmployeeStats(emp.id).absent, 0)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                <Clock className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-yellow-800">Half Days</p>
                <p className="text-lg font-bold text-yellow-900">{filteredEmployees.reduce((sum, emp) => sum + getEmployeeStats(emp.id).half_day, 0)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <Leaf className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-800">On Leave</p>
                <p className="text-lg font-bold text-blue-900">{filteredEmployees.reduce((sum, emp) => sum + getEmployeeStats(emp.id).leave, 0)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
