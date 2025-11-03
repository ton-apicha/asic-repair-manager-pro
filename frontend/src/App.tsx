/**
 * App Component
 * 
 * Component หลักสำหรับจัดการ routing
 * แบ่งเป็น Public Routes และ Protected Routes
 * ใช้ AuthContext เพื่อตรวจสอบสถานะการล็อกอิน
 */

import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Box } from '@mui/material'
import { useAuth } from './contexts/AuthContext'
import { Layout } from './components/Layout'
import { LoadingSpinner } from './components/LoadingSpinner'

// Pages - นำเข้าหน้าต่างๆ ของแอป
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { WorkOrdersPage } from './pages/WorkOrdersPage'
import { WorkOrderDetailPage } from './pages/WorkOrderDetailPage'
import { CustomersPage } from './pages/CustomersPage'
import { CustomerDetailPage } from './pages/CustomerDetailPage'
import { DevicesPage } from './pages/DevicesPage'
import { DeviceDetailPage } from './pages/DeviceDetailPage'
import { TechniciansPage } from './pages/TechniciansPage'
import { TechnicianDetailPage } from './pages/TechnicianDetailPage'
import { InventoryPage } from './pages/InventoryPage'
import { SchedulePage } from './pages/SchedulePage'
import { WarrantyPage } from './pages/WarrantyPage'
import { ReportsPage } from './pages/ReportsPage'
import { SettingsPage } from './pages/SettingsPage'
import { NotFoundPage } from './pages/NotFoundPage'

/**
 * Protected Route Component
 * ตรวจสอบว่าผู้ใช้ล็อกอินอยู่หรือไม่
 * ถ้ายังไม่ล็อกอินจะ redirect ไปหน้า login
 */
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <LoadingSpinner />
      </Box>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

/**
 * Public Route Component
 * ตรวจสอบว่าผู้ใช้ยังไม่ล็อกอินอยู่หรือไม่
 * ถ้าล็อกอินแล้วจะ redirect ไปหน้า dashboard
 */
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <LoadingSpinner />
      </Box>
    )
  }

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

/**
 * Main App Component
 * จัดการ routing ทั้งหมดของแอปพลิเคชัน
 */
function App() {
  return (
    <Routes>
      {/* Public Routes - ไม่ต้องล็อกอิน */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />

      {/* Protected Routes - ต้องล็อกอินก่อน */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        
        {/* Work Orders - ใบงานซ่อม */}
        <Route path="work-orders" element={<WorkOrdersPage />} />
        <Route path="work-orders/:id" element={<WorkOrderDetailPage />} />
        
        {/* Customers - ลูกค้า */}
        <Route path="customers" element={<CustomersPage />} />
        <Route path="customers/:id" element={<CustomerDetailPage />} />
        
        {/* Devices - อุปกรณ์ ASIC */}
        <Route path="devices" element={<DevicesPage />} />
        <Route path="devices/:id" element={<DeviceDetailPage />} />
        
        {/* Technicians - ช่างซ่อม */}
        <Route path="technicians" element={<TechniciansPage />} />
        <Route path="technicians/:id" element={<TechnicianDetailPage />} />
        
        {/* Inventory - สต็อคอะไหล่ */}
        <Route path="inventory" element={<InventoryPage />} />
        
        {/* Schedule - ตารางงาน */}
        <Route path="schedule" element={<SchedulePage />} />
        
        {/* Warranty - การรับประกัน */}
        <Route path="warranty" element={<WarrantyPage />} />
        
        {/* Reports - รายงาน */}
        <Route path="reports" element={<ReportsPage />} />
        
        {/* Settings - ตั้งค่า */}
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* 404 Page - เมื่อไม่พบหน้าที่ต้องการ */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App
