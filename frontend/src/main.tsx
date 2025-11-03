/**
 * ASIC Repair Pro - Frontend Entry Point
 * 
 * ไฟล์หลักสำหรับเริ่มต้น React application
 * ตั้งค่า providers ต่างๆ สำหรับ routing, state management, theming
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ThemeProvider } from '@mui/material/styles'
import { CssBaseline } from '@mui/material'
import { SnackbarProvider } from 'notistack'
import { HelmetProvider } from 'react-helmet-async'

import App from './App'
import { theme } from './theme'
import { AuthProvider } from './contexts/AuthContext'
import './index.css'

// Create a client - สร้าง React Query client สำหรับจัดการ server state
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,                                    // Retry 1 ครั้งเมื่อ error
      refetchOnWindowFocus: false,                // ไม่ refetch เมื่อ focus
      staleTime: 5 * 60 * 1000,                   // ข้อมูลจะ stale หลัง 5 นาที
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <SnackbarProvider maxSnack={3}>
              <AuthProvider>
                <App />
              </AuthProvider>
            </SnackbarProvider>
          </ThemeProvider>
        </BrowserRouter>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </HelmetProvider>
  </React.StrictMode>,
)
