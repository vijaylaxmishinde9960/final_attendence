import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  Home, 
  Users, 
  Calendar, 
  BarChart3, 
  Clock,
  X,
  User,
  Building2
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Employees', href: '/employees', icon: Users },
  { name: 'Departments', href: '/departments', icon: Building2 },
  { name: 'Attendance Overview', href: '/attendance-overview', icon: Calendar },
  { name: 'Attendance', href: '/attendance', icon: Calendar },
  { name: 'Monthly Reports', href: '/reports', icon: BarChart3 },
  { name: 'Leave & Overtime', href: '/leave-overtime', icon: Clock },
]

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation()

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        group fixed inset-y-0 left-0 z-50 bg-white shadow-lg transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col border-r border-gray-200
        w-16 hover:w-64 lg:w-16 lg:hover:w-64
        ${isOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex items-center justify-between h-20 px-3 border-b border-gray-200">
          <div className="flex items-center space-x-2 min-w-0 w-full">
            <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-primary-800 rounded-lg flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex-1 min-w-0 pl-1">
              <h1 className="text-xs font-bold text-gray-900 leading-3 w-full">
                <span className="block">Attendance</span>
                <span className="block">Management</span>
                <span className="block">System</span>
              </h1>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="mt-6 px-2 flex-1">
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={onClose}
                  className={`
                    relative flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 group/item
                    ${isActive
                      ? 'bg-primary-50 text-primary-700 shadow-sm'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm'
                    }
                  `}
                  title={item.name}
                >
                  <item.icon className={`
                    h-5 w-5 flex-shrink-0 transition-colors duration-200
                    ${isActive ? 'text-primary-600' : 'text-gray-400 group-hover/item:text-gray-500'}
                  `} />
                  <span className="ml-3 truncate opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                    {item.name}
                  </span>
                  
                  {/* Tooltip for collapsed state */}
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover/item:opacity-100 lg:group-hover:opacity-0 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap">
                    {item.name}
                  </div>
                </Link>
              )
            })}
          </div>
        </nav>

        {/* User info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 overflow-hidden">
          <div className="flex items-center justify-center lg:justify-start space-x-3">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-gray-600" />
            </div>
            <div className="flex-1 min-w-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <p className="text-sm font-medium text-gray-900 truncate whitespace-nowrap">Admin User</p>
              <p className="text-xs text-gray-500 truncate whitespace-nowrap">Administrator</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
