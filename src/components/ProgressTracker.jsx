import React from 'react';
import { Box, LinearProgress, CircularProgress, Typography, Paper } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';

const ProgressTracker = ({ 
  currentExercise, 
  totalExercises, 
  currentSet, 
  totalSets, 
  calories, 
  fatBurnerMode 
}) => {
  const theme = useTheme();
  
  const exerciseProgress = (currentExercise / totalExercises) * 100;
  const setProgress = (currentSet / totalSets) * 100;

  return (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        borderRadius: 2,
        bgcolor: 'background.paper',
        mb: 2,
      }}
    >
      {/* Progress Indicators */}
      <Box display="flex" justifyContent="space-between" mb={2}>
        {/* Exercise Progress */}
        <Box flex={1} mr={2}>
          <Box display="flex" alignItems="center" mb={1}>
            <FitnessCenterIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="body2" color="textSecondary">
              Exercice {currentExercise}/{totalExercises}
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={exerciseProgress}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: theme.palette.grey[theme.palette.mode === 'light' ? 200 : 800],
              '& .MuiLinearProgress-bar': {
                backgroundColor: theme.palette.primary.main,
                borderRadius: 4,
              },
            }}
          />
        </Box>

        {/* Set Progress */}
        <Box flex={1}>
          <Box display="flex" alignItems="center" mb={1}>
            <LocalFireDepartmentIcon 
              sx={{ 
                mr: 1,
                color: fatBurnerMode ? theme.palette.error.main : theme.palette.warning.main
              }} 
            />
            <Typography variant="body2" color="textSecondary">
              Série {currentSet}/{totalSets}
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={setProgress}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: theme.palette.grey[theme.palette.mode === 'light' ? 200 : 800],
              '& .MuiLinearProgress-bar': {
                backgroundColor: fatBurnerMode ? theme.palette.error.main : theme.palette.warning.main,
                borderRadius: 4,
              },
            }}
          />
        </Box>
      </Box>

      {/* Calories Circle */}
      <Box display="flex" justifyContent="center" alignItems="center">
        <Box position="relative" display="inline-flex">
          <CircularProgress
            variant="determinate"
            value={100}
            size={80}
            thickness={4}
            sx={{
              color: theme.palette.grey[theme.palette.mode === 'light' ? 200 : 800],
            }}
          />
          <CircularProgress
            variant="determinate"
            value={calories > 0 ? 100 : 0}
            size={80}
            thickness={4}
            sx={{
              color: theme.palette.success.main,
              position: 'absolute',
              left: 0,
              '& circle': {
                strokeLinecap: 'round',
              },
            }}
          />
          <Box
            sx={{
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              position: 'absolute',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
            }}
          >
            <Typography variant="h6" component="div" color="textPrimary">
              {calories}
            </Typography>
            <Typography variant="caption" component="div" color="textSecondary">
              calories
            </Typography>
          </Box>
        </Box>
      </Box>

      {fatBurnerMode && (
        <Box 
          mt={2} 
          p={1} 
          bgcolor="error.main" 
          borderRadius={1} 
          display="flex" 
          alignItems="center"
          justifyContent="center"
        >
          <LocalFireDepartmentIcon sx={{ color: 'white', mr: 1 }} />
          <Typography color="white" variant="body2">
            Mode Fat Burner actif
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default ProgressTracker;