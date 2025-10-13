import React from 'react'
import { format } from 'date-fns'

const attendanceStatuses = {
  present: { 
    label: 'Full Day', 
    short: '✅', 
    color: 'bg-green-500', 
    hoverColor: 'hover:bg-green-600',
    textColor: 'text-green-600',
    bgColor: 'bg-green-50'
  },
  half_day: { 
    label: 'Half Day', 
    short: '🌗', 
    color: 'bg-yellow-500', 
    hoverColor: 'hover:bg-yellow-600',
    textColor: 'text-yellow-600',
    bgColor: 'bg-yellow-50'
  },
  absent: { 
    label: 'Absent', 
    short: '❌', 
    color: 'bg-red-500', 
    hoverColor: 'hover:bg-red-600',
    textColor: 'text-red-600',
    bgColor: 'bg-red-50'
  },
  leave: { 
    label: 'Leave', 
    short: '🌴', 
    color: 'bg-blue-500', 
    hoverColor: 'hover:bg-blue-600',
    textColor: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  overtime: { 
    label: 'Overtime', 
    short: '⏰', 
    color: 'bg-purple-500', 
    hoverColor: 'hover:bg-purple-600',
    textColor: 'text-purple-600',
    bgColor: 'bg-purple-50'
  }
}

export default function StatusDropdown({ 
  isOpen, 
  onClose, 
  selectedCell, 
  employeeName, 
  onStatusSelect 
}) {
  if (!isOpen || !selectedCell) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Mark Attendance
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          {employeeName} - {format(selectedCell.date, 'MMM dd, yyyy')}
        </p>
        
        <div className="space-y-2">
          {Object.entries(attendanceStatuses).map(([status, config]) => (
            <button
              key={status}
              onClick={() => onStatusSelect(selectedCell.employeeId, selectedCell.date, status)}
              className={`
                w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200
                ${config.bgColor} ${config.textColor} hover:opacity-80
              `}
            >
              <div className={`w-6 h-6 ${config.color} rounded-full flex items-center justify-center`}>
                <span className="text-xs text-white">{config.short}</span>
              </div>
              <span className="font-medium">{config.label}</span>
            </button>
          ))}
        </div>
        
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="btn-secondary"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

