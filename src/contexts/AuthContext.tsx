'use client'

import { createContext, useContext, useReducer, useEffect, useCallback } from 'react'

interface Admin {
  id: string
  name: string
  email: string
  role: string
}

interface AuthState {
  admin: Admin | null
  token: string | null
  isLoading: boolean
}

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_AUTH'; payload: { admin: Admin; token: string } }
  | { type: 'CLEAR_AUTH' }

interface AuthContextType {
  admin: Admin | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    case 'SET_AUTH':
      return {
        ...state,
        admin: action.payload.admin,
        token: action.payload.token,
        isLoading: false
      }
    case 'CLEAR_AUTH':
      return {
        admin: null,
        token: null,
        isLoading: false
      }
    default:
      return state
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, {
    admin: null,
    token: null,
    isLoading: true
  })

  useEffect(() => {
    // Check for stored token and admin
    const storedToken = localStorage.getItem('token')
    const storedAdmin = localStorage.getItem('admin')

    if (storedToken && storedAdmin) {
      try {
        const parsedAdmin = JSON.parse(storedAdmin)
        // Batch update state through dispatch
        dispatch({ 
          type: 'SET_AUTH', 
          payload: { admin: parsedAdmin, token: storedToken } 
        })
      } catch (error) {
        localStorage.removeItem('token')
        localStorage.removeItem('admin')
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    } else {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })

    const data = await response.json()

    if (!data.success) {
      throw new Error(data.error?.message || 'Login gagal')
    }

    // Update state and localStorage
    dispatch({ 
      type: 'SET_AUTH', 
      payload: { admin: data.data.admin, token: data.data.token } 
    })

    localStorage.setItem('token', data.data.token)
    localStorage.setItem('admin', JSON.stringify(data.data.admin))
  }, [])

  const logout = useCallback(() => {
    const token = state.token
    
    // Call logout API
    if (token) {
      fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      }).catch(() => {})
    }

    // Clear state
    dispatch({ type: 'CLEAR_AUTH' })

    // Clear localStorage
    localStorage.removeItem('token')
    localStorage.removeItem('admin')

    // Reload page to reset state
    window.location.href = '/'
  }, [state.token])

  return (
    <AuthContext.Provider
      value={{
        admin: state.admin,
        token: state.token,
        login,
        logout,
        isAuthenticated: !!state.admin,
        isLoading: state.isLoading
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
