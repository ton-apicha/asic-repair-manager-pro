import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Avatar,
  Chip,
  Grid,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Person,
  TrendingUp,
  TrendingDown,
  TrendingFlat,
} from '@mui/icons-material';
import { TechnicianUtilizationData } from '../../types/dashboard';

interface TechnicianUtilizationProps {
  data: TechnicianUtilizationData[];
  loading?: boolean;
  error?: string | null;
  title?: string;
  maxItems?: number;
  className?: string;
}

export const TechnicianUtilization: React.FC<TechnicianUtilizationProps> = ({
  data,
  loading = false,
  error = null,
  title = 'Technician Utilization',
  maxItems = 10,
  className,
}) => {
  const getUtilizationColor = (rate: number) => {
    if (rate >= 90) return 'error';
    if (rate >= 75) return 'warning';
    if (rate >= 50) return 'success';
    if (rate >= 25) return 'info';
    return 'default';
  };

  const getUtilizationLabel = (rate: number) => {
    if (rate >= 90) return 'Overutilized';
    if (rate >= 75) return 'High';
    if (rate >= 50) return 'Good';
    if (rate >= 25) return 'Low';
    return 'Very Low';
  };

  const getTrendIcon = (efficiency: number) => {
    if (efficiency > 1.5) return <TrendingUp />;
    if (efficiency < 0.5) return <TrendingDown />;
    return <TrendingFlat />;
  };

  const getTrendColor = (efficiency: number) => {
    if (efficiency > 1.5) return 'success';
    if (efficiency < 0.5) return 'error';
    return 'default';
  };

  const formatEfficiency = (efficiency: number) => {
    return `${efficiency.toFixed(1)} WO/h`;
  };

  const displayedData = data.slice(0, maxItems);

  if (loading) {
    return (
      <Card className={className}>
        <CardContent>
          <Box display="flex" justifyContent="center" alignItems="center" height={200}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent>
          <Alert severity="error">{error}</Alert>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className={className}>
        <CardContent>
          <Box display="flex" justifyContent="center" alignItems="center" height={200}>
            <Typography color="text.secondary">No technician data available</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardContent>
        <Typography variant="h6" component="h2" gutterBottom>
          {title}
        </Typography>

        <Box>
          {displayedData.map((technician, index) => (
            <Box key={technician.id} mb={3}>
              <Box display="flex" alignItems="center" gap={2} mb={1}>
                <Avatar sx={{ width: 40, height: 40 }}>
                  <Person />
                </Avatar>
                
                <Box flex={1}>
                  <Typography variant="body1" fontWeight="medium">
                    {technician.name}
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                    <Chip
                      label={getUtilizationLabel(technician.utilizationRate)}
                      size="small"
                      color={getUtilizationColor(technician.utilizationRate) as any}
                      variant="outlined"
                    />
                    <Chip
                      icon={getTrendIcon(technician.efficiency)}
                      label={formatEfficiency(technician.efficiency)}
                      size="small"
                      color={getTrendColor(technician.efficiency) as any}
                      variant="outlined"
                    />
                  </Box>
                </Box>

                <Box textAlign="right">
                  <Typography variant="h6" fontWeight="bold">
                    {technician.utilizationRate.toFixed(0)}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Utilization
                  </Typography>
                </Box>
              </Box>

              <LinearProgress
                variant="determinate"
                value={Math.min(technician.utilizationRate, 100)}
                color={getUtilizationColor(technician.utilizationRate) as any}
                sx={{ height: 8, borderRadius: 4, mb: 1 }}
              />

              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Box textAlign="center">
                    <Typography variant="h6" fontWeight="bold" color="primary">
                      {technician.totalHours}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Total Hours
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box textAlign="center">
                    <Typography variant="h6" fontWeight="bold" color="secondary">
                      {technician.workOrders}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Work Orders
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box textAlign="center">
                    <Typography variant="h6" fontWeight="bold" color="success.main">
                      {technician.efficiency.toFixed(1)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Efficiency
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              {index < displayedData.length - 1 && (
                <Box mt={2}>
                  <hr style={{ border: 'none', borderTop: '1px solid #e0e0e0', margin: 0 }} />
                </Box>
              )}
            </Box>
          ))}
        </Box>

        {data.length > maxItems && (
          <Box mt={2} textAlign="center">
            <Typography variant="body2" color="text.secondary">
              Showing {maxItems} of {data.length} technicians
            </Typography>
          </Box>
        )}

        {/* Summary Stats */}
        <Box mt={3} p={2} sx={{ backgroundColor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            Team Summary
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Box textAlign="center">
                <Typography variant="h6" fontWeight="bold">
                  {data.length}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Total Technicians
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box textAlign="center">
                <Typography variant="h6" fontWeight="bold">
                  {(data.reduce((sum, tech) => sum + tech.utilizationRate, 0) / data.length).toFixed(0)}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Avg Utilization
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TechnicianUtilization;
