import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

const styles = {
  pillContainer: {
    display: 'flex',
    overflowX: 'auto',
    padding: '10px 5px',
    gap: '10px',
    backgroundColor: 'var(--background-dark)',
    borderRadius: '8px',
    margin: '10px 0',
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

  const handleDayClick = (index) => {
    setCurrent(index);
    setStepMode && setStepMode(false);
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        Sélectionner un jour
      </Typography>
      <Box sx={styles.pillContainer}>
        {days.map((day, index) => (
          <Button
            key={index}
            variant="outlined"
            size="small"
            onClick={() => handleDayClick(index)}
            sx={{
              ...styles.pill,
              ...(current === index ? styles.activePill : {}),
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
