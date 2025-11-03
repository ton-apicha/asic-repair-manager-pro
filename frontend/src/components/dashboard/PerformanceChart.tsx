import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  Area,
  AreaChart,
} from 'recharts';
import { PerformanceChartData } from '../../types/dashboard';

interface PerformanceChartProps {
  data: PerformanceChartData[];
  loading?: boolean;
  error?: string | null;
  chartType?: 'line' | 'bar' | 'area';
  period?: 'daily' | 'weekly' | 'monthly';
  onPeriodChange?: (period: 'daily' | 'weekly' | 'monthly') => void;
  height?: number;
  showLegend?: boolean;
  className?: string;
}

export const PerformanceChart: React.FC<PerformanceChartProps> = ({
  data,
  loading = false,
  error = null,
  chartType = 'line',
  period = 'monthly',
  onPeriodChange,
  height = 300,
  showLegend = true,
  className,
}) => {
  const formatXAxisLabel = (value: string) => {
    if (period === 'daily') {
      return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    if (period === 'weekly') {
      return `Week ${value}`;
    }
    return value;
  };

  const formatTooltipValue = (value: number, name: string) => {
    const formattedName = name.charAt(0).toUpperCase() + name.slice(1).replace(/([A-Z])/g, ' $1');
    return [`${value.toLocaleString()}`, formattedName];
  };

  const renderChart = () => {
    if (chartType === 'bar') {
      return (
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            tickFormatter={formatXAxisLabel}
            fontSize={12}
          />
          <YAxis fontSize={12} />
          <Tooltip formatter={formatTooltipValue} />
          {showLegend && <Legend />}
          <Bar dataKey="workOrders" fill="#1976d2" name="Work Orders" />
          <Bar dataKey="completed" fill="#4caf50" name="Completed" />
          <Bar dataKey="revenue" fill="#ff9800" name="Revenue" />
        </BarChart>
      );
    }

    if (chartType === 'area') {
      return (
        <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            tickFormatter={formatXAxisLabel}
            fontSize={12}
          />
          <YAxis fontSize={12} />
          <Tooltip formatter={formatTooltipValue} />
          {showLegend && <Legend />}
          <Area
            type="monotone"
            dataKey="workOrders"
            stackId="1"
            stroke="#1976d2"
            fill="#1976d2"
            fillOpacity={0.6}
            name="Work Orders"
          />
          <Area
            type="monotone"
            dataKey="completed"
            stackId="2"
            stroke="#4caf50"
            fill="#4caf50"
            fillOpacity={0.6}
            name="Completed"
          />
        </AreaChart>
      );
    }

    // Default to line chart
    return (
      <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="date" 
          tickFormatter={formatXAxisLabel}
          fontSize={12}
        />
        <YAxis fontSize={12} />
        <Tooltip formatter={formatTooltipValue} />
        {showLegend && <Legend />}
        <Line
          type="monotone"
          dataKey="workOrders"
          stroke="#1976d2"
          strokeWidth={2}
          dot={{ fill: '#1976d2', strokeWidth: 2, r: 4 }}
          name="Work Orders"
        />
        <Line
          type="monotone"
          dataKey="completed"
          stroke="#4caf50"
          strokeWidth={2}
          dot={{ fill: '#4caf50', strokeWidth: 2, r: 4 }}
          name="Completed"
        />
        <Line
          type="monotone"
          dataKey="revenue"
          stroke="#ff9800"
          strokeWidth={2}
          dot={{ fill: '#ff9800', strokeWidth: 2, r: 4 }}
          name="Revenue"
        />
        <Line
          type="monotone"
          dataKey="cost"
          stroke="#f44336"
          strokeWidth={2}
          dot={{ fill: '#f44336', strokeWidth: 2, r: 4 }}
          name="Cost"
        />
      </LineChart>
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
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" component="h2">
            Performance Overview
          </Typography>
          
          {onPeriodChange && (
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Period</InputLabel>
              <Select
                value={period}
                label="Period"
                onChange={(e) => onPeriodChange(e.target.value as 'daily' | 'weekly' | 'monthly')}
              >
                <MenuItem value="daily">Daily</MenuItem>
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="monthly">Monthly</MenuItem>
              </Select>
            </FormControl>
          )}
        </Box>

        <Box height={height}>
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

export default PerformanceChart;
