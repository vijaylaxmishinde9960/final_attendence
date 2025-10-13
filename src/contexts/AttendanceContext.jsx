import React, { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AttendanceContext = createContext()

export function useAttendance() {
  const context = useContext(AttendanceContext)
  if (!context) {
    throw new Error('useAttendance must be used within an AttendanceProvider')
  }
  return context
}

export function AttendanceProvider({ children }) {
  const [attendanceData, setAttendanceData] = useState({})
  const [loading, setLoading] = useState(false)

  const fetchAttendanceForMonth = async (month, employees) => {
    try {
      setLoading(true)
      const startDate = new Date(month.getFullYear(), month.getMonth(), 1).toISOString().split('T')[0]
      const endDate = new Date(month.getFullYear(), month.getMonth() + 1, 0).toISOString().split('T')[0]
      
      // Fetch attendance data for all employees for the month
      const promises = employees.map(async (employee) => {
        try {
          const response = await axios.get(`/admin/attendance/report?date=${startDate}`)
          return { employeeId: employee.id, data: response.data }
        } catch (error) {
          return { employeeId: employee.id, data: null }
        }
      })

      const results = await Promise.all(promises)
      
      // Process attendance data
      const newAttendanceData = {}
      results.forEach(({ employeeId, data }) => {
        if (data && data.employees) {
          const employeeData = data.employees.find(emp => emp.id === employeeId)
          if (employeeData) {
            newAttendanceData[employeeId] = { [startDate]: employeeData.status }
          }
        }
      })
      
      setAttendanceData(prev => ({
        ...prev,
        [month.toISOString().split('T')[0].substring(0, 7)]: newAttendanceData
      }))
      
    } catch (error) {
      console.error('Failed to fetch attendance data:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateAttendance = (employeeId, date, status) => {
    const monthKey = date.toISOString().split('T')[0].substring(0, 7)
    const dateKey = date.toISOString().split('T')[0]
    
    setAttendanceData(prev => ({
      ...prev,
      [monthKey]: {
        ...prev[monthKey],
        [employeeId]: {
          ...prev[monthKey]?.[employeeId],
          [dateKey]: status
        }
      }
    }))
  }

  const getAttendanceStatus = (employeeId, date) => {
    const monthKey = date.toISOString().split('T')[0].substring(0, 7)
    const dateKey = date.toISOString().split('T')[0]
    return attendanceData[monthKey]?.[employeeId]?.[dateKey] || null
  }

  const markAttendance = async (employeeId, date, status) => {
    try {
      await axios.post('/admin/attendance/bulk', {
        attendance_data: [{
          employee_id: employeeId,
          status: status
        }],
        date: date.toISOString().split('T')[0]
      })
      
      // Update local state immediately
      updateAttendance(employeeId, date, status)
      
      return { success: true }
    } catch (error) {
      console.error('Failed to mark attendance:', error)
      return { success: false, error: error.response?.data?.message || 'Failed to mark attendance' }
    }
  }

  const value = {
    attendanceData,
    loading,
    fetchAttendanceForMonth,
    updateAttendance,
    getAttendanceStatus,
    markAttendance
  }

  return (
    <AttendanceContext.Provider value={value}>
      {children}
    </AttendanceContext.Provider>
  )
}

