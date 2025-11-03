import React, { useState, useEffect } from 'react'
import {
  Box,
  Grid,
  Typography,
  Fab,
  Snackbar,
  Alert,
} from '@mui/material'
import {
  Refresh as RefreshIcon,
} from '@mui/icons-material'
import { useDashboard } from '../hooks/useDashboard'
import KPICard from '../components/dashboard/KPICard'
import PerformanceChart from '../components/dashboard/PerformanceChart'
import StatusPieChart from '../components/dashboard/StatusPieChart'
import RecentActivityList from '../components/dashboard/RecentActivityList'
import AlertsList from '../components/dashboard/AlertsList'
import TechnicianUtilization from '../components/dashboard/TechnicianUtilization'
import {
  Work as WorkIcon,
  Build as BuildIcon,
  Inventory as InventoryIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material'

export const DashboardPage: React.FC = () => {
  const [_refreshKey, setRefreshKey] = useState(0)
  const [snackbar, setSnackbar] = useState<{
    open: boolean
    message: string
    severity: 'success' | 'error' | 'warning' | 'info'
  }>({
    open: false,
    message: '',
    severity: 'info',
  })

  const {
    kpis,
    performanceChart,
    statusDistribution,
    technicianUtilization,
    recentActivities,
    systemAlerts,
    inventoryAlerts: _inventoryAlerts,
    isLoading,
    error,
    refetch,
    refetchKPIs,
    refetchCharts: _refetchCharts,
    refetchActivities,
    refetchAlerts,
    clearError,
  } = useDashboard({
    enabled: true,
    refetchInterval: 30000, // 30 seconds
    autoRefresh: true,
  })

  const handleRefresh = async () => {
    setRefreshKey(prev => prev + 1)
    await refetch()
    setSnackbar({
      open: true,
      message: 'Dashboard refreshed successfully',
      severity: 'success',
    })
  }

  const handleMarkAlertAsRead = async (_alertId: string) => {
    // This would call the API to mark alert as read
    setSnackbar({
      open: true,
      message: 'Alert marked as read',
      severity: 'info',
    })
  }

  const handleMarkAllAlertsAsRead = async () => {
    // This would call the API to mark all alerts as read
    setSnackbar({
      open: true,
      message: 'All alerts marked as read',
      severity: 'info',
    })
  }

  const handleViewMoreActivities = () => {
    // Navigate to activities page
    setSnackbar({
      open: true,
      message: 'Navigate to activities page',
      severity: 'info',
    })
  }

  const handleViewMoreAlerts = () => {
    // Navigate to alerts page
    setSnackbar({
      open: true,
      message: 'Navigate to alerts page',
      severity: 'info',
    })
  }

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }))
  }

  useEffect(() => {
    if (error) {
      setSnackbar({
        open: true,
        message: error,
        severity: 'error',
      })
      clearError()
    }
  }, [error, clearError])

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Welcome back! Here's what's happening with your ASIC repair operations.
      </Typography>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Work Orders */}
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Total Work Orders"
            value={kpis?.workOrders.total || 0}
            subtitle="All time"
            trend={{
              value: 12,
              direction: 'up',
              period: 'vs last month',
            }}
            icon={<WorkIcon />}
            color="primary"
            onRefresh={refetchKPIs}
            loading={isLoading}
          />
        </Grid>

        {/* Technicians */}
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Active Technicians"
            value={kpis?.technicians.active || 0}
            subtitle={`${kpis?.technicians.total || 0} total`}
            progress={{
              value: kpis?.technicians.utilizationRate || 0,
              max: 100,
              color: 'primary',
            }}
            icon={<BuildIcon />}
            color="success"
            description={`${kpis?.technicians.available || 0} available`}
            onRefresh={refetchKPIs}
            loading={isLoading}
          />
        </Grid>

        {/* Inventory */}
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Parts Available"
            value={kpis?.inventory.totalParts || 0}
            subtitle={`${kpis?.inventory.availabilityRate || 0}% availability`}
            trend={{
              value: kpis?.inventory.lowStock ?? 0,
              direction: (kpis?.inventory.lowStock ?? 0) > 10 ? 'down' : 'up',
              period: 'low stock',
            }}
            icon={<InventoryIcon />}
            color="warning"
            description={`${kpis?.inventory.outOfStock || 0} out of stock`}
            onRefresh={refetchKPIs}
            loading={isLoading}
          />
        </Grid>

        {/* Revenue */}
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Total Revenue"
            value={`$${kpis?.revenue.total?.toLocaleString() || 0}`}
            subtitle="This month"
            trend={{
              value: kpis?.revenue.growthRate || 0,
              direction: (kpis?.revenue.growthRate || 0) > 0 ? 'up' : 'down',
              period: 'vs last month',
            }}
            icon={<MoneyIcon />}
            color="success"
            description={`$${kpis?.revenue.averagePerWorkOrder || 0} avg per WO`}
            onRefresh={refetchKPIs}
            loading={isLoading}
          />
        </Grid>
      </Grid>

      {/* Performance KPIs */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Completion Rate"
            value={`${kpis?.workOrders.completionRate || 0}%`}
            progress={{
              value: kpis?.workOrders.completionRate || 0,
              max: 100,
              color: 'success',
            }}
            icon={<TrendingUpIcon />}
            color="success"
            description={`${kpis?.workOrders.completed || 0} of ${kpis?.workOrders.total || 0} completed`}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Avg Time to Repair"
            value={`${kpis?.performance.averageTimeToRepair || 0}h`}
            icon={<ScheduleIcon />}
            color="info"
            description="Average completion time"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="First-Time Fix Rate"
            value={`${kpis?.performance.firstTimeFixRate || 0}%`}
            icon={<CheckCircleIcon />}
            color="success"
            description="Success rate on first attempt"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Revenue per Technician"
            value={`$${kpis?.performance.revenuePerTechnician?.toLocaleString() || 0}`}
            icon={<MoneyIcon />}
            color="primary"
            description="Average revenue per technician"
          />
        </Grid>
      </Grid>

      {/* Charts and Tables */}
      <Grid container spacing={3}>
        {/* Performance Chart */}
        <Grid item xs={12} md={8}>
          <PerformanceChart
            data={performanceChart || []}
            loading={isLoading}
            error={error}
            onPeriodChange={(period) => {
              // Handle period change
              console.log('Period changed to:', period)
            }}
          />
        </Grid>

        {/* Status Distribution */}
        <Grid item xs={12} md={4}>
          <StatusPieChart
            data={statusDistribution || []}
            loading={isLoading}
            error={error}
          />
        </Grid>

        {/* Recent Activities */}
        <Grid item xs={12} md={6}>
          <RecentActivityList
            activities={recentActivities || []}
            loading={isLoading}
            error={error}
            onRefresh={refetchActivities}
            onViewMore={handleViewMoreActivities}
          />
        </Grid>

        {/* System Alerts */}
        <Grid item xs={12} md={6}>
          <AlertsList
            alerts={systemAlerts || []}
            loading={isLoading}
            error={error}
            onRefresh={refetchAlerts}
            onViewMore={handleViewMoreAlerts}
            onMarkAsRead={handleMarkAlertAsRead}
            onMarkAllAsRead={handleMarkAllAlertsAsRead}
          />
        </Grid>

        {/* Technician Utilization */}
        <Grid item xs={12}>
          <TechnicianUtilization
            data={technicianUtilization || []}
            loading={isLoading}
            error={error}
          />
        </Grid>
      </Grid>

      {/* Floating Action Button for Refresh */}
      <Fab
        color="primary"
        aria-label="refresh"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
        }}
        onClick={handleRefresh}
        disabled={isLoading}
      >
        <RefreshIcon />
      </Fab>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}
