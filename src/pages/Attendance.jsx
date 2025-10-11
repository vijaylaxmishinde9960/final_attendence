import React, { useState, useEffect } from 'react'
import { 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  X, 
  Clock, 
  User,
  Calendar,
  Filter
} from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns'
import axios from 'axios'
import toast from 'react-hot-toast'

const attendanceStatuses = {
  present: { label: 'Present', color: 'bg-green-500', icon: Check },
  absent: { label: 'Absent', color: 'bg-red-500', icon: X },
  halfday: { label: 'Half Day', color: 'bg-yellow-500', icon: Clock },
  leave: { label: 'Leave', color: 'bg-blue-500', icon: User },
  overtime: { label: 'Overtime', color: 'bg-purple-500', icon: Clock }
}

export default function Attendance() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [employees, setEmployees] = useState([])
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [attendanceData, setAttendanceData] = useState({})
  const [loading, setLoading] = useState(true)
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [selectedDates, setSelectedDates] = useState([])

  useEffect(() => {
    fetchEmployees()
  }, [])

  useEffect(() => {
    if (employees.length > 0 && !selectedEmployee) {
      setSelectedEmployee(employees[0])
    }
  }, [employees])

  useEffect(() => {
    if (selectedEmployee) {
      fetchAttendanceData()
    }
  }, [selectedEmployee, currentMonth])

  const fetchEmployees = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/admin/employees')
      setEmployees(response.data)
    } catch (error) {
      toast.error('Failed to fetch employees')
    } finally {
      setLoading(false)
    }
  }

  const fetchAttendanceData = async () => {
    if (!selectedEmployee) return

    try {
      // Try to get attendance report for the selected month
      const reportDate = startOfMonth(currentMonth).toISOString().split('T')[0]
          const response = await axios.get(`/admin/attendance/report?date=${reportDate}`)
      
      // Process the response to extract attendance data for the selected employee
      if (response.data && response.data.employees) {
        const employeeData = response.data.employees.find(emp => emp.id === selectedEmployee.id)
        if (employeeData) {
          // Create a simple attendance data object
          setAttendanceData({ [reportDate]: employeeData.status })
        } else {
          setAttendanceData({})
        }
      } else {
        setAttendanceData({})
      }
    } catch (error) {
      console.error('Failed to fetch attendance data:', error)
      // Don't show error toast for this as it's expected for new months
      setAttendanceData({})
    }
  }

  const markAttendance = async (date, status) => {
    if (!selectedEmployee) {
      toast.error('Please select an employee first')
      return
    }

    try {
      // Use the bulk attendance endpoint that matches your backend
      const response = await axios.post('/admin/attendance/bulk', {
        attendance_data: [{
          employee_id: selectedEmployee.id,
          status: status
        }],
        date: date.toISOString().split('T')[0]
      })
      
      // Update local state immediately for instant UI feedback
      setAttendanceData(prev => ({
        ...prev,
        [date.toISOString().split('T')[0]]: status
      }))
      
      toast.success(`${status.charAt(0).toUpperCase() + status.slice(1)} marked successfully for ${selectedEmployee.name}!`)
      
      // Refresh attendance data to ensure consistency
      setTimeout(() => {
        fetchAttendanceData()
      }, 500)
      
    } catch (error) {
      console.error('Attendance marking error:', error)
      const errorMessage = error.response?.data?.message || 'Failed to mark attendance'
      toast.error(errorMessage)
    }
  }

  const markBulkAttendance = async (status) => {
    if (!selectedEmployee || selectedDates.length === 0) return

    try {
      const promises = selectedDates.map(date => 
        axios.post('/admin/attendance', {
          employee_id: selectedEmployee.id,
          date: date.toISOString().split('T')[0],
          status: status
        })
      )

      await Promise.all(promises)
      
      const newAttendanceData = { ...attendanceData }
      selectedDates.forEach(date => {
        newAttendanceData[date.toISOString().split('T')[0]] = status
      })
      
      setAttendanceData(newAttendanceData)
      setSelectedDates([])
      setShowBulkActions(false)
      toast.success('Bulk attendance marked successfully!')
    } catch (error) {
      toast.error('Failed to mark bulk attendance')
    }
  }

  const navigateMonth = (direction) => {
    setCurrentMonth(prev => 
      direction === 'next' ? addMonths(prev, 1) : subMonths(prev, 1)
    )
  }

  const toggleDateSelection = (date) => {
    const dateString = date.toISOString().split('T')[0]
    setSelectedDates(prev => 
      prev.includes(date) 
        ? prev.filter(d => d !== date)
        : [...prev, date]
    )
  }

  const getAttendanceStatus = (date) => {
    const dateString = date.toISOString().split('T')[0]
    return attendanceData[dateString] || null
  }

  const getAttendanceStats = () => {
    const days = eachDayOfInterval({
      start: startOfMonth(currentMonth),
      end: endOfMonth(currentMonth)
    }).filter(day => isSameMonth(day, currentMonth))

    const stats = {
      present: 0,
      absent: 0,
      halfday: 0,
      leave: 0,
      overtime: 0
    }

    days.forEach(day => {
      const status = getAttendanceStatus(day)
      if (status && stats.hasOwnProperty(status)) {
        stats[status]++
      }
    })

    return stats
  }

  const calendarDays = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  })

  const stats = getAttendanceStats()

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
        </div>
        <div className="card animate-pulse">
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance Management</h1>
          <p className="text-gray-600">Track and manage employee attendance</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={selectedEmployee?.id || ''}
            onChange={(e) => {
              const employee = employees.find(emp => emp.id === parseInt(e.target.value))
              setSelectedEmployee(employee)
            }}
            className="input-field"
          >
            {employees.map(employee => (
              <option key={employee.id} value={employee.id}>
                {employee.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => setShowBulkActions(!showBulkActions)}
            className={`btn-secondary ${showBulkActions ? 'bg-primary-100 text-primary-700' : ''}`}
          >
            <Filter className="w-4 h-4 mr-2" />
            Bulk Actions
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {Object.entries(attendanceStatuses).map(([status, config]) => (
          <div key={status} className="card text-center">
            <div className={`w-8 h-8 ${config.color} rounded-full flex items-center justify-center mx-auto mb-2`}>
              <config.icon className="w-4 h-4 text-white" />
            </div>
            <p className="text-lg font-bold text-gray-900">{stats[status]}</p>
            <p className="text-sm text-gray-600">{config.label}</p>
          </div>
        ))}
      </div>

      {/* Calendar */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-semibold text-gray-900">
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          
          {showBulkActions && selectedDates.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                {selectedDates.length} dates selected
              </span>
              <div className="flex space-x-1">
                {Object.entries(attendanceStatuses).map(([status, config]) => (
                  <button
                    key={status}
                    onClick={() => markBulkAttendance(status)}
                    className={`px-3 py-1 text-xs font-medium text-white rounded ${config.color} hover:opacity-80 transition-opacity duration-200`}
                  >
                    {config.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Day headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}

          {/* Calendar days */}
          {calendarDays.map(day => {
            const attendanceStatus = getAttendanceStatus(day)
            const isSelected = selectedDates.includes(day)
            const isToday = isSameDay(day, new Date())
            const statusConfig = attendanceStatus ? attendanceStatuses[attendanceStatus] : null

            return (
              <div
                key={day.toISOString()}
                className={`
                  relative p-2 min-h-[60px] border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md
                  ${isToday ? 'ring-2 ring-primary-500 bg-primary-50' : 'border-gray-200'}
                  ${isSelected ? 'bg-primary-100 border-primary-300' : ''}
                  ${attendanceStatus ? 'bg-opacity-10' : 'hover:bg-gray-50'}
                `}
                onClick={() => showBulkActions ? toggleDateSelection(day) : null}
              >
                <div className="text-sm font-medium text-gray-900 mb-1">
                  {format(day, 'd')}
                </div>
                
                {statusConfig && (
                  <div className="flex items-center space-x-1">
                    <div className={`w-2 h-2 ${statusConfig.color} rounded-full`}></div>
                    <span className="text-xs text-gray-600">{statusConfig.label}</span>
                  </div>
                )}

                {/* Quick action buttons */}
                {!showBulkActions && (
                  <div className="absolute top-1 right-1 opacity-100 transition-opacity duration-200">
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(attendanceStatuses).map(([status, config]) => (
                        <button
                          key={status}
                          onClick={(e) => {
                            e.stopPropagation()
                            markAttendance(day, status)
                          }}
                          className={`w-5 h-5 ${config.color} rounded-full hover:scale-110 transition-transform duration-200 flex items-center justify-center`}
                          title={`Mark as ${config.label}`}
                        >
                          <config.icon className="w-3 h-3 text-white" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(attendanceStatuses).map(([status, config]) => (
            <div key={status} className="flex items-center space-x-2">
              <div className={`w-4 h-4 ${config.color} rounded-full`}></div>
              <span className="text-sm text-gray-600">{config.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
