import React from 'react'
import { Box, Typography, Card, CardContent } from '@mui/material'

export const SettingsPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Settings
      </Typography>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            System Settings
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This page will contain system configuration, user preferences, and administrative settings.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )
}
