import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Grid,
  Paper,
  Typography,
  Alert,
} from '@mui/material';
import { Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';
import { Customer, CustomerQuickCreate } from '../../types/customer';
import { CustomerService } from '../../services/customerService';

interface CustomerQuickAddProps {
  onSuccess: (customer: Customer) => void;
  onCancel?: () => void;
}

export const CustomerQuickAdd: React.FC<CustomerQuickAddProps> = ({
  onSuccess,
  onCancel,
}) => {
  const [formData, setFormData] = useState<CustomerQuickCreate>({
    companyName: '',
    email: '',
    contactPerson: '',
    phone: '',
    address: '',
    taxId: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof CustomerQuickCreate, string>>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateField = (field: keyof CustomerQuickCreate, value: string): string => {
    switch (field) {
      case 'companyName':
        if (!value.trim()) return 'กรุณากรอกชื่อบริษัท';
        if (value.length < 2) return 'ชื่อบริษัทต้องมีความยาวอย่างน้อย 2 ตัวอักษร';
        break;
      case 'email':
        if (!value.trim()) return 'กรุณากรอกอีเมล';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return 'รูปแบบอีเมลไม่ถูกต้อง';
        break;
      case 'contactPerson':
        if (!value.trim()) return 'กรุณากรอกชื่อผู้ติดต่อ';
        if (value.length < 2) return 'ชื่อผู้ติดต่อต้องมีความยาวอย่างน้อย 2 ตัวอักษร';
        break;
      case 'phone':
        if (!value.trim()) return 'กรุณากรอกเบอร์โทรศัพท์';
        if (value.length < 10) return 'เบอร์โทรศัพท์ต้องมีความยาวอย่างน้อย 10 ตัวอักษร';
        break;
    }
    return '';
  };

  const handleChange = (field: keyof CustomerQuickCreate) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Real-time validation
    const error = validateField(field, value);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CustomerQuickCreate, string>> = {};
    let isValid = true;

    (['companyName', 'email', 'contactPerson', 'phone'] as const).forEach((field) => {
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
      const response = await CustomerService.quickCreateCustomer(formData);
      if (response.success && response.data) {
        onSuccess(response.data.customer);
        // Reset form
        setFormData({
          companyName: '',
          email: '',
          contactPerson: '',
          phone: '',
          address: '',
          taxId: '',
        });
        setErrors({});
      } else {
        setError(response.error?.message || 'เกิดข้อผิดพลาดในการสร้างลูกค้า');
      }
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการสร้างลูกค้า');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        เพิ่มลูกค้าใหม่
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="ชื่อบริษัท *"
              value={formData.companyName}
              onChange={handleChange('companyName')}
              error={!!errors.companyName}
              helperText={errors.companyName}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="อีเมล *"
              type="email"
              value={formData.email}
              onChange={handleChange('email')}
              error={!!errors.email}
              helperText={errors.email}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="ชื่อผู้ติดต่อ *"
              value={formData.contactPerson}
              onChange={handleChange('contactPerson')}
              error={!!errors.contactPerson}
              helperText={errors.contactPerson}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="เบอร์โทรศัพท์ *"
              value={formData.phone}
              onChange={handleChange('phone')}
              error={!!errors.phone}
              helperText={errors.phone}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="ที่อยู่"
              value={formData.address}
              onChange={handleChange('address')}
              multiline
              rows={2}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="เลขประจำตัวผู้เสียภาษี"
              value={formData.taxId}
              onChange={handleChange('taxId')}
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

