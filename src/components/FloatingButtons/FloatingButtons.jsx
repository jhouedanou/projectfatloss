import React from 'react';
import { Box } from '@mui/material';
import './FloatingButtons.css';
import YouTubeIcon from '@mui/icons-material/YouTube';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

function FloatingButtons({ 
  onYouTube, 
  onToggleRhythm, 
  onNext, 
  onBack, 
  onSkip,
  isRhythmActive,
  isPause,
  exerciseName 
}) {
  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        zIndex: 1000
      }}
    >
      {isPause ? (
        <button
          className="floating-button skip-button"
          onClick={onSkip}
          aria-label="Passer la pause"
        >
          <SkipNextIcon />
        </button>
      ) : (
        <>
          {onYouTube && (
            <button
              className="floating-button youtube-button"
              onClick={onYouTube}
              aria-label="Voir la vidéo YouTube"
            >
              <YouTubeIcon />
            </button>
          )}
          
          {onToggleRhythm && (
            <button
              className={`floating-button rhythm-button ${isRhythmActive ? 'active' : ''}`}
              onClick={onToggleRhythm}
              aria-label={isRhythmActive ? "Arrêter le rythme" : "Démarrer le rythme"}
            >
              {isRhythmActive ? <PauseIcon /> : <PlayArrowIcon />}
            </button>
          )}
          
          {onNext && (
            <button
              className="floating-button next-button"
              onClick={onNext}
              aria-label="Exercice suivant"
            >
              <SkipNextIcon />
            </button>
          )}
          
          {onBack && (
            <button
              className="floating-button back-button"
              onClick={onBack}
              aria-label="Retour"
            >
              <ArrowBackIcon />
            </button>
          )}
        </>
      )}
    </Box>
  );
}

export default FloatingButtons;