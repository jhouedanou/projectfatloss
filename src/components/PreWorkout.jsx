import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Pause as PauseIcon, RotateCcw, Zap, Flame } from 'lucide-react';
import { showTestNotification } from '../services/NotificationService';
import './PreWorkout.css';

const beepSound = '/beep.mp3';

function playBeep() {
  const beep = new Audio(beepSound);
  beep.volume = 1.0;
  beep.play().catch(err => console.error('Erreur lecture audio:', err));
}

const TOTAL_TIME = 30 * 60;

const PHASE_TEXTS = [
  { from: 25 * 60, text: 'Visualisez vos objectifs, préparez le mindset' },
  { from: 20 * 60, text: 'Hydratez-vous, équipement prêt' },
  { from: 15 * 60, text: 'Échauffez les articulations en douceur' },
  { from: 10 * 60, text: 'Activez les muscles, mouvements légers' },
  { from: 5 * 60, text: 'Augmentez progressivement l\'intensité' },
  { from: 0, text: 'Dernière ligne droite, vous êtes prêt(e)' },
];

function phaseText(timeLeft) {
  for (const p of PHASE_TEXTS) if (timeLeft > p.from) return p.text;
  return PHASE_TEXTS[PHASE_TEXTS.length - 1].text;
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export default function PreWorkout({ onStartWorkout, onStartAutoMode, onClose, autoOpen = false }) {
  const [isOpen, setIsOpen] = useState(autoOpen);
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [isRunning, setIsRunning] = useState(autoOpen);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef(null);

  const progress = ((TOTAL_TIME - timeLeft) / TOTAL_TIME) * 100;

  useEffect(() => {
    if (isRunning && !isPaused && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          const newTime = prev - 1;
          if (newTime <= 10 && newTime > 0) playBeep();
          if (newTime === 0) {
            handleTimerComplete();
            return 0;
          }
          return newTime;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
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
    playBeep();
    setTimeout(() => playBeep(), 200);
    setTimeout(() => playBeep(), 400);

    try {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Pre-Workout terminé', {
          body: 'C\'est parti, votre entraînement commence',
          icon: '/favicon.ico',
          tag: 'preworkout-complete'
        });
      } else {
        await showTestNotification();
      }
    } catch (error) {
      console.error('Erreur notification:', error);
    }

    setTimeout(() => {
      setIsOpen(false);
      onStartWorkout && onStartWorkout();
    }, 1500);
  };

  const handleStart = () => { setIsRunning(true); setIsPaused(false); };
  const handlePause = () => setIsPaused(true);
  const handleResume = () => setIsPaused(false);
  const handleReset = () => {
    setIsRunning(false);
    setIsPaused(false);
    setTimeLeft(TOTAL_TIME);
  };
  const handleClose = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsOpen(false);
    onClose && onClose();
  };
  const handleSkip = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsOpen(false);
    onStartWorkout && onStartWorkout();
  };
  const handleOpen = () => {
    setIsOpen(true);
    setTimeLeft(TOTAL_TIME);
    setIsRunning(false);
    setIsPaused(false);
  };

  return (
    <>
      {!autoOpen && (
        <div className="pfl-prewk-launchers">
          <button className="pfl-prewk-launch-btn primary" onClick={handleOpen}>
            <Flame size={18} />
            <span>Pre-Workout</span>
          </button>
          {onStartAutoMode && (
            <button className="pfl-prewk-launch-btn secondary" onClick={onStartAutoMode}>
              <Zap size={18} />
              <span>Mode Auto</span>
            </button>
          )}
        </div>
      )}

      {isOpen && (
        <div className="pfl-prewk-overlay" role="dialog" aria-modal="true">
          <div className="pfl-prewk-card">
            <div className="pfl-prewk-header">
              <div className="pfl-prewk-title-wrap">
                <Flame size={20} color="#F03D32" strokeWidth={2.5} />
                <h2 className="pfl-prewk-title">Pre-Workout</h2>
              </div>
              <button className="pfl-prewk-close" onClick={handleClose} aria-label="Fermer">
                <X size={20} />
              </button>
            </div>

            <div className="pfl-prewk-progress-track">
              <div
                className="pfl-prewk-progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="pfl-prewk-progress-label">{Math.round(progress)}% • {formatTime(TOTAL_TIME - timeLeft)} écoulées</div>

            <div className={`pfl-prewk-timer ${timeLeft <= 60 ? 'warning' : ''}`}>
              {formatTime(timeLeft)}
            </div>

            <div className="pfl-prewk-status">
              {timeLeft === 0
                ? 'C\'est parti, l\'entraînement commence'
                : isRunning && !isPaused
                  ? phaseText(timeLeft)
                  : isPaused
                    ? 'Timer en pause'
                    : 'Démarrer la préparation'}
            </div>

            <div className="pfl-prewk-controls">
              {!isRunning ? (
                <button className="pfl-prewk-btn primary" onClick={handleStart}>
                  <Play size={16} />
                  <span>Démarrer</span>
                </button>
              ) : !isPaused ? (
                <button className="pfl-prewk-btn ghost" onClick={handlePause}>
                  <PauseIcon size={16} />
                  <span>Pause</span>
                </button>
              ) : (
                <button className="pfl-prewk-btn primary" onClick={handleResume}>
                  <Play size={16} />
                  <span>Reprendre</span>
                </button>
              )}

              <button className="pfl-prewk-btn ghost" onClick={handleReset}>
                <RotateCcw size={16} />
                <span>Reset</span>
              </button>

              <button className="pfl-prewk-btn skip" onClick={handleSkip}>
                <span>Sauter</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
