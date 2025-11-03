import React from 'react'
import { useParams } from 'react-router-dom'
import { Box, Typography, Card, CardContent } from '@mui/material'

export const DeviceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Device Detail
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Device ID: {id}
      </Typography>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Device Information
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This page will contain detailed device information, repair history, and warranty status.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )
}
