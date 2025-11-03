import React from 'react'
import { Box, Typography, Card, CardContent } from '@mui/material'

export const CustomersPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Customers
      </Typography>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Customer Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This page will contain customer list, management features, and communication tools.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )
}
