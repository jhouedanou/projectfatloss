import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Tabs,
  Tab,
  useTheme,
  alpha,
  useMediaQuery
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

function DayPills({ days, current, setCurrent, setStepMode }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleChange = (event, newValue) => {
    setCurrent(newValue);
    setStepMode && setStepMode(false);
  };

  return (
    <Box sx={{ mb: 4, width: '100%', px: { xs: 0, sm: 1 } }}>
      {/* Titre avec gradient */}
      <Typography 
        variant="h5" 
        gutterBottom
        sx={{
          fontWeight: 700,
          background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          textAlign: 'center',
          mb: 3,
          fontSize: { xs: '1.1rem', sm: '1.3rem' }, // Titre encore plus petit
          px: { xs: 1, sm: 0 },
        }}
      >
        📅 Choisissez votre jour d'entraînement
      </Typography>
      
      {/* Onglets avec design amélioré */}
      <Box 
        sx={{
          borderRadius: '16px',
          background: `linear-gradient(135deg, 
            ${alpha(theme.palette.primary.main, 0.05)} 0%, 
            ${alpha(theme.palette.secondary.main, 0.05)} 100%
          )`,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          backdropFilter: 'blur(10px)',
          overflow: 'hidden',
          mx: { xs: 0.25, sm: 0 }, // Marge encore plus réduite
          // Forcer une largeur maximale pour éviter le débordement
          maxWidth: '100%',
          width: '100%',
        }}
      >
        <Tabs
          value={current}
          onChange={handleChange}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{
            minHeight: { xs: '44px', sm: '52px' }, // Encore plus compact
            // Calculer dynamiquement l'espace disponible
            width: '100%',
            '& .MuiTabs-indicator': {
              background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
              height: '2px',
              borderRadius: '2px',
            },
            '& .MuiTabs-scrollButtons': {
              color: theme.palette.primary.main,
              width: { xs: '24px', sm: '36px' }, // Très petit sur mobile
              minWidth: { xs: '24px', sm: '36px' },
              padding: 0,
              '&.Mui-disabled': {
                opacity: 0.2,
              },
            },
            // Scrollbar personnalisée pour mobile
            '& .MuiTabs-scroller': {
              '&::-webkit-scrollbar': {
                height: '3px',
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: alpha(theme.palette.grey[300], 0.2),
              },
              '&::-webkit-scrollbar-thumb': {
                background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                borderRadius: '2px',
              },
            },
            // Style pour les boutons de navigation
            '& .MuiTabs-flexContainer': {
              gap: 0, // Aucun espacement
            },
          }}
        >
          {days.map((day, index) => {
            const isCompleted = index < current;
            const isActive = current === index;
            
            return (
              <Tab
                key={index}
                label={
                  <Box 
                    display="flex" 
                    alignItems="center" 
                    flexDirection="column"
                    sx={{
                      py: 0.25,
                      px: 0,
                      gap: 0.1,
                    }}
                  >
                    {isCompleted ? (
                      <CheckCircleIcon 
                        sx={{ 
                          fontSize: { xs: '0.8rem', sm: '1rem' },
                          color: isActive ? 'inherit' : theme.palette.success.main 
                        }} 
                      />
                    ) : (
                      <FitnessCenterIcon 
                        sx={{ 
                          fontSize: { xs: '0.8rem', sm: '1rem' },
                          color: isActive ? 'inherit' : theme.palette.text.secondary 
                        }} 
                      />
                    )}
                    <Typography 
                      variant="caption"
                      fontWeight={600}
                      sx={{
                        fontSize: { xs: '0.55rem', sm: '0.65rem' },
                        lineHeight: 1,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {`J${index + 1}`}
                    </Typography>
                  </Box>
                }
                sx={{
                  minHeight: { xs: '44px', sm: '52px' },
                  minWidth: { xs: `${Math.floor(100 / days.length)}%`, sm: '70px' }, // Largeur dynamique sur mobile
                  maxWidth: { xs: `${Math.floor(100 / days.length) + 2}%`, sm: '80px' },
                  textTransform: 'none',
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                  px: { xs: 0.1, sm: 0.5 }, // Padding minimal
                  
                  // Style pour le jour actif
                  ...(isActive && {
                    color: theme.palette.primary.main,
                    fontWeight: 700,
                  }),
                  
                  // Style pour les jours terminés
                  ...(isCompleted && !isActive && {
                    color: theme.palette.success.main,
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.success.main, 0.05),
                    },
                  }),
                  
                  // Style pour les jours non commencés
                  ...(!isActive && !isCompleted && {
                    color: theme.palette.text.secondary,
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.05),
                      color: theme.palette.primary.main,
                    },
                  }),
                  
                  '&.Mui-selected': {
                    color: theme.palette.primary.main,
                    fontWeight: 700,
                  },
                  
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.03),
                  },
                }}
              />
            );
          })}
        </Tabs>
      </Box>
      
      {/* Indicateur de position simplifié */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          mt: 2,
          px: { xs: 2, sm: 0 },
        }}
      >
        <Box
          sx={{
            px: { xs: 2, sm: 3 },
            py: { xs: 0.5, sm: 1 },
            borderRadius: '20px',
            background: `linear-gradient(135deg, 
              ${alpha(theme.palette.primary.main, 0.1)} 0%, 
              ${alpha(theme.palette.secondary.main, 0.1)} 100%
            )`,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: theme.palette.text.secondary,
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              fontWeight: 500,
              textAlign: 'center',
            }}
          >
            📋 Jour {current + 1} / {days.length}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default DayPills;
