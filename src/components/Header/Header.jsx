import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  IconButton, 
  Typography, 
  Box,
  useTheme,
  alpha
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import './Header.css';
import logo from '/playstore.png';

export default function Header({ onNotificationSettings }) {
  const theme = useTheme();
  
  return (
    <AppBar 
      position="sticky" 
      elevation={0}
      sx={{
        background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
        backdropFilter: 'blur(10px)',
        borderBottom: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(255, 255, 255, 0.05)',
          pointerEvents: 'none',
        }
      }}
    >
      <Toolbar sx={{ minHeight: '64px !important', px: 2 }}>
        {/* Logo et titre */}
        <Box 
          display="flex" 
          alignItems="center" 
          sx={{ 
            flexGrow: 1,
            cursor: 'pointer',
            transition: 'transform 0.2s ease-in-out',
            '&:hover': {
              transform: 'scale(1.02)',
            }
          }}
        >
          <Box
            sx={{
              position: 'relative',
              mr: 2,
              '&::after': {
                content: '""',
                position: 'absolute',
                top: -2,
                left: -2,
                right: -2,
                bottom: -2,
                background: 'linear-gradient(45deg, rgba(255,255,255,0.3), rgba(255,255,255,0.1))',
                borderRadius: '50%',
                zIndex: -1,
              }
            }}
          >
            <img 
              src={logo} 
              alt="Project Fat Loss" 
              style={{
                height: '40px',
                width: '40px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
              }}
            />
          </Box>
          
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: 'white',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                fontSize: { xs: '1.1rem', sm: '1.25rem' },
                lineHeight: 1.2,
                letterSpacing: '0.5px',
              }}
            >
              Project Fat Loss
            </Typography>
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                color: alpha(theme.palette.common.white, 0.8),
                fontSize: '0.7rem',
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '1px',
                mt: -0.5,
              }}
            >
              Fitness • Motivation • Résultats
            </Typography>
          </Box>
        </Box>

        {/* Actions */}
        <Box display="flex" alignItems="center" gap={1}>
          {/* Indicateur de fitness */}
          <Box
            sx={{
              display: { xs: 'none', sm: 'flex' },
              alignItems: 'center',
              gap: 1,
              px: 2,
              py: 0.5,
              backgroundColor: alpha(theme.palette.common.white, 0.15),
              borderRadius: '20px',
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha(theme.palette.common.white, 0.2)}`,
            }}
          >
            <FitnessCenterIcon 
              sx={{ 
                fontSize: '1rem', 
                color: alpha(theme.palette.common.white, 0.9) 
              }} 
            />
            <Typography
              variant="caption"
              sx={{
                color: alpha(theme.palette.common.white, 0.9),
                fontWeight: 600,
                fontSize: '0.75rem',
              }}
            >
              EN FORME
            </Typography>
          </Box>

          {/* Bouton notifications */}
          {onNotificationSettings && (
            <IconButton
              onClick={onNotificationSettings}
              size="medium"
              sx={{
                color: 'white',
                backgroundColor: alpha(theme.palette.common.white, 0.1),
                border: `1px solid ${alpha(theme.palette.common.white, 0.2)}`,
                backdropFilter: 'blur(10px)',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  backgroundColor: alpha(theme.palette.common.white, 0.2),
                  transform: 'scale(1.05)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                },
                '&:active': {
                  transform: 'scale(0.95)',
                },
              }}
              title="Paramètres de notification"
            >
              <NotificationsIcon />
            </IconButton>
          )}
        </Box>
      </Toolbar>
      
      {/* Ligne de séparation avec gradient */}
      <Box
        sx={{
          height: '2px',
          background: `linear-gradient(90deg, 
            transparent 0%, 
            ${alpha(theme.palette.common.white, 0.3)} 20%, 
            ${alpha(theme.palette.common.white, 0.6)} 50%, 
            ${alpha(theme.palette.common.white, 0.3)} 80%, 
            transparent 100%
          )`,
        }}
      />
    </AppBar>
  );
}
