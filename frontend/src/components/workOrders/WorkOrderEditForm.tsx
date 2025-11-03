import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Box,
  Typography,
  Grid,
} from '@mui/material';
import { WorkOrder, WorkOrderUpdate } from '../../types/workOrder';
import { Priority } from '../../types/common';
import { WorkOrderService } from '../../services/workOrderService';
import { useAuth } from '../../contexts/AuthContext';

interface WorkOrderEditFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  workOrder: WorkOrder;
}

export const WorkOrderEditForm: React.FC<WorkOrderEditFormProps> = ({
  open,
  onClose,
  onSuccess,
  workOrder,
}) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [formData, setFormData] = useState<WorkOrderUpdate>({
    description: workOrder.description || '',
    notes: workOrder.notes || '',
    priority: workOrder.priority,
    estimatedCost: workOrder.estimatedCost ? Number(workOrder.estimatedCost) : undefined,
    actualCost: workOrder.actualCost ? Number(workOrder.actualCost) : undefined,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof WorkOrderUpdate, string>>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && workOrder) {
      setFormData({
        description: workOrder.description || '',
        notes: workOrder.notes || '',
        priority: workOrder.priority,
        estimatedCost: workOrder.estimatedCost ? Number(workOrder.estimatedCost) : undefined,
        actualCost: workOrder.actualCost ? Number(workOrder.actualCost) : undefined,
      });
      setErrors({});
      setError(null);
    }
  }, [open, workOrder]);

  const validateField = (field: keyof WorkOrderUpdate, value: any): string => {
    switch (field) {
      case 'description':
        if (value && value.length < 10) {
          return 'รายละเอียดต้องมีความยาวอย่างน้อย 10 ตัวอักษร';
        }
        break;
      case 'estimatedCost':
      case 'actualCost':
        if (value !== undefined && value !== null && value < 0) {
          return 'ราคาต้องมากกว่าหรือเท่ากับ 0';
        }
        break;
    }
    return '';
  };

  const handleChange = (field: keyof WorkOrderUpdate) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = field === 'priority' ? e.target.value : 
                  field === 'estimatedCost' || field === 'actualCost' ? 
                  (e.target.value === '' ? undefined : Number(e.target.value)) : 
                  e.target.value;
    
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Real-time validation
    const error = validateField(field, value);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof WorkOrderUpdate, string>> = {};
    let isValid = true;

    (['description', 'estimatedCost', 'actualCost'] as const).forEach((field) => {
      if (formData[field] !== undefined && formData[field] !== null) {
        const error = validateField(field, formData[field]);
        if (error) {
          newErrors[field] = error;
          isValid = false;
        }
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    setError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await WorkOrderService.updateWorkOrder(workOrder.id, formData);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการอัปเดตใบงาน');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      description: workOrder.description || '',
      notes: workOrder.notes || '',
      priority: workOrder.priority,
      estimatedCost: workOrder.estimatedCost ? Number(workOrder.estimatedCost) : undefined,
      actualCost: workOrder.actualCost ? Number(workOrder.actualCost) : undefined,
    });
    setErrors({});
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>แก้ไขใบงาน</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {!isAdmin && (
          <Alert severity="info" sx={{ mb: 2 }}>
            คุณสามารถแก้ไขได้เฉพาะ: รายละเอียดปัญหา, หมายเหตุ, และความสำคัญ
          </Alert>
        )}

        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="รายละเอียดปัญหา"
              value={formData.description}
              onChange={handleChange('description')}
              error={!!errors.description}
              helperText={errors.description}
              multiline
              rows={4}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="หมายเหตุ"
              value={formData.notes}
              onChange={handleChange('notes')}
              error={!!errors.notes}
              helperText={errors.notes}
              multiline
              rows={3}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>ความสำคัญ</InputLabel>
              <Select
                value={formData.priority}
                onChange={(e) => handleChange('priority')(e as any)}
                label="ความสำคัญ"
              >
                <MenuItem value="LOW">ต่ำ</MenuItem>
                <MenuItem value="MEDIUM">ปานกลาง</MenuItem>
                <MenuItem value="HIGH">สูง</MenuItem>
                <MenuItem value="URGENT">ด่วน</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {isAdmin && (
            <>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="ราคาประมาณการ (฿)"
                  type="number"
                  value={formData.estimatedCost || ''}
                  onChange={handleChange('estimatedCost')}
                  error={!!errors.estimatedCost}
                  helperText={errors.estimatedCost}
                  InputProps={{
                    inputProps: { min: 0, step: 0.01 },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="ราคาจริง (฿)"
                  type="number"
                  value={formData.actualCost || ''}
                  onChange={handleChange('actualCost')}
                  error={!!errors.actualCost}
                  helperText={errors.actualCost}
                  InputProps={{
                    inputProps: { min: 0, step: 0.01 },
                  }}
                />
              </Grid>
            </>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
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
  );
};

