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
    label: 'Full Day', 
    short: '✅', 
    color: 'bg-green-500'
  },
  halfday: { 
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
      
      // For now, just set empty attendance data
      setAttendanceData({})
    } catch (error) {
      console.error('Failed to fetch attendance data:', error)
      setAttendanceData({})
    }
  }

  const markAttendance = async (employeeId, date, status) => {
    try {
      // Update local state immediately
      setAttendanceData(prev => ({
        ...prev,
        [employeeId]: {
          ...prev[employeeId],
          [date.toISOString().split('T')[0]]: status
        }
      }))
      
      const employee = employees.find(emp => emp.id === employeeId)
      toast.success(`${attendanceStatuses[status].label} marked for ${employee?.name}`)
      
      setShowStatusDropdown(false)
      setSelectedCell(null)
      
    } catch (error) {
      console.error('Failed to mark attendance:', error)
      toast.error('Failed to mark attendance')
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
      halfday: 0,
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
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            {/* Header */}
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10 min-w-[200px]">
                  Employee
                </th>
                <th className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                  Stats
                </th>
                {calendarDays.slice(0, 10).map(day => (
                  <th key={day.toISOString()} className="px-1 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[40px]">
                    {day.getDate()}
                  </th>
                ))}
              </tr>
            </thead>
            
            {/* Body */}
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEmployees.map((employee) => {
                const stats = getEmployeeStats(employee.id)
                
                return (
                  <tr key={employee.id} className="hover:bg-gray-50">
                    {/* Employee Info */}
                    <td className="px-4 py-4 sticky left-0 bg-white border-r border-gray-200 z-10">
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
                    
                    {/* Stats */}
                    <td className="px-2 py-4">
                      <div className="grid grid-cols-2 gap-1 text-xs">
                        <div className="flex items-center space-x-1">
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          <span>{stats.present}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-yellow-500" />
                          <span>{stats.halfday}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <XCircle className="w-3 h-3 text-red-500" />
                          <span>{stats.absent}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Leaf className="w-3 h-3 text-blue-500" />
                          <span>{stats.leave}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Zap className="w-3 h-3 text-purple-500" />
                          <span>{stats.overtime}</span>
                        </div>
                      </div>
                    </td>
                    
                    {/* Calendar Days - Show only first 10 days for now */}
                    {calendarDays.slice(0, 10).map(day => {
                      const status = getAttendanceStatus(employee.id, day)
                      const isSelected = selectedCell?.employeeId === employee.id && 
                                       selectedCell?.date.toDateString() === day.toDateString()
                      const isToday = day.toDateString() === new Date().toDateString()
                      
                      return (
                        <td key={day.toISOString()} className="px-1 py-2 text-center relative">
                          <button
                            onClick={(e) => handleCellClick(employee.id, day, e)}
                            className={`
                              w-8 h-8 rounded-full text-xs font-medium transition-all duration-200 hover:scale-110
                              ${status 
                                ? `${attendanceStatuses[status].color} text-white` 
                                : isToday 
                                  ? 'bg-primary-100 text-primary-700 border-2 border-primary-300' 
                                  : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                              }
                              ${isSelected ? 'ring-2 ring-primary-500' : ''}
                            `}
                            title={status ? attendanceStatuses[status].label : isToday ? 'Today - Click to mark attendance' : 'Click to mark attendance'}
                          >
                            {status ? attendanceStatuses[status].short : day.getDate()}
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

      {/* Status Dropdown */}
      {showStatusDropdown && selectedCell && (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Mark Attendance
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {employees.find(emp => emp.id === selectedCell.employeeId)?.name} - {selectedCell.date.toLocaleDateString()}
            </p>
            
            <div className="space-y-2">
              {Object.entries(attendanceStatuses).map(([status, config]) => (
                <button
                  key={status}
                  onClick={() => markAttendance(selectedCell.employeeId, selectedCell.date, status)}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 bg-gray-50 hover:bg-gray-100"
                >
                  <div className={`w-6 h-6 ${config.color} rounded-full flex items-center justify-center`}>
                    <span className="text-xs text-white">{config.short}</span>
                  </div>
                  <span className="font-medium text-gray-900">{config.label}</span>
                </button>
              ))}
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  setShowStatusDropdown(false)
                  setSelectedCell(null)
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(attendanceStatuses).map(([status, config]) => (
            <div key={status} className="flex items-center space-x-2">
              <div className={`w-4 h-4 ${config.color} rounded-full flex items-center justify-center`}>
                <span className="text-xs text-white">{config.short}</span>
              </div>
              <span className="text-sm text-gray-600">{config.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Debug Info */}
      <div className="card bg-blue-50">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Debug Information</h3>
        <p className="text-sm text-blue-800">Employees loaded: {employees.length}</p>
        <p className="text-sm text-blue-800">Current month: {currentMonth.toLocaleDateString()}</p>
        <p className="text-sm text-blue-800">Search term: "{searchTerm}"</p>
        <p className="text-sm text-blue-800">Department filter: "{departmentFilter}"</p>
      </div>
    </div>
  )
}