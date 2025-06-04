import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Paper, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, LinearProgress } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import { showTestNotification } from '../services/NotificationService';
import './PreWorkout.css';

const beepSound = '/beep.mp3';

function playBeep() {
  const beep = new Audio(beepSound);
  beep.volume = 1.0;
  beep.play().catch(err => console.error("Erreur de lecture audio:", err));
}

export default function PreWorkout({ onStartWorkout, onStartAutoMode, onClose }) {
  const [isOpen, setIsOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes en secondes
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef(null);
  const theme = useTheme();

  const totalTime = 30 * 60; // 30 minutes
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  // Effet pour gérer le timer
  useEffect(() => {
    if (isRunning && !isPaused && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          const newTime = prev - 1;
          
          // Bip dans les 10 dernières secondes
          if (newTime <= 10 && newTime > 0) {
            playBeep();
          }
          
          // Timer terminé
          if (newTime === 0) {
            handleTimerComplete();
            return 0;
          }
          
          return newTime;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, isPaused, timeLeft]);

  const handleTimerComplete = async () => {
    setIsRunning(false);
    setIsPaused(false);
    
    // Jouer un son spécial de fin
    playBeep();
    setTimeout(() => playBeep(), 200);
    setTimeout(() => playBeep(), 400);
    
    // Envoyer une notification
    try {
      // Créer une notification personnalisée pour le pre-workout
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification("Pre-Workout terminé !", {
          body: "C'est parti ! Votre entraînement commence maintenant 💪",
          icon: '/favicon.ico',
          tag: 'preworkout-complete'
        });
      } else {
        // Demander la permission et montrer la notification si accordée
        await showTestNotification();
      }
    } catch (error) {
      console.error('Erreur notification:', error);
    }
    
    // Attendre un peu puis lancer l'entraînement
    setTimeout(() => {
      setIsOpen(false);
      onStartWorkout();
    }, 2000);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    setIsRunning(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    setIsPaused(true);
  };

  const handleResume = () => {
    setIsPaused(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsPaused(false);
    setTimeLeft(30 * 60);
  };

  const handleClose = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setIsOpen(false);
    onClose();
  };

  const handleOpen = () => {
    setIsOpen(true);
    // Reset timer when opening
    setTimeLeft(30 * 60);
    setIsRunning(false);
    setIsPaused(false);
  };

  return (
    <>
      {/* Bouton pour ouvrir le pre-workout */}
      <Button
        variant="contained"
        color="primary"
        size="large"
        startIcon={<FitnessCenterIcon />}
        onClick={handleOpen}
        sx={{
          minHeight: 60,
          fontSize: '1.1rem',
          fontWeight: 'bold',
          mb: 2,
          background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4)',
          '&:hover': {
            background: 'linear-gradient(45deg, #FF5252, #26C6DA)',
          }
        }}
      >
        Démarrer Pre-Workout (30 min)
      </Button>

      {/* Bouton pour le mode automatique */}
      <Button
        variant="contained"
        color="secondary"
        size="large"
        startIcon={<FlashOnIcon />}
        onClick={() => onStartAutoMode && onStartAutoMode()}
        sx={{
          minHeight: 60,
          fontSize: '1.1rem',
          fontWeight: 'bold',
          mb: 2,
          width: '100%',
          background: 'linear-gradient(45deg, #F03D32, #FF6B6B)',
          '&:hover': {
            background: 'linear-gradient(45deg, #D32F2F, #FF5252)',
          }
        }}
      >
        🚀 Mode Auto - Entraînement Automatisé
      </Button>

      {/* Dialog du pre-workout */}
      <Dialog
        open={isOpen}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            minHeight: 400,
            background: theme.palette.mode === 'dark' 
              ? 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)'
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white'
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          pb: 1
        }}>
          <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
            🔥 Pre-Workout Timer
          </Typography>
          <IconButton 
            onClick={handleClose}
            sx={{ color: 'white' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ textAlign: 'center', py: 3 }}>
          {/* Progress Bar */}
          <Box sx={{ mb: 3 }}>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                  background: 'linear-gradient(90deg, #FFD700, #FF6B6B)',
                }
              }}
            />
            <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
              {Math.round(progress)}% terminé
            </Typography>
          </Box>

          {/* Timer Display */}
          <Typography 
            variant="h2" 
            component="div" 
            sx={{ 
              mb: 3,
              fontFamily: 'monospace',
              fontWeight: 'bold',
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
              color: timeLeft <= 60 ? '#FFD700' : 'white'
            }}
          >
            {formatTime(timeLeft)}
          </Typography>

          {/* Status Text */}
          <Typography variant="h6" sx={{ mb: 3, opacity: 0.9 }}>
            {timeLeft === 0 ? (
              "🎉 C'est parti ! Votre entraînement va commencer..."
            ) : isRunning && !isPaused ? (
              "⏳ Préparez-vous mentalement pour votre séance..."
            ) : isPaused ? (
              "⏸️ Timer en pause"
            ) : (
              "🚀 Cliquez sur Démarrer pour commencer votre préparation"
            )}
          </Typography>

          {/* Motivational Text */}
          {isRunning && timeLeft > 0 && (
            <Box sx={{ mb: 3, p: 2, backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 2 }}>
              <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
                {timeLeft > 25 * 60 ? (
                  "🧠 Visualisez vos objectifs et préparez votre mindset"
                ) : timeLeft > 20 * 60 ? (
                  "💧 Hydratez-vous et préparez votre équipement"
                ) : timeLeft > 15 * 60 ? (
                  "🔥 Échauffez vos articulations en douceur"
                ) : timeLeft > 10 * 60 ? (
                  "💪 Activez vos muscles avec des mouvements légers"
                ) : timeLeft > 5 * 60 ? (
                  "⚡ Augmentez progressivement l'intensité"
                ) : (
                  "🎯 Dernière ligne droite, vous êtes prêt(e) !"
                )}
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ justifyContent: 'center', pb: 3, px: 3 }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
            {!isRunning ? (
              <Button
                variant="contained"
                startIcon={<PlayArrowIcon />}
                onClick={handleStart}
                sx={{
                  bgcolor: '#4CAF50',
                  '&:hover': { bgcolor: '#45a049' },
                  px: 3,
                  py: 1
                }}
              >
                Démarrer
              </Button>
            ) : (
              <>
                {!isPaused ? (
                  <Button
                    variant="contained"
                    startIcon={<PauseIcon />}
                    onClick={handlePause}
                    sx={{
                      bgcolor: '#FF9800',
                      '&:hover': { bgcolor: '#F57C00' },
                      px: 3,
                      py: 1
                    }}
                  >
                    Pause
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    startIcon={<PlayArrowIcon />}
                    onClick={handleResume}
                    sx={{
                      bgcolor: '#4CAF50',
                      '&:hover': { bgcolor: '#45a049' },
                      px: 3,
                      py: 1
                    }}
                  >
                    Reprendre
                  </Button>
                )}
              </>
            )}
            
            <Button
              variant="outlined"
              startIcon={<RestartAltIcon />}
              onClick={handleReset}
              sx={{
                color: 'white',
                borderColor: 'white',
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)'
                },
                px: 3,
                py: 1
              }}
            >
              Reset
            </Button>

            <Button
              variant="contained"
              onClick={() => {
                handleClose();
                onStartWorkout();
              }}
              sx={{
                bgcolor: '#2196F3',
                '&:hover': { bgcolor: '#1976D2' },
                px: 3,
                py: 1
              }}
            >
              Commencer maintenant
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </>
  );
}