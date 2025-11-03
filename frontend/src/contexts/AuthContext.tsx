/**
 * Authentication Context
 * 
 * จัดการสถานะการล็อกอินของผู้ใช้ทั่วทั้งแอป
 * ใช้ React Context API และ useReducer สำหรับ state management
 */

import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { authService } from '../services/authService'
import { logger } from '../utils/logger'

// ==================== Types ====================

/** ข้อมูลผู้ใช้ */
interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  isActive: boolean
  technician?: {
    id: string
    employeeId: string
    skills: string[]
    hourlyRate?: number
    isActive: boolean
  }
}

/** สถานะของ authentication */
interface AuthState {
  user: User | null        // ข้อมูลผู้ใช้ปัจจุบัน
  loading: boolean         // กำลังโหลดข้อมูลหรือไม่
  error: string | null     // ข้อความ error (ถ้ามี)
}

/** API ของ AuthContext */
interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  register: (userData: RegisterData) => Promise<void>
  refreshToken: () => Promise<void>
  clearError: () => void
}

/** ข้อมูลสำหรับการสมัครสมาชิก */
interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  role?: string
}

// ==================== Action Types ====================

type AuthAction =
  | { type: 'AUTH_START' }                          // เริ่มต้น authentication
  | { type: 'AUTH_SUCCESS'; payload: User }        // Authentication สำเร็จ
  | { type: 'AUTH_FAILURE'; payload: string }      // Authentication ล้มเหลว
  | { type: 'AUTH_LOGOUT' }                        // ออกจากระบบ
  | { type: 'CLEAR_ERROR' }                        // ล้าง error

// ==================== Initial State ====================

const initialState: AuthState = {
  user: null,
  loading: true,
  error: null,
}

// ==================== Reducer ====================

/**
 * Authentication Reducer
 * จัดการ state changes ตาม action types
 */
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        loading: true,
        error: null,
      }
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload,
        loading: false,
        error: null,
      }
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        loading: false,
        error: action.payload,
      }
    case 'AUTH_LOGOUT':
      return {
        ...state,
        user: null,
        loading: false,
        error: null,
      }
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      }
    default:
      return state
  }
}

// ==================== Context ====================

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// ==================== Provider Component ====================

/**
 * AuthProvider
 * ให้ authentication context แก่ children components
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // ==================== Effects ====================

  /** ตรวจสอบ token เมื่อ component mount */
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('accessToken')
        if (token) {
          // Verify token and get user data - ตรวจสอบ token และดึงข้อมูลผู้ใช้
          const user = await authService.getProfile()
          dispatch({ type: 'AUTH_SUCCESS', payload: user })
        } else {
          dispatch({ type: 'AUTH_LOGOUT' })
        }
      } catch (error) {
        logger.error('Auth initialization failed:', error)
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        dispatch({ type: 'AUTH_LOGOUT' })
      }
    }

    initAuth()
  }, [])

  // ==================== Authentication Functions ====================

  /**
   * Login Function
   * เข้าสู่ระบบด้วย email และ password
   */
  const login = async (email: string, password: string): Promise<void> => {
    try {
      dispatch({ type: 'AUTH_START' })
      
      const response = await authService.login(email, password)
      
      // Store tokens
      localStorage.setItem('accessToken', response.accessToken)
      localStorage.setItem('refreshToken', response.refreshToken)
      
      dispatch({ type: 'AUTH_SUCCESS', payload: response.user })
      
      logger.info('User logged in successfully:', response.user.email)
    } catch (error: any) {
      const errorMessage = error.response?.data?.error?.message || 'Login failed'
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage })
      throw error
    }
  }

  /**
   * Logout Function
   * ออกจากระบบและลบ tokens
   */
  const logout = (): void => {
    try {
      // Clear tokens - ลบ tokens จาก localStorage
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      
      // Call logout API - เรียก API logout
      authService.logout().catch((error) => {
        logger.error('Logout API call failed:', error)
      })
      
      dispatch({ type: 'AUTH_LOGOUT' })
      
      logger.info('User logged out successfully')
    } catch (error) {
      logger.error('Logout failed:', error)
    }
  }

  /**
   * Register Function
   * สมัครสมาชิกใหม่
   */
  const register = async (userData: RegisterData): Promise<void> => {
    try {
      dispatch({ type: 'AUTH_START' })
      
      const response = await authService.register(userData)
      
      // Store tokens
      localStorage.setItem('accessToken', response.accessToken)
      localStorage.setItem('refreshToken', response.refreshToken)
      
      dispatch({ type: 'AUTH_SUCCESS', payload: response.user })
      
      logger.info('User registered successfully:', response.user.email)
    } catch (error: any) {
      const errorMessage = error.response?.data?.error?.message || 'Registration failed'
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage })
      throw error
    }
  }

  /**
   * Refresh Token Function
   * ต่ออายุ access token ด้วย refresh token
   */
  const refreshToken = async (): Promise<void> => {
    try {
      const refreshTokenValue = localStorage.getItem('refreshToken')
      if (!refreshTokenValue) {
        throw new Error('No refresh token available')
      }

      const response = await authService.refreshToken(refreshTokenValue)
      
      // Update tokens - อัปเดต tokens ใหม่
      localStorage.setItem('accessToken', response.accessToken)
      localStorage.setItem('refreshToken', response.refreshToken)
      
      logger.info('Token refreshed successfully')
    } catch (error) {
      logger.error('Token refresh failed:', error)
      logout()
      throw error
    }
  }

  /**
   * Clear Error Function
   * ล้าง error message
   */
  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' })
  }

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    register,
    refreshToken,
    clearError,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
