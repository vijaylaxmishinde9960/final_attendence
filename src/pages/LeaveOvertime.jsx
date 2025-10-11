import React, { useState, useEffect } from 'react'
import { 
  Plus, 
  Calendar, 
  Clock, 
  Check, 
  X, 
  AlertCircle,
  User,
  Filter,
  Edit,
  Trash2
} from 'lucide-react'
import { format, addDays, differenceInDays } from 'date-fns'
import axios from 'axios'
import toast from 'react-hot-toast'

const leaveTypes = [
  { value: 'sick', label: 'Sick Leave', color: 'bg-red-100 text-red-800' },
  { value: 'vacation', label: 'Vacation', color: 'bg-blue-100 text-blue-800' },
  { value: 'personal', label: 'Personal Leave', color: 'bg-green-100 text-green-800' },
  { value: 'maternity', label: 'Maternity Leave', color: 'bg-pink-100 text-pink-800' },
  { value: 'paternity', label: 'Paternity Leave', color: 'bg-purple-100 text-purple-800' },
  { value: 'emergency', label: 'Emergency Leave', color: 'bg-yellow-100 text-yellow-800' }
]

const overtimeTypes = [
  { value: 'regular', label: 'Regular Overtime', color: 'bg-blue-100 text-blue-800' },
  { value: 'weekend', label: 'Weekend Work', color: 'bg-purple-100 text-purple-800' },
  { value: 'holiday', label: 'Holiday Work', color: 'bg-orange-100 text-orange-800' },
  { value: 'night', label: 'Night Shift', color: 'bg-gray-100 text-gray-800' }
]

export default function LeaveOvertime() {
  const [activeTab, setActiveTab] = useState('leave')
  const [employees, setEmployees] = useState([])
  const [leaveRequests, setLeaveRequests] = useState([])
  const [overtimeRequests, setOvertimeRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [showLeaveModal, setShowLeaveModal] = useState(false)
  const [showOvertimeModal, setShowOvertimeModal] = useState(false)
  const [editingRequest, setEditingRequest] = useState(null)
  const [filter, setFilter] = useState('all')

  const [leaveForm, setLeaveForm] = useState({
    employee_id: '',
    leave_type: 'sick',
    start_date: '',
    end_date: '',
    reason: '',
    status: 'pending'
  })

  const [overtimeForm, setOvertimeForm] = useState({
    employee_id: '',
    overtime_type: 'regular',
    date: '',
    hours: '',
    reason: '',
    status: 'pending'
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch employees
      const employeesResponse = await axios.get('/api/admin/employees')
      setEmployees(employeesResponse.data)

      // Mock data for leave and overtime requests
      // In a real app, these would come from your backend
      setLeaveRequests([
        {
          id: 1,
          employee_id: 1,
          employee_name: 'John Doe',
          leave_type: 'sick',
          start_date: '2024-01-15',
          end_date: '2024-01-17',
          reason: 'Flu symptoms',
          status: 'pending',
          applied_date: '2024-01-14'
        },
        {
          id: 2,
          employee_id: 2,
          employee_name: 'Jane Smith',
          leave_type: 'vacation',
          start_date: '2024-01-20',
          end_date: '2024-01-25',
          reason: 'Family vacation',
          status: 'approved',
          applied_date: '2024-01-10'
        }
      ])

      setOvertimeRequests([
        {
          id: 1,
          employee_id: 1,
          employee_name: 'John Doe',
          overtime_type: 'regular',
          date: '2024-01-15',
          hours: 4,
          reason: 'Project deadline',
          status: 'pending',
          applied_date: '2024-01-14'
        },
        {
          id: 2,
          employee_id: 3,
          employee_name: 'Mike Johnson',
          overtime_type: 'weekend',
          date: '2024-01-13',
          hours: 8,
          reason: 'System maintenance',
          status: 'approved',
          applied_date: '2024-01-12'
        }
      ])

    } catch (error) {
      toast.error('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  const handleLeaveSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingRequest) {
        // Update existing leave request
        const updatedRequests = leaveRequests.map(req => 
          req.id === editingRequest.id ? { ...req, ...leaveForm } : req
        )
        setLeaveRequests(updatedRequests)
        toast.success('Leave request updated successfully!')
      } else {
        // Add new leave request
        const newRequest = {
          id: Date.now(),
          ...leaveForm,
          employee_name: employees.find(emp => emp.id === parseInt(leaveForm.employee_id))?.name || 'Unknown',
          applied_date: new Date().toISOString().split('T')[0]
        }
        setLeaveRequests([...leaveRequests, newRequest])
        toast.success('Leave request submitted successfully!')
      }
      
      setShowLeaveModal(false)
      setEditingRequest(null)
      setLeaveForm({
        employee_id: '',
        leave_type: 'sick',
        start_date: '',
        end_date: '',
        reason: '',
        status: 'pending'
      })
    } catch (error) {
      toast.error('Failed to submit leave request')
    }
  }

  const handleOvertimeSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingRequest) {
        // Update existing overtime request
        const updatedRequests = overtimeRequests.map(req => 
          req.id === editingRequest.id ? { ...req, ...overtimeForm } : req
        )
        setOvertimeRequests(updatedRequests)
        toast.success('Overtime request updated successfully!')
      } else {
        // Add new overtime request
        const newRequest = {
          id: Date.now(),
          ...overtimeForm,
          employee_name: employees.find(emp => emp.id === parseInt(overtimeForm.employee_id))?.name || 'Unknown',
          applied_date: new Date().toISOString().split('T')[0]
        }
        setOvertimeRequests([...overtimeRequests, newRequest])
        toast.success('Overtime request submitted successfully!')
      }
      
      setShowOvertimeModal(false)
      setEditingRequest(null)
      setOvertimeForm({
        employee_id: '',
        overtime_type: 'regular',
        date: '',
        hours: '',
        reason: '',
        status: 'pending'
      })
    } catch (error) {
      toast.error('Failed to submit overtime request')
    }
  }

  const handleStatusUpdate = (type, id, status) => {
    if (type === 'leave') {
      setLeaveRequests(requests =>
        requests.map(req => req.id === id ? { ...req, status } : req)
      )
    } else {
      setOvertimeRequests(requests =>
        requests.map(req => req.id === id ? { ...req, status } : req)
      )
    }
    toast.success(`Request ${status} successfully!`)
  }

  const handleEdit = (type, request) => {
    setEditingRequest(request)
    if (type === 'leave') {
      setLeaveForm(request)
      setShowLeaveModal(true)
    } else {
      setOvertimeForm(request)
      setShowOvertimeModal(true)
    }
  }

  const handleDelete = (type, id) => {
    if (window.confirm('Are you sure you want to delete this request?')) {
      if (type === 'leave') {
        setLeaveRequests(requests => requests.filter(req => req.id !== id))
      } else {
        setOvertimeRequests(requests => requests.filter(req => req.id !== id))
      }
      toast.success('Request deleted successfully!')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredLeaveRequests = leaveRequests.filter(request => {
    if (filter === 'all') return true
    return request.status === filter
  })

  const filteredOvertimeRequests = overtimeRequests.filter(request => {
    if (filter === 'all') return true
    return request.status === filter
  })

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Leave & Overtime</h1>
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
          <h1 className="text-2xl font-bold text-gray-900">Leave & Overtime Management</h1>
          <p className="text-gray-600">Manage employee leave requests and overtime tracking</p>
        </div>
        <div className="flex space-x-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="input-field"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <button
            onClick={() => setShowLeaveModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Leave</span>
          </button>
          <button
            onClick={() => setShowOvertimeModal(true)}
            className="btn-secondary flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Overtime</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('leave')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'leave'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Calendar className="w-4 h-4 inline mr-2" />
            Leave Requests ({filteredLeaveRequests.length})
          </button>
          <button
            onClick={() => setActiveTab('overtime')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overtime'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Clock className="w-4 h-4 inline mr-2" />
            Overtime Requests ({filteredOvertimeRequests.length})
          </button>
        </nav>
      </div>

      {/* Leave Requests */}
      {activeTab === 'leave' && (
        <div className="space-y-4">
          {filteredLeaveRequests.map((request) => {
            const leaveType = leaveTypes.find(lt => lt.value === request.leave_type)
            const days = differenceInDays(new Date(request.end_date), new Date(request.start_date)) + 1
            
            return (
              <div key={request.id} className="card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{request.employee_name}</h3>
                      <p className="text-sm text-gray-600">{leaveType?.label}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-600">
                        {format(new Date(request.start_date), 'MMM dd')} - {format(new Date(request.end_date), 'MMM dd')}
                      </p>
                      <p className="text-sm text-gray-500">{days} day{days > 1 ? 's' : ''}</p>
                    </div>
                    
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                    
                    <div className="flex items-center space-x-2">
                      {request.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate('leave', request.id, 'approved')}
                            className="p-1 text-green-600 hover:bg-green-50 rounded"
                            title="Approve"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleStatusUpdate('leave', request.id, 'rejected')}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                            title="Reject"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleEdit('leave', request)}
                        className="p-1 text-gray-600 hover:bg-gray-50 rounded"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete('leave', request.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    <strong>Reason:</strong> {request.reason}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Applied on {format(new Date(request.applied_date), 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>
            )
          })}
          
          {filteredLeaveRequests.length === 0 && (
            <div className="card text-center py-12">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Leave Requests</h3>
              <p className="text-gray-500">No leave requests found for the selected filter</p>
            </div>
          )}
        </div>
      )}

      {/* Overtime Requests */}
      {activeTab === 'overtime' && (
        <div className="space-y-4">
          {filteredOvertimeRequests.map((request) => {
            const overtimeType = overtimeTypes.find(ot => ot.value === request.overtime_type)
            
            return (
              <div key={request.id} className="card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{request.employee_name}</h3>
                      <p className="text-sm text-gray-600">{overtimeType?.label}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-600">
                        {format(new Date(request.date), 'MMM dd, yyyy')}
                      </p>
                      <p className="text-sm text-gray-500">{request.hours} hour{request.hours > 1 ? 's' : ''}</p>
                    </div>
                    
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                    
                    <div className="flex items-center space-x-2">
                      {request.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate('overtime', request.id, 'approved')}
                            className="p-1 text-green-600 hover:bg-green-50 rounded"
                            title="Approve"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleStatusUpdate('overtime', request.id, 'rejected')}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                            title="Reject"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleEdit('overtime', request)}
                        className="p-1 text-gray-600 hover:bg-gray-50 rounded"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete('overtime', request.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    <strong>Reason:</strong> {request.reason}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Applied on {format(new Date(request.applied_date), 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>
            )
          })}
          
          {filteredOvertimeRequests.length === 0 && (
            <div className="card text-center py-12">
              <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Overtime Requests</h3>
              <p className="text-gray-500">No overtime requests found for the selected filter</p>
            </div>
          )}
        </div>
      )}

      {/* Leave Request Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingRequest ? 'Edit Leave Request' : 'Add Leave Request'}
            </h3>
            <form onSubmit={handleLeaveSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
                <select
                  required
                  className="input-field"
                  value={leaveForm.employee_id}
                  onChange={(e) => setLeaveForm({ ...leaveForm, employee_id: e.target.value })}
                >
                  <option value="">Select Employee</option>
                  {employees.map(employee => (
                    <option key={employee.id} value={employee.id}>
                      {employee.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type</label>
                <select
                  required
                  className="input-field"
                  value={leaveForm.leave_type}
                  onChange={(e) => setLeaveForm({ ...leaveForm, leave_type: e.target.value })}
                >
                  {leaveTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    className="input-field"
                    value={leaveForm.start_date}
                    onChange={(e) => setLeaveForm({ ...leaveForm, start_date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    className="input-field"
                    value={leaveForm.end_date}
                    onChange={(e) => setLeaveForm({ ...leaveForm, end_date: e.target.value })}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                <textarea
                  required
                  rows={3}
                  className="input-field"
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                />
              </div>
              
              {editingRequest && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    className="input-field"
                    value={leaveForm.status}
                    onChange={(e) => setLeaveForm({ ...leaveForm, status: e.target.value })}
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              )}
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowLeaveModal(false)
                    setEditingRequest(null)
                    setLeaveForm({
                      employee_id: '',
                      leave_type: 'sick',
                      start_date: '',
                      end_date: '',
                      reason: '',
                      status: 'pending'
                    })
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1">
                  {editingRequest ? 'Update' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Overtime Request Modal */}
      {showOvertimeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingRequest ? 'Edit Overtime Request' : 'Add Overtime Request'}
            </h3>
            <form onSubmit={handleOvertimeSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
                <select
                  required
                  className="input-field"
                  value={overtimeForm.employee_id}
                  onChange={(e) => setOvertimeForm({ ...overtimeForm, employee_id: e.target.value })}
                >
                  <option value="">Select Employee</option>
                  {employees.map(employee => (
                    <option key={employee.id} value={employee.id}>
                      {employee.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Overtime Type</label>
                <select
                  required
                  className="input-field"
                  value={overtimeForm.overtime_type}
                  onChange={(e) => setOvertimeForm({ ...overtimeForm, overtime_type: e.target.value })}
                >
                  {overtimeTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    className="input-field"
                    value={overtimeForm.date}
                    onChange={(e) => setOvertimeForm({ ...overtimeForm, date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hours</label>
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    required
                    className="input-field"
                    value={overtimeForm.hours}
                    onChange={(e) => setOvertimeForm({ ...overtimeForm, hours: e.target.value })}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                <textarea
                  required
                  rows={3}
                  className="input-field"
                  value={overtimeForm.reason}
                  onChange={(e) => setOvertimeForm({ ...overtimeForm, reason: e.target.value })}
                />
              </div>
              
              {editingRequest && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    className="input-field"
                    value={overtimeForm.status}
                    onChange={(e) => setOvertimeForm({ ...overtimeForm, status: e.target.value })}
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              )}
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowOvertimeModal(false)
                    setEditingRequest(null)
                    setOvertimeForm({
                      employee_id: '',
                      overtime_type: 'regular',
                      date: '',
                      hours: '',
                      reason: '',
                      status: 'pending'
                    })
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1">
                  {editingRequest ? 'Update' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

