import React from 'react';
import { 
  Box, 
  useTheme,
  alpha,
} from '@mui/material';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

function DayPills({ days, current, setCurrent, setStepMode }) {
  const theme = useTheme();

  const handleDayClick = (index) => {
    setCurrent(index);
    setStepMode && setStepMode(false);
  };

  // Diviser les jours en deux rangées
  const midPoint = Math.ceil(days.length / 2);
  const firstRow = days.slice(0, midPoint);
  const secondRow = days.slice(midPoint);

  const renderButton = (day, index, isFirstRow) => {
    const actualIndex = isFirstRow ? index : index + midPoint;
    const isCompleted = actualIndex < current;
    const isActive = current === actualIndex;
    
    return (
      <button
        key={actualIndex}
        onClick={() => handleDayClick(actualIndex)}
        style={{
          minWidth: '60px',
          width: '60px',
          height: '56px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '2px',
          border: 'none',
          borderRadius: '12px',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          fontSize: '0.65rem',
          fontWeight: '700',
          flexShrink: 0,
          backgroundColor: isActive 
            ? alpha(theme.palette.primary.main, 0.15)
            : isCompleted 
              ? alpha(theme.palette.success.main, 0.1)
              : 'transparent',
          color: isActive 
            ? theme.palette.primary.main
            : isCompleted 
              ? theme.palette.success.main
              : theme.palette.text.secondary,
          transform: isActive ? 'scale(1.05)' : 'scale(1)',
          boxShadow: isActive 
            ? `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`
            : 'none',
        }}
        onMouseEnter={(e) => {
          if (!isActive) {
            e.target.style.backgroundColor = alpha(theme.palette.primary.main, 0.05);
            e.target.style.transform = 'translateY(-2px)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive) {
            e.target.style.backgroundColor = isCompleted 
              ? alpha(theme.palette.success.main, 0.1)
              : 'transparent';
            e.target.style.transform = 'translateY(0)';
          }
        }}
      >
        {isCompleted ? (
          <CheckCircleIcon 
            style={{ 
              fontSize: '1rem',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
            }} 
          />
        ) : (
          <FitnessCenterIcon 
            style={{ 
              fontSize: '1rem',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
            }} 
          />
        )}
        J{actualIndex + 1}
      </button>
    );
  };

  return (
    <Box sx={{ mb: 3, width: '100%', px: { xs: 0.5, sm: 2 } }}>
      <Box 
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: { xs: 1, sm: 1.5 },
          py: { xs: 1, sm: 2 },
          px: { xs: 1, sm: 2 },
          borderRadius: '16px',
          background: `linear-gradient(135deg, 
            ${alpha(theme.palette.primary.main, 0.08)} 0%, 
            ${alpha(theme.palette.secondary.main, 0.08)} 100%
          )`,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        {/* Première rangée */}
        <Box sx={{
          display: 'flex',
          gap: { xs: 0.5, sm: 1 },
          justifyContent: 'center',
        }}>
          {firstRow.map((day, index) => renderButton(day, index, true))}
        </Box>

        {/* Deuxième rangée */}
        {secondRow.length > 0 && (
          <Box sx={{
            display: 'flex',
            gap: { xs: 0.5, sm: 1 },
            justifyContent: 'center',
          }}>
            {secondRow.map((day, index) => renderButton(day, index, false))}
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default DayPills;
