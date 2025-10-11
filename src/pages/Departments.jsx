import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Building, Users, Search } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function Departments() {
  const [departments, setDepartments] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingDepartment, setEditingDepartment] = useState(null)
  const [includeInactive, setIncludeInactive] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    manager_id: null,
    is_active: true
  })

  useEffect(() => {
    fetchDepartments()
    fetchEmployees()
  }, [])

  useEffect(() => {
    fetchDepartments()
  }, [includeInactive])

  const fetchDepartments = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('authToken')
      const url = includeInactive 
        ? '/admin/departments?include_inactive=true' 
        : '/admin/departments'
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      setDepartments(response.data)
    } catch (error) {
      toast.error('Failed to fetch departments')
      console.error('Error fetching departments:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('authToken')
      const response = await axios.get('/admin/employees/for-manager', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      setEmployees(response.data)
    } catch (error) {
      console.error('Error fetching employees:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast.error('Department name is required')
      return
    }

    try {
      const token = localStorage.getItem('authToken')
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
      
      if (editingDepartment) {
        // Update existing department
        await axios.put(`/admin/departments/${editingDepartment.id}`, formData, config)
        toast.success('Department updated successfully!')
      } else {
        // Add new department
        await axios.post('/admin/departments', formData, config)
        toast.success('Department added successfully!')
      }
      
      // Reset form and close modal
      resetForm()
      fetchDepartments()
    } catch (error) {
      const message = error.response?.data?.message || 'Operation failed'
      toast.error(message)
    }
  }

  const handleEdit = (department) => {
    setFormData({
      name: department.name,
      description: department.description || '',
      manager_id: department.manager_id || null,
      is_active: department.is_active
    })
    setEditingDepartment(department)
    setShowAddModal(true)
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete the department "${name}"?`)) {
      return
    }

    try {
      const token = localStorage.getItem('authToken')
      await axios.delete(`/admin/departments/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      toast.success('Department deleted successfully!')
      fetchDepartments()
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete department'
      toast.error(message)
    }
  }

  const resetForm = () => {
    setFormData({ 
      name: '', 
      description: '', 
      manager_id: null,
      is_active: true 
    })
    setEditingDepartment(null)
    setShowAddModal(false)
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (name === 'manager_id' ? (value === '' ? null : parseInt(value)) : value)
    }))
  }

  const filteredDepartments = departments.filter(department =>
    department.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (department.description && department.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Department Management</h1>
          <p className="text-gray-600 mt-1">Manage company departments and organizational structure</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add Department</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search departments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="includeInactive"
              checked={includeInactive}
              onChange={(e) => setIncludeInactive(e.target.checked)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="includeInactive" className="text-sm text-gray-700">
              Show inactive departments
            </label>
          </div>
        </div>
      </div>

      {/* Departments List */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Departments ({filteredDepartments.length})
          </h2>
        </div>

        {filteredDepartments.length === 0 ? (
          <div className="text-center py-12">
            <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No departments found' : 'No departments yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm 
                ? `No departments match "${searchTerm}"`
                : 'Get started by creating your first department'
              }
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowAddModal(true)}
                className="btn-primary"
              >
                Add First Department
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDepartments.map((department) => (
              <div key={department.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                      <Building className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-gray-900">{department.name}</h3>
                        {!department.is_active && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Inactive
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-1 text-sm text-gray-500 mt-1">
                        <Users className="w-4 h-4" />
                        <span>{department.employee_count} employees</span>
                      </div>
                      {department.manager_name && (
                        <div className="text-sm text-gray-600 mt-1">
                          <span className="font-medium">Manager:</span> {department.manager_name}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(department)}
                      className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors"
                      title="Edit department"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(department.id, department.name)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      title="Delete department"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {department.description && (
                  <p className="text-sm text-gray-600 mb-4">{department.description}</p>
                )}

                <div className="text-xs text-gray-500">
                  Created {new Date(department.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={resetForm}></div>

            <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingDepartment ? 'Edit Department' : 'Add New Department'}
                </h3>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="Enter department name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="input-field resize-none"
                    placeholder="Enter department description (optional)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department Manager
                  </label>
                  <select
                    name="manager_id"
                    value={formData.manager_id || ''}
                    onChange={handleInputChange}
                    className="input-field"
                  >
                    <option value="">No Manager</option>
                    {employees.map((employee) => (
                      <option key={employee.id} value={employee.id}>
                        {employee.name} ({employee.employee_id})
                        {employee.position && ` - ${employee.position}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Active Department</span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Inactive departments won't appear in employee assignment dropdowns
                  </p>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                  >
                    {editingDepartment ? 'Update Department' : 'Add Department'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}