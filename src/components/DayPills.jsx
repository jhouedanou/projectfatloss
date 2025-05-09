import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

function DayPills({ days, current, setCurrent }) {
  const { t } = useTranslation();

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        Sélectionner un jour
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
        {days.map((day, index) => (
          <Button
            key={index}
            variant="outlined"
            size="small"
            onClick={() => {
              setCurrent(index);
              setStepMode(false);
            }}
            sx={{
              borderRadius: '20px',
              padding: '8px 16px',
              minWidth: '60px',
              textTransform: 'none',
              bgcolor: current === index ? 'primary.main' : 'transparent',
              color: current === index ? 'white' : 'text.primary',
              '&:hover': {
                bgcolor: current === index ? 'primary.dark' : 'primary.light',
              },
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
