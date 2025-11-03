import React, { useState } from 'react';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  AttachFile as AttachFileIcon,
} from '@mui/icons-material';
import { WorkOrderDocument, WorkOrderDocumentCreate } from '../../types/workOrder';
import { WorkOrderService } from '../../services/workOrderService';

interface DocumentsSectionProps {
  workOrderId: string;
  documents: WorkOrderDocument[];
  onUpdate: () => void;
}

const DOCUMENT_TYPES = [
  'QUOTATION',
  'INVOICE',
  'RECEIPT',
  'WARRANTY_CERTIFICATE',
  'DIAGNOSTIC_REPORT',
  'PHOTO',
  'OTHER',
];

const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  QUOTATION: 'ใบเสนอราคา',
  INVOICE: 'ใบแจ้งหนี้',
  RECEIPT: 'ใบเสร็จ',
  WARRANTY_CERTIFICATE: 'ใบรับประกัน',
  DIAGNOSTIC_REPORT: 'รายงานวินิจฉัย',
  PHOTO: 'รูปภาพ',
  OTHER: 'อื่นๆ',
};

export const DocumentsSection: React.FC<DocumentsSectionProps> = ({
  workOrderId,
  documents,
  onUpdate,
}) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState<WorkOrderDocumentCreate>({
    documentType: '',
    file: null as any,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof WorkOrderDocumentCreate, string>>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof WorkOrderDocumentCreate, string>> = {};
    let isValid = true;

    if (!formData.documentType) {
      newErrors.documentType = 'กรุณาเลือกประเภทเอกสาร';
      isValid = false;
    }

    if (!formData.file) {
      newErrors.file = 'กรุณาเลือกไฟล์';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, file }));
      setErrors((prev) => ({ ...prev, file: '' }));
    }
  };

  const handleSubmit = async () => {
    setError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await WorkOrderService.uploadDocument(workOrderId, formData);
      setOpenDialog(false);
      setFormData({
        documentType: '',
        file: null as any,
      });
      onUpdate();
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการอัปโหลดเอกสาร');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (documentId: string) => {
    if (!window.confirm('ยืนยันการลบเอกสารนี้?')) {
      return;
    }

    try {
      // TODO: Implement delete document API
      // await WorkOrderService.deleteDocument(workOrderId, documentId);
      onUpdate();
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการลบเอกสาร');
    }
  };

  const handleDownload = async (document: WorkOrderDocument) => {
    try {
      // TODO: Implement download document API
      // const response = await WorkOrderService.downloadDocument(workOrderId, document.id);
      // Create download link
      window.open(document.filePath, '_blank');
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการดาวน์โหลดเอกสาร');
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({
      documentType: '',
      file: null as any,
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

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return '-';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <Box>
      <Paper sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">เอกสาร</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
          >
            อัปโหลดเอกสาร
          </Button>
        </Box>
        <Divider sx={{ mb: 2 }} />

        {documents.length === 0 ? (
          <Typography variant="body2" color="text.secondary" align="center" py={3}>
            ยังไม่มีเอกสาร
          </Typography>
        ) : (
          <List>
            {documents.map((document, index) => (
              <React.Fragment key={document.id}>
                <ListItem>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <AttachFileIcon fontSize="small" color="action" />
                        <Typography variant="body1">
                          {document.fileName}
                        </Typography>
                        <Chip
                          label={DOCUMENT_TYPE_LABELS[document.documentType] || document.documentType}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {formatFileSize(document.fileSize)} • {formatDate(document.uploadedAt)}
                        </Typography>
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={() => handleDownload(document)}
                      size="small"
                      sx={{ mr: 1 }}
                    >
                      <DownloadIcon />
                    </IconButton>
                    <IconButton
                      edge="end"
                      onClick={() => handleDelete(document.id)}
                      size="small"
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
                {index < documents.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>

      {/* Upload Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>อัปโหลดเอกสาร</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>ประเภทเอกสาร *</InputLabel>
                <Select
                  value={formData.documentType}
                  onChange={(e) => setFormData((prev) => ({ ...prev, documentType: e.target.value }))}
                  label="ประเภทเอกสาร *"
                  error={!!errors.documentType}
                >
                  {DOCUMENT_TYPES.map((type) => (
                    <MenuItem key={type} value={type}>
                      {DOCUMENT_TYPE_LABELS[type]}
                    </MenuItem>
                  ))}
                </Select>
                {errors.documentType && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                    {errors.documentType}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                type="file"
                label="ไฟล์ *"
                InputLabelProps={{
                  shrink: true,
                }}
                inputProps={{
                  accept: '.pdf,.doc,.docx,.jpg,.jpeg,.png,.xlsx,.xls',
                }}
                onChange={handleFileChange}
                error={!!errors.file}
                helperText={errors.file || 'รองรับไฟล์: PDF, DOC, DOCX, JPG, PNG, XLSX'}
              />
              {formData.file && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  ไฟล์ที่เลือก: {formData.file.name} ({formatFileSize(formData.file.size)})
                </Typography>
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
            {loading ? 'กำลังอัปโหลด...' : 'อัปโหลด'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

