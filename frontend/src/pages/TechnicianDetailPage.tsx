import React from 'react'
import { useParams } from 'react-router-dom'
import { Box, Typography, Card, CardContent } from '@mui/material'

export const TechnicianDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Technician Detail
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Technician ID: {id}
      </Typography>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Technician Information
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This page will contain detailed technician information, performance metrics, and work history.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )
}
