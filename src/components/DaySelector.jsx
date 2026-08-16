import React from 'react';
import { Box, Typography, IconButton, Grid, Paper } from '@mui/material';
import { X, CheckCircle2, Dumbbell, Award, Calendar, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function DaySelector({ days, current, setCurrent, onClose }) {
  const { t } = useTranslation();

  const handleDaySelect = (index) => {
    setCurrent(index);
    onClose();
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100dvh',
        bgcolor: '#0a0a0a',
        zIndex: 2000,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 16px env(safe-area-inset-bottom, 24px)',
        boxSizing: 'border-box',
        color: '#fff',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4,
          mt: 'env(safe-area-inset-top, 12px)',
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.5px', color: '#fff' }}>
            PROGRAMME 7 JOURS
          </Typography>
          <Typography variant="caption" sx={{ color: '#888', fontWeight: 600 }}>
            CHOISISSEZ VOTRE ENTRAÎNEMENT DU JOUR
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          sx={{
            bgcolor: 'rgba(255, 255, 255, 0.05)',
            color: '#fff',
            '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' },
            borderRadius: '12px',
            p: 1.5,
          }}
        >
          <X size={20} />
        </IconButton>
      </Box>

      {/* Grid of days */}
      <Grid container spacing={2} sx={{ flex: 1, pb: 4 }}>
        {days.map((day, index) => {
          const isCompleted = index < current;
          const isActive = index === current;
          const isRestDay = day.isRestDay === true;
          
          // Get basic title info
          const displayTitle = day.title.replace(/JOUR \d+:\s*/i, '');
          
          return (
            <Grid item xs={6} sm={4} key={index}>
              <Paper
                onClick={() => handleDaySelect(index)}
                sx={{
                  bgcolor: isActive 
                    ? 'rgba(240, 61, 50, 0.08)' 
                    : isCompleted 
                      ? 'rgba(255, 255, 255, 0.01)' 
                      : 'rgba(255, 255, 255, 0.02)',
                  border: isActive 
                    ? '1.5px solid #F03D32' 
                    : isCompleted
                      ? '1px solid rgba(76, 175, 80, 0.2)'
                      : '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: '20px',
                  p: 2.5,
                  height: '100%',
                  minHeight: '130px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: isActive ? '0 0 20px rgba(240, 61, 50, 0.15)' : 'none',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    bgcolor: isActive ? 'rgba(240, 61, 50, 0.12)' : 'rgba(255, 255, 255, 0.04)',
                    border: isActive ? '1.5px solid #F03D32' : '1px solid rgba(255, 255, 255, 0.15)',
                  }
                }}
              >
                {/* Background watermarked number */}
                <Typography
                  sx={{
                    position: 'absolute',
                    top: '-10px',
                    right: '-5px',
                    fontSize: '4.5rem',
                    fontWeight: 900,
                    color: isActive 
                      ? 'rgba(240, 61, 50, 0.06)' 
                      : 'rgba(255, 255, 255, 0.02)',
                    lineHeight: 1,
                    userSelect: 'none',
                    pointerEvents: 'none'
                  }}
                >
                  {index + 1}
                </Typography>

                {/* Top indicator row */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 800,
                      color: isActive ? '#F03D32' : '#888',
                      letterSpacing: '1px'
                    }}
                  >
                    JOUR {index + 1}
                  </Typography>
                  {isCompleted ? (
                    <CheckCircle2 size={16} color="#4CAF50" strokeWidth={2.5} />
                  ) : isActive ? (
                    <Sparkles size={16} color="#F03D32" strokeWidth={2.5} />
                  ) : null}
                </Box>

                {/* Muscle Title / Rest Day text */}
                <Box sx={{ zIndex: 1, mt: 1 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 700,
                      color: isRestDay ? '#4CAF50' : '#fff',
                      fontSize: '0.85rem',
                      lineHeight: 1.3,
                      textTransform: 'uppercase',
                      mb: 0.5
                    }}
                  >
                    {isRestDay ? 'Récupération' : displayTitle.split(' (')[0]}
                  </Typography>
                  
                  {!isRestDay && day.exercises && (
                    <Typography variant="caption" sx={{ color: '#666', fontWeight: 600 }}>
                      {day.exercises.length} exercices
                    </Typography>
                  )}
                </Box>
              </Paper>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
