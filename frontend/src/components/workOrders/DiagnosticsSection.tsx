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
  Chip,
  Divider,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { Diagnostic, DiagnosticCreate } from '../../types/workOrder';
import { WorkOrderService } from '../../services/workOrderService';

interface DiagnosticsSectionProps {
  workOrderId: string;
  diagnostics: Diagnostic[];
  onUpdate: () => void;
}

export const DiagnosticsSection: React.FC<DiagnosticsSectionProps> = ({
  workOrderId,
  diagnostics,
  onUpdate,
}) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingDiagnostic, setEditingDiagnostic] = useState<Diagnostic | null>(null);
  const [formData, setFormData] = useState<DiagnosticCreate>({
    faultType: '',
    faultDescription: '',
    diagnosisNotes: '',
    recommendedParts: [],
    estimatedRepairTime: undefined,
  });
  const [recommendedPart, setRecommendedPart] = useState('');
  const [errors, setErrors] = useState<Partial<Record<keyof DiagnosticCreate, string>>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingDiagnostic) {
      setFormData({
        faultType: editingDiagnostic.faultType,
        faultDescription: editingDiagnostic.faultDescription || '',
        diagnosisNotes: editingDiagnostic.diagnosisNotes || '',
        recommendedParts: editingDiagnostic.recommendedParts || [],
        estimatedRepairTime: editingDiagnostic.estimatedRepairTime,
      });
    } else {
      setFormData({
        faultType: '',
        faultDescription: '',
        diagnosisNotes: '',
        recommendedParts: [],
        estimatedRepairTime: undefined,
      });
    }
    setRecommendedPart('');
    setErrors({});
    setError(null);
  }, [openDialog, editingDiagnostic]);

  const handleAddRecommendedPart = () => {
    if (recommendedPart.trim()) {
      setFormData((prev) => ({
        ...prev,
        recommendedParts: [...(prev.recommendedParts || []), recommendedPart.trim()],
      }));
      setRecommendedPart('');
    }
  };

  const handleRemoveRecommendedPart = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      recommendedParts: prev.recommendedParts?.filter((_, i) => i !== index) || [],
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof DiagnosticCreate, string>> = {};
    let isValid = true;

    if (!formData.faultType.trim()) {
      newErrors.faultType = 'กรุณาระบุประเภทของปัญหา';
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
      if (editingDiagnostic) {
        // TODO: Update diagnostic if API supports it
        // For now, we'll create a new one
        await WorkOrderService.createDiagnostic(workOrderId, formData);
      } else {
        await WorkOrderService.createDiagnostic(workOrderId, formData);
      }
      setOpenDialog(false);
      setEditingDiagnostic(null);
      onUpdate();
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการบันทึกผลการวินิจฉัย');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (diagnostic?: Diagnostic) => {
    setEditingDiagnostic(diagnostic || null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingDiagnostic(null);
    setFormData({
      faultType: '',
      faultDescription: '',
      diagnosisNotes: '',
      recommendedParts: [],
      estimatedRepairTime: undefined,
    });
    setRecommendedPart('');
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

  return (
    <Box>
      <Paper sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">ผลการวินิจฉัย</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            เพิ่มผลการวินิจฉัย
          </Button>
        </Box>
        <Divider sx={{ mb: 2 }} />

        {diagnostics.length === 0 ? (
          <Typography variant="body2" color="text.secondary" align="center" py={3}>
            ยังไม่มีผลการวินิจฉัย
          </Typography>
        ) : (
          <List>
            {diagnostics.map((diagnostic, index) => (
              <React.Fragment key={diagnostic.id}>
                <ListItem>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <Typography variant="subtitle1">
                          {diagnostic.faultType}
                        </Typography>
                        {diagnostic.estimatedRepairTime && (
                          <Chip
                            label={`${diagnostic.estimatedRepairTime} นาที`}
                            size="small"
                            color="info"
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box>
                        {diagnostic.faultDescription && (
                          <Typography variant="body2" paragraph>
                            {diagnostic.faultDescription}
                          </Typography>
                        )}
                        {diagnostic.diagnosisNotes && (
                          <Typography variant="body2" color="text.secondary" paragraph>
                            {diagnostic.diagnosisNotes}
                          </Typography>
                        )}
                        {diagnostic.recommendedParts && diagnostic.recommendedParts.length > 0 && (
                          <Box mt={1}>
                            <Typography variant="caption" color="text.secondary">
                              อะไหล่ที่แนะนำ:
                            </Typography>
                            <Box display="flex" flexWrap="wrap" gap={0.5} mt={0.5}>
                              {diagnostic.recommendedParts.map((part, i) => (
                                <Chip key={i} label={part} size="small" variant="outlined" />
                              ))}
                            </Box>
                          </Box>
                        )}
                        <Typography variant="caption" color="text.secondary" mt={1} display="block">
                          {formatDate(diagnostic.createdAt)}
                        </Typography>
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={() => handleOpenDialog(diagnostic)}
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
                {index < diagnostics.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingDiagnostic ? 'แก้ไขผลการวินิจฉัย' : 'เพิ่มผลการวินิจฉัย'}
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
                label="ประเภทของปัญหา *"
                value={formData.faultType}
                onChange={(e) => setFormData((prev) => ({ ...prev, faultType: e.target.value }))}
                error={!!errors.faultType}
                helperText={errors.faultType}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="รายละเอียดปัญหา"
                value={formData.faultDescription}
                onChange={(e) => setFormData((prev) => ({ ...prev, faultDescription: e.target.value }))}
                multiline
                rows={3}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="หมายเหตุการวินิจฉัย"
                value={formData.diagnosisNotes}
                onChange={(e) => setFormData((prev) => ({ ...prev, diagnosisNotes: e.target.value }))}
                multiline
                rows={3}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="เวลาซ่อมประมาณการ (นาที)"
                type="number"
                value={formData.estimatedRepairTime || ''}
                onChange={(e) => setFormData((prev) => ({
                  ...prev,
                  estimatedRepairTime: e.target.value ? Number(e.target.value) : undefined,
                }))}
                InputProps={{
                  inputProps: { min: 0 },
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                อะไหล่ที่แนะนำ
              </Typography>
              <Box display="flex" gap={1} mb={2}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="ระบุอะไหล่"
                  value={recommendedPart}
                  onChange={(e) => setRecommendedPart(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddRecommendedPart();
                    }
                  }}
                />
                <Button
                  variant="outlined"
                  onClick={handleAddRecommendedPart}
                  disabled={!recommendedPart.trim()}
                >
                  เพิ่ม
                </Button>
              </Box>
              {formData.recommendedParts && formData.recommendedParts.length > 0 && (
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {formData.recommendedParts.map((part, index) => (
                    <Chip
                      key={index}
                      label={part}
                      onDelete={() => handleRemoveRecommendedPart(index)}
                      size="small"
                    />
                  ))}
                </Box>
              )}
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

