import React from 'react';
import { Button, useTheme, alpha } from '@mui/material';

const GradientButton = ({ 
  children, 
  variant = 'gradient', 
  size = 'medium',
  fullWidth = false,
  disabled = false,
  startIcon,
  endIcon,
  onClick,
  sx = {},
  ...props 
}) => {
  const theme = useTheme();

  const gradientStyles = {
    background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontWeight: 600,
    textTransform: 'none',
    boxShadow: 'none',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    overflow: 'hidden',
    
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: '-100%',
      width: '100%',
      height: '100%',
      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
      transition: 'left 0.5s ease',
    },
    
    '&:hover': {
      background: `linear-gradient(45deg, ${theme.palette.primary.dark} 30%, ${theme.palette.secondary.dark} 90%)`,
      boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
      transform: 'translateY(-2px)',
      
      '&::before': {
        left: '100%',
      },
    },
    
    '&:active': {
      transform: 'translateY(0px)',
      boxShadow: `0 3px 10px ${alpha(theme.palette.primary.main, 0.3)}`,
    },
    
    '&:disabled': {
      background: alpha(theme.palette.grey[400], 0.5),
      color: alpha(theme.palette.grey[600], 0.7),
      cursor: 'not-allowed',
      transform: 'none',
      boxShadow: 'none',
      
      '&::before': {
        display: 'none',
      },
    },
  };

  const outlinedStyles = {
    background: 'transparent',
    border: `2px solid ${theme.palette.primary.main}`,
    color: theme.palette.primary.main,
    borderRadius: '12px',
    fontWeight: 600,
    textTransform: 'none',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    
    '&:hover': {
      background: alpha(theme.palette.primary.main, 0.1),
      borderColor: theme.palette.primary.dark,
      color: theme.palette.primary.dark,
      transform: 'translateY(-1px)',
      boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
    },
    
    '&:active': {
      transform: 'translateY(0px)',
    },
  };

  const textStyles = {
    background: 'transparent',
    border: 'none',
    color: theme.palette.primary.main,
    borderRadius: '12px',
    fontWeight: 600,
    textTransform: 'none',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    
    '&:hover': {
      background: alpha(theme.palette.primary.main, 0.08),
      color: theme.palette.primary.dark,
    },
  };

  const getSizeStyles = (size) => {
    switch (size) {
      case 'small':
        return {
          padding: '8px 16px',
          fontSize: '0.8rem',
          minHeight: '32px',
        };
      case 'large':
        return {
          padding: '16px 32px',
          fontSize: '1.1rem',
          minHeight: '56px',
        };
      default: // medium
        return {
          padding: '12px 24px',
          fontSize: '0.95rem',
          minHeight: '44px',
        };
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'outlined':
        return outlinedStyles;
      case 'text':
        return textStyles;
      default: // gradient
        return gradientStyles;
    }
  };

  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      startIcon={startIcon}
      endIcon={endIcon}
      fullWidth={fullWidth}
      sx={{
        ...getVariantStyles(),
        ...getSizeStyles(size),
        ...sx,
      }}
      {...props}
    >
      {children}
    </Button>
  );
};

export default GradientButton; 