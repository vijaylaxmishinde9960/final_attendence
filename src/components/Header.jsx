import React from 'react'
import { Menu, Bell, User, LogOut } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Header({ onMenuClick }) {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        <div className="flex items-center space-x-4 min-w-0 flex-1">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 flex-shrink-0"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="hidden lg:block min-w-0">
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900 truncate">Employee Management</h1>
            <p className="text-xs lg:text-sm text-gray-500 truncate">Track attendance and manage your team</p>
          </div>
          <div className="lg:hidden">
            <h1 className="text-lg font-bold text-gray-900">Dashboard</h1>
          </div>
        </div>

        <div className="flex items-center space-x-2 lg:space-x-4 flex-shrink-0">
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200">
            <Bell className="w-5 h-5" />
          </button>
          
          <div className="flex items-center space-x-2 lg:space-x-3">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-gray-600" />
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-gray-900 truncate">Admin</p>
              <p className="text-xs text-gray-500 truncate">Administrator</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center space-x-1 lg:space-x-2 px-2 lg:px-3 py-2 text-sm text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden lg:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  )
}
