import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Grid,
  Paper,
  Typography,
  Alert,
  Autocomplete,
} from '@mui/material';
import { Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';
import { Device, DeviceQuickCreate } from '../../types/device';
import { Customer } from '../../types/customer';
import { DeviceService } from '../../services/deviceService';
import { CustomerService } from '../../services/customerService';
import { LoadingSpinner } from '../LoadingSpinner';

interface DeviceQuickAddProps {
  customerId?: string; // Pre-select customer if provided
  onSuccess: (device: Device) => void;
  onCancel?: () => void;
}

export const DeviceQuickAdd: React.FC<DeviceQuickAddProps> = ({
  customerId: initialCustomerId,
  onSuccess,
  onCancel,
}) => {
  const [formData, setFormData] = useState<DeviceQuickCreate>({
    customerId: initialCustomerId || '',
    model: '',
    serialNumber: '',
    purchaseDate: '',
    warrantyExpiry: '',
  });

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof DeviceQuickCreate, string>>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load customers for autocomplete
  useEffect(() => {
    const loadCustomers = async () => {
      setLoadingCustomers(true);
      try {
        const response = await CustomerService.getCustomers({ limit: 100 });
        if (response.success && response.data) {
          setCustomers(response.data.data);
          
          // Pre-select customer if provided
          if (initialCustomerId) {
            const customer = response.data.data.find(c => c.id === initialCustomerId);
            if (customer) {
              setSelectedCustomer(customer);
            }
          }
        }
      } catch (err: any) {
        setError('เกิดข้อผิดพลาดในการโหลดรายการลูกค้า');
      } finally {
        setLoadingCustomers(false);
      }
    };

    loadCustomers();
  }, [initialCustomerId]);

  const validateField = (field: keyof DeviceQuickCreate, value: string): string => {
    switch (field) {
      case 'customerId':
        if (!value.trim()) return 'กรุณาเลือกลูกค้า';
        break;
      case 'model':
        if (!value.trim()) return 'กรุณากรอกรุ่นอุปกรณ์';
        if (value.length < 2) return 'รุ่นอุปกรณ์ต้องมีความยาวอย่างน้อย 2 ตัวอักษร';
        break;
    }
    return '';
  };

  const handleChange = (field: keyof DeviceQuickCreate) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Real-time validation
    const error = validateField(field, value);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleCustomerChange = (_event: any, newValue: Customer | null) => {
    setSelectedCustomer(newValue);
    const customerId = newValue?.id || '';
    setFormData((prev) => ({ ...prev, customerId }));
    
    // Validate customer selection
    const error = validateField('customerId', customerId);
    setErrors((prev) => ({ ...prev, customerId: error }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof DeviceQuickCreate, string>> = {};
    let isValid = true;

    (['customerId', 'model'] as const).forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await DeviceService.quickCreateDevice(formData);
      if (response.success && response.data) {
        onSuccess(response.data.device);
        // Reset form
        setFormData({
          customerId: initialCustomerId || '',
          model: '',
          serialNumber: '',
          purchaseDate: '',
          warrantyExpiry: '',
        });
        setSelectedCustomer(null);
        setErrors({});
      } else {
        setError(response.error?.message || 'เกิดข้อผิดพลาดในการสร้างอุปกรณ์');
      }
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการสร้างอุปกรณ์');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        เพิ่มอุปกรณ์ใหม่
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Autocomplete
              options={customers}
              getOptionLabel={(option) => `${option.companyName} (${option.email})`}
              value={selectedCustomer}
              onChange={handleCustomerChange}
              loading={loadingCustomers}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="ลูกค้า *"
                  error={!!errors.customerId}
                  helperText={errors.customerId}
                  required
                />
              )}
              disabled={!!initialCustomerId}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="รุ่นอุปกรณ์ *"
              value={formData.model}
              onChange={handleChange('model')}
              error={!!errors.model}
              helperText={errors.model}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Serial Number"
              value={formData.serialNumber}
              onChange={handleChange('serialNumber')}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="วันที่ซื้อ"
              type="date"
              value={formData.purchaseDate}
              onChange={handleChange('purchaseDate')}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="วันหมดประกัน"
              type="date"
              value={formData.warrantyExpiry}
              onChange={handleChange('warrantyExpiry')}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <Box display="flex" gap={2} justifyContent="flex-end">
              {onCancel && (
                <Button
                  variant="outlined"
                  startIcon={<CancelIcon />}
                  onClick={onCancel}
                  disabled={loading}
                >
                  ยกเลิก
                </Button>
              )}
              <Button
                type="submit"
                variant="contained"
                startIcon={<SaveIcon />}
                disabled={loading}
              >
                {loading ? 'กำลังบันทึก...' : 'บันทึก'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

