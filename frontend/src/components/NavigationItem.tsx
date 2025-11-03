import React from 'react'
import { ListItem, ListItemButton, ListItemIcon, ListItemText, useTheme } from '@mui/material'
import { useLocation, useNavigate } from 'react-router-dom'

interface NavigationItemProps {
  text: string
  icon: React.ReactNode
  path: string
  onClick?: () => void
}

export const NavigationItem: React.FC<NavigationItemProps> = ({ 
  text, 
  icon, 
  path, 
  onClick 
}) => {
  const theme = useTheme()
  const location = useLocation()
  const navigate = useNavigate()
  
  const isActive = location.pathname === path || location.pathname.startsWith(path + '/')

  const handleClick = () => {
    navigate(path)
    if (onClick) {
      onClick()
    }
  }

  return (
    <ListItem disablePadding>
      <ListItemButton
        onClick={handleClick}
        sx={{
          borderRadius: 2,
          mx: 1,
          mb: 0.5,
          backgroundColor: isActive ? theme.palette.primary.main : 'transparent',
          color: isActive ? theme.palette.primary.contrastText : theme.palette.text.primary,
          '&:hover': {
            backgroundColor: isActive 
              ? theme.palette.primary.dark 
              : theme.palette.action.hover,
          },
        }}
      >
        <ListItemIcon
          sx={{
            color: isActive ? theme.palette.primary.contrastText : theme.palette.text.secondary,
            minWidth: 40,
          }}
        >
          {icon}
        </ListItemIcon>
        <ListItemText 
          primary={text}
          primaryTypographyProps={{
            fontSize: '0.875rem',
            fontWeight: isActive ? 600 : 400,
          }}
        />
      </ListItemButton>
    </ListItem>
  )
}
