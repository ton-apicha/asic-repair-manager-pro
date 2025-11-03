import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  IconButton,
  Divider,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { TimeLog, TimeLogCreate } from '../../types/workOrder';
import { WorkOrderService } from '../../services/workOrderService';
import { useAuth } from '../../contexts/AuthContext';

interface TimeLogsSectionProps {
  workOrderId: string;
  timeLogs: TimeLog[];
  onUpdate: () => void;
}

export const TimeLogsSection: React.FC<TimeLogsSectionProps> = ({
  workOrderId,
  timeLogs,
  onUpdate,
}) => {
  const { user } = useAuth();
  const [openDialog, setOpenDialog] = useState(false);
  const [editingLog, setEditingLog] = useState<TimeLog | null>(null);
  const [formData, setFormData] = useState<TimeLogCreate>({
    activityType: '',
    startTime: new Date().toISOString().slice(0, 16),
    endTime: '',
    hourlyRate: undefined,
    notes: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof TimeLogCreate, string>>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingLog) {
      setFormData({
        activityType: editingLog.activityType,
        startTime: new Date(editingLog.startTime).toISOString().slice(0, 16),
        endTime: editingLog.endTime ? new Date(editingLog.endTime).toISOString().slice(0, 16) : '',
        hourlyRate: editingLog.hourlyRate ? Number(editingLog.hourlyRate) : undefined,
        notes: editingLog.notes || '',
      });
    } else {
      setFormData({
        activityType: '',
        startTime: new Date().toISOString().slice(0, 16),
        endTime: '',
        hourlyRate: undefined,
        notes: '',
      });
    }
    setErrors({});
    setError(null);
  }, [openDialog, editingLog]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof TimeLogCreate, string>> = {};
    let isValid = true;

    if (!formData.activityType.trim()) {
      newErrors.activityType = 'กรุณาระบุประเภทกิจกรรม';
      isValid = false;
    }

    if (!formData.startTime) {
      newErrors.startTime = 'กรุณาระบุเวลาเริ่มต้น';
      isValid = false;
    }

    if (formData.endTime && new Date(formData.endTime) <= new Date(formData.startTime)) {
      newErrors.endTime = 'เวลาสิ้นสุดต้องมากกว่าเวลาเริ่มต้น';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const calculateDuration = (): number | null => {
    if (!formData.startTime || !formData.endTime) return null;
    const start = new Date(formData.startTime);
    const end = new Date(formData.endTime);
    return Math.round((end.getTime() - start.getTime()) / (1000 * 60)); // minutes
  };

  const calculateTotalCost = (): number | null => {
    const duration = calculateDuration();
    if (!duration || !formData.hourlyRate) return null;
    return (duration / 60) * formData.hourlyRate;
  };

  const handleSubmit = async () => {
    setError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      if (editingLog) {
        await WorkOrderService.updateTimeLog(workOrderId, editingLog.id, {
          endTime: formData.endTime || undefined,
          notes: formData.notes || undefined,
        });
      } else {
        await WorkOrderService.addTimeLog(workOrderId, {
          ...formData,
          startTime: new Date(formData.startTime).toISOString(),
          endTime: formData.endTime ? new Date(formData.endTime).toISOString() : undefined,
        });
      }
      setOpenDialog(false);
      setEditingLog(null);
      onUpdate();
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการบันทึก time log');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (logId: string) => {
    if (!window.confirm('ยืนยันการลบ time log นี้?')) {
      return;
    }

    try {
      await WorkOrderService.deleteTimeLog(workOrderId, logId);
      onUpdate();
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการลบ time log');
    }
  };

  const handleOpenDialog = (log?: TimeLog) => {
    setEditingLog(log || null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingLog(null);
    setFormData({
      activityType: '',
      startTime: new Date().toISOString().slice(0, 16),
      endTime: '',
      hourlyRate: undefined,
      notes: '',
    });
    setErrors({});
    setError(null);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (minutes?: number): string => {
    if (!minutes) return '-';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours} ชม. ${mins} นาที`;
    }
    return `${mins} นาที`;
  };

  const totalDuration = timeLogs.reduce((sum, log) => sum + (log.duration || 0), 0);
  const totalCost = timeLogs.reduce((sum, log) => sum + Number(log.totalCost || 0), 0);

  return (
    <Box>
      <Paper sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box>
            <Typography variant="h6">บันทึกเวลา</Typography>
            <Typography variant="body2" color="text.secondary">
              รวมเวลา: {formatDuration(totalDuration)} | รวมค่าใช้จ่าย: ฿{totalCost.toLocaleString()}
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            disabled={!user || (user.role !== 'TECHNICIAN' && user.role !== 'ADMIN')}
          >
            เพิ่มบันทึกเวลา
          </Button>
        </Box>
        <Divider sx={{ mb: 2 }} />

        {user && user.role !== 'TECHNICIAN' && user.role !== 'ADMIN' && (
          <Alert severity="info" sx={{ mb: 2 }}>
            คุณต้องเป็นช่างซ่อมหรือ Admin เพื่อบันทึกเวลา
          </Alert>
        )}

        {timeLogs.length === 0 ? (
          <Typography variant="body2" color="text.secondary" align="center" py={3}>
            ยังไม่มีบันทึกเวลา
          </Typography>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ประเภทกิจกรรม</TableCell>
                  <TableCell>เวลาเริ่มต้น</TableCell>
                  <TableCell>เวลาสิ้นสุด</TableCell>
                  <TableCell align="right">ระยะเวลา</TableCell>
                  <TableCell align="right">อัตรา</TableCell>
                  <TableCell align="right">รวม</TableCell>
                  <TableCell>ช่างซ่อม</TableCell>
                  <TableCell align="right">จัดการ</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {timeLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <Chip label={log.activityType} size="small" />
                    </TableCell>
                    <TableCell>{formatDate(log.startTime)}</TableCell>
                    <TableCell>
                      {log.endTime ? formatDate(log.endTime) : <Chip label="กำลังทำงาน" size="small" color="warning" />}
                    </TableCell>
                    <TableCell align="right">{formatDuration(log.duration)}</TableCell>
                    <TableCell align="right">
                      {log.hourlyRate ? `฿${Number(log.hourlyRate).toLocaleString()}/ชม.` : '-'}
                    </TableCell>
                    <TableCell align="right">
                      {log.totalCost ? `฿${Number(log.totalCost).toLocaleString()}` : '-'}
                    </TableCell>
                    <TableCell>
                      {log.technician ? `${log.technician.user?.firstName} ${log.technician.user?.lastName}` : '-'}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        edge="end"
                        onClick={() => handleOpenDialog(log)}
                        size="small"
                        sx={{ mr: 1 }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        edge="end"
                        onClick={() => handleDelete(log.id)}
                        size="small"
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingLog ? 'แก้ไขบันทึกเวลา' : 'เพิ่มบันทึกเวลา'}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="ประเภทกิจกรรม *"
                value={formData.activityType}
                onChange={(e) => setFormData((prev) => ({ ...prev, activityType: e.target.value }))}
                error={!!errors.activityType}
                helperText={errors.activityType}
                required
                disabled={!!editingLog}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="เวลาเริ่มต้น *"
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) => setFormData((prev) => ({ ...prev, startTime: e.target.value }))}
                error={!!errors.startTime}
                helperText={errors.startTime}
                InputLabelProps={{
                  shrink: true,
                }}
                required
                disabled={!!editingLog}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="เวลาสิ้นสุด"
                type="datetime-local"
                value={formData.endTime}
                onChange={(e) => setFormData((prev) => ({ ...prev, endTime: e.target.value }))}
                error={!!errors.endTime}
                helperText={errors.endTime}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>

            {!editingLog && (
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="อัตราต่อชั่วโมง (฿)"
                  type="number"
                  value={formData.hourlyRate || ''}
                  onChange={(e) => setFormData((prev) => ({
                    ...prev,
                    hourlyRate: e.target.value ? Number(e.target.value) : undefined,
                  }))}
                  InputProps={{
                    inputProps: { min: 0, step: 0.01 },
                  }}
                />
              </Grid>
            )}

            {calculateDuration() !== null && (
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  ระยะเวลา: {formatDuration(calculateDuration() || 0)}
                </Typography>
                {calculateTotalCost() !== null && (
                  <Typography variant="body2" color="text.secondary">
                    รวม: ฿{calculateTotalCost()?.toLocaleString()}
                  </Typography>
                )}
              </Grid>
            )}

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="หมายเหตุ"
                value={formData.notes}
                onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={loading}>
            ยกเลิก
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading}
          >
            {loading ? 'กำลังบันทึก...' : 'บันทึก'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

