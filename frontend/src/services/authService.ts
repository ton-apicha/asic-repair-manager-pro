import { apiClient } from './apiClient'

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  success: boolean
  data: {
    user: {
      id: string
      email: string
      firstName: string
      lastName: string
      role: string
      isActive: boolean
    }
    accessToken: string
    refreshToken: string
  }
}

export interface RegisterRequest {
  email: string
  password: string
  firstName: string
  lastName: string
  role?: string
}

export interface RegisterResponse {
  success: boolean
  data: {
    user: {
      id: string
      email: string
      firstName: string
      lastName: string
      role: string
      isActive: boolean
    }
    accessToken: string
    refreshToken: string
  }
}

export interface UserProfile {
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

export interface ProfileResponse {
  success: boolean
  data: {
    user: UserProfile
  }
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface RefreshTokenResponse {
  success: boolean
  data: {
    accessToken: string
    refreshToken: string
  }
}

class AuthService {
  async login(email: string, password: string): Promise<LoginResponse['data']> {
    const response = await apiClient.post<LoginResponse>('/auth/login', {
      email,
      password,
    })
    return response.data.data
  }

  async register(userData: RegisterRequest): Promise<RegisterResponse['data']> {
    const response = await apiClient.post<RegisterResponse>('/auth/register', userData)
    return response.data.data
  }

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout')
  }

  async getProfile(): Promise<UserProfile> {
    const response = await apiClient.get<ProfileResponse>('/auth/me')
    return response.data.data.user
  }

  async updateProfile(userData: Partial<Pick<UserProfile, 'firstName' | 'lastName'>>): Promise<UserProfile> {
    const response = await apiClient.put<ProfileResponse>('/auth/me', userData)
    return response.data.data.user
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await apiClient.post('/auth/change-password', {
      currentPassword,
      newPassword,
    })
  }

  async forgotPassword(email: string): Promise<void> {
    await apiClient.post('/auth/forgot-password', { email })
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await apiClient.post('/auth/reset-password', {
      token,
      newPassword,
    })
  }

  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse['data']> {
    const response = await apiClient.post<RefreshTokenResponse>('/auth/refresh', {
      refreshToken,
    })
    return response.data.data
  }
}

export const authService = new AuthService()
