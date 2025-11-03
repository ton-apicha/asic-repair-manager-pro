import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  TrendingFlat,
  InfoOutlined,
  Refresh,
} from '@mui/icons-material';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'flat';
    period?: string;
  };
  progress?: {
    value: number;
    max?: number;
    color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  };
  icon?: React.ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  description?: string;
  onRefresh?: () => void;
  loading?: boolean;
  className?: string;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  subtitle,
  trend,
  progress,
  icon,
  color = 'primary',
  description,
  onRefresh,
  loading = false,
  className,
}) => {
  const getTrendIcon = () => {
    if (!trend) return null;
    
    switch (trend.direction) {
      case 'up':
        return <TrendingUp fontSize="small" />;
      case 'down':
        return <TrendingDown fontSize="small" />;
      case 'flat':
        return <TrendingFlat fontSize="small" />;
      default:
        return null;
    }
  };

  const getTrendColor = () => {
    if (!trend) return 'default';
    
    switch (trend.direction) {
      case 'up':
        return 'success';
      case 'down':
        return 'error';
      case 'flat':
        return 'default';
      default:
        return 'default';
    }
  };

  const getProgressColor = () => {
    if (!progress) return 'primary';
    
    if (progress.color) return progress.color;
    
    if (progress.value >= 80) return 'success';
    if (progress.value >= 60) return 'warning';
    return 'error';
  };

  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      if (val >= 1000000) {
        return `${(val / 1000000).toFixed(1)}M`;
      }
      if (val >= 1000) {
        return `${(val / 1000).toFixed(1)}K`;
      }
      return val.toLocaleString();
    }
    return val;
  };

  return (
    <Card className={className} sx={{ height: '100%', position: 'relative' }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            {icon && (
              <Box
                sx={{
                  p: 1,
                  borderRadius: 1,
                  backgroundColor: `${color}.light`,
                  color: `${color}.main`,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {icon}
              </Box>
            )}
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {title}
              </Typography>
              {subtitle && (
                <Typography variant="caption" color="text.secondary">
                  {subtitle}
                </Typography>
              )}
            </Box>
          </Box>
          
          <Box display="flex" alignItems="center" gap={1}>
            {trend && (
              <Chip
                icon={getTrendIcon() || undefined}
                label={`${trend.value > 0 ? '+' : ''}${trend.value}%`}
                size="small"
                color={getTrendColor() as any}
                variant="outlined"
              />
            )}
            
            {onRefresh && (
              <Tooltip title="Refresh">
                <IconButton
                  size="small"
                  onClick={onRefresh}
                  disabled={loading}
                  sx={{ ml: 1 }}
                >
                  <Refresh fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>

        <Typography
          variant="h4"
          component="div"
          color={`${color}.main`}
          fontWeight="bold"
          gutterBottom
        >
          {formatValue(value)}
        </Typography>

        {progress && (
          <Box mt={2}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="caption" color="text.secondary">
                Progress
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {progress.value}%{progress.max && ` of ${progress.max}`}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={progress.value}
              color={getProgressColor() as any}
              sx={{ height: 6, borderRadius: 3 }}
            />
          </Box>
        )}

        {description && (
          <Box mt={2}>
            <Typography variant="caption" color="text.secondary" display="flex" alignItems="center" gap={0.5}>
              <InfoOutlined fontSize="small" />
              {description}
            </Typography>
          </Box>
        )}

        {trend?.period && (
          <Typography variant="caption" color="text.secondary" display="block" mt={1}>
            vs {trend.period}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default KPICard;
