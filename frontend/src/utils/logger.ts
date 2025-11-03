// Simple logger utility for frontend
const isDevelopment = import.meta.env.MODE === 'development'

export const logger = {
  info: (message: string, data?: any) => {
    if (isDevelopment) {
      console.log(`[INFO] ${message}`, data || '')
    }
  },
  warn: (message: string, data?: any) => {
    if (isDevelopment) {
      console.warn(`[WARN] ${message}`, data || '')
    }
  },
  error: (message: string, data?: any) => {
    console.error(`[ERROR] ${message}`, data || '')
  },
  debug: (message: string, data?: any) => {
    if (isDevelopment) {
      console.debug(`[DEBUG] ${message}`, data || '')
    }
  },
}
