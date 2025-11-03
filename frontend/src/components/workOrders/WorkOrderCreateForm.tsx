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
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Snackbar,
} from '@mui/material';
import { Save as SaveIcon, Add as AddIcon } from '@mui/icons-material';
import { WorkOrderCreate } from '../../types/workOrder';
import { Priority } from '../../types/common';
import { Customer } from '../../types/customer';
import { Device } from '../../types/device';
import { WorkOrderService } from '../../services/workOrderService';
import { CustomerService } from '../../services/customerService';
import { DeviceService } from '../../services/deviceService';
import { CustomerQuickAdd } from '../customers/CustomerQuickAdd';
import { DeviceQuickAdd } from '../devices/DeviceQuickAdd';

interface WorkOrderCreateFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const WorkOrderCreateForm: React.FC<WorkOrderCreateFormProps> = ({
  onSuccess,
  onCancel,
}) => {
  const [formData, setFormData] = useState<WorkOrderCreate>({
    customerId: '',
    deviceId: '',
    description: '',
    priority: Priority.MEDIUM,
  });

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [loadingDevices, setLoadingDevices] = useState(false);
  const [showCustomerQuickAdd, setShowCustomerQuickAdd] = useState(false);
  const [showDeviceQuickAdd, setShowDeviceQuickAdd] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof WorkOrderCreate, string>>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Load customers for autocomplete
  useEffect(() => {
    const loadCustomers = async () => {
      setLoadingCustomers(true);
      try {
        const response = await CustomerService.getCustomers({ limit: 100 });
        if (response.success && response.data) {
          setCustomers(response.data.data);
        }
      } catch (err: any) {
        setError('เกิดข้อผิดพลาดในการโหลดรายการลูกค้า');
      } finally {
        setLoadingCustomers(false);
      }
    };

    loadCustomers();
  }, []);

  // Load devices when customer is selected
  useEffect(() => {
    if (selectedCustomer?.id) {
      const loadDevices = async () => {
        setLoadingDevices(true);
        try {
          const response = await DeviceService.getDevices({ 
            customerId: selectedCustomer.id,
            limit: 100 
          });
          if (response.success && response.data) {
            setDevices(response.data.data);
          }
        } catch (err: any) {
          setError('เกิดข้อผิดพลาดในการโหลดรายการอุปกรณ์');
        } finally {
          setLoadingDevices(false);
        }
      };

      loadDevices();
    } else {
      setDevices([]);
      setSelectedDevice(null);
      setFormData((prev) => ({ ...prev, deviceId: '' }));
    }
  }, [selectedCustomer]);

  const validateField = (field: keyof WorkOrderCreate, value: string): string => {
    switch (field) {
      case 'customerId':
        if (!value.trim()) return 'กรุณาเลือกลูกค้า';
        break;
      case 'deviceId':
        if (!value.trim()) return 'กรุณาเลือกอุปกรณ์';
        break;
      case 'description':
        if (!value.trim()) return 'กรุณากรอกรายละเอียดปัญหา';
        if (value.length < 10) return 'รายละเอียดต้องมีความยาวอย่างน้อย 10 ตัวอักษร';
        break;
    }
    return '';
  };

  const handleChange = (field: keyof WorkOrderCreate) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Real-time validation
    const error = validateField(field, value);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handlePriorityChange = (e: any) => {
    setFormData((prev) => ({ ...prev, priority: e.target.value as Priority }));
  };

  const handleCustomerChange = (_event: any, newValue: Customer | null) => {
    setSelectedCustomer(newValue);
    const customerId = newValue?.id || '';
    setFormData((prev) => ({ ...prev, customerId }));
    
    // Reset device selection when customer changes
    setSelectedDevice(null);
    setFormData((prev) => ({ ...prev, deviceId: '' }));

    // Validate customer selection
    const error = validateField('customerId', customerId);
    setErrors((prev) => ({ ...prev, customerId: error }));
  };

  const handleDeviceChange = (_event: any, newValue: Device | null) => {
    setSelectedDevice(newValue);
    const deviceId = newValue?.id || '';
    setFormData((prev) => ({ ...prev, deviceId }));

    // Validate device selection
    const error = validateField('deviceId', deviceId);
    setErrors((prev) => ({ ...prev, deviceId: error }));
  };

  const handleCustomerQuickAddSuccess = (customer: Customer) => {
    setCustomers((prev) => [...prev, customer]);
    setSelectedCustomer(customer);
    setFormData((prev) => ({ ...prev, customerId: customer.id }));
    setShowCustomerQuickAdd(false);
    setErrors((prev) => ({ ...prev, customerId: '' }));
  };

  const handleDeviceQuickAddSuccess = (device: Device) => {
    setDevices((prev) => [...prev, device]);
    setSelectedDevice(device);
    setFormData((prev) => ({ ...prev, deviceId: device.id }));
    setShowDeviceQuickAdd(false);
    setErrors((prev) => ({ ...prev, deviceId: '' }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof WorkOrderCreate, string>> = {};
    let isValid = true;

    (['customerId', 'deviceId', 'description'] as const).forEach((field) => {
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
      const response = await WorkOrderService.createWorkOrder(formData);
      if (response.success && response.data) {
        setSuccess(true);
        // Reset form
        setFormData({
          customerId: '',
          deviceId: '',
          description: '',
          priority: Priority.MEDIUM,
        });
        setSelectedCustomer(null);
        setSelectedDevice(null);
        setErrors({});
        
        // Call success callback
        if (onSuccess) {
          setTimeout(() => {
            onSuccess();
          }, 1000);
        }
      } else {
        setError(response.error?.message || 'เกิดข้อผิดพลาดในการสร้างใบงาน');
      }
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการสร้างใบงาน');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          สร้างใบงานใหม่
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {showCustomerQuickAdd ? (
          <CustomerQuickAdd
            onSuccess={handleCustomerQuickAddSuccess}
            onCancel={() => setShowCustomerQuickAdd(false)}
          />
        ) : showDeviceQuickAdd ? (
          <DeviceQuickAdd
            customerId={selectedCustomer?.id}
            onSuccess={handleDeviceQuickAddSuccess}
            onCancel={() => setShowDeviceQuickAdd(false)}
          />
        ) : (
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Box display="flex" gap={2} alignItems="flex-start">
                  <Autocomplete
                    options={customers}
                    getOptionLabel={(option) => `${option.companyName} (${option.email}${option.phone ? ` - ${option.phone}` : ''})`}
                    value={selectedCustomer}
                    onChange={handleCustomerChange}
                    loading={loadingCustomers}
                    fullWidth
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="ลูกค้า *"
                        error={!!errors.customerId}
                        helperText={errors.customerId}
                        required
                      />
                    )}
                  />
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => setShowCustomerQuickAdd(true)}
                    sx={{ minWidth: 150 }}
                  >
                    เพิ่มลูกค้าใหม่
                  </Button>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Box display="flex" gap={2} alignItems="flex-start">
                  <Autocomplete
                    options={devices}
                    getOptionLabel={(option) => `${option.model}${option.serialNumber ? ` (${option.serialNumber})` : ''} - ${option.customer?.companyName || ''}`}
                    value={selectedDevice}
                    onChange={handleDeviceChange}
                    loading={loadingDevices}
                    disabled={!selectedCustomer}
                    fullWidth
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="อุปกรณ์ *"
                        error={!!errors.deviceId}
                        helperText={errors.deviceId || (!selectedCustomer ? 'กรุณาเลือกลูกค้าก่อน' : '')}
                        required
                      />
                    )}
                  />
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => setShowDeviceQuickAdd(true)}
                    disabled={!selectedCustomer}
                    sx={{ minWidth: 150 }}
                  >
                    เพิ่มอุปกรณ์ใหม่
                  </Button>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="รายละเอียดปัญหา *"
                  value={formData.description}
                  onChange={handleChange('description')}
                  error={!!errors.description}
                  helperText={errors.description}
                  multiline
                  rows={4}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>ความสำคัญ *</InputLabel>
                  <Select
                    value={formData.priority || 'MEDIUM'}
                    onChange={handlePriorityChange}
                    label="ความสำคัญ *"
                  >
                    <MenuItem value="LOW">ต่ำ</MenuItem>
                    <MenuItem value="MEDIUM">ปานกลาง</MenuItem>
                    <MenuItem value="HIGH">สูง</MenuItem>
                    <MenuItem value="URGENT">ด่วน</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Box display="flex" gap={2} justifyContent="flex-end">
                  {onCancel && (
                    <Button
                      variant="outlined"
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
                    {loading ? 'กำลังบันทึก...' : 'สร้างใบงาน'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        )}
      </Paper>

      <Snackbar
        open={success}
        autoHideDuration={3000}
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSuccess(false)} severity="success" sx={{ width: '100%' }}>
          สร้างใบงานสำเร็จ
        </Alert>
      </Snackbar>
    </Box>
  );
};

