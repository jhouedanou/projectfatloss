import React, { useMemo } from 'react';
import { 
  Box, 
  useTheme,
  alpha,
} from '@mui/material';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SpaIcon from '@mui/icons-material/Spa';
import { useTranslation } from 'react-i18next';

const DAYS_PER_WEEK = 7;

function DayPills({ days, current, setCurrent, setStepMode }) {
  const theme = useTheme();
  const { t } = useTranslation();

  const totalWeeks = Math.ceil(days.length / DAYS_PER_WEEK);
  const currentWeek = Math.floor(current / DAYS_PER_WEEK);

  const weekDays = useMemo(() => {
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
          minWidth: '50px',
          height: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          fontSize: '0.7rem',
          fontWeight: '700',
          backgroundColor: isActiveWeek
            ? theme.palette.primary.main
            : isWeekCompleted
              ? alpha(theme.palette.success.main, 0.15)
              : alpha(theme.palette.text.secondary, 0.08),
          color: isActiveWeek
            ? '#fff'
            : isWeekCompleted
              ? theme.palette.success.main
              : theme.palette.text.secondary,
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

    return (
      <button
        key={actualIndex}
        onClick={() => handleDayClick(actualIndex)}
        style={{
          minWidth: '44px',
          width: '44px',
          height: '50px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '2px',
          border: 'none',
          borderRadius: '12px',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          fontSize: '0.6rem',
          fontWeight: '700',
          flexShrink: 0,
          backgroundColor: isActive
            ? isRestDay
              ? alpha(theme.palette.info.main, 0.15)
              : alpha(theme.palette.primary.main, 0.15)
            : isCompleted
              ? alpha(theme.palette.success.main, 0.1)
              : 'transparent',
          color: isActive
            ? isRestDay
              ? theme.palette.info.main
              : theme.palette.primary.main
            : isCompleted
              ? theme.palette.success.main
              : theme.palette.text.secondary,
          transform: isActive ? 'scale(1.05)' : 'scale(1)',
          boxShadow: isActive
            ? `0 4px 12px ${alpha(isRestDay ? theme.palette.info.main : theme.palette.primary.main, 0.2)}`
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
              fontSize: '0.9rem',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
            }}
          />
        ) : isRestDay ? (
          <SpaIcon
            style={{
              fontSize: '0.9rem',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
            }}
          />
        ) : (
          <FitnessCenterIcon
            style={{
              fontSize: '0.9rem',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
            }}
          />
        )}
        J{actualIndex + 1}
      </button>
    );
  };

  // Split week days into two rows for display
  const firstRowDays = weekDays.slice(0, 4);
  const secondRowDays = weekDays.slice(4);

  return (
    <Box sx={{ mb: 3, width: '100%', px: { xs: 0.5, sm: 2 } }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: { xs: 0.75, sm: 1 },
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
        {/* Week selector */}
        {totalWeeks > 1 && (
          <Box sx={{
            display: 'flex',
            gap: 0.5,
            justifyContent: 'center',
            mb: 0.5,
          }}>
            {Array.from({ length: totalWeeks }, (_, i) => renderWeekTab(i))}
          </Box>
        )}

        {/* First row of day pills */}
        <Box sx={{
          display: 'flex',
          gap: { xs: 0.5, sm: 1 },
          justifyContent: 'center',
        }}>
          {firstRowDays.map((day, index) => renderDayButton(day, index))}
        </Box>

        {/* Second row of day pills */}
        {secondRowDays.length > 0 && (
          <Box sx={{
            display: 'flex',
            gap: { xs: 0.5, sm: 1 },
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
