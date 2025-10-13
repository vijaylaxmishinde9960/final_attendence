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

export default function AttendanceCell({ 
  date, 
  status, 
  isSelected, 
  onCellClick, 
  employeeId,
  isToday = false 
}) {
  const handleClick = (e) => {
    onCellClick(employeeId, date, e)
  }

  const statusConfig = status ? attendanceStatuses[status] : null

  return (
    <td className="px-1 py-2 text-center relative">
      <button
        onClick={handleClick}
        className={`
          w-8 h-8 rounded-full text-xs font-medium transition-all duration-200 hover:scale-110
          ${status 
            ? `${statusConfig.color} text-white` 
            : isToday 
              ? 'bg-primary-100 text-primary-700 border-2 border-primary-300' 
              : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
          }
          ${isSelected ? 'ring-2 ring-primary-500' : ''}
        `}
        title={status ? statusConfig.label : isToday ? 'Today - Click to mark attendance' : 'Click to mark attendance'}
      >
        {status ? statusConfig.short : format(date, 'd')}
      </button>
    </td>
  )
}

