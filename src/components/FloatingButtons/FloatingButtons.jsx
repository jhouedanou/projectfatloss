import React from 'react';
import './FloatingButtons.css';
import YouTubeIcon from '@mui/icons-material/YouTube';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

const FloatingButtons = ({ 
  onYouTube, 
  onToggleRhythm, 
  onNext, 
  isRhythmActive,
  exerciseName 
}) => {
  return (
    <div className="floating-buttons-container">
      {onYouTube && (
        <button 
          className="floating-button youtube-btn"
          onClick={onYouTube}
          title={`Voir des tutoriels pour ${exerciseName}`}
        >
          <YouTubeIcon />
        </button>
      )}
      
      {onToggleRhythm && (
        <button 
          className="floating-button rhythm-btn"
          onClick={onToggleRhythm}
          title={isRhythmActive ? "Arrêter le rythme" : "Démarrer le rythme"}
        >
          {isRhythmActive ? <StopIcon /> : <PlayArrowIcon />}
        </button>
      )}
      
      {onNext && (
        <button 
          className="floating-button next-btn"
          onClick={onNext}
          title="Exercice suivant"
        >
          <NavigateNextIcon />
        </button>
      )}
    </div>
  );
};

export default FloatingButtons;