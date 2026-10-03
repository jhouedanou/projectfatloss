import React from 'react';
import { Box, Typography } from '@mui/material';
import { Dumbbell, Flame, Target } from 'lucide-react';

const ProgressTracker = ({ 
  currentExercise, 
  totalExercises, 
  currentSet, 
  totalSets, 
  calories, 
  fatBurnerMode 
}) => {
  const exerciseProgress = (currentExercise / totalExercises) * 100;
  const setProgress = (currentSet / totalSets) * 100;

  return (
    <Box
      sx={{
        width: '100%',
        bgcolor: '#1c1c1e',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: '24px',
        padding: '16px 20px',
        boxSizing: 'border-box',
        mb: 3,
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
        fontFamily: 'Inter, sans-serif'
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* Exercise Progress */}
        <Box sx={{ flex: 1, mr: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5, gap: 1 }}>
            <Dumbbell size={16} color="#F03D32" strokeWidth={2.5} />
            <Typography variant="caption" sx={{ color: '#888', fontWeight: 700, letterSpacing: '0.5px' }}>
              EXERCICE {currentExercise}/{totalExercises}
            </Typography>
          </Box>
          <Box sx={{ width: '100%', height: '4px', bgcolor: 'rgba(255, 255, 255, 0.05)', borderRadius: '10px', overflow: 'hidden' }}>
            <Box sx={{ width: `${exerciseProgress}%`, height: '100%', bgcolor: '#F03D32', borderRadius: '10px', transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)' }} />
          </Box>
        </Box>

        {/* Set Progress */}
        <Box sx={{ flex: 1, mr: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5, gap: 1 }}>
            <Target size={16} color="#fff" strokeWidth={2.5} />
            <Typography variant="caption" sx={{ color: '#888', fontWeight: 700, letterSpacing: '0.5px' }}>
              SÉRIE {currentSet}/{totalSets}
            </Typography>
          </Box>
          <Box sx={{ width: '100%', height: '4px', bgcolor: 'rgba(255, 255, 255, 0.05)', borderRadius: '10px', overflow: 'hidden' }}>
            <Box sx={{ width: `${setProgress}%`, height: '100%', bgcolor: '#fff', borderRadius: '10px', transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)' }} />
          </Box>
        </Box>

        {/* Calories Burned - Integrated cleanly */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', minWidth: '70px' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Flame size={18} color="#FF6B35" strokeWidth={2.5} className="pulse-animation" />
            <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: '1.2rem', letterSpacing: '-0.5px', lineHeight: 1 }}>
              {calories || 0}
            </Typography>
          </Box>
          <Typography variant="caption" sx={{ color: '#666', fontWeight: 700, fontSize: '0.65rem', letterSpacing: '0.5px', mt: 0.2 }}>
            KCAL
          </Typography>
        </Box>
      </Box>

      {fatBurnerMode && (
        <Box 
          sx={{ 
            p: '8px 12px', 
            bgcolor: 'rgba(240, 61, 50, 0.1)', 
            border: '1px solid rgba(240, 61, 50, 0.2)',
            borderRadius: '12px', 
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1
          }}
        >
          <Flame size={14} color="#F03D32" strokeWidth={2.5} />
          <Typography sx={{ color: '#F03D32', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.5px' }}>
            MODE FAT BURNER ACTIF
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default ProgressTracker;