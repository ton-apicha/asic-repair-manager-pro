import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Box,
  Typography,
} from '@mui/material';
import { WorkOrderStatus } from '../../types/common';
import {
  STAGE_LABELS,
  STAGE_DESCRIPTIONS,
  checkPrerequisites,
  getNextPossibleStatuses,
  canTransitionTo,
} from '../../utils/workflowUtils';
import { WorkOrder } from '../../types/workOrder';

interface StatusUpdateDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (newStatus: WorkOrderStatus) => Promise<void>;
  currentStatus: WorkOrderStatus;
  workOrder: WorkOrder;
}

export const StatusUpdateDialog: React.FC<StatusUpdateDialogProps> = ({
  open,
  onClose,
  onConfirm,
  currentStatus,
  workOrder,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<WorkOrderStatus | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nextPossibleStatuses = getNextPossibleStatuses(currentStatus);

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status as WorkOrderStatus);
    setError(null);
  };

  const handleConfirm = async () => {
    if (!selectedStatus) return;

    // Validate prerequisites
    const prerequisites = checkPrerequisites(
      currentStatus,
      selectedStatus,
      {
        estimatedCost: workOrder.estimatedCost,
        actualCost: workOrder.actualCost,
        technicianId: workOrder.technicianId,
        diagnostics: workOrder.diagnostics,
      }
    );

    if (!prerequisites.canTransition) {
      setError(prerequisites.missingRequirements.join(', '));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onConfirm(selectedStatus);
      setSelectedStatus('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการอัปเดตสถานะ');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedStatus('');
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>เปลี่ยนสถานะใบงาน</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            สถานะปัจจุบัน
          </Typography>
          <Typography variant="body1" fontWeight="bold">
            {STAGE_LABELS[currentStatus]}
          </Typography>
        </Box>

        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>สถานะใหม่</InputLabel>
          <Select
            value={selectedStatus}
            onChange={(e) => handleStatusChange(e.target.value)}
            label="สถานะใหม่"
          >
            {nextPossibleStatuses.map((status) => (
              <MenuItem key={status} value={status}>
                <Box>
                  <Typography variant="body1">
                    {STAGE_LABELS[status]}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {STAGE_DESCRIPTIONS[status]}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {selectedStatus && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              คำอธิบาย:
            </Typography>
            <Typography variant="body2">
              {STAGE_DESCRIPTIONS[selectedStatus]}
            </Typography>
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          ยกเลิก
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={!selectedStatus || loading}
        >
          {loading ? 'กำลังอัปเดต...' : 'ยืนยัน'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

