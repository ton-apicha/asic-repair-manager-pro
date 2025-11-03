import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Button,
  Divider,
  IconButton,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { useWorkOrder } from '../hooks/useWorkOrder';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorDisplay } from '../components/common/ErrorDisplay';
import { WorkOrderStatus } from '../types/common';
import { WorkflowStepper } from '../components/workOrders/WorkflowStepper';
import { StatusUpdateDialog } from '../components/workOrders/StatusUpdateDialog';
import { WorkOrderEditForm } from '../components/workOrders/WorkOrderEditForm';
import { DiagnosticsSection } from '../components/workOrders/DiagnosticsSection';
import { PartsUsageSection } from '../components/workOrders/PartsUsageSection';
import { TimeLogsSection } from '../components/workOrders/TimeLogsSection';
import { DocumentsSection } from '../components/workOrders/DocumentsSection';
import { TimelineComponent } from '../components/workOrders/TimelineComponent';
import { TechnicianAssignment } from '../components/workOrders/TechnicianAssignment';
import { WorkOrderService } from '../services/workOrderService';
import { STAGE_LABELS } from '../utils/workflowUtils';

export const WorkOrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { workOrder, isLoading, error, refetch } = useWorkOrder({
    id: id || '',
    enabled: !!id,
  });

  const [openStatusDialog, setOpenStatusDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });

  const handleStatusUpdate = async (newStatus: WorkOrderStatus) => {
    if (!id) return;

    try {
      await WorkOrderService.updateStatus(id, { status: newStatus });
      setSnackbar({
        open: true,
        message: `เปลี่ยนสถานะเป็น ${STAGE_LABELS[newStatus]} สำเร็จ`,
        severity: 'success',
      });
      await refetch();
    } catch (err: any) {
      throw new Error(err.message || 'เกิดข้อผิดพลาดในการอัปเดตสถานะ');
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const getStatusLabel = (status: string): string => {
    const statusMap: Record<string, string> = {
      TRIAGE: 'วินิจฉัย',
      QUOTATION: 'เสนอราคา',
      EXECUTION: 'ดำเนินการ',
      QA: 'ตรวจสอบ',
      CLOSURE: 'ปิดงาน',
      WARRANTY: 'รับประกัน',
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    const colorMap: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
      TRIAGE: 'warning',
      QUOTATION: 'info',
      EXECUTION: 'primary',
      QA: 'secondary',
      CLOSURE: 'success',
      WARRANTY: 'error',
    };
    return colorMap[status] || 'default';
  };

  const getPriorityLabel = (priority: string): string => {
    const priorityMap: Record<string, string> = {
      LOW: 'ต่ำ',
      MEDIUM: 'ปานกลาง',
      HIGH: 'สูง',
      URGENT: 'ด่วน',
    };
    return priorityMap[priority] || priority;
  };

  const getPriorityColor = (priority: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    const colorMap: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
      LOW: 'default',
      MEDIUM: 'info',
      HIGH: 'warning',
      URGENT: 'error',
    };
    return colorMap[priority] || 'default';
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <LoadingSpinner message="กำลังโหลดข้อมูลใบงาน..." />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <ErrorDisplay message={error} onRetry={refetch} />
      </Box>
    );
  }

  if (!workOrder) {
    return (
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          ไม่พบข้อมูลใบงาน
        </Typography>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/work-orders')}
        >
          กลับไปหน้ารายการ
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton onClick={() => navigate('/work-orders')} aria-label="back">
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography variant="h4" component="h1">
              ใบงาน #{workOrder.woId}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              สร้างเมื่อ {formatDate(workOrder.createdAt)}
            </Typography>
          </Box>
        </Box>
        <Box display="flex" gap={2}>
          <Chip
            label={getStatusLabel(workOrder.status)}
            color={getStatusColor(workOrder.status)}
            size="medium"
          />
          <Chip
            label={getPriorityLabel(workOrder.priority)}
            color={getPriorityColor(workOrder.priority)}
            size="medium"
          />
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => setOpenEditDialog(true)}
          >
            แก้ไข
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Workflow Stepper */}
        <Grid item xs={12}>
          <WorkflowStepper
            currentStatus={workOrder.status}
            onStatusClick={() => setOpenStatusDialog(true)}
          />
        </Grid>

        {/* Main Information */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              รายละเอียดปัญหา
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body1" paragraph>
              {workOrder.description || 'ไม่มีรายละเอียด'}
            </Typography>
            {workOrder.notes && (
              <>
                <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                  หมายเหตุ:
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {workOrder.notes}
                </Typography>
              </>
            )}
          </Paper>

          {/* Customer Information */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              ข้อมูลลูกค้า
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  บริษัท
                </Typography>
                <Typography variant="body1">
                  {workOrder.customer?.companyName || '-'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  ผู้ติดต่อ
                </Typography>
                <Typography variant="body1">
                  {workOrder.customer?.contactPerson || '-'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  อีเมล
                </Typography>
                <Typography variant="body1">
                  {workOrder.customer?.email || '-'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  เบอร์โทร
                </Typography>
                <Typography variant="body1">
                  {workOrder.customer?.phone || '-'}
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          {/* Device Information */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              ข้อมูลอุปกรณ์
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  รุ่น
                </Typography>
                <Typography variant="body1">
                  {workOrder.device?.model || '-'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Serial Number
                </Typography>
                <Typography variant="body1">
                  {workOrder.device?.serialNumber || '-'}
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          {/* Diagnostics Section */}
          <DiagnosticsSection
            workOrderId={workOrder.id}
            diagnostics={workOrder.diagnostics || []}
            onUpdate={refetch}
          />

          {/* Parts Usage Section */}
          <PartsUsageSection
            workOrderId={workOrder.id}
            partsUsage={workOrder.partsUsage || []}
            onUpdate={refetch}
          />

          {/* Time Logs Section */}
          <TimeLogsSection
            workOrderId={workOrder.id}
            timeLogs={workOrder.timeLogs || []}
            onUpdate={refetch}
          />
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Technician Assignment */}
          <TechnicianAssignment
            workOrderId={workOrder.id}
            currentTechnicianId={workOrder.technicianId || undefined}
            onUpdate={refetch}
          />

          {/* Cost Information */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              ข้อมูลค่าใช้จ่าย
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  ราคาประมาณการ
                </Typography>
                <Typography variant="body1">
                  {workOrder.estimatedCost ? `฿${Number(workOrder.estimatedCost).toLocaleString()}` : '-'}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  ราคาจริง
                </Typography>
                <Typography variant="body1">
                  {workOrder.actualCost ? `฿${Number(workOrder.actualCost).toLocaleString()}` : '-'}
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          {/* Documents Section */}
          <DocumentsSection
            workOrderId={workOrder.id}
            documents={workOrder.documents || []}
            onUpdate={refetch}
          />

          {/* Timeline */}
          <TimelineComponent workOrderId={workOrder.id} />
        </Grid>
      </Grid>

      {/* Status Update Dialog */}
      {workOrder && (
        <StatusUpdateDialog
          open={openStatusDialog}
          onClose={() => setOpenStatusDialog(false)}
          onConfirm={handleStatusUpdate}
          currentStatus={workOrder.status}
          workOrder={workOrder}
        />
      )}

      {/* Edit Dialog */}
      {workOrder && (
        <WorkOrderEditForm
          open={openEditDialog}
          onClose={() => setOpenEditDialog(false)}
          onSuccess={async () => {
            setSnackbar({
              open: true,
              message: 'แก้ไขใบงานสำเร็จ',
              severity: 'success',
            });
            await refetch();
          }}
          workOrder={workOrder}
        />
      )}

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
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
  );
};
