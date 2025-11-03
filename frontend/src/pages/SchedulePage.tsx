import React from 'react'
import { Box, Typography, Card, CardContent } from '@mui/material'

export const SchedulePage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Schedule
      </Typography>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Schedule Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This page will contain technician schedules, calendar view, and work assignment.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )
}
