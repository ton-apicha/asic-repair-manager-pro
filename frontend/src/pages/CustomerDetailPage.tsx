import React from 'react'
import { useParams } from 'react-router-dom'
import { Box, Typography, Card, CardContent } from '@mui/material'

export const CustomerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Customer Detail
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Customer ID: {id}
      </Typography>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Customer Information
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This page will contain detailed customer information, work order history, and communication features.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )
}
