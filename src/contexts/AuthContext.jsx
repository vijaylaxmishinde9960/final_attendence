import React, { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext()

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('authToken')
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      // Verify token with backend
      verifyToken(token)
    } else {
      setLoading(false)
    }
  }, [])

  const verifyToken = async (token) => {
    try {
      const response = await axios.get('/admin/test-token')
      setUser({ token })
      setLoading(false)
    } catch (error) {
      localStorage.removeItem('authToken')
      delete axios.defaults.headers.common['Authorization']
      setLoading(false)
    }
  }

  const login = async (username, password) => {
    try {
      const response = await axios.post('/admin/login', {
        username,
        password
      })
      
      const { access_token } = response.data
      localStorage.setItem('authToken', access_token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
      
      setUser({ token: access_token })
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('authToken')
    delete axios.defaults.headers.common['Authorization']
    setUser(null)
  }

  const value = {
    user,
    login,
    logout,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
