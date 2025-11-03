import React from 'react'
import { Box, Typography, Card, CardContent } from '@mui/material'

export const TechniciansPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Technicians
      </Typography>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Technician Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This page will contain technician list, performance tracking, and schedule management.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )
}
