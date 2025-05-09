import React from 'react';
import { Box, LinearProgress, Typography, CircularProgress } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const ProgressBar = ({ current, total, variant = 'linear', showLabel = true, size = 'medium' }) => {
  const theme = useTheme();
  const progress = Math.round((current / total) * 100);
  
  const getColor = (progress) => {
    if (progress < 33) return theme.palette.warning.main;
    if (progress < 66) return theme.palette.info.main;
    return theme.palette.success.main;
  };

  return (
    <Box sx={{ position: 'relative', width: '100%', my: 2 }}>
      {variant === 'linear' ? (
        <>
          <LinearProgress 
            variant="determinate" 
            value={progress}
            sx={{
              height: size === 'large' ? 10 : 6,
              borderRadius: 5,
              backgroundColor: theme.palette.grey[theme.palette.mode === 'light' ? 200 : 800],
              '& .MuiLinearProgress-bar': {
                backgroundColor: getColor(progress),
                transition: 'transform 0.4s ease-in-out',
              },
            }}
          />
          {showLabel && (
            <Typography 
              variant="body2" 
              color="textSecondary"
              sx={{ 
                position: 'absolute',
                right: 0,
                top: -20,
                fontWeight: 500
              }}
            >
              {current} / {total}
            </Typography>
          )}
        </>
      ) : (
        <Box display="flex" alignItems="center" justifyContent="center">
          <Box position="relative" display="inline-flex">
            <CircularProgress
              variant="determinate"
              value={progress}
              size={size === 'large' ? 80 : 60}
              sx={{
                color: getColor(progress),
                '& .MuiCircularProgress-circle': {
                  strokeLinecap: 'round',
                  transition: 'stroke-dashoffset 0.4s ease-in-out',
                },
              }}
            />
            {showLabel && (
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
                }}
              >
                <Typography
                  variant="caption"
                  component="div"
                  color="textSecondary"
                  sx={{ fontWeight: 500 }}
                >
                  {`${progress}%`}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default ProgressBar;
