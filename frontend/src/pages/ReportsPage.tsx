import React from 'react'
import { Box, Typography, Card, CardContent } from '@mui/material'

export const ReportsPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Reports
      </Typography>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Reports & Analytics
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This page will contain various reports, KPI dashboards, and analytics.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )
}
