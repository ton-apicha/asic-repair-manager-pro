import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Avatar,
  Divider,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  WorkOutline,
  Assignment,
  Build,
  CheckCircle,
  Info,
  Refresh,
  MoreVert,
} from '@mui/icons-material';
import { RecentActivity } from '../../types/dashboard';

interface RecentActivityListProps {
  activities: RecentActivity[];
  loading?: boolean;
  error?: string | null;
  title?: string;
  maxItems?: number;
  onRefresh?: () => void;
  onViewMore?: () => void;
  className?: string;
}

export const RecentActivityList: React.FC<RecentActivityListProps> = ({
  activities,
  loading = false,
  error = null,
  title = 'Recent Activities',
  maxItems = 10,
  onRefresh,
  onViewMore,
  className,
}) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'work_order_created':
        return <WorkOutline />;
      case 'work_order_updated':
        return <Assignment />;
      case 'work_order_completed':
        return <CheckCircle />;
      case 'diagnostic_added':
        return <Build />;
      case 'parts_used':
        return <Build />;
      case 'technician_assigned':
        return <Assignment />;
      default:
        return <Info />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'work_order_created':
        return 'primary';
      case 'work_order_updated':
        return 'info';
      case 'work_order_completed':
        return 'success';
      case 'diagnostic_added':
        return 'warning';
      case 'parts_used':
        return 'secondary';
      case 'technician_assigned':
        return 'primary';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'urgent':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const displayedActivities = activities.slice(0, maxItems);

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

  if (!activities || activities.length === 0) {
    return (
      <Card className={className}>
        <CardContent>
          <Box display="flex" justifyContent="center" alignItems="center" height={200}>
            <Typography color="text.secondary">No recent activities</Typography>
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
            {title}
          </Typography>
          
          <Box display="flex" gap={1}>
            {onRefresh && (
              <Tooltip title="Refresh">
                <IconButton size="small" onClick={onRefresh}>
                  <Refresh fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            
            {onViewMore && (
              <Tooltip title="View More">
                <IconButton size="small" onClick={onViewMore}>
                  <MoreVert fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>

        <List disablePadding>
          {displayedActivities.map((activity, index) => (
            <React.Fragment key={activity.id}>
              <ListItem disablePadding sx={{ py: 1 }}>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      backgroundColor: `${getActivityColor(activity.type)}.light`,
                      color: `${getActivityColor(activity.type)}.main`,
                    }}
                  >
                    {getActivityIcon(activity.type)}
                  </Avatar>
                </ListItemIcon>
                
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                      <Typography variant="body2" fontWeight="medium">
                        {activity.title}
                      </Typography>
                      {activity.priority && (
                        <Chip
                          label={activity.priority.toUpperCase()}
                          size="small"
                          color={getPriorityColor(activity.priority) as any}
                          variant="outlined"
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary" mb={0.5}>
                        {activity.description}
                      </Typography>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="caption" color="text.secondary">
                          {activity.user}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatTimestamp(activity.timestamp)}
                        </Typography>
                      </Box>
                    </Box>
                  }
                />
              </ListItem>
              
              {index < displayedActivities.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>

        {activities.length > maxItems && onViewMore && (
          <Box mt={2} textAlign="center">
            <Typography
              variant="body2"
              color="primary"
              sx={{ cursor: 'pointer' }}
              onClick={onViewMore}
            >
              View {activities.length - maxItems} more activities
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentActivityList;
