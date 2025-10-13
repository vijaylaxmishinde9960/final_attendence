import React, { useState, useEffect } from 'react'
import { 
  Download, 
  FileText, 
  Calendar, 
  Users,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  User
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, subMonths } from 'date-fns'
import axios from 'axios'
import toast from 'react-hot-toast'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export default function Reports() {
  const [selectedMonth, setSelectedMonth] = useState(new Date())
  const [employees, setEmployees] = useState([])
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [reportData, setReportData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [exportLoading, setExportLoading] = useState(false)

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
      generateReport()
    }
  }, [selectedEmployee, selectedMonth])

  const fetchEmployees = async () => {
    try {
      const response = await axios.get('/admin/employees')
      setEmployees(response.data)
    } catch (error) {
      toast.error('Failed to fetch employees')
    }
  }

  const generateReport = async () => {
    if (!selectedEmployee) return

    try {
      setLoading(true)
      const startDate = startOfMonth(selectedMonth).toISOString().split('T')[0]
      const endDate = endOfMonth(selectedMonth).toISOString().split('T')[0]
      
      // Fetch monthly overview and extract selected employee's attendance
      const overviewResponse = await axios.get(`/admin/attendance/overview?date=${startDate}`)
      const attendanceData = (overviewResponse.data?.attendance_data || {})[selectedEmployee.id] || {}
      const days = eachDayOfInterval({
        start: startOfMonth(selectedMonth),
        end: endOfMonth(selectedMonth)
      })

      const report = {
        employee: selectedEmployee,
        month: selectedMonth,
        totalDays: days.length,
        workingDays: days.filter(day => day.getDay() !== 0 && day.getDay() !== 6).length,
        attendance: {
          present: 0,
          absent: 0,
          half_day: 0,
          leave: 0,
          overtime: 0
        },
        dailyData: [],
        weeklyTrend: []
      }

      // Calculate attendance stats
      days.forEach(day => {
        const dateString = day.toISOString().split('T')[0]
        const status = attendanceData[dateString]
        
        if (status && report.attendance.hasOwnProperty(status)) {
          report.attendance[status]++
        }

        // Daily data for chart
        report.dailyData.push({
          date: format(day, 'MMM dd'),
          present: status === 'present' ? 1 : 0,
          absent: status === 'absent' ? 1 : 0,
          half_day: status === 'half_day' ? 1 : 0,
          leave: status === 'leave' ? 1 : 0,
          overtime: status === 'overtime' ? 1 : 0
        })
      })

      // Weekly trend calculation
      const weeks = Math.ceil(days.length / 7)
      for (let week = 0; week < weeks; week++) {
        const weekStart = week * 7
        const weekEnd = Math.min(weekStart + 7, days.length)
        const weekDays = days.slice(weekStart, weekEnd)
        
        const weekStats = {
          week: `Week ${week + 1}`,
          present: 0,
          absent: 0,
          half_day: 0,
          leave: 0,
          overtime: 0
        }

        weekDays.forEach(day => {
          const dateString = day.toISOString().split('T')[0]
          const status = attendanceData[dateString]
          if (status && weekStats.hasOwnProperty(status)) {
            weekStats[status]++
          }
        })

        report.weeklyTrend.push(weekStats)
      }

      setReportData(report)
    } catch (error) {
      console.error('Failed to generate report:', error)
      toast.error('Failed to generate report')
    } finally {
      setLoading(false)
    }
  }

  const exportToPDF = async () => {
    if (!reportData || !selectedEmployee) return

    try {
      setExportLoading(true)
      const response = await axios.get(`/admin/attendance/export-pdf?employee_id=${selectedEmployee.id}&date=${selectedMonth.toISOString().split('T')[0]}`, {
        responseType: 'blob'
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `attendance_report_${selectedEmployee.name.replace(' ', '_')}_${format(selectedMonth, 'yyyy-MM')}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      toast.success('PDF report downloaded successfully!')
    } catch (error) {
      console.error('PDF Export error:', error)
      toast.error('Failed to export PDF report. Please try again.')
    } finally {
      setExportLoading(false)
    }
  }

  const exportToExcel = async () => {
    if (!reportData) return

    try {
      setExportLoading(true)
      const response = await axios.get(`/admin/attendance/export?employee_id=${selectedEmployee.id}&month=${selectedMonth.toISOString().split('T')[0]}`, {
        responseType: 'blob'
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `attendance_report_${selectedEmployee.name}_${format(selectedMonth, 'yyyy-MM')}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      toast.success('Excel report downloaded successfully!')
    } catch (error) {
      toast.error('Failed to export Excel report')
    } finally {
      setExportLoading(false)
    }
  }

  const getAttendanceRate = () => {
    if (!reportData) return 0
    const { present, half_day } = reportData.attendance
    const totalWorkingDays = reportData.workingDays
    return totalWorkingDays > 0 ? Math.round(((present + half_day * 0.5) / totalWorkingDays) * 100) : 0
  }

  const attendanceChartData = reportData ? [
    { name: 'Present', value: reportData.attendance.present, color: '#10b981' },
    { name: 'Absent', value: reportData.attendance.absent, color: '#ef4444' },
    { name: 'Half Day', value: reportData.attendance.half_day, color: '#f59e0b' },
    { name: 'Leave', value: reportData.attendance.leave, color: '#3b82f6' },
    { name: 'Overtime', value: reportData.attendance.overtime, color: '#8b5cf6' }
  ].filter(item => item.value > 0) : []

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Monthly Reports</h1>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="card animate-pulse">
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="card animate-pulse">
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Monthly Reports</h1>
          <p className="text-gray-600">Generate and export detailed attendance reports</p>
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
          <input
            type="month"
            value={format(selectedMonth, 'yyyy-MM')}
            onChange={(e) => setSelectedMonth(new Date(e.target.value))}
            className="input-field"
          />
        </div>
      </div>

      {reportData && (
        <>
          {/* Export Actions */}
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {reportData.employee.name} - {format(reportData.month, 'MMMM yyyy')}
                </h3>
                <p className="text-gray-600">Monthly attendance report</p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={exportToPDF}
                  disabled={exportLoading}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <FileText className="w-4 h-4" />
                  <span>Export PDF</span>
                </button>
                <button
                  onClick={exportToExcel}
                  disabled={exportLoading}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Export Excel</span>
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Charts */}
            <div className="lg:col-span-2 space-y-6">
              {/* Daily Attendance Chart */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Attendance Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={reportData.dailyData.slice(0, 15)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="present" stackId="a" fill="#10b981" name="Present" />
                    <Bar dataKey="half_day" stackId="a" fill="#f59e0b" name="Half Day" />
                    <Bar dataKey="absent" stackId="a" fill="#ef4444" name="Absent" />
                    <Bar dataKey="leave" stackId="a" fill="#3b82f6" name="Leave" />
                    <Bar dataKey="overtime" stackId="a" fill="#8b5cf6" name="Overtime" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Weekly Trend */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Trend</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={reportData.weeklyTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="present" stroke="#10b981" strokeWidth={2} name="Present" />
                    <Line type="monotone" dataKey="absent" stroke="#ef4444" strokeWidth={2} name="Absent" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="space-y-6">
              {/* Attendance Summary */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Working Days</span>
                    <span className="font-semibold">{reportData.workingDays}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Present Days</span>
                    <span className="font-semibold text-green-600">{reportData.attendance.present}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Absent Days</span>
                    <span className="font-semibold text-red-600">{reportData.attendance.absent}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Half Days</span>
                    <span className="font-semibold text-yellow-600">{reportData.attendance.halfday}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Leave Days</span>
                    <span className="font-semibold text-blue-600">{reportData.attendance.leave}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Overtime Days</span>
                    <span className="font-semibold text-purple-600">{reportData.attendance.overtime}</span>
                  </div>
                  <hr className="border-gray-200" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">Attendance Rate</span>
                    <span className="text-lg font-bold text-primary-600">{getAttendanceRate()}%</span>
                  </div>
                </div>
              </div>

              {/* Attendance Distribution */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribution</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={attendanceChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {attendanceChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {attendanceChartData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                        <span className="text-sm text-gray-600">{item.name}</span>
                      </div>
                      <span className="text-sm font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Performance Indicators */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-gray-600">Good Attendance</span>
                    </div>
                    <span className={`text-sm font-medium ${getAttendanceRate() >= 90 ? 'text-green-600' : 'text-yellow-600'}`}>
                      {getAttendanceRate() >= 90 ? 'Excellent' : 'Good'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-blue-500" />
                      <span className="text-sm text-gray-600">Punctuality</span>
                    </div>
                    <span className="text-sm font-medium text-blue-600">Good</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-purple-500" />
                      <span className="text-sm text-gray-600">Trend</span>
                    </div>
                    <span className="text-sm font-medium text-green-600">Improving</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {!reportData && (
        <div className="card text-center py-12">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Report Data</h3>
          <p className="text-gray-500">Select an employee and month to generate a report</p>
        </div>
      )}
    </div>
  )
}
