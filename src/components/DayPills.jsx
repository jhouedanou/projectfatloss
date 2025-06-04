import React, { useState, useRef } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Chip,
  useTheme,
  alpha
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

function DayPills({ days, current, setCurrent, setStepMode }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [isSwiping, setIsSwiping] = useState(false);
  const containerRef = useRef(null);
  
  // Seuil minimal pour considérer un swipe valide (en pixels)
  const swipeThreshold = 50;

  const handleDayClick = (index) => {
    setCurrent(index);
    setStepMode && setStepMode(false);
  };

  // Gestionnaires d'événements tactiles
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
    setIsSwiping(true);
  };

  const handleTouchMove = (e) => {
    if (!isSwiping) return;
    setTouchEnd(e.targetTouches[0].clientX);
    
    // Ajout de scroll horizontal lors du swipe pour donner un feedback visuel
    if (containerRef.current && touchStart && touchEnd) {
      const diff = touchEnd - touchStart;
      // Limiter la valeur de déplacement pour un effet naturel
      const translateX = Math.min(Math.max(diff, -80), 80);
      containerRef.current.style.transform = `translateX(${translateX / 5}px)`;
    }
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd || !isSwiping) return;
    
    // Réinitialiser le déplacement visuel
    if (containerRef.current) {
      containerRef.current.style.transform = 'translateX(0)';
    }
    
    // Calculer la distance du swipe
    const distance = touchEnd - touchStart;
    
    // Naviguer en fonction de la direction du swipe
    if (distance < -swipeThreshold && current < days.length - 1) {
      // Swipe vers la gauche -> jour suivant
      setCurrent(current + 1);
    } else if (distance > swipeThreshold && current > 0) {
      // Swipe vers la droite -> jour précédent
      setCurrent(current - 1);
    }
    
    // Réinitialiser l'état du swipe
    setTouchStart(null);
    setTouchEnd(null);
    setIsSwiping(false);
  };

  const handleTouchCancel = () => {
    // Réinitialiser l'état du swipe et la transition visuelle
    if (containerRef.current) {
      containerRef.current.style.transform = 'translateX(0)';
    }
    setTouchStart(null);
    setTouchEnd(null);
    setIsSwiping(false);
  };

  return (
    <Box sx={{ mb: 4, width: '100%' }}>
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
        }}
      >
        📅 Choisissez votre jour d'entraînement
      </Typography>
      
      {/* Conteneur des pills avec design amélioré */}
      <Box 
        ref={containerRef}
        sx={{
          display: 'flex',
          overflowX: 'auto',
          gap: 2,
          padding: '16px',
          borderRadius: '16px',
          background: `linear-gradient(135deg, 
            ${alpha(theme.palette.primary.main, 0.05)} 0%, 
            ${alpha(theme.palette.secondary.main, 0.05)} 100%
          )`,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          backdropFilter: 'blur(10px)',
          transition: !isSwiping ? 'transform 0.3s ease' : 'none',
          touchAction: 'pan-y',
          // Masquer la scrollbar
          '&::-webkit-scrollbar': {
            height: '4px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: alpha(theme.palette.grey[300], 0.3),
            borderRadius: '2px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            borderRadius: '2px',
          },
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
      >
        {days.map((day, index) => {
          const isActive = current === index;
          const isCompleted = index < current; // Logique simple pour "terminé"
          
          return (
            <Chip
              key={index}
              label={
                <Box display="flex" alignItems="center" gap={1}>
                  {isCompleted ? (
                    <CheckCircleIcon sx={{ fontSize: '1rem' }} />
                  ) : (
                    <FitnessCenterIcon sx={{ fontSize: '1rem' }} />
                  )}
                  <Typography variant="body2" fontWeight={600}>
                    Jour {index + 1}
                  </Typography>
                </Box>
              }
              clickable
              onClick={() => handleDayClick(index)}
              variant={isActive ? 'filled' : 'outlined'}
              sx={{
                minWidth: '100px',
                height: '48px',
                borderRadius: '24px',
                fontSize: '0.875rem',
                fontWeight: 600,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
                flexShrink: 0,
                
                // Style pour le jour actif
                ...(isActive && {
                  background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
                  color: 'white',
                  boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.4)}`,
                  transform: 'scale(1.05)',
                  '&:hover': {
                    background: `linear-gradient(45deg, ${theme.palette.primary.dark} 30%, ${theme.palette.secondary.dark} 90%)`,
                    transform: 'scale(1.08)',
                    boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.5)}`,
                  },
                }),
                
                // Style pour les jours terminés
                ...(isCompleted && !isActive && {
                  backgroundColor: alpha(theme.palette.success.main, 0.1),
                  borderColor: theme.palette.success.main,
                  color: theme.palette.success.main,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.success.main, 0.2),
                    transform: 'scale(1.02)',
                  },
                }),
                
                // Style pour les jours non commencés
                ...(!isActive && !isCompleted && {
                  backgroundColor: 'transparent',
                  borderColor: alpha(theme.palette.primary.main, 0.3),
                  color: theme.palette.text.primary,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.08),
                    borderColor: theme.palette.primary.main,
                    transform: 'scale(1.02)',
                  },
                }),
                
                '&:active': {
                  transform: isActive ? 'scale(1.02)' : 'scale(0.98)',
                },
              }}
            />
          );
        })}
      </Box>
      
      {/* Indicateur de swipe sur mobile */}
      <Box
        sx={{
          display: { xs: 'block', md: 'none' },
          textAlign: 'center',
          mt: 2,
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: alpha(theme.palette.text.secondary, 0.7),
            fontSize: '0.75rem',
            fontStyle: 'italic',
          }}
        >
          👆 Glissez pour naviguer entre les jours
        </Typography>
      </Box>
    </Box>
  );
}

export default DayPills;
