import React, { useMemo } from 'react';
import { 
  Box, 
  useTheme,
  alpha,
} from '@mui/material';
import { Dumbbell, CheckCircle2, Leaf } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const DAYS_PER_WEEK = 7;

function DayPills({ days, current, setCurrent, setStepMode }) {
  const theme = useTheme();
  const { t } = useTranslation();

  const totalWeeks = Math.ceil(days.length / DAYS_PER_WEEK);
  const currentWeek = Math.floor(current / DAYS_PER_WEEK);

  const currentWeekDays = useMemo(() => {
    const start = currentWeek * DAYS_PER_WEEK;
    return days.slice(start, start + DAYS_PER_WEEK);
  }, [days, currentWeek]);

  const handleDayClick = (index) => {
    setCurrent(index);
    setStepMode && setStepMode(false);
  };

  const handleWeekClick = (weekIndex) => {
    setCurrent(weekIndex * DAYS_PER_WEEK);
    setStepMode && setStepMode(false);
  };

  const renderWeekTab = (weekIndex) => {
    const isActiveWeek = currentWeek === weekIndex;
    const weekStart = weekIndex * DAYS_PER_WEEK;
    const weekEnd = Math.min(weekStart + DAYS_PER_WEEK, days.length);
    const isWeekCompleted = current >= weekEnd;

    return (
      <button
        key={weekIndex}
        onClick={() => handleWeekClick(weekIndex)}
        style={{
          flex: 1,
          minWidth: '40px',
          height: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '100px',
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          fontSize: '0.7rem',
          fontWeight: '700',
          fontFamily: 'Inter, sans-serif',
          backgroundColor: isActiveWeek
            ? '#F03D32'
            : 'transparent',
          color: isActiveWeek
            ? '#fff'
            : isWeekCompleted
              ? '#888'
              : '#555',
          border: isActiveWeek ? 'none' : '1px solid rgba(255, 255, 255, 0.05)',
        }}
      >
        {t('dayPills.week', { defaultValue: 'S' })}{weekIndex + 1}
      </button>
    );
  };

  const renderDayButton = (day, indexInWeek) => {
    const actualIndex = currentWeek * DAYS_PER_WEEK + indexInWeek;
    if (actualIndex >= days.length) return null;

    const isCompleted = actualIndex < current;
    const isActive = current === actualIndex;
    const isRestDay = day.isRestDay === true;

    let iconColor = '#555';
    let IconComponent = Dumbbell;

    if (isActive) {
      iconColor = '#F03D32';
      IconComponent = isRestDay ? Leaf : Dumbbell;
    } else if (isCompleted) {
      iconColor = '#4CAF50';
      IconComponent = CheckCircle2;
    } else {
      IconComponent = isRestDay ? Leaf : Dumbbell;
    }

    return (
      <button
        key={actualIndex}
        onClick={() => handleDayClick(actualIndex)}
        style={{
          minWidth: '40px',
          width: '40px',
          height: '54px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '4px',
          border: isActive ? '1px solid rgba(240, 61, 50, 0.3)' : '1px solid rgba(255, 255, 255, 0.05)',
          borderRadius: '16px',
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          fontSize: '0.65rem',
          fontWeight: '700',
          fontFamily: 'Inter, sans-serif',
          flexShrink: 0,
          backgroundColor: isActive
            ? 'rgba(240, 61, 50, 0.1)'
            : isCompleted
              ? 'rgba(255, 255, 255, 0.02)'
              : 'transparent',
          color: isActive ? '#fff' : (isCompleted ? '#aaa' : '#666'),
          boxShadow: isActive ? '0 2px 8px rgba(240, 61, 50, 0.25)' : 'none',
        }}
      >
        <IconComponent size={18} color={iconColor} strokeWidth={isActive ? 2.5 : 2} />
        J{actualIndex + 1}
      </button>
    );
  };

  const firstRowDays = currentWeekDays.slice(0, 4);
  const secondRowDays = currentWeekDays.slice(4);

  return (
    <Box sx={{ mb: 2, width: '100%', px: { xs: 0.5, sm: 2 } }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
          py: 2,
          px: 2,
          borderRadius: '24px',
          background: 'rgba(24, 24, 27, 0.6)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        {totalWeeks > 1 && (
          <Box sx={{
            display: 'flex',
            gap: 1,
            justifyContent: 'center',
            mb: 1,
          }}>
            {Array.from({ length: totalWeeks }, (_, i) => renderWeekTab(i))}
          </Box>
        )}

        <Box sx={{
          display: 'flex',
          gap: 1,
          justifyContent: 'center',
        }}>
          {firstRowDays.map((day, index) => renderDayButton(day, index))}
        </Box>

        {secondRowDays.length > 0 && (
          <Box sx={{
            display: 'flex',
            gap: 1,
            justifyContent: 'center',
          }}>
            {secondRowDays.map((day, index) => renderDayButton(day, index + 4))}
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default DayPills;
