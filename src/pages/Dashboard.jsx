import React, { useState, useEffect } from 'react'
import { 
  Users, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  TrendingUp,
  Clock,
  AlertCircle
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import axios from 'axios'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    absentToday: 0,
    attendanceRate: 0,
    lateArrivals: 0
  })
  const [loading, setLoading] = useState(true)
  const [attendanceData, setAttendanceData] = useState([])
  const [departmentData, setDepartmentData] = useState([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch employees
      const employeesResponse = await axios.get('/admin/employees')
      const employees = employeesResponse.data
      
      // Fetch today's attendance
      const today = new Date().toISOString().split('T')[0]
      const attendanceResponse = await axios.get(`/admin/attendance/report?date=${today}`)
      const attendanceReport = attendanceResponse.data
      
      // Calculate stats
      const totalEmployees = employees.length
      const presentToday = attendanceReport.present_count || 0
      const absentToday = attendanceReport.absent_count || 0
      const attendanceRate = totalEmployees > 0 ? Math.round((presentToday / totalEmployees) * 100) : 0
      
      setStats({
        totalEmployees,
        presentToday,
        absentToday,
        attendanceRate,
        lateArrivals: 0 // This would come from your backend
      })

      // Mock data for charts (replace with real data from your backend)
      setAttendanceData([
        { name: 'Mon', present: 45, absent: 5 },
        { name: 'Tue', present: 42, absent: 8 },
        { name: 'Wed', present: 48, absent: 2 },
        { name: 'Thu', present: 46, absent: 4 },
        { name: 'Fri', present: 44, absent: 6 },
        { name: 'Sat', present: 20, absent: 0 },
        { name: 'Sun', present: 15, absent: 0 }
      ])

      setDepartmentData([
        { name: 'Development', value: 25, color: COLORS[0] },
        { name: 'Marketing', value: 15, color: COLORS[1] },
        { name: 'Sales', value: 10, color: COLORS[2] },
        { name: 'HR', value: 8, color: COLORS[3] },
        { name: 'Finance', value: 7, color: COLORS[4] }
      ])

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Total Employees',
      value: stats.totalEmployees,
      icon: Users,
      color: 'bg-blue-500',
      change: '+2.5%',
      changeType: 'positive'
    },
    {
      title: 'Present Today',
      value: stats.presentToday,
      icon: CheckCircle,
      color: 'bg-green-500',
      change: '+5.2%',
      changeType: 'positive'
    },
    {
      title: 'Absent Today',
      value: stats.absentToday,
      icon: XCircle,
      color: 'bg-red-500',
      change: '-1.8%',
      changeType: 'negative'
    },
    {
      title: 'Attendance Rate',
      value: `${stats.attendanceRate}%`,
      icon: TrendingUp,
      color: 'bg-purple-500',
      change: '+3.1%',
      changeType: 'positive'
    }
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 min-h-full">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your team today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="card hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                <div className="flex items-center mt-2">
                  <span className={`text-xs font-medium ${
                    stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change}
                  </span>
                  <span className="text-xs text-gray-500 ml-1">vs last week</span>
                </div>
              </div>
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Attendance Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Attendance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={attendanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="present" fill="#10b981" name="Present" />
              <Bar dataKey="absent" fill="#ef4444" name="Absent" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Department Distribution */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={departmentData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {departmentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {departmentData.map((dept, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: dept.color }}
                ></div>
                <span className="text-sm text-gray-600">{dept.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {[
            { action: 'John Doe marked present', time: '2 minutes ago', type: 'success' },
            { action: 'Jane Smith submitted leave request', time: '15 minutes ago', type: 'info' },
            { action: 'Mike Johnson marked absent', time: '1 hour ago', type: 'warning' },
            { action: 'Sarah Wilson completed overtime', time: '2 hours ago', type: 'success' }
          ].map((activity, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className={`w-2 h-2 rounded-full ${
                activity.type === 'success' ? 'bg-green-500' :
                activity.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
              }`}></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                <p className="text-xs text-gray-500">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
