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
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  Alert,
  Autocomplete,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { PartsUsage, PartsUsageCreate, Part } from '../../types/workOrder';
import { WorkOrderService } from '../../services/workOrderService';
import { apiClient } from '../../services/apiClient';
import { ApiResponse, PaginatedResponse } from '../../types/common';

interface PartsUsageSectionProps {
  workOrderId: string;
  partsUsage: PartsUsage[];
  onUpdate: () => void;
}

export const PartsUsageSection: React.FC<PartsUsageSectionProps> = ({
  workOrderId,
  partsUsage,
  onUpdate,
}) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [parts, setParts] = useState<Part[]>([]);
  const [loadingParts, setLoadingParts] = useState(false);
  const [formData, setFormData] = useState<PartsUsageCreate>({
    partId: '',
    quantity: 1,
    unitCost: 0,
  });
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof PartsUsageCreate, string>>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (openDialog) {
      loadParts();
    }
  }, [openDialog]);

  const loadParts = async () => {
    setLoadingParts(true);
    try {
      const response = await apiClient.get<ApiResponse<PaginatedResponse<Part>>>('/parts', {
        params: { limit: 100, status: 'AVAILABLE' },
      });
      if (response.data.success && response.data.data) {
        setParts(response.data.data.data);
      }
    } catch (err: any) {
      setError('เกิดข้อผิดพลาดในการโหลดรายการอะไหล่');
    } finally {
      setLoadingParts(false);
    }
  };

  useEffect(() => {
    if (selectedPart) {
      setFormData((prev) => ({
        ...prev,
        partId: selectedPart.id,
        unitCost: Number(selectedPart.cost),
      }));
    }
  }, [selectedPart]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof PartsUsageCreate, string>> = {};
    let isValid = true;

    if (!formData.partId) {
      newErrors.partId = 'กรุณาเลือกอะไหล่';
      isValid = false;
    }

    if (!formData.quantity || formData.quantity <= 0) {
      newErrors.quantity = 'กรุณาระบุจำนวนที่ถูกต้อง';
      isValid = false;
    }

    if (!formData.unitCost || formData.unitCost <= 0) {
      newErrors.unitCost = 'กรุณาระบุราคาต่อหน่วยที่ถูกต้อง';
      isValid = false;
    }

    // Check stock availability
    if (selectedPart && formData.quantity > selectedPart.quantityInStock) {
      newErrors.quantity = `สต็อกไม่พอ จำนวนที่เหลือ: ${selectedPart.quantityInStock}`;
      isValid = false;
    }

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
      await WorkOrderService.addPartsUsage(workOrderId, formData);
      setOpenDialog(false);
      setFormData({
        partId: '',
        quantity: 1,
        unitCost: 0,
      });
      setSelectedPart(null);
      onUpdate();
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการบันทึกการใช้อะไหล่');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (partUsageId: string) => {
    if (!window.confirm('ยืนยันการลบการใช้อะไหล่นี้?')) {
      return;
    }

    try {
      await WorkOrderService.deletePartsUsage(workOrderId, partUsageId);
      onUpdate();
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการลบการใช้อะไหล่');
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({
      partId: '',
      quantity: 1,
      unitCost: 0,
    });
    setSelectedPart(null);
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

  const totalCost = partsUsage.reduce((sum, usage) => sum + Number(usage.totalCost), 0);

  return (
    <Box>
      <Paper sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box>
            <Typography variant="h6">การใช้อะไหล่</Typography>
            <Typography variant="body2" color="text.secondary">
              รวมค่าใช้จ่าย: ฿{totalCost.toLocaleString()}
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
          >
            เพิ่มอะไหล่
          </Button>
        </Box>
        <Divider sx={{ mb: 2 }} />

        {partsUsage.length === 0 ? (
          <Typography variant="body2" color="text.secondary" align="center" py={3}>
            ยังไม่มีการใช้อะไหล่
          </Typography>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>อะไหล่</TableCell>
                  <TableCell align="right">จำนวน</TableCell>
                  <TableCell align="right">ราคาต่อหน่วย</TableCell>
                  <TableCell align="right">รวม</TableCell>
                  <TableCell>วันที่ใช้</TableCell>
                  <TableCell align="right">จัดการ</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {partsUsage.map((usage) => (
                  <TableRow key={usage.id}>
                    <TableCell>
                      <Typography variant="body2">
                        {usage.part?.partNumber || 'N/A'}
                      </Typography>
                      {usage.part?.model && (
                        <Typography variant="caption" color="text.secondary">
                          {usage.part.model}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">{usage.quantity}</TableCell>
                    <TableCell align="right">
                      ฿{Number(usage.unitCost).toLocaleString()}
                    </TableCell>
                    <TableCell align="right">
                      ฿{Number(usage.totalCost).toLocaleString()}
                    </TableCell>
                    <TableCell>{formatDate(usage.usedAt)}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        edge="end"
                        onClick={() => handleDelete(usage.id)}
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

      {/* Add Parts Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>เพิ่มการใช้อะไหล่</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Autocomplete
                options={parts}
                getOptionLabel={(option) => `${option.partNumber} ${option.model ? `- ${option.model}` : ''} (สต็อก: ${option.quantityInStock})`}
                value={selectedPart}
                onChange={(_event, newValue) => {
                  setSelectedPart(newValue);
                  if (newValue) {
                    setFormData((prev) => ({
                      ...prev,
                      partId: newValue.id,
                      unitCost: Number(newValue.cost),
                    }));
                  }
                }}
                loading={loadingParts}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="อะไหล่ *"
                    error={!!errors.partId}
                    helperText={errors.partId || (selectedPart && `สต็อก: ${selectedPart.quantityInStock}`)}
                    required
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="จำนวน *"
                type="number"
                value={formData.quantity}
                onChange={(e) => {
                  const quantity = Number(e.target.value);
                  setFormData((prev) => ({ ...prev, quantity }));
                }}
                error={!!errors.quantity}
                helperText={errors.quantity}
                InputProps={{
                  inputProps: { min: 1, max: selectedPart?.quantityInStock || 999 },
                }}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="ราคาต่อหน่วย (฿) *"
                type="number"
                value={formData.unitCost}
                onChange={(e) => {
                  const unitCost = Number(e.target.value);
                  setFormData((prev) => ({ ...prev, unitCost }));
                }}
                error={!!errors.unitCost}
                helperText={errors.unitCost}
                InputProps={{
                  inputProps: { min: 0, step: 0.01 },
                }}
                required
              />
            </Grid>

            {formData.quantity > 0 && formData.unitCost > 0 && (
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  รวม: ฿{(formData.quantity * formData.unitCost).toLocaleString()}
                </Typography>
              </Grid>
            )}
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

