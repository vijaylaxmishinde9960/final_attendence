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
  ArrowLeft,
  Calendar,
  X
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

// Test function to check backend connectivity
window.testBackend = async () => {
  try {
    console.log('🧪 Testing backend connectivity...')
    console.log('Auth token:', localStorage.getItem('authToken') ? 'Present' : 'Missing')
    console.log('Axios auth header:', axios.defaults.headers.common['Authorization'] ? 'Set' : 'Not set')
    
    // Test basic connectivity
    const testResponse = await axios.get('/admin/test-token')
    console.log('✅ Backend connectivity test passed:', testResponse.data)
    
    // Test employees endpoint
    const employeesResponse = await axios.get('/admin/employees')
    console.log('✅ Employees endpoint working:', employeesResponse.data?.length || 0, 'employees')
    
    return { success: true }
  } catch (error) {
    console.error('❌ Backend test failed:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    })
    return { success: false, error }
  }
}

// Test function to analyze date issues
window.testDates = () => {
  const formatDateLocal = (date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
  
  const currentDate = new Date()
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()
  
  console.log('📅 DEBUG: Date analysis for current month')
  console.log('Current date:', currentDate.toISOString())
  console.log('Current month index:', currentMonth)
  console.log('Current year:', currentYear)
  
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  console.log('Days in month:', daysInMonth)
  
  for (let day = 1; day <= Math.min(10, daysInMonth); day++) {
    const date = new Date(currentYear, currentMonth, day)
    const isWeekend = date.getDay() === 0 || date.getDay() === 6
    console.log(`Day ${day}: ${formatDateLocal(date)} (vs UTC: ${date.toISOString().split('T')[0]}) - ${date.toLocaleDateString('en-US', { weekday: 'long' })} ${isWeekend ? '(WEEKEND)' : '(WEEKDAY)'}`)
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
  const [holidays, setHolidays] = useState([])
  const [showHolidayModal, setShowHolidayModal] = useState(false)
  const [holidayName, setHolidayName] = useState('')
  const [holidayDate, setHolidayDate] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [savingHoliday, setSavingHoliday] = useState(false)
  const [markingAttendance, setMarkingAttendance] = useState(false)
  const [fetchingAttendance, setFetchingAttendance] = useState(false)
  const [attendanceValidation, setAttendanceValidation] = useState(null)
  const [showClearConfirmModal, setShowClearConfirmModal] = useState(false)
  const [showValidationModal, setShowValidationModal] = useState(false)
  const [validationData, setValidationData] = useState(null)

  useEffect(() => {
    fetchEmployees()
    fetchHolidays()
  }, [])

  useEffect(() => {
    if (employees.length > 0) {
      fetchAttendanceData()
      fetchAttendanceValidation()
    }
  }, [employees.length, currentMonth.getTime()])

  // Update validation when attendance data changes
  useEffect(() => {
    if (employees.length > 0 && Object.keys(attendanceData).length >= 0) {
      fetchAttendanceValidation()
    }
  }, [attendanceData, employees.length])

  // Update departments whenever employees change (with length check to avoid infinite loops)
  useEffect(() => {
    if (employees.length > 0) {
      const uniqueDepartments = [...new Set(employees.map(emp => emp.department).filter(Boolean))]
      // Only update if departments actually changed
      if (JSON.stringify(uniqueDepartments.sort()) !== JSON.stringify(departments.sort())) {
        setDepartments(uniqueDepartments)
      }
    }
  }, [employees.length])


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
      const mockEmployees = [
        { id: 1, name: 'John Doe', email: 'john@example.com', department: 'Engineering' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', department: 'Marketing' },
        { id: 3, name: 'Bob Johnson', email: 'bob@example.com', department: 'Sales' },
        { id: 4, name: 'Alice Cooper', email: 'alice@example.com', department: 'Engineering' },
        { id: 5, name: 'David Wilson', email: 'david@example.com', department: 'HR' }
      ]
      setEmployees(mockEmployees)
      
      // Extract departments from mock data
      const uniqueDepartments = [...new Set(mockEmployees.map(emp => emp.department).filter(Boolean))]
      setDepartments(uniqueDepartments)
    } finally {
      setLoading(false)
    }
  }

  const fetchHolidays = async () => {
    try {
      const response = await axios.get('/admin/holidays')
      const holidaysData = response.data || []
      setHolidays(holidaysData)
      console.log('Fetched holidays from database:', holidaysData)
    } catch (error) {
      console.error('Failed to fetch holidays from database:', error)
      // Fallback to localStorage
      const storedHolidays = localStorage.getItem('attendance_holidays')
      if (storedHolidays) {
        try {
          const parsedHolidays = JSON.parse(storedHolidays)
          setHolidays(parsedHolidays)
          console.log('Loaded holidays from localStorage:', parsedHolidays)
          toast.success('Holidays loaded from local storage')
        } catch (parseError) {
          console.error('Error parsing stored holidays:', parseError)
          setHolidays([])
          localStorage.removeItem('attendance_holidays')
        }
      } else {
        // Set some default holidays for demo purposes
        const currentYear = new Date().getFullYear()
        const defaultHolidays = [
          { id: 1, name: 'New Year Day', date: `${currentYear}-01-01` },
          { id: 2, name: 'Christmas Day', date: `${currentYear}-12-25` }
        ]
        setHolidays(defaultHolidays)
        // Save to localStorage
        localStorage.setItem('attendance_holidays', JSON.stringify(defaultHolidays))
        toast.info('Using default holidays - add your own holidays below')
      }
    }
  }

  const fetchAttendanceData = async () => {
    if (fetchingAttendance) return // Prevent concurrent calls
    
    setFetchingAttendance(true)
    try {
      const startDate = formatDateLocal(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1))
      
      // Use the new attendance overview endpoint for better performance
      const response = await axios.get(`/admin/attendance/overview?date=${startDate}`)
      
      if (response.data && response.data.attendance_data) {
        setAttendanceData(response.data.attendance_data)
        
        // Update employees list if needed (only if significantly different to avoid loops)
        if (response.data.employees && response.data.employees.length > 0 && response.data.employees.length !== employees.length) {
          setEmployees(response.data.employees)
          // Update departments from the new employee data
          const uniqueDepartments = [...new Set(response.data.employees.map(emp => emp.department).filter(Boolean))]
          setDepartments(uniqueDepartments)
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
    } finally {
      setFetchingAttendance(false)
    }
  }

  const markAttendance = async (employeeId, date, status) => {
    if (markingAttendance) return // Prevent multiple simultaneous requests
    
    setMarkingAttendance(true)
    const dateString = formatDateLocal(date)
    const employee = employees.find(emp => emp.id === employeeId)
    
    console.log('🔍 DEBUG: Marking attendance:', {
      employeeId,
      dateString,
      status,
      employeeName: employee?.name,
      hasAuth: !!axios.defaults.headers.common['Authorization'],
      authToken: localStorage.getItem('authToken') ? 'Present' : 'Missing'
    })
    
    try {
      // Call backend API to mark attendance
      const response = await axios.post('/admin/attendance', {
        employee_id: employeeId,
        date: dateString,
        status: status
      })
      
      console.log('✅ DEBUG: Backend response:', response.data)
      
    } catch (error) {
      console.error('❌ DEBUG: Backend API failed:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers
        }
      })
      // In demo mode, just continue with local state update
      toast.error('Backend not available - using demo mode')
    }
    
    // Always update local state for immediate UI feedback
    setAttendanceData(prev => {
      const newData = {
        ...prev,
        [employeeId]: {
          ...prev[employeeId],
          [dateString]: status
        }
      }
      return newData
    })
    
    toast.success(`${attendanceStatuses[status].label} marked for ${employee?.name} on ${date.toLocaleDateString()}`)
    
    setShowStatusDropdown(false)
    setSelectedCell(null)
    setMarkingAttendance(false)
  }

  const unmarkAttendance = async (employeeId, date) => {
    const dateString = formatDateLocal(date)
    const employee = employees.find(emp => emp.id === employeeId)
    
    try {
      // Call backend API to delete attendance record
      await axios.delete(`/admin/attendance/${employeeId}/${dateString}`)
    } catch (error) {
      console.error('Backend API failed for unmarking:', error)
      toast.error('Backend not available - using demo mode')
    }
    
    // Update local state to remove attendance
    setAttendanceData(prev => {
      const newData = { ...prev }
      if (newData[employeeId] && newData[employeeId][dateString]) {
        delete newData[employeeId][dateString]
        // Remove employee key if no attendance records left
        if (Object.keys(newData[employeeId]).length === 0) {
          delete newData[employeeId]
        }
      }
      return newData
    })
    
    toast.success(`Attendance unmarked for ${employee?.name} on ${date.toLocaleDateString()}`)
    
    setShowStatusDropdown(false)
    setSelectedCell(null)
  }

  const clearAllAttendance = async () => {
    const startDate = formatDateLocal(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1))

    try {
      // Call backend API to clear all attendance for the month
      await axios.delete(`/admin/attendance/month/${startDate}`)
      toast.success('All attendance records cleared successfully')
    } catch (error) {
      console.error('Backend API failed for clearing attendance:', error)
      toast.success('All attendance records cleared (demo mode)')
    }

    // Clear local state
    setAttendanceData({})
    
    // Close the modal
    setShowClearConfirmModal(false)
  }

  const handleClearAllClick = () => {
    setShowClearConfirmModal(true)
  }

  const refreshEmployeeData = async () => {
    if (refreshing) return // Prevent multiple concurrent requests
    
    setRefreshing(true)
    try {
      const response = await axios.get('/admin/employees')
      const newEmployees = response.data || []
      setEmployees(newEmployees)
      
      // Update departments from fresh data
      const uniqueDepartments = [...new Set(newEmployees.map(emp => emp.department).filter(Boolean))]
      setDepartments(uniqueDepartments)
      
      console.log('Refreshed employee data:', { employees: newEmployees.length, departments: uniqueDepartments })
      toast.success('Employee data refreshed successfully')
    } catch (error) {
      console.error('Failed to refresh employee data:', error)
      toast.error('Failed to refresh employee data - using cached data')
    } finally {
      setRefreshing(false)
    }
  }

  const migrateHolidaysToDatabase = async () => {
    try {
      const storedHolidays = localStorage.getItem('attendance_holidays')
      if (!storedHolidays) return
      
      const parsedHolidays = JSON.parse(storedHolidays)
      if (parsedHolidays.length === 0) return
      
      console.log('Migrating holidays to database:', parsedHolidays)
      
      // Try to save each holiday to database
      const migrationPromises = parsedHolidays.map(holiday => 
        axios.post('/admin/holidays', {
          name: holiday.name,
          date: holiday.date
        }).catch(error => {
          console.error(`Failed to migrate holiday ${holiday.name}:`, error)
          return null
        })
      )
      
      const results = await Promise.all(migrationPromises)
      const successCount = results.filter(r => r !== null).length
      
      if (successCount > 0) {
        // Clear localStorage after successful migration
        localStorage.removeItem('attendance_holidays')
        toast.success(`Successfully migrated ${successCount} holidays to database`)
        
        // Refresh holidays from database
        await fetchHolidays()
      }
    } catch (error) {
      console.error('Migration error:', error)
      toast.error('Failed to migrate holidays to database')
    }
  }

  const refreshHolidaysData = async () => {
    try {
      await fetchHolidays()
      console.log('Holidays refreshed from database')
    } catch (error) {
      console.error('Failed to refresh holidays:', error)
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
    
    // Refresh both employee and holiday data when month changes
    setTimeout(() => {
      refreshEmployeeData()
      refreshHolidaysData()
    }, 100)
  }

  const handleCellClick = (employeeId, date, event) => {
    event.stopPropagation()
    
    console.log('🔍 DEBUG: Cell clicked:', {
      employeeId,
      date: date.toISOString(),
      dateString: formatDateLocal(date),
      dayOfMonth: date.getDate(),
      isWeekend: date.getDay() === 0 || date.getDay() === 6,
      currentMonth: formatDateLocal(currentMonth),
      dateMonth: date.getMonth(),
      currentMonthIndex: currentMonth.getMonth()
    })
    
    // Don't allow marking on holidays
    const isHoliday = isDateHoliday(date)
    if (isHoliday) {
      console.log('⚠️ DEBUG: Click blocked - Holiday detected')
      return
    }
    
    // Check if it's a weekend
    if (date.getDay() === 0 || date.getDay() === 6) {
      console.log('⚠️ DEBUG: Click on weekend detected')
    }
    
    console.log('✅ DEBUG: Setting selected cell for attendance marking')
    setSelectedCell({ employeeId, date })
    setShowStatusDropdown(true)
  }

  // Helper function to format date in YYYY-MM-DD format without timezone issues
  const formatDateLocal = (date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // Helper function to safely get status configuration
  const getStatusConfig = (status) => {
    if (!status || !attendanceStatuses[status]) {
      return null
    }
    return attendanceStatuses[status]
  }

  const getAttendanceStatus = (employeeId, date) => {
    const dateString = formatDateLocal(date)
    const status = attendanceData[employeeId]?.[dateString] || null
    
    // Debug logging for problematic statuses
    if (status && !attendanceStatuses[status]) {
      console.warn('⚠️ Unknown status found:', status, 'for employee:', employeeId, 'on date:', dateString)
      console.warn('Available statuses:', Object.keys(attendanceStatuses))
    }
    
    return status
  }

  const isDateHoliday = (date) => {
    const dateString = formatDateLocal(date)
    const isHoliday = holidays.some(holiday => holiday.date === dateString)
    return isHoliday
  }

  const getHolidayName = (date) => {
    const dateString = formatDateLocal(date)
    const holiday = holidays.find(holiday => holiday.date === dateString)
    return holiday ? holiday.name : null
  }

  const clearAttendanceForDate = async (dateString) => {
    // Clear attendance from database for all employees on this date
    try {
      await axios.delete(`/admin/attendance/date/${dateString}`)
      console.log(`✅ Cleared attendance from database for date: ${dateString}`)
    } catch (error) {
      console.error('Failed to clear attendance from database:', error)
      // Continue with local state cleanup even if backend fails
    }

    // Clear from local state
    setAttendanceData(prev => {
      const newData = { ...prev }
      let clearedCount = 0
      
      // Remove attendance for all employees on this date
      Object.keys(newData).forEach(employeeId => {
        if (newData[employeeId] && newData[employeeId][dateString]) {
          delete newData[employeeId][dateString]
          clearedCount++
          
          // Remove employee key if no attendance records left
          if (Object.keys(newData[employeeId]).length === 0) {
            delete newData[employeeId]
          }
        }
      })
      
      if (clearedCount > 0) {
        console.log(`✅ Cleared attendance for ${clearedCount} employees on ${dateString}`)
        toast.info(`Cleared attendance for ${clearedCount} employee(s) on holiday date`)
      }
      
      return newData
    })
  }

  const addHoliday = async () => {
    if (!holidayName.trim() || !holidayDate) {
      toast.error('Please enter both holiday name and date')
      return
    }

    console.log('🔍 DEBUG: Adding holiday with date:', holidayDate)
    console.log('🔍 DEBUG: Type of holidayDate:', typeof holidayDate)
    console.log('🔍 DEBUG: Existing holidays:', holidays.map(h => ({ date: h.date, name: h.name })))

    // Check for duplicate date
    const existingHoliday = holidays.find(h => h.date === holidayDate)
    if (existingHoliday) {
      toast.error(`A holiday "${existingHoliday.name}" already exists on this date`)
      return
    }

    if (savingHoliday) return // Prevent multiple saves

    const holidayData = {
      name: holidayName.trim(),
      date: holidayDate
    }

    setSavingHoliday(true)

    try {
      // Save to database
      const response = await axios.post('/admin/holidays', holidayData)
      const newHoliday = response.data
      
      // Update local state with the saved holiday (includes server-generated ID)
      setHolidays(prev => [...prev, newHoliday])
      
      console.log('✅ DEBUG: Holiday saved with data:', newHoliday)
      console.log('🔍 DEBUG: Backend returned date:', newHoliday.date)
      
      // Clear attendance for this holiday date
      await clearAttendanceForDate(holidayDate)
      
      setHolidayName('')
      setHolidayDate('')
      setShowHolidayModal(false)
      
      console.log('Holiday saved to database:', newHoliday)
      toast.success(`Holiday "${newHoliday.name}" added successfully`)
      
    } catch (error) {
      console.error('Failed to save holiday to database:', error)
      
      // Fallback: add to localStorage
      const fallbackHoliday = {
        id: Date.now(),
        name: holidayData.name,
        date: holidayData.date
      }
      
      const updatedHolidays = [...holidays, fallbackHoliday]
      setHolidays(updatedHolidays)
      
      // Save to localStorage
      localStorage.setItem('attendance_holidays', JSON.stringify(updatedHolidays))
      
      setHolidayName('')
      setHolidayDate('')
      setShowHolidayModal(false)
      
      console.log('Holiday saved to localStorage:', fallbackHoliday)
      toast.success(`Holiday "${fallbackHoliday.name}" saved locally successfully`)
    } finally {
      setSavingHoliday(false)
    }
  }

  const removeHoliday = async (holidayId) => {
    const holiday = holidays.find(h => h.id === holidayId)
    if (!holiday) return
    
    try {
      // Delete from database
      await axios.delete(`/admin/holidays/${holidayId}`)
      
      // Update local state
      setHolidays(prev => prev.filter(h => h.id !== holidayId))
      
      console.log('Holiday deleted from database:', holiday)
      toast.success(`Holiday "${holiday.name}" removed successfully`)
      
    } catch (error) {
      console.error('Failed to delete holiday from database:', error)
      
      // Fallback: remove from localStorage
      const updatedHolidays = holidays.filter(h => h.id !== holidayId)
      setHolidays(updatedHolidays)
      
      // Update localStorage
      localStorage.setItem('attendance_holidays', JSON.stringify(updatedHolidays))
      
      console.log('Holiday removed from localStorage:', holiday)
      toast.success(`Holiday "${holiday.name}" removed from local storage successfully`)
    }
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
      const startDate = formatDateLocal(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1))
      
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

  const validateAndExportToExcel = async () => {
    try {
      const startDate = formatDateLocal(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1))
      
      // First validate attendance completion
      const validationResponse = await axios.get(`/admin/attendance/validate?date=${startDate}`)
      const currentValidationData = validationResponse.data
      
      if (!currentValidationData.is_complete) {
        // Show custom validation modal instead of window.confirm
        setValidationData(currentValidationData)
        setShowValidationModal(true)
        return
      }
      
      // If complete, proceed directly with export
      console.log('📄 Attendance is complete, proceeding with export')
      await exportToExcel(false)  // Normal export for complete attendance
      
    } catch (error) {
      console.error('Validation error:', error)
      toast.error('Failed to validate attendance. Proceeding with export anyway.')
      await exportToExcel(false)  // Default export (up to today for current month)
    }
  }
  
  const handleValidationConfirm = async () => {
    // User confirmed to proceed despite incomplete attendance
    console.log('📄 User chose to proceed with full month export after warning')
    setShowValidationModal(false)
    await exportToExcel(true)  // Pass true to force full month export
  }
  
  const handleValidationCancel = () => {
    // User cancelled the export
    console.log('📄 User cancelled export due to incomplete attendance')
    setShowValidationModal(false)
    toast.info('Export cancelled. Please complete attendance marking first.')
  }

  const fetchAttendanceValidation = async () => {
    try {
      const startDate = formatDateLocal(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1))
      const response = await axios.get(`/admin/attendance/validate?date=${startDate}`)
      setAttendanceValidation(response.data)
    } catch (error) {
      console.error('Failed to fetch attendance validation:', error)
      setAttendanceValidation(null)
    }
  }

  const exportToExcel = async (forceFullMonth = false) => {
    try {
      const startDate = formatDateLocal(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1))
      console.log(`📄 Starting Excel export - forceFullMonth: ${forceFullMonth}, date: ${startDate}`)
      
      // Add force_full_month parameter if requested
      const params = new URLSearchParams({ date: startDate })
      if (forceFullMonth) {
        params.append('force_full_month', 'true')
        console.log('📅 Force full month parameter added to request')
      }
      
      const response = await axios.get(`/admin/attendance/export?${params.toString()}`, {
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
    const dateObj = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    calendarDays.push(dateObj)
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
            <p className="text-gray-600">Manage attendance for all employees in one view</p>
            {attendanceValidation && (
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                attendanceValidation.is_complete 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  attendanceValidation.is_complete 
                    ? 'bg-green-500' 
                    : 'bg-yellow-500'
                }`}></div>
                <span>
                  {attendanceValidation.is_complete 
                    ? '✓ Complete' 
                    : `${attendanceValidation.completion_percentage}% Complete`
                  }
                </span>
                <span className="ml-1 text-gray-500">
                  ({attendanceValidation.total_marked}/{attendanceValidation.total_expected})
                </span>
              </div>
            )}
          </div>
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
          
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex space-x-2">
              <button
                onClick={exportToPDF}
                className="btn-secondary flex items-center space-x-2"
                title="Export current month to PDF"
              >
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">PDF</span>
              </button>
              <button
                onClick={() => exportToExcel(false)}
                className="btn-secondary flex items-center space-x-2"
                title="Quick export to Excel (up to today, no validation)"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Excel</span>
              </button>
            </div>
            <button
              onClick={validateAndExportToExcel}
              className="btn-primary flex items-center space-x-2 px-4"
              title="Validate attendance completion and export to Excel"
            >
              <CheckCircle className="w-4 h-4" />
              <span className="whitespace-nowrap">Validated Export</span>
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
          <div className="flex space-x-2">
            <button
              onClick={refreshEmployeeData}
              disabled={refreshing}
              className={`btn-secondary flex items-center space-x-2 whitespace-nowrap ${refreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
              title="Refresh employee and department data"
            >
              {refreshing ? (
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Users className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">{refreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
            <button
              onClick={() => {
                setSearchTerm('')
                setDepartmentFilter('')
                toast.success('Filters cleared')
              }}
              className="btn-secondary flex items-center space-x-2 whitespace-nowrap"
              title="Clear all filters"
              disabled={!searchTerm && !departmentFilter}
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          </div>
        </div>
        
        {/* Department and employee count info */}
        <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-600">
          <span>{filteredEmployees.length} of {employees.length} employees shown</span>
          <span>•</span>
          <span>{departments.length} departments: {departments.join(', ') || 'None'}</span>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="card" style={{ maxWidth: '100vw', overflowX: 'visible' }}>
        <div className="mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Monthly Attendance Grid</h3>
              <p className="text-sm text-gray-600">Click on any date to mark attendance. Marked dates will show with colored backgrounds. Weekends are disabled.</p>
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
                        const statusConfig = getStatusConfig(status)
                        const isSelected = selectedCell?.employeeId === employee.id && 
                                         selectedCell?.date.toDateString() === day.toDateString()
                        const isToday = day.toDateString() === new Date().toDateString()
                        const isWeekend = day.getDay() === 0 || day.getDay() === 6
                        const isHoliday = isDateHoliday(day)
                        const holidayName = getHolidayName(day)
                        
                        return (
                          <td 
                            key={day.toISOString()} 
                            className={`px-2 py-3 text-center border-r border-gray-100 ${isWeekend ? 'bg-gray-50' : ''} ${isHoliday ? 'bg-red-50' : ''}`}
                            style={{ width: '60px', minWidth: '60px', maxWidth: '60px' }}
                          >
                            <button
                              onClick={(e) => handleCellClick(employee.id, day, e)}
                              className={`
                                w-9 h-9 rounded-lg text-xs font-medium transition-all duration-200 hover:scale-105 hover:shadow-md relative
                                ${statusConfig
                                  ? `${statusConfig.color} text-white shadow-sm` 
                                  : isToday 
                                    ? 'bg-primary-100 text-primary-700 border-2 border-primary-400 shadow-sm' 
                                    : isHoliday
                                      ? 'bg-red-200 text-red-700 cursor-not-allowed'
                                      : isWeekend
                                        ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border border-yellow-300'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                                }
                                ${isSelected ? 'ring-2 ring-primary-500 ring-offset-1' : ''}
                                ${isHoliday ? 'cursor-not-allowed' : 'cursor-pointer'}
                              `}
                              title={
                                isHoliday 
                                  ? `${holidayName} - ${day.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}`
                                  : isWeekend 
                                    ? `${day.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })} - Weekend`
                                    : statusConfig
                                      ? `${statusConfig.label} - ${day.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}`
                                      : isToday 
                                        ? `Today - ${day.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} - Click to mark attendance`
                                        : `${day.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} - Click to mark attendance`
                              }
                              disabled={isHoliday}
                            >
                              {isHoliday ? (
                                <span className="text-red-600">🏖️</span>
                              ) : (
                                <span className={`${isToday ? 'font-bold' : ''} ${status ? 'text-white font-bold drop-shadow-sm' : ''}`}>{day.getDate()}</span>
                              )}
                              {isToday && !status && !isHoliday && (
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
        
        {/* Clear All Attendance Button */}
        <div className="mt-4 flex justify-center">
          <button
            onClick={handleClearAllClick}
            className="btn-danger flex items-center space-x-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
            disabled={Object.keys(attendanceData).length === 0}
            title={Object.keys(attendanceData).length === 0 ? 'No attendance records to clear' : `Clear all attendance records for ${currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`}
          >
            <XCircle className="w-5 h-5" />
            <span>Clear All Attendance</span>
            {Object.keys(attendanceData).length > 0 && (
              <span className="text-xs bg-red-500 px-2 py-1 rounded-full ml-2">
                {Object.values(attendanceData).reduce((total, emp) => total + Object.keys(emp).length, 0)} records
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Status Dropdown Modal */}
      {showStatusDropdown && selectedCell && (() => {
        const currentStatus = getAttendanceStatus(selectedCell.employeeId, selectedCell.date)
        return (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" style={{ zIndex: 9999 }} onClick={() => {
            setShowStatusDropdown(false)
            setSelectedCell(null)
          }}>
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {currentStatus ? 'Change Attendance' : 'Mark Attendance'}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {employees.find(emp => emp.id === selectedCell.employeeId)?.name} - {selectedCell.date.toLocaleDateString()}
                {currentStatus && (
                  <span className="ml-2 text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                    Currently: {(attendanceStatuses[currentStatus] && attendanceStatuses[currentStatus].label) || currentStatus}
                  </span>
                )}
              </p>
              
              <div className="space-y-2">
                {Object.entries(attendanceStatuses).map(([status, config]) => (
                  <button
                    key={status}
                    onClick={() => markAttendance(selectedCell.employeeId, selectedCell.date, status)}
                    disabled={markingAttendance}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                      currentStatus === status 
                        ? 'bg-blue-50 border border-blue-200 hover:bg-blue-100' 
                        : 'bg-gray-50 hover:bg-gray-100'
                    } ${markingAttendance ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className={`w-8 h-8 ${config.color} rounded-lg flex items-center justify-center`}>
                      <span className="text-xs text-white font-bold drop-shadow-sm">{selectedCell.date.getDate()}</span>
                    </div>
                    <span className={`font-medium ${
                      currentStatus === status ? 'text-blue-900' : 'text-gray-900'
                    }`}>
                      {config.label}
                      {currentStatus === status && <span className="text-xs text-blue-600 ml-1">(Current)</span>}
                    </span>
                  </button>
                ))}
                
                {/* Unmark option if attendance is already marked */}
                {currentStatus && (
                  <button
                    onClick={() => unmarkAttendance(selectedCell.employeeId, selectedCell.date)}
                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 bg-red-50 hover:bg-red-100 border border-red-200"
                  >
                    <div className="w-8 h-8 bg-gray-300 rounded-lg flex items-center justify-center">
                      <span className="text-xs text-gray-600 font-bold">{selectedCell.date.getDate()}</span>
                    </div>
                    <span className="font-medium text-red-900">
                      Unmark Attendance
                      <span className="block text-xs text-red-600">Remove attendance record</span>
                    </span>
                  </button>
                )}
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
        )
      })()}

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

      {/* Holiday Management Section */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Holiday Management</h3>
            <p className="text-sm text-gray-600">
              {holidays.filter(holiday => {
                const holidayDate = new Date(holiday.date + 'T00:00:00')
                return holidayDate.getMonth() === currentMonth.getMonth() && 
                       holidayDate.getFullYear() === currentMonth.getFullYear()
              }).length} holidays in {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={refreshHolidaysData}
              className="btn-secondary flex items-center space-x-2"
              title="Refresh holidays from database"
            >
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            {localStorage.getItem('attendance_holidays') && (
              <button
                onClick={migrateHolidaysToDatabase}
                className="btn-secondary flex items-center space-x-2 bg-blue-100 hover:bg-blue-200 text-blue-700"
                title="Migrate local holidays to database"
              >
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Migrate</span>
              </button>
            )}
            <button
              onClick={() => setShowHolidayModal(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <Calendar className="w-4 h-4" />
              <span>Add Holiday</span>
            </button>
          </div>
        </div>
        
        {/* Current Month Holidays */}
        <div className="space-y-2">
          {holidays.length === 0 ? (
            <p className="text-gray-500 text-sm">No holidays added for this month.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {holidays
                .filter(holiday => {
                  const holidayDate = new Date(holiday.date + 'T00:00:00')
                  return holidayDate.getMonth() === currentMonth.getMonth() && 
                         holidayDate.getFullYear() === currentMonth.getFullYear()
                })
                .map(holiday => {
                  const holidayDate = new Date(holiday.date + 'T00:00:00')
                  return (
                    <div key={holiday.id} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">🏖️</span>
                        <div>
                          <p className="font-medium text-gray-900">{holiday.name}</p>
                          <p className="text-sm text-gray-600">{holidayDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeHoliday(holiday.id)}
                        className="text-red-600 hover:text-red-800 transition-colors duration-200"
                        title="Remove holiday"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )
                })
              }
            </div>
          )}
        </div>
      </div>

      {/* Holiday Modal */}
      {showHolidayModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" style={{ zIndex: 9999 }} onClick={() => {
          setShowHolidayModal(false)
          setHolidayName('')
          setHolidayDate('')
        }}>
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Add Holiday
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Holiday Name
                </label>
                <input
                  type="text"
                  value={holidayName}
                  onChange={(e) => setHolidayName(e.target.value)}
                  placeholder="Enter holiday name (e.g., Christmas, New Year)"
                  className="input-field"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={holidayDate}
                  onChange={(e) => setHolidayDate(e.target.value)}
                  className="input-field"
                  min={`${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-01`}
                  max={`${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-31`}
                />
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowHolidayModal(false)
                  setHolidayName('')
                  setHolidayDate('')
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={addHoliday}
                className="btn-primary flex items-center space-x-2"
                disabled={!holidayName.trim() || !holidayDate || savingHoliday}
              >
                {savingHoliday && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                <span>{savingHoliday ? 'Saving...' : 'Add Holiday'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear All Attendance Confirmation Modal */}
      {showClearConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" style={{ zIndex: 9999 }} onClick={() => setShowClearConfirmModal(false)}>
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Clear All Attendance Records
                </h3>
                <p className="text-sm text-gray-500">
                  {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700 mb-3">
                Are you sure you want to clear <strong>ALL</strong> attendance records for this month?
              </p>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <div className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5">
                    <svg fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-red-800 mb-1">This action cannot be undone!</p>
                    <ul className="text-red-700 space-y-1">
                      <li>• All employee attendance records will be permanently deleted</li>
                      <li>• This includes Present, Absent, Half Day, Leave, and Overtime records</li>
                      <li>• {Object.values(attendanceData).reduce((total, emp) => total + Object.keys(emp).length, 0)} records will be removed</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowClearConfirmModal(false)}
                className="btn-secondary px-4 py-2"
              >
                Cancel
              </button>
              <button
                onClick={clearAllAttendance}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
              >
                <XCircle className="w-4 h-4" />
                <span>Yes, Clear All Records</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Validation Export Confirmation Modal */}
      {showValidationModal && validationData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" style={{ zIndex: 9999 }} onClick={() => setShowValidationModal(false)}>
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-lg w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Attendance Incomplete!
                </h3>
                <p className="text-sm text-gray-500">
                  {validationData.period.month_name}
                </p>
              </div>
            </div>
            
            <div className="mb-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="text-yellow-800 font-medium">
                      Completion Status
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-yellow-800">
                      {validationData.completion_percentage}%
                    </div>
                    <div className="text-xs text-yellow-600">
                      {validationData.total_marked}/{validationData.total_expected} records
                    </div>
                  </div>
                </div>
                <div className="w-full bg-yellow-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${validationData.completion_percentage}%` }}
                  ></div>
                </div>
              </div>
              
              <p className="text-gray-700 mb-3">
                <strong>{validationData.missing_count}</strong> attendance records are missing for <strong>{validationData.period.month_name}</strong>.
              </p>
              
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Missing records for:</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  {validationData.missing_attendance.slice(0, 6).map((missing, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                      <span>{missing.employee_name} - {missing.date_formatted}</span>
                    </li>
                  ))}
                  {validationData.missing_attendance.length > 6 && (
                    <li className="text-gray-500 italic">
                      ...and {validationData.missing_attendance.length - 6} more records
                    </li>
                  )}
                </ul>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <div className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5">
                    <svg fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-blue-800 mb-1">Export Options</p>
                    <p className="text-blue-700">
                      If you proceed, the export will include <strong>ALL dates</strong> in {validationData.period.month_name}, including unmarked days (which will appear blank in the Excel file).
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                onClick={handleValidationCancel}
                className="btn-secondary px-4 py-2 order-2 sm:order-1"
              >
                Cancel Export
              </button>
              <button
                onClick={handleValidationConfirm}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2 order-1 sm:order-2"
              >
                <Download className="w-4 h-4" />
                <span>Yes, Export Full Month</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
