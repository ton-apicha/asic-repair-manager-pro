import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Chip,
  Grid,
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';

interface StatusPieChartProps {
  data: Array<{
    name: string;
    value: number;
    percentage: number;
    color: string;
  }>;
  loading?: boolean;
  error?: string | null;
  title?: string;
  height?: number;
  showLegend?: boolean;
  showPercentage?: boolean;
  className?: string;
}

export const StatusPieChart: React.FC<StatusPieChartProps> = ({
  data,
  loading = false,
  error = null,
  title = 'Status Distribution',
  height = 300,
  showLegend = true,
  showPercentage = true,
  className,
}) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  const formatTooltipValue = (value: number, name: string) => {
    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
    return [`${value} (${percentage}%)`, name];
  };

  const renderCustomLabel = (entry: any) => {
    if (entry.percentage < 5) return null; // Don't show labels for small slices
    
    return (
      <text
        x={entry.cx}
        y={entry.cy}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={12}
        fill="white"
        fontWeight="bold"
      >
        {entry.percentage}%
      </text>
    );
  };

  const renderLegend = (props: any) => {
    const { payload } = props;
    
    return (
      <Box display="flex" flexWrap="wrap" gap={1} justifyContent="center" mt={2}>
        {payload.map((entry: any, index: number) => (
          <Chip
            key={index}
            label={`${entry.value} (${entry.payload.percentage}%)`}
            sx={{
              backgroundColor: entry.color,
              color: 'white',
              fontWeight: 'bold',
              fontSize: '0.75rem',
            }}
            size="small"
          />
        ))}
      </Box>
    );
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent>
          <Box display="flex" justifyContent="center" alignItems="center" height={height}>
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
          <Box display="flex" justifyContent="center" alignItems="center" height={height}>
            <Typography color="text.secondary">No data available</Typography>
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

        <Box height={height}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={showPercentage ? renderCustomLabel : false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={formatTooltipValue} />
              {showLegend && <Legend content={renderLegend} />}
            </PieChart>
          </ResponsiveContainer>
        </Box>

        {/* Summary Stats */}
        <Box mt={2}>
          <Grid container spacing={2}>
            {data.map((item, index) => (
              <Grid item xs={6} sm={4} key={index}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Box
                    width={12}
                    height={12}
                    borderRadius="50%"
                    sx={{ backgroundColor: item.color }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {item.name}
                  </Typography>
                </Box>
                <Typography variant="h6" fontWeight="bold">
                  {item.value}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {item.percentage}%
                </Typography>
              </Grid>
            ))}
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatusPieChart;
