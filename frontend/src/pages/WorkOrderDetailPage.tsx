import React from 'react'
import { useParams } from 'react-router-dom'
import { Box, Typography, Card, CardContent } from '@mui/material'

export const WorkOrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Work Order Detail
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Work Order ID: {id}
      </Typography>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Work Order Information
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This page will contain detailed work order information, status updates, and management features.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )
}
