/**
 * API Client
 * 
 * สร้าง Axios instance สำหรับเรียก API
 * จัดการ authentication, error handling, และ token refresh
 */

import axios, { AxiosInstance, AxiosResponse } from 'axios'
import { logger } from '../utils/logger'

// Create axios instance - สร้าง Axios instance พื้นฐาน
const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',  // API base URL
  timeout: 30000,                                      // Timeout 30 วินาที
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - จัดการทุก request ก่อนส่งไปยัง server
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token to requests
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Log request in development
    if (import.meta.env.MODE === 'development') {
      logger.info(`API Request: ${config.method?.toUpperCase()} ${config.url}`, {
        data: config.data,
        params: config.params,
      })
    }

    return config
  },
  (error) => {
    logger.error('Request interceptor error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response in development
    if (import.meta.env.MODE === 'development') {
      logger.info(`API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data,
      })
    }

    return response
  },
  async (error) => {
    const originalRequest = error.config

    // Handle 401 errors (token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // Try to refresh token
        const refreshToken = localStorage.getItem('refreshToken')
        if (refreshToken) {
          // Use direct axios call to avoid circular interceptor
          const response = await axios.post(
            `${import.meta.env.VITE_API_URL || '/api/v1'}/auth/refresh`,
            { refreshToken },
            {
              headers: {
                'Content-Type': 'application/json',
              },
            }
          )

          const { accessToken, refreshToken: newRefreshToken } = response.data.data

          // Update tokens
          localStorage.setItem('accessToken', accessToken)
          localStorage.setItem('refreshToken', newRefreshToken)

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`
          return apiClient(originalRequest)
        }
      } catch (refreshError) {
        logger.error('Token refresh failed:', refreshError)
        // Clear tokens but don't redirect here
        // Let AuthContext handle the redirect through ProtectedRoute
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        return Promise.reject(refreshError)
      }
    }

    // Log error
    logger.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data,
    })

    return Promise.reject(error)
  }
)

export { apiClient }
