import React, { useState, useRef } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

const styles = {
  pillContainer: {
    display: 'flex',
    overflowX: 'visible',  // Changé pour éviter le conflit de scroll
    flexWrap: 'wrap', // Pour éviter le débordement sur petits écrans
    justifyContent: 'center', // Centrer les pills
    padding: '10px 5px',
    gap: '10px',
    backgroundColor: 'var(--background-dark)',
    borderRadius: '8px',
    margin: '10px 0',
    width: '100%', // S'assurer que le conteneur prend toute la largeur
    boxSizing: 'border-box',
    '::-webkit-scrollbar': {
      display: 'none'
    }
  },
  pill: {
    padding: '10px 20px',
    borderRadius: '20px',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 0.3s ease',
    backgroundColor: '#121212',
    color: '#FFFFFF',
    border: '1px solid #F03D32',
    flexShrink: 0,
  },
  activePill: {
    backgroundColor: '#F03D32',
    color: '#FFFFFF',
    boxShadow: '0 2px 4px rgba(240, 61, 50, 0.3)',
  },
  completedPill: {
    backgroundColor: '#6A1D1C',
    borderColor: '#6A1D1C',
    color: '#FFFFFF',
  }
};

function DayPills({ days, current, setCurrent, setStepMode }) {
  const { t } = useTranslation();
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
      <Typography variant="h6" gutterBottom>
        Sélectionner un jour
      </Typography>
      <Box 
        ref={containerRef}
        sx={{
          ...styles.pillContainer,
          transition: !isSwiping ? 'transform 0.3s ease' : 'none',
          position: 'relative',
          padding: '10px 5px',
          touchAction: 'pan-y', // Permettre le scroll vertical normal
          maxWidth: '100%', // S'assurer que la largeur est limitée
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
      >
        {days.map((day, index) => (
          <Button
            key={index}
            variant="outlined"
            size="small"
            onClick={() => handleDayClick(index)}
            sx={{
              ...styles.pill,
              ...(current === index ? styles.activePill : {}),
              minWidth: '80px', // Largeur minimale fixe
              margin: '3px',   // Espacement uniforme
            }}
          >
            {t('app.tabs.day')} {index + 1}
          </Button>
        ))}
      </Box>
    </Box>
  );
}

export default DayPills;
