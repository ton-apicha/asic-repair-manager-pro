import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  Paper,
} from '@mui/material';
import { Add as AddIcon, Search as SearchIcon } from '@mui/icons-material';
import { DataGrid, GridColDef, GridRowParams } from '@mui/x-data-grid';
import { useWorkOrders } from '../hooks/useWorkOrders';
import { WorkOrderCreateForm } from '../components/workOrders/WorkOrderCreateForm';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorDisplay } from '../components/common/ErrorDisplay';
import { EmptyState } from '../components/common/EmptyState';
import { WorkOrderStatus, Priority } from '../types/common';

export const WorkOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const {
    workOrders,
    pagination,
    isLoading,
    error,
    refetch,
  } = useWorkOrders({
    page,
    limit,
    search: search || undefined,
    status: statusFilter ? (statusFilter as WorkOrderStatus) : undefined,
    priority: priorityFilter ? (priorityFilter as Priority) : undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const handleCreateSuccess = () => {
    setOpenCreateDialog(false);
    refetch();
  };

  const handleRowClick = (params: GridRowParams) => {
    // Navigate to work order detail page
    navigate(`/work-orders/${params.row.id}`);
  };

  const getStatusLabel = (status: string): string => {
    const statusMap: Record<string, string> = {
      TRIAGE: 'วินิจฉัย',
      QUOTATION: 'เสนอราคา',
      EXECUTION: 'ดำเนินการ',
      QA: 'ตรวจสอบ',
      CLOSURE: 'ปิดงาน',
      WARRANTY: 'รับประกัน',
    };
    return statusMap[status] || status;
  };

  const getPriorityLabel = (priority: string): string => {
    const priorityMap: Record<string, string> = {
      LOW: 'ต่ำ',
      MEDIUM: 'ปานกลาง',
      HIGH: 'สูง',
      URGENT: 'ด่วน',
    };
    return priorityMap[priority] || priority;
  };

  const getStatusColor = (status: string): string => {
    const colorMap: Record<string, string> = {
      TRIAGE: '#ff9800',
      QUOTATION: '#2196f3',
      EXECUTION: '#9c27b0',
      QA: '#00bcd4',
      CLOSURE: '#4caf50',
      WARRANTY: '#f44336',
    };
    return colorMap[status] || '#757575';
  };

  const columns: GridColDef[] = [
    {
      field: 'woId',
      headerName: 'WO ID',
      width: 120,
      flex: 0,
    },
    {
      field: 'customer',
      headerName: 'ลูกค้า',
      width: 200,
      flex: 1,
      valueGetter: (params) => {
        const wo = params.row as any;
        return wo.customer?.companyName || '-';
      },
    },
    {
      field: 'device',
      headerName: 'อุปกรณ์',
      width: 200,
      flex: 1,
      valueGetter: (params) => {
        const wo = params.row as any;
        return wo.device?.model || '-';
      },
    },
    {
      field: 'status',
      headerName: 'สถานะ',
      width: 120,
      flex: 0,
      renderCell: (params) => (
        <Box
          sx={{
            px: 1,
            py: 0.5,
            borderRadius: 1,
            backgroundColor: getStatusColor(params.value),
            color: 'white',
            fontSize: '0.75rem',
            fontWeight: 'bold',
          }}
        >
          {getStatusLabel(params.value)}
        </Box>
      ),
    },
    {
      field: 'priority',
      headerName: 'ความสำคัญ',
      width: 120,
      flex: 0,
      renderCell: (params) => (
        <Box
          sx={{
            px: 1,
            py: 0.5,
            borderRadius: 1,
            backgroundColor: params.value === 'URGENT' ? '#f44336' : 
                           params.value === 'HIGH' ? '#ff9800' :
                           params.value === 'MEDIUM' ? '#2196f3' : '#9e9e9e',
            color: 'white',
            fontSize: '0.75rem',
            fontWeight: 'bold',
          }}
        >
          {getPriorityLabel(params.value)}
        </Box>
      ),
    },
    {
      field: 'createdAt',
      headerName: 'วันที่สร้าง',
      width: 150,
      flex: 0,
      valueGetter: (params) => {
        const date = new Date(params.value);
        return date.toLocaleDateString('th-TH', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
      },
    },
  ];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1">
          ใบงาน
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          size="large"
          onClick={() => setOpenCreateDialog(true)}
        >
          สร้างใบงานใหม่
        </Button>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
          <TextField
            placeholder="ค้นหา (WO ID, ลูกค้า, อุปกรณ์)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
            sx={{ minWidth: 300, flex: 1 }}
          />

          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>สถานะ</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label="สถานะ"
            >
              <MenuItem value="">ทั้งหมด</MenuItem>
              {Object.values(WorkOrderStatus).map((status) => (
                <MenuItem key={status} value={status}>
                  {getStatusLabel(status)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>ความสำคัญ</InputLabel>
            <Select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              label="ความสำคัญ"
            >
              <MenuItem value="">ทั้งหมด</MenuItem>
              {Object.values(Priority).map((priority) => (
                <MenuItem key={priority} value={priority}>
                  {getPriorityLabel(priority)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* DataGrid */}
      <Paper sx={{ height: 600, width: '100%' }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <LoadingSpinner message="กำลังโหลดข้อมูล..." />
          </Box>
        ) : error ? (
          <ErrorDisplay message={error} onRetry={refetch} />
        ) : workOrders.length === 0 ? (
          <EmptyState
            title="ไม่มีใบงาน"
            message="ยังไม่มีใบงานในระบบ"
            action={
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setOpenCreateDialog(true)}
              >
                สร้างใบงานใหม่
              </Button>
            }
          />
        ) : (
          <DataGrid
            rows={workOrders}
            columns={columns}
            paginationModel={{ page: page - 1, pageSize: limit }}
            rowCount={pagination?.total || 0}
            paginationMode="server"
            onPaginationModelChange={(model: { page: number; pageSize: number }) => setPage(model.page + 1)}
            loading={isLoading}
            pageSizeOptions={[10, 20, 50]}
            disableRowSelectionOnClick
            onRowClick={handleRowClick}
            sx={{
              '& .MuiDataGrid-row:hover': {
                cursor: 'pointer',
                backgroundColor: 'action.hover',
              },
            }}
            disableColumnMenu
          />
        )}
      </Paper>

      {/* Create Work Order Dialog */}
      <Dialog
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>สร้างใบงานใหม่</DialogTitle>
        <DialogContent>
          <WorkOrderCreateForm
            onSuccess={handleCreateSuccess}
            onCancel={() => setOpenCreateDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};
