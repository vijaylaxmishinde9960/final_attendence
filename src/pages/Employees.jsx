import React, { useState, useEffect } from 'react'
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  User, 
  Mail, 
  Calendar,
  Phone,
  MapPin,
  Building
} from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function Employees() {
  const [employees, setEmployees] = useState([])
  const [departments, setDepartments] = useState([])
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [formData, setFormData] = useState({
    employee_id: '',
    name: '',
    email: '',
    phone: '',
    address: '',
    department_id: '',
    position: '',
    hire_date: '',
    salary: ''
  })

  useEffect(() => {
    fetchEmployees()
    fetchDepartments()
  }, [])

  const fetchEmployees = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('authToken')
      const response = await axios.get('/admin/employees', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      setEmployees(response.data)
    } catch (error) {
      toast.error('Failed to fetch employees')
    } finally {
      setLoading(false)
    }
  }

  const fetchDepartments = async () => {
    try {
      const token = localStorage.getItem('authToken')
      const response = await axios.get('/admin/departments', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      setDepartments(response.data)
    } catch (error) {
      console.error('Error fetching departments:', error)
    }
  }

  const handleAddEmployee = async (e) => {
    e.preventDefault()
    
    // Validate required fields
    if (!formData.employee_id?.trim() ||
        !formData.name?.trim() ||
        !formData.email?.trim() ||
        !formData.phone?.trim() ||
        !formData.address?.trim() ||
        !formData.position?.trim() ||
        !formData.hire_date?.trim() ||
        formData.department_id === '' ||
        formData.department_id === null ||
        formData.salary === '' || formData.salary === null) {
      toast.error('Please fill all fields before adding an employee')
      return
    }

    // Extra basic checks
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error('Please enter a valid email address')
      return
    }
    if (Number.isNaN(parseFloat(formData.salary)) || parseFloat(formData.salary) < 0) {
      toast.error('Salary must be a valid non-negative number')
      return
    }

    try {
      const token = localStorage.getItem('authToken')
      const payload = {
        employee_id: formData.employee_id.trim(),
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        department_id: typeof formData.department_id === 'string' ? parseInt(formData.department_id) : formData.department_id,
        position: formData.position.trim(),
        hire_date: formData.hire_date,
        salary: parseFloat(formData.salary)
      }
      
      // Remove undefined values
      Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key])
      
      await axios.post('/admin/employees', payload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      toast.success(`${formData.name} has been added successfully!`)
      setShowAddModal(false)
      resetForm()
      
      // Refresh employee list
      await fetchEmployees()
      
    } catch (error) {
      console.error('Add employee error:', error)
      const errorMessage = error.response?.data?.message || 'Failed to add employee'
      toast.error(errorMessage)
    }
  }

  const handleEditEmployee = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('authToken')
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        address: formData.address || undefined,
        department_id: formData.department_id || undefined,
        position: formData.position || undefined,
        hire_date: formData.hire_date || undefined,
        salary: formData.salary ? parseFloat(formData.salary) : undefined
      }
      
      // Remove undefined values
      Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key])
      
      await axios.put(`/admin/employees/${selectedEmployee.id}`, payload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      toast.success('Employee updated successfully!')
      setShowEditModal(false)
      setSelectedEmployee(null)
      resetForm()
      fetchEmployees()
    } catch (error) {
      console.error('Edit employee error:', error)
      const errorMessage = error.response?.data?.message || 'Failed to update employee'
      toast.error(errorMessage)
    }
  }

  const handleDeleteEmployee = async (employeeId) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        const token = localStorage.getItem('authToken')
        await axios.delete(`/admin/employees/${employeeId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        toast.success('Employee deleted successfully!')
        fetchEmployees()
      } catch (error) {
        console.error('Delete employee error:', error)
        const errorMessage = error.response?.data?.message || 'Failed to delete employee'
        toast.error(errorMessage)
      }
    }
  }

  const resetForm = () => {
    setFormData({
      employee_id: '',
      name: '',
      email: '',
      phone: '',
      address: '',
      department_id: '',
      position: '',
      hire_date: '',
      salary: ''
    })
  }

  const openEditModal = (employee) => {
    setSelectedEmployee(employee)
    setFormData({
      employee_id: employee.employee_id || '',
      name: employee.name || '',
      email: employee.email || '',
      phone: employee.phone || '',
      address: employee.address || '',
      department_id: employee.department_id || '',
      position: employee.position || '',
      hire_date: employee.hire_date || '',
      salary: employee.salary ? employee.salary.toString() : ''
    })
    setShowEditModal(true)
  }

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
          <div className="card animate-pulse">
            <div className="h-32 bg-gray-200 rounded"></div>
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
          <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
          <p className="text-gray-600">Manage your team members and view their details</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Employee</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Employee List */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>

          {/* Employee Cards */}
          <div className="space-y-3">
            {filteredEmployees.map((employee) => (
              <div
                key={employee.id}
                className={`card cursor-pointer transition-all duration-200 hover:shadow-md ${
                  selectedEmployee?.id === employee.id ? 'ring-2 ring-primary-500 bg-primary-50' : ''
                }`}
                onClick={() => setSelectedEmployee(employee)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{employee.name}</h3>
                      <p className="text-sm text-gray-600">{employee.email}</p>
                      {employee.department_name && (
                        <p className="text-xs text-gray-500">{employee.department_name}</p>
                      )}
                      {employee.position && (
                        <p className="text-xs text-gray-500">{employee.position}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        openEditModal(employee)
                      }}
                      className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors duration-200"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteEmployee(employee.id)
                      }}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Employee Details */}
        <div className="space-y-6">
          {selectedEmployee ? (
            <div className="card">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedEmployee.name}</h2>
                  <p className="text-gray-600">{selectedEmployee.position || 'Employee'}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{selectedEmployee.email}</span>
                </div>
                
                {selectedEmployee.phone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{selectedEmployee.phone}</span>
                  </div>
                )}
                
                {selectedEmployee.department_name && (
                  <div className="flex items-center space-x-3">
                    <Building className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{selectedEmployee.department_name}</span>
                  </div>
                )}
                
                {selectedEmployee.hire_date && (
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      Joined {new Date(selectedEmployee.hire_date).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">Quick Stats</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary-600">95%</p>
                    <p className="text-xs text-gray-500">Attendance</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">2</p>
                    <p className="text-xs text-gray-500">Leaves Taken</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="card text-center py-12">
              <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select an Employee</h3>
              <p className="text-gray-500">Choose an employee from the list to view their details</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Employee</h3>
            <form onSubmit={handleAddEmployee} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID *</label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    value={formData.employee_id}
                    onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                    placeholder="Enter Employee ID"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  className="input-field"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    required
                    className="input-field"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <select
                  className="input-field"
                  required
                  value={formData.department_id || ''}
                  onChange={(e) => setFormData({ ...formData, department_id: e.target.value ? parseInt(e.target.value) : '' })}
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  className="input-field resize-none"
                  required
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Employee address"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hire Date</label>
                  <input
                    type="date"
                    required
                    className="input-field"
                    value={formData.hire_date}
                    onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Salary</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    className="input-field"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); resetForm(); }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1">
                  Add Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Employee</h3>
            <form onSubmit={handleEditEmployee} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
                  <input
                    type="text"
                    className="input-field bg-gray-50"
                    value={formData.employee_id}
                    readOnly
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  className="input-field"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    className="input-field"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                  <input
                    type="text"
                    className="input-field"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <select
                  className="input-field"
                  value={formData.department_id || ''}
                  onChange={(e) => setFormData({ ...formData, department_id: e.target.value ? parseInt(e.target.value) : '' })}
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  className="input-field resize-none"
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Employee address"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hire Date</label>
                  <input
                    type="date"
                    className="input-field"
                    value={formData.hire_date}
                    onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Salary</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="input-field"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); setSelectedEmployee(null); resetForm(); }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1">
                  Update Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
