import React from 'react'
import { Box, Typography, Card, CardContent } from '@mui/material'

export const InventoryPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Inventory
      </Typography>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Inventory Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This page will contain parts inventory, stock management, and reorder alerts.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )
}
