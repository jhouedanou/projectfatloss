import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  IconButton, 
  Box
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import './Header.css';
import { getAssetPath } from '../../utils/paths';

export default function Header({ onNotificationSettings, onBack }) {
  return (
    <AppBar 
      position="absolute" 
      elevation={0}
      sx={{
        background: 'transparent',
        boxShadow: 'none',
        zIndex: 10,
        paddingTop: '10px'
      }}
    >
      <Toolbar sx={{ minHeight: '64px !important', px: 3, justifyContent: 'space-between' }}>
        {/* Logo ou Bouton Retour */}
        <Box 
          display="flex" 
          alignItems="center" 
        >
          {onBack ? (
            <IconButton
              onClick={onBack}
              size="small"
              sx={{
                color: 'white',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                borderRadius: '50%',
                padding: '8px',
                transition: 'all 0.2s',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  transform: 'scale(1.1)',
                }
              }}
            >
              <ArrowBackIcon sx={{ fontSize: '1.2rem' }} />
            </IconButton>
          ) : (
            <Box 
              display="flex" 
              alignItems="center" 
              sx={{ 
                cursor: 'pointer',
                transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                '&:hover': { transform: 'scale(1.05)' }
              }}
            >
              <img 
                src={getAssetPath('/logo.png')} 
                alt="Project Fat Loss" 
                style={{
                  height: '32px',
                  width: '32px',
                  borderRadius: '8px',
                  objectFit: 'cover',
                }}
              />
            </Box>
          )}
        </Box>

        {/* Actions minimalistes */}
        <Box display="flex" alignItems="center">
          {onNotificationSettings && (
            <IconButton
              onClick={onNotificationSettings}
              size="small"
              sx={{
                color: 'white',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                borderRadius: '50%',
                padding: '8px',
                transition: 'all 0.2s',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  transform: 'scale(1.1)',
                }
              }}
            >
              <NotificationsIcon sx={{ fontSize: '1.2rem' }} />
            </IconButton>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
