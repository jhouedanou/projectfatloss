import React, { useState } from 'react';
import { Box } from '@mui/material';
import './FloatingButtons.css';
import { Play, Pause, SkipForward, ArrowLeft, Menu, X, CheckCircle2, Dumbbell } from 'lucide-react';
import YouTubeIcon from '@mui/icons-material/YouTube';

function FloatingButtons({
  onYouTube,
  onToggleRhythm,
  onNext,
  onBack,
  onSkip,
  isRhythmActive,
  isPause,
  exerciseName,
  exercises = [],
  currentStep = 0,
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <Box
        sx={{
          position: 'fixed',
          bottom: 'calc(30px + env(safe-area-inset-bottom, 0px))',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 1.5,
          zIndex: 1000,
          background: 'rgba(20, 20, 20, 0.85)',
          backdropFilter: 'blur(12px)',
          padding: '10px 20px',
          borderRadius: '100px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
        }}
      >
        {isPause ? (
          <button
            className="floating-button skip-button"
            onClick={onSkip}
            aria-label="Passer la pause"
            style={{ width: 'auto', padding: '0 24px', borderRadius: '100px', background: '#F03D32', color: '#fff', fontWeight: 600, display: 'flex', gap: '8px', alignItems: 'center' }}
          >
            <span>Passer la pause</span>
            <SkipForward size={20} />
          </button>
        ) : (
          <>
            {exercises.length > 0 && (
              <button
                className="floating-button menu-button"
                onClick={() => setMenuOpen(true)}
                aria-label="Voir les exercices de la séance"
              >
                <Menu size={20} />
              </button>
            )}

            {onBack && (
              <button
                className="floating-button back-button"
                onClick={onBack}
                aria-label="Retour"
              >
                <ArrowLeft size={20} />
              </button>
            )}

            {onYouTube && (
              <button
                className="floating-button youtube-button"
                onClick={onYouTube}
                aria-label="Voir la vidéo YouTube"
              >
                <YouTubeIcon style={{ fontSize: 28, color: '#F03D32' }} />
              </button>
            )}

            {onToggleRhythm && (
              <button
                className={`floating-button rhythm-button ${isRhythmActive ? 'active' : ''}`}
                onClick={onToggleRhythm}
                aria-label={isRhythmActive ? "Arrêter le rythme" : "Démarrer le rythme"}
              >
                {isRhythmActive ? <Pause size={24} /> : <Play size={24} />}
              </button>
            )}

            {onNext && (
              <button
                className="floating-button next-button"
                onClick={onNext}
                aria-label="Exercice suivant"
              >
                <SkipForward size={20} />
              </button>
            )}
          </>
        )}
      </Box>

      {menuOpen && (
        <div className="exo-menu-overlay" onClick={() => setMenuOpen(false)}>
          <div className="exo-menu-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="exo-menu-head">
              <div className="exo-menu-title">
                <Dumbbell size={18} />
                <span>Exercices de la séance</span>
              </div>
              <button className="exo-menu-close" onClick={() => setMenuOpen(false)} aria-label="Fermer">
                <X size={20} />
              </button>
            </div>
            <div className="exo-menu-list">
              {exercises.map((ex, i) => {
                const state = i < currentStep ? 'done' : i === currentStep ? 'current' : 'todo';
                return (
                  <div key={i} className={`exo-menu-item ${state}`}>
                    <div className="exo-menu-num">
                      {state === 'done' ? <CheckCircle2 size={18} /> : i + 1}
                    </div>
                    <div className="exo-menu-info">
                      <div className="exo-menu-name">{ex.name}</div>
                      <div className="exo-menu-sets">{ex.sets}{ex.equip ? ` • ${ex.equip}` : ''}</div>
                    </div>
                    {state === 'current' && <span className="exo-menu-badge">En cours</span>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default FloatingButtons;
