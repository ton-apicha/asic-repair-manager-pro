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
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Divider,
  Badge,
  Avatar,
} from '@mui/material';
import {
  Warning,
  Error,
  Info,
  CheckCircle,
  Refresh,
  MoreVert,
  Inventory,
  Schedule,
  Work,
  Person,
  Settings as System,
} from '@mui/icons-material';
import { SystemAlert } from '../../types/dashboard';

interface AlertsListProps {
  alerts: SystemAlert[];
  loading?: boolean;
  error?: string | null;
  title?: string;
  maxItems?: number;
  onRefresh?: () => void;
  onViewMore?: () => void;
  onMarkAsRead?: (alertId: string) => void;
  onMarkAllAsRead?: () => void;
  className?: string;
}

export const AlertsList: React.FC<AlertsListProps> = ({
  alerts,
  loading = false,
  error = null,
  title = 'System Alerts',
  maxItems = 10,
  onRefresh,
  onViewMore,
  onMarkAsRead,
  onMarkAllAsRead,
  className,
}) => {
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <Warning />;
      case 'error':
        return <Error />;
      case 'info':
        return <Info />;
      case 'success':
        return <CheckCircle />;
      default:
        return <Info />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      case 'info':
        return 'info';
      case 'success':
        return 'success';
      default:
        return 'default';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'inventory':
        return <Inventory />;
      case 'schedule':
        return <Schedule />;
      case 'work_order':
        return <Work />;
      case 'technician':
        return <Person />;
      case 'system':
        return <System />;
      default:
        return <Info />;
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

  const unreadCount = alerts.filter(alert => !alert.isRead).length;
  const displayedAlerts = alerts.slice(0, maxItems);

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

  if (!alerts || alerts.length === 0) {
    return (
      <Card className={className}>
        <CardContent>
          <Box display="flex" justifyContent="center" alignItems="center" height={200}>
            <Typography color="text.secondary">No alerts</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="h6" component="h2">
              {title}
            </Typography>
            {unreadCount > 0 && (
              <Badge badgeContent={unreadCount} color="error">
                <Box />
              </Badge>
            )}
          </Box>
          
          <Box display="flex" gap={1}>
            {onMarkAllAsRead && unreadCount > 0 && (
              <Tooltip title="Mark all as read">
                <IconButton size="small" onClick={onMarkAllAsRead}>
                  <CheckCircle fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            
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
          {displayedAlerts.map((alert, index) => (
            <React.Fragment key={alert.id}>
              <ListItem 
                disablePadding 
                sx={{ 
                  py: 1,
                  opacity: alert.isRead ? 0.6 : 1,
                  backgroundColor: alert.isRead ? 'transparent' : 'action.hover',
                  borderRadius: 1,
                  mb: 0.5,
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <Box position="relative">
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        backgroundColor: `${getAlertColor(alert.type)}.light`,
                        color: `${getAlertColor(alert.type)}.main`,
                      }}
                    >
                      {getAlertIcon(alert.type)}
                    </Avatar>
                    {!alert.isRead && (
                      <Box
                        position="absolute"
                        top={-2}
                        right={-2}
                        width={12}
                        height={12}
                        borderRadius="50%"
                        sx={{ backgroundColor: 'error.main', border: '2px solid white' }}
                      />
                    )}
                  </Box>
                </ListItemIcon>
                
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                      <Typography 
                        variant="body2" 
                        fontWeight={alert.isRead ? "normal" : "bold"}
                      >
                        {alert.title}
                      </Typography>
                      <Chip
                        label={alert.category.toUpperCase()}
                        size="small"
                        icon={getCategoryIcon(alert.category)}
                        variant="outlined"
                        color="default"
                      />
                      {alert.actionRequired && (
                        <Chip
                          label="Action Required"
                          size="small"
                          color="warning"
                          variant="filled"
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        mb={0.5}
                        sx={{ opacity: alert.isRead ? 0.7 : 1 }}
                      >
                        {alert.message}
                      </Typography>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="caption" color="text.secondary">
                          {formatTimestamp(alert.timestamp)}
                        </Typography>
                        {!alert.isRead && onMarkAsRead && (
                          <IconButton
                            size="small"
                            onClick={() => onMarkAsRead(alert.id)}
                            sx={{ p: 0.5 }}
                          >
                            <CheckCircle fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                    </Box>
                  }
                />
              </ListItem>
              
              {index < displayedAlerts.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>

        {alerts.length > maxItems && onViewMore && (
          <Box mt={2} textAlign="center">
            <Typography
              variant="body2"
              color="primary"
              sx={{ cursor: 'pointer' }}
              onClick={onViewMore}
            >
              View {alerts.length - maxItems} more alerts
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default AlertsList;
