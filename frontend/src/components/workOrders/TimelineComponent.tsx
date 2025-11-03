import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
  Assessment as AssessmentIcon,
  AccessTime as AccessTimeIcon,
  AddCircle as AddCircleIcon,
} from '@mui/icons-material';
import { WorkOrderService } from '../../services/workOrderService';
import { STAGE_LABELS } from '../../utils/workflowUtils';

interface TimelineComponentProps {
  workOrderId: string;
}

interface TimelineEvent {
  id: string;
  type: 'status' | 'diagnostic' | 'time_log' | 'created';
  title: string;
  description: string;
  timestamp: string;
  color: 'primary' | 'success' | 'warning' | 'error' | 'info';
}

export const TimelineComponent: React.FC<TimelineComponentProps> = ({
  workOrderId,
}) => {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTimeline();
  }, [workOrderId]);

  const loadTimeline = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await WorkOrderService.getTimeline(workOrderId);
      if (response.success && response.data) {
        const timeline = response.data.timeline;
        const timelineEvents: TimelineEvent[] = [];

        // Add created event
        timelineEvents.push({
          id: 'created',
          type: 'created',
          title: 'สร้างใบงาน',
          description: `ใบงาน ${timeline.woId} ถูกสร้าง`,
          timestamp: timeline.createdAt,
          color: 'primary',
        });

        // Add status change events
        if (timeline.status) {
          timelineEvents.push({
            id: 'status',
            type: 'status',
            title: 'สถานะ',
            description: `เปลี่ยนสถานะเป็น ${STAGE_LABELS[timeline.status]}`,
            timestamp: timeline.updatedAt,
            color: 'info',
          });
        }

        // Add diagnostic events
        timeline.diagnostics?.forEach((diagnostic, index) => {
          timelineEvents.push({
            id: `diagnostic-${index}`,
            type: 'diagnostic',
            title: 'วินิจฉัย',
            description: diagnostic.faultType,
            timestamp: diagnostic.createdAt,
            color: 'warning',
          });
        });

        // Add time log events
        timeline.timeLogs?.forEach((timeLog, index) => {
          timelineEvents.push({
            id: `time-log-${index}`,
            type: 'time_log',
            title: 'บันทึกเวลา',
            description: `${timeLog.activityType} - ${timeLog.technician?.firstName} ${timeLog.technician?.lastName}`,
            timestamp: timeLog.startTime,
            color: 'success',
          });
        });

        // Sort by timestamp
        timelineEvents.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

        setEvents(timelineEvents);
      }
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการโหลด timeline');
    } finally {
      setLoading(false);
    }
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

  if (loading) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Timeline
        </Typography>
        <Typography variant="body2" color="text.secondary">
          กำลังโหลด...
        </Typography>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Timeline
        </Typography>
        <Typography variant="body2" color="error">
          {error}
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Timeline
      </Typography>
      {events.length === 0 ? (
        <Typography variant="body2" color="text.secondary" align="center" py={3}>
          ยังไม่มี timeline
        </Typography>
      ) : (
        <List>
          {events.map((event, index) => {
            const getIcon = () => {
              switch (event.type) {
                case 'created':
                  return <AddCircleIcon color={event.color} />;
                case 'status':
                  return <CheckCircleIcon color={event.color} />;
                case 'diagnostic':
                  return <AssessmentIcon color={event.color} />;
                case 'time_log':
                  return <AccessTimeIcon color={event.color} />;
                default:
                  return <RadioButtonUncheckedIcon color={event.color} />;
              }
            };

            return (
              <React.Fragment key={event.id}>
                <ListItem>
                  <ListItemIcon>
                    {getIcon()}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {event.title}
                        </Typography>
                        <Chip
                          label={event.type}
                          size="small"
                          color={event.color}
                          variant="outlined"
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {event.description}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(event.timestamp)}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
                {index < events.length - 1 && <Divider variant="inset" component="li" />}
              </React.Fragment>
            );
          })}
        </List>
      )}
    </Paper>
  );
};

