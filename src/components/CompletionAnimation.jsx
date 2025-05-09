import React from 'react';
import { Box, Fade, Grow } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { keyframes } from '@mui/system';

const bounceKeyframe = keyframes`
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-30px);
  }
  60% {
    transform: translateY(-15px);
  }
`;

const CompletionAnimation = ({ show, message, variant = 'success' }) => {
  return (
    <Fade in={show} timeout={500}>
      <Grow in={show} timeout={800}>
        <Box
          sx={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            zIndex: 1000,
            animation: show ? `${bounceKeyframe} 1s ease` : 'none',
          }}
        >
          <CheckCircleIcon
            sx={{
              fontSize: 80,
              color: theme => variant === 'success' 
                ? theme.palette.success.main 
                : theme.palette.primary.main,
            }}
          />
          <Box
            sx={{
              padding: '8px 16px',
              borderRadius: '20px',
              backgroundColor: theme => variant === 'success'
                ? theme.palette.success.light
                : theme.palette.primary.light,
              color: 'white',
              fontWeight: 'bold',
              textAlign: 'center',
              boxShadow: 2,
            }}
          >
            {message}
          </Box>
        </Box>
      </Grow>
    </Fade>
  );
};

export default CompletionAnimation;