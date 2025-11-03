import React from 'react';
import { Box, Alert, AlertTitle, Typography } from '@mui/material';
import { Error as ErrorIcon } from '@mui/icons-material';

interface ErrorDisplayProps {
  message?: string;
  title?: string;
  severity?: 'error' | 'warning' | 'info';
  onRetry?: () => void;
  retryLabel?: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  message = 'เกิดข้อผิดพลาดในการโหลดข้อมูล',
  title = 'เกิดข้อผิดพลาด',
  severity = 'error',
  onRetry,
  retryLabel = 'ลองอีกครั้ง',
}) => {
  return (
    <Box sx={{ p: 3 }}>
      <Alert 
        severity={severity}
        icon={<ErrorIcon />}
        action={
          onRetry && (
            <Typography
              component="button"
              variant="body2"
              onClick={onRetry}
              sx={{
                textDecoration: 'underline',
                cursor: 'pointer',
                border: 'none',
                background: 'transparent',
                color: 'inherit',
                '&:hover': {
                  opacity: 0.8,
                },
              }}
            >
              {retryLabel}
            </Typography>
          )
        }
      >
        <AlertTitle>{title}</AlertTitle>
        {message}
      </Alert>
    </Box>
  );
};

