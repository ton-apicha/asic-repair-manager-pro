import React from 'react';
import { Box, Typography } from '@mui/material';
import { Inbox as InboxIcon } from '@mui/icons-material';

interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'ไม่มีข้อมูล',
  message = 'ยังไม่มีข้อมูลในรายการนี้',
  icon,
  action,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 6,
        textAlign: 'center',
      }}
    >
      {icon || (
        <InboxIcon
          sx={{
            fontSize: 64,
            color: 'text.secondary',
            mb: 2,
            opacity: 0.5,
          }}
        />
      )}
      <Typography variant="h6" color="text.secondary" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {message}
      </Typography>
      {action}
    </Box>
  );
};

