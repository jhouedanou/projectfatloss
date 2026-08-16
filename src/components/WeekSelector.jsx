import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Paper, LinearProgress } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { CheckCircle2, Flame, ChevronRight, Award, Calendar, Trophy } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function WeekSelector({ days, current, onSelectDay }) {
  const { t } = useTranslation();
  // Couleurs dépendantes du thème : le composant est stylé inline (sx), il ne
  // peut pas s'appuyer sur les surcharges CSS globales du mode clair.
  const theme = useTheme();
  const dark = theme.palette.mode === 'dark';
  const inkPrimary = dark ? '#fff' : '#1A1A1A';
  const inkMuted = dark ? '#a1a1aa' : '#52525B';
  const inkFaint = dark ? '#888' : '#6E6E76';
  const surface = dark ? '#141414' : '#FFFFFF';
  const line = dark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.08)';
  const fill = (a) => (dark ? `rgba(255, 255, 255, ${a})` : `rgba(0, 0, 0, ${a})`);
  
  // Determine current week from current day index (0 to 27)
  const initialWeek = Math.floor(current / 7);
  const [selectedWeek, setSelectedWeek] = useState(initialWeek);

  // Auto-focus on the current week if current changes
  useEffect(() => {
    setSelectedWeek(Math.floor(current / 7));
  }, [current]);

  const totalDays = days.length;
  const weekCount = Math.max(1, Math.ceil(totalDays / 7));
  const globalProgress = Math.round((current / totalDays) * 100);
  const weekStart = selectedWeek * 7;
  const weekDays = days.slice(weekStart, weekStart + 7);

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: '600px',
        margin: '0 auto',
        padding: '20px 16px 120px',
        color: inkPrimary,
        fontFamily: 'Inter, sans-serif',
      }}
    >
      {/* Global Progress Header */}
      <Paper
        sx={{
          bgcolor: surface,
          border: `1px solid ${line}`,
          borderRadius: '24px',
          p: 3,
          mb: 4,
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Trophy size={20} color="#F03D32" strokeWidth={2.5} />
            <Typography variant="body1" sx={{ fontWeight: 800, letterSpacing: '-0.5px' }}>
              PROGRÈS GLOBAL
            </Typography>
          </Box>
          <Typography sx={{ fontWeight: 900, color: '#F03D32', fontSize: '1.2rem' }}>
            {globalProgress}%
          </Typography>
        </Box>
        <Box sx={{ width: '100%', height: '6px', bgcolor: fill(0.06), borderRadius: '10px', overflow: 'hidden', mb: 2 }}>
          <Box sx={{ width: `${globalProgress}%`, height: '100%', bgcolor: '#F03D32', borderRadius: '10px' }} />
        </Box>
        <Typography variant="caption" sx={{ color: inkFaint, fontWeight: 600 }}>
          {weekCount > 1
            ? `JOUR ${current + 1} SUR ${totalDays} • SEMAINE ${initialWeek + 1} EN COURS`
            : `JOUR ${current + 1} SUR ${totalDays} • SEMAINE TYPE RÉPÉTÉE`}
        </Typography>
      </Paper>

      {/* Week Selector Tabs (masqués quand le programme tient sur une semaine) */}
      {weekCount > 1 && (
      <Box
        sx={{
          display: 'flex',
          gap: 1,
          mb: 3,
          overflowX: 'auto',
          pb: 1,
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' }
        }}
      >
        {Array.from({ length: weekCount }, (_, weekIndex) => {
          const isActive = selectedWeek === weekIndex;
          const isCurrentWeek = Math.floor(current / 7) === weekIndex;
          
          return (
            <Box
              key={weekIndex}
              onClick={() => setSelectedWeek(weekIndex)}
              sx={{
                padding: '10px 20px',
                borderRadius: '100px',
                bgcolor: isActive ? '#F03D32' : fill(0.03),
                border: isActive 
                  ? '1px solid #F03D32' 
                  : isCurrentWeek 
                    ? '1px solid rgba(240, 61, 50, 0.3)' 
                    : `1px solid ${line}`,
                color: isActive ? '#fff' : inkMuted,
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '0.8rem',
                whiteSpace: 'nowrap',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                '&:hover': {
                  bgcolor: isActive ? '#F03D32' : fill(0.08),
                  color: isActive || dark ? '#fff' : '#1A1A1A'
                }
              }}
            >
              <Calendar size={14} />
              <span>SEM. {weekIndex + 1}</span>
              {isCurrentWeek && !isActive && (
                <Box sx={{ width: 6, height: 6, bgcolor: '#F03D32', borderRadius: '50%' }} />
              )}
            </Box>
          );
        })}
      </Box>
      )}

      {/* Days List for the selected week */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {weekDays.map((day, idx) => {
          const dayIndex = weekStart + idx;
          const isCompleted = dayIndex < current;
          const isActive = dayIndex === current;
          const isRestDay = day.isRestDay === true;
          
          const cleanTitle = day.title.replace(/JOUR \d+:\s*/i, '');

          return (
            <Paper
              key={dayIndex}
              onClick={() => onSelectDay(dayIndex)}
              sx={{
                bgcolor: isActive 
                  ? 'rgba(240, 61, 50, 0.08)' 
                  : isCompleted 
                    ? fill(0.01)
                    : fill(0.02),
                border: isActive 
                  ? '1.5px solid #F03D32' 
                  : isCompleted
                    ? '1px solid rgba(76, 175, 80, 0.2)'
                    : `1px solid ${line}`,
                borderRadius: '20px',
                p: 2.5,
                cursor: 'pointer',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: isActive ? '0 0 20px rgba(240, 61, 50, 0.15)' : 'none',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  bgcolor: isActive ? 'rgba(240, 61, 50, 0.12)' : fill(0.04),
                  border: isActive ? '1.5px solid #F03D32' : `1px solid ${fill(0.15)}`,
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                {/* Status Indicator circle */}
                <Box
                  sx={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: isCompleted 
                      ? 'rgba(76, 175, 80, 0.1)' 
                      : isActive 
                        ? 'rgba(240, 61, 50, 0.2)' 
                        : fill(0.05),
                    border: isCompleted
                      ? '1px solid rgba(76, 175, 80, 0.3)'
                      : isActive
                        ? '1px solid #F03D32'
                        : `1px solid ${fill(0.1)}`,
                  }}
                >
                  {isCompleted ? (
                    <CheckCircle2 size={18} color="#4CAF50" strokeWidth={2.5} />
                  ) : isRestDay ? (
                    <Award size={18} color={isActive ? '#F03D32' : inkFaint} />
                  ) : (
                    <Flame size={18} color={isActive ? '#F03D32' : '#a1a1aa'} />
                  )}
                </Box>

                {/* Day Info */}
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 800,
                      color: isActive ? '#F03D32' : inkFaint,
                      letterSpacing: '1px',
                      textTransform: 'uppercase'
                    }}
                  >
                    JOUR {dayIndex + 1} {isActive && '• ACTIF'}
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 700,
                      color: isRestDay ? '#4CAF50' : inkPrimary,
                      fontSize: '1rem',
                      lineHeight: 1.3,
                      textTransform: 'uppercase',
                      mt: 0.2
                    }}
                  >
                    {isRestDay ? 'Récupération' : cleanTitle.split(' (')[0]}
                  </Typography>
                  {!isRestDay && day.exercises && (
                    <Typography variant="caption" sx={{ color: '#666', fontWeight: 600, mt: 0.5, display: 'block' }}>
                      {day.exercises.length} exercices • Haltères & barre
                    </Typography>
                  )}
                </Box>
              </Box>

              {/* Right Chevron */}
              <ChevronRight 
                size={20} 
                color={isActive ? '#F03D32' : '#555'} 
                style={{ transition: 'transform 0.2s' }} 
              />
            </Paper>
          );
        })}
      </Box>
    </Box>
  );
}
