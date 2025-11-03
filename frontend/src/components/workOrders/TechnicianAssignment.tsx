import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Chip,
  Divider,
} from '@mui/material';
import {
  Person as PersonIcon,
  PersonAdd as PersonAddIcon,
} from '@mui/icons-material';
import { Technician } from '../../types/workOrder';
import { WorkOrderService } from '../../services/workOrderService';
import { TechnicianService } from '../../services/technicianService';
import { ApiResponse, PaginatedResponse } from '../../types/common';
import { Technician as TechnicianType } from '../../types/technician';

interface TechnicianAssignmentProps {
  workOrderId: string;
  currentTechnicianId?: string;
  onUpdate: () => void;
}

export const TechnicianAssignment: React.FC<TechnicianAssignmentProps> = ({
  workOrderId,
  currentTechnicianId,
  onUpdate,
}) => {
  const [technicians, setTechnicians] = useState<TechnicianType[]>([]);
  const [selectedTechnicianId, setSelectedTechnicianId] = useState<string>('');
  const [currentTechnician, setCurrentTechnician] = useState<Technician | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingTechnicians, setLoadingTechnicians] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTechnicians();
    if (currentTechnicianId) {
      loadCurrentTechnician();
    }
  }, [currentTechnicianId]);

  const loadTechnicians = async () => {
    setLoadingTechnicians(true);
    try {
      const response: ApiResponse<PaginatedResponse<TechnicianType>> = await TechnicianService.getTechnicians({
        limit: 100,
        isActive: true,
      });
      if (response.success && response.data) {
        setTechnicians(response.data.data);
      }
    } catch (err: any) {
      setError('เกิดข้อผิดพลาดในการโหลดรายการช่างซ่อม');
    } finally {
      setLoadingTechnicians(false);
    }
  };

  const loadCurrentTechnician = async () => {
    if (!currentTechnicianId) return;

    try {
      const response = await TechnicianService.getTechnicianById(currentTechnicianId);
      if (response.success && response.data) {
        const tech = response.data.technician;
        // Convert to Technician type from workOrder
        setCurrentTechnician({
          id: tech.id,
          userId: tech.userId,
          employeeId: tech.employeeId,
          skills: tech.skills || [],
          hourlyRate: tech.hourlyRate ? Number(tech.hourlyRate) : undefined,
          isActive: tech.isActive,
          createdAt: tech.createdAt,
          updatedAt: tech.updatedAt,
          user: tech.user ? {
            firstName: tech.user.firstName,
            lastName: tech.user.lastName,
            email: tech.user.email,
          } : undefined,
        });
      }
    } catch (err: any) {
      // Ignore error
    }
  };

  const handleAssign = async () => {
    if (!selectedTechnicianId) return;

    setLoading(true);
    setError(null);

    try {
      await WorkOrderService.assignTechnician(workOrderId, {
        technicianId: selectedTechnicianId,
      });
      setSelectedTechnicianId('');
      setCurrentTechnician(null);
      onUpdate();
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการมอบหมายช่างซ่อม');
    } finally {
      setLoading(false);
    }
  };

  const handleUnassign = async () => {
    if (!window.confirm('ยืนยันการยกเลิกการมอบหมายช่างซ่อม?')) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await WorkOrderService.assignTechnician(workOrderId, {
        technicianId: null as any,
      });
      setCurrentTechnician(null);
      onUpdate();
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการยกเลิกการมอบหมาย');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        มอบหมายช่างซ่อม
      </Typography>
      <Divider sx={{ mb: 2 }} />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {currentTechnician ? (
        <Box>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <PersonIcon color="primary" />
            <Box>
              <Typography variant="body1" fontWeight="bold">
                {currentTechnician.user?.firstName} {currentTechnician.user?.lastName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ID: {currentTechnician.employeeId}
              </Typography>
              {currentTechnician.skills && currentTechnician.skills.length > 0 && (
                <Box display="flex" gap={0.5} mt={1} flexWrap="wrap">
                  {currentTechnician.skills.map((skill, index) => (
                    <Chip key={index} label={skill} size="small" variant="outlined" />
                  ))}
                </Box>
              )}
            </Box>
          </Box>
          <Button
            variant="outlined"
            color="error"
            fullWidth
            onClick={handleUnassign}
            disabled={loading}
          >
            ยกเลิกการมอบหมาย
          </Button>
        </Box>
      ) : (
        <Box>
          <Typography variant="body2" color="text.secondary" mb={2}>
            ยังไม่ได้มอบหมายช่างซ่อม
          </Typography>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>เลือกช่างซ่อม</InputLabel>
            <Select
              value={selectedTechnicianId}
              onChange={(e) => setSelectedTechnicianId(e.target.value)}
              label="เลือกช่างซ่อม"
              disabled={loadingTechnicians}
            >
              {technicians.map((tech) => (
                <MenuItem key={tech.id} value={tech.id}>
                  <Box>
                    <Typography variant="body1">
                      {tech.user?.firstName} {tech.user?.lastName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      ID: {tech.employeeId}
                      {tech.skills && tech.skills.length > 0 && ` • ${tech.skills.join(', ')}`}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            fullWidth
            onClick={handleAssign}
            disabled={!selectedTechnicianId || loading}
          >
            {loading ? 'กำลังมอบหมาย...' : 'มอบหมาย'}
          </Button>
        </Box>
      )}
    </Paper>
  );
};

