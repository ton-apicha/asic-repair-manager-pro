import React from 'react'
import { Box, Typography, Card, CardContent } from '@mui/material'

export const DevicesPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Devices
      </Typography>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Device Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This page will contain device list, management features, and warranty tracking.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )
}
