// Correction des bugs liés à pause/isPaused - v1.0.1
import React, { useState, useEffect, useRef, createContext, useCallback, useMemo } from 'react';
import { Box, Typography, Paper, Button, FormControlLabel, Switch, IconButton, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { ArrowLeft, Rocket, Save, Flame, Dumbbell, Repeat, Timer, Play, Pause as PauseIconLucide, RotateCcw, Check, MonitorPlay, Bell, CalendarPlus, Volume2, VolumeX } from 'lucide-react';
import { getLastDoseAt, isTakenToday, downloadCreatineReminder } from '../utils/creatineReminder';
const beepSound = '/beep.mp3';
import YouTubeButton from '../components/YouTubeButton';
import ExoIcon from '../components/ExoIcon';
import FloatingButtons from '../components/FloatingButtons/FloatingButtons';
import ProgressTracker from '../components/ProgressTracker';
import SpeechSettingsDialog from '../components/SpeechSettingsDialog';
import DayPills from '../components/DayPills';
import { getActiveWorkoutPlan } from '../services/WorkoutCustomization';
import { initSpeechService, announceExercise, announceSet, announcePause, announceCount, announceRepetition, announceWorkoutComplete, setEnabled as setSpeechEnabled, isEnabled as isSpeechEnabled } from '../services/SpeechService';
import { saveWorkout } from '../services/WorkoutStorage';
import notificationService from '../services/NotificationService';
import { useTranslation } from 'react-i18next';
import YouTube from 'react-youtube';
import { getExerciseIconsPath, getAssetPath } from '../utils/paths';
import GoogleFitService from '../services/GoogleFitService';
import PreWorkout from '../components/PreWorkout';
import { getCaloriesForSet } from '../services/CalorieEstimator';

import '../components/SpeechSettings.css';
import './StepWorkout.css';

// Fonction utilitaire simple pour formater le temps
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// Durées de repos adaptées : repos plus long entre exercices pour récupérer
// de la force, et repos entre séries qui augmente avec la fatigue cumulée.
const SET_PAUSE_BASE_SECONDS = 15;        // repos de base entre deux séries
const SET_PAUSE_INCREMENT_SECONDS = 5;    // +5s par série déjà réalisée
const SET_PAUSE_MAX_SECONDS = 40;         // plafond du repos entre séries
const EXERCISE_PAUSE_SECONDS = 45;        // repos entre exercices (récupération force)
const PAUSE_DURATION_SECONDS = SET_PAUSE_BASE_SECONDS; // valeur par défaut historique

// Calcule la durée de pause en fonction du contexte (changement d'exercice ou
// de série) afin d'avoir plus de force pour l'effort suivant.
function getPauseDuration({ isExerciseTransition, setNum = 0 }) {
  if (isExerciseTransition) {
    return EXERCISE_PAUSE_SECONDS;
  }
  const reps = Math.max(0, setNum);
  return Math.min(
    SET_PAUSE_BASE_SECONDS + reps * SET_PAUSE_INCREMENT_SECONDS,
    SET_PAUSE_MAX_SECONDS
  );
}

// Correction de l'import du fichier JSON
// import iconsMap from '../../public/exo-icons.json'; // ❌ Incorrect

// ✅ Utilisation d'un fetch dynamique ou import direct depuis src
const iconsMap = {}; // Temporaire - sera chargé dynamiquement

// Chargement dynamique des icônes
fetch(getExerciseIconsPath())
  .then(response => response.json())
  .then(data => Object.assign(iconsMap, data))
  .catch(error => console.error('Erreur chargement icônes:', error));

// Helper to map exercise icon types and names to premium generated illustrations
const getExerciseIllustration = (iconType, name = '') => {
  const cleanName = name.toLowerCase();
  
  if (cleanName.includes('biceps') || cleanName.includes('curl') || cleanName.includes('triceps') || cleanName.includes('barre au front') || cleanName.includes('dips') || cleanName.includes('kickback')) {
    return 'arms_workout.png';
  }
  if (cleanName.includes('épaule') || cleanName.includes('arnold') || cleanName.includes('latérale') || cleanName.includes('frontale') || cleanName.includes('oiseau') || cleanName.includes('reverse fly') || cleanName.includes('face pull')) {
    return 'shoulders_workout.png';
  }
  if (cleanName.includes('développé couch') || cleanName.includes('pompe') || cleanName.includes('écarté') || cleanName.includes('chest') || cleanName.includes('incliné')) {
    return 'chest_workout.png';
  }
  if (cleanName.includes('rowing') || cleanName.includes('deadlift') || cleanName.includes('soulevé de terre') || cleanName.includes('traction') || cleanName.includes('shrug') || cleanName.includes('meadows') || cleanName.includes('yates')) {
    return 'back_workout.png';
  }
  if (cleanName.includes('squat') || cleanName.includes('fente') || cleanName.includes('thrust') || cleanName.includes('pont fessier') || cleanName.includes('mollet') || cleanName.includes('jambe') || cleanName.includes('hanche') || cleanName.includes('adducteur') || cleanName.includes('dead bug')) {
    return 'legs_workout.png';
  }
  if (cleanName.includes('crunch') || cleanName.includes('planche') || cleanName.includes('gainage') || cleanName.includes('twist') || cleanName.includes('hollow') || cleanName.includes('v-up')) {
    return 'abs_workout.png';
  }
  if (cleanName.includes('cardio') || cleanName.includes('étirement') || cleanName.includes('étirer') || cleanName.includes('mobilité') || cleanName.includes('vélo') || cleanName.includes('stretch') || cleanName.includes('good morning')) {
    return 'cardio_stretch.png';
  }

  switch (iconType) {
    case 'dumbbell':
    case 'dumbbell_equip':
    case 'barbell':
    case 'bench':
      return 'chest_workout.png';
    case 'arrow-up':
    case 'step-up':
    case 'shrug':
    case 'reverse-fly':
      return 'shoulders_workout.png';
    case 'arm-flex':
    case 'bars':
      return 'arms_workout.png';
    case 'rowing':
    case 'deadlift':
      return 'back_workout.png';
    case 'squat':
    case 'lunge':
    case 'hip-thrust':
    case 'calf':
    case 'hip-extension':
    case 'ankle':
      return 'legs_workout.png';
    case 'abs':
    case 'plank':
    case 'twist':
    case 'leg-raise':
      return 'abs_workout.png';
    case 'compass':
    case 'mountain':
    case 'cardio':
    case 'stretch':
    case 'mobility':
    case 'good-morning':
      return 'cardio_stretch.png';
    default:
      return 'chest_workout.png';
  }
};

// Créer un contexte pour partager le mode automatique entre composants
const WorkoutContext = createContext({
  autoMode: false,
});

// Contexte audio unique, créé paresseusement au premier usage.
// IMPORTANT : ne PAS instancier au chargement du module. Sur certains
// navigateurs (politique d'autoplay, AudioContext indisponible, modes
// restreints…) `new AudioContext()` peut lever une exception ; comme ce code
// s'exécute pendant l'évaluation du module (avant le montage de React), cela
// fait planter tout le graphe d'import et aboutit à une page blanche que
// l'ErrorBoundary ne peut pas intercepter.
let audioContext = null;

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  const AudioCtor = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtor) return null;
  if (!audioContext) {
    try {
      audioContext = new AudioCtor();
    } catch (error) {
      console.warn('AudioContext indisponible:', error);
      return null;
    }
  }
  return audioContext;
}

function playBeep() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    // Créer un oscillateur pour générer le son
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    // Connecter les nœuds
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Configurer le son
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800, ctx.currentTime);
    gainNode.gain.setValueAtTime(0.1, ctx.currentTime);

    // Jouer le son
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.1);
  } catch (error) {
    console.error("Erreur lors de la lecture du son:", error);
  }
}

function parseSets(sets) {
  const m = sets.match(/(\d+)\s*[x×]/i);
  return m ? parseInt(m[1], 10) : 1;
}

function calculateWeight(equipment) {
  const match = equipment && equipment.match(/(\d+)\s*kg/i);
  return match ? parseInt(match[1], 10) : 0;
}

function Pause({ onEnd, onSkip, isExerciseTransition, reducedTime, day, step, total, setNum, totalSets, autoMode }) {
  const defaultTime = getPauseDuration({ isExerciseTransition, setNum });

  const [time, setTime] = useState(defaultTime);
  
  const currentExercise = day.exercises[step];
  const nextExercise = step < total - 1 ? day?.exercises?.[step + 1] : null;
  const isLastSet = setNum === totalSets - 1;
  
  useEffect(() => {
    const timer = setInterval(() => {
      setTime((prevTime) => {
        if (prevTime <= 4 && prevTime > 1) {
          playBeep();
        }
        
        if (prevTime === 1) {
          clearInterval(timer);
          onEnd();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
    // Démarre une seule fois au montage de la pause : évite tout relancement du
    // compte à rebours quand le parent re-render (ex. bascule du mode auto).
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="pause-screen">
      <div className="pause-header">
        <h2 className="pause-title">Pause {autoMode ? "Auto" : (reducedTime && "Rapide")}</h2>
        <div className="pause-timer">{time}s</div>
      </div>
      
      {/* Afficher le prochain exercice sur la dernière série */}
      {nextExercise && isLastSet && (
        <div className="next-exercise-info">
          <h3 style={{ marginTop: 0, marginBottom: '12px', color: 'var(--text-primary)' }}>Prochain exercice :</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <ExoIcon type={iconsMap[nextExercise.name] || 'dumbbell'} size={48} />
            <div>
              <p style={{ margin: '0 0 4px 0', fontWeight: 500, fontSize: '1.1rem' }}>{nextExercise.name}</p>
              <p style={{ margin: '0 0 4px 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                {nextExercise.nbRep} répétitions × {nextExercise.sets}
              </p>
              {nextExercise.equip && (
                <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>
                  {nextExercise.equip}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Bouton flottant pour passer la pause */}
      <FloatingButtons 
        onSkip={onSkip}
        isPause={true}
      />
    </div>
  );
}

function CalorieDisplay({ calories, visible }) {
  return (
    <div className={`calorie-display ${visible ? 'visible' : ''}`}>
      <span>+{calories} calories brûlées !</span>
    </div>
  );
}


function EndOfDayModal({ day, totalCalories, duration, onClose, onSaveWorkout }) {
  const [isLoadingFit, setIsLoadingFit] = useState(false);
  const [isSynced, setIsSynced] = useState(false);
  const [reminderAdded, setReminderAdded] = useState(false);
  const creatineLastDose = getLastDoseAt();
  const creatineTakenToday = isTakenToday(creatineLastDose);

  const handleAddCreatineReminder = () => {
    downloadCreatineReminder(creatineLastDose || Date.now());
    setReminderAdded(true);
  };

  function calculateWeight(equipment) {
    const match = equipment && equipment.match(/(\d+)\s*kg/i);
    return match ? parseInt(match[1], 10) : 0;
  }
  
  const totalWeightLifted = day.exercises.reduce((total, exercise) => {
    const weight = calculateWeight(exercise.equip);
    const sets = parseSets(exercise.sets);
    let reps = 0;
    const repsMatch = exercise.sets.match(/\d+\s*[x×]\s*(\d+)(?:-(\d+))?/i);
    if (repsMatch) {
      if (repsMatch[2]) {
        reps = Math.round((parseInt(repsMatch[1], 10) + parseInt(repsMatch[2], 10)) / 2);
      } else {
        reps = parseInt(repsMatch[1], 10);
      }
    }
    return total + (weight * sets * reps);
  }, 0);
  
  const handleGoogleFitSync = async () => {
    setIsLoadingFit(true);
    try {
      await GoogleFitService.signIn();
      const sessionActivity = {
        activityType: 97, // Strength Training in Google Fit
        name: `Project Fat Loss - ${day?.title}`,
        description: `Séance de musculation de haute intensité. Poids total soulevé : ${totalWeightLifted} kg.`,
        startTime: new Date().getTime() - 45 * 60 * 1000,
        duration: 45 * 60 * 1000,
        calories: totalCalories,
      };
      await GoogleFitService.addActivity(sessionActivity);
      setIsSynced(true);
      alert('Séance synchronisée avec Google Fit !');
    } catch (error) {
      console.error('Erreur lors de la synchronisation Google Fit:', error);
      alert(`Erreur lors de la synchronisation avec Google Fit : ${error.message || error}`);
    } finally {
      setIsLoadingFit(false);
    }
  };

  const handleSave = async () => {
    const workoutData = {
      title: day?.title,
      date: new Date().toISOString(),
      calories: totalCalories,
      weightLifted: totalWeightLifted,
      exerciseCount: day.exercises.length,
      exercises: day.exercises.map(exercise => ({
        name: exercise.name,
        sets: parseSets(exercise.sets),
        weightLifted: calculateWeight(exercise.equip)
      })),
      // Durée réelle mesurée (minutes) si disponible, sinon estimation (3 min/exercice)
      duration: duration != null ? duration : day.exercises.length * 3
    };
    
    // Sauvegarder localement
    const savedWorkout = saveWorkout(workoutData);
    
    // Informer le parent que l'entraînement a été sauvegardé
    onSaveWorkout && onSaveWorkout(savedWorkout);
    
    // Fermer la modale
    onClose();
  };
  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{
        background: 'linear-gradient(135deg, #141416 0%, #0d0d0e 100%)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '24px',
        padding: '36px 24px 28px',
        maxWidth: '450px',
        width: '92%',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
        color: '#fff',
        fontFamily: "'Inter', sans-serif",
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative corner glow */}
        <div style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '120px',
          height: '120px',
          background: 'rgba(240, 61, 50, 0.15)',
          filter: 'blur(30px)',
          borderRadius: '50%',
          pointerEvents: 'none'
        }} />

        <h2 style={{ 
          fontFamily: "'Outfit', sans-serif",
          fontSize: '2rem', 
          fontWeight: 900, 
          marginBottom: '4px', 
          letterSpacing: '-0.5px',
          background: 'linear-gradient(135deg, #fff 30%, #a1a1aa 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          FÉLICITATIONS !
        </h2>
        <p style={{
          color: 'var(--vermilion)',
          fontSize: '0.75rem',
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '2px',
          margin: '0 0 16px 0'
        }}>
          Séance Complétée
        </p>

        <div className="completion-icon" style={{
          width: '76px',
          height: '76px',
          borderRadius: '50%',
          background: 'rgba(240, 61, 50, 0.08)',
          border: '1px solid rgba(240, 61, 50, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
          boxShadow: '0 0 24px rgba(240, 61, 50, 0.15)',
          animation: 'pulse 2s infinite'
        }}>
          <Flame size={36} color="var(--vermilion)" />
        </div>

        <h3 style={{ 
          fontFamily: "'Outfit', sans-serif",
          fontSize: '1.2rem', 
          fontWeight: 800, 
          margin: '0 0 20px 0', 
          textTransform: 'uppercase', 
          color: '#fff',
          letterSpacing: '-0.2px'
        }}>
          {day?.title}
        </h3>
        
        {/* Stats Container - Two premium cards side-by-side */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          margin: '0 0 20px 0'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '16px',
            padding: '14px 8px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Flame size={20} color="var(--vermilion)" />
            <span style={{ color: '#71717a', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Calories
            </span>
            <span style={{ color: '#fff', fontSize: '1.25rem', fontWeight: 900, fontFamily: "'Outfit', sans-serif" }}>
              {totalCalories} <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#71717a' }}>kcal</span>
            </span>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '16px',
            padding: '14px 8px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Dumbbell size={20} color="#3b82f6" />
            <span style={{ color: '#71717a', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Volume
            </span>
            <span style={{ color: '#fff', fontSize: '1.25rem', fontWeight: 900, fontFamily: "'Outfit', sans-serif" }}>
              {totalWeightLifted} <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#71717a' }}>kg</span>
            </span>
          </div>
        </div>

        <p className="motivation-text" style={{ 
          color: '#a1a1aa', 
          fontSize: '0.82rem', 
          lineHeight: 1.5, 
          margin: '0 0 24px 0',
          padding: '0 8px'
        }}>
          Excellent travail ! Vos progrès sont enregistrés. Continuez sur cette lancée !
        </p>
        
        {/* Google Fit Sync Button */}
        <div style={{ margin: '0 0 16px 0', width: '100%' }}>
          <button 
            onClick={handleGoogleFitSync}
            disabled={isLoadingFit || isSynced}
            style={{
              width: '100%',
              padding: '14px 16px',
              borderRadius: '14px',
              border: isSynced ? '1px solid rgba(16, 185, 129, 0.2)' : 'none',
              background: isSynced 
                ? 'rgba(16, 185, 129, 0.08)' 
                : 'linear-gradient(135deg, #4285F4 0%, #357ae8 100%)',
              color: isSynced ? '#10b981' : 'white',
              fontSize: '0.88rem',
              fontWeight: '800',
              fontFamily: "'Outfit', sans-serif",
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              cursor: isSynced ? 'default' : 'pointer',
              boxShadow: isSynced ? 'none' : '0 4px 15px rgba(66, 133, 244, 0.2)',
              transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            onMouseEnter={(e) => {
              if (!isLoadingFit && !isSynced) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(66, 133, 244, 0.35)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isSynced) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(66, 133, 244, 0.2)';
              }
            }}
          >
            <img 
              src="https://www.gstatic.com/images/branding/product/1x/gfit_512dp.png" 
              alt="Google Fit" 
              style={{ width: '20px', height: '20px', objectFit: 'contain' }}
            />
            {isLoadingFit ? 'Synchronisation...' : isSynced ? '✓ SYNCHRONISÉ AVEC GOOGLE FIT' : 'SYNCHRONISER AVEC GOOGLE FIT'}
          </button>
        </div>

        {/* Rappel créatine — dose quotidienne de 5 g (proposé tant qu'elle n'est pas prise) */}
        {!creatineTakenToday && (
          <div style={{ margin: '0 0 16px 0', width: '100%' }}>
            <button
              onClick={handleAddCreatineReminder}
              disabled={reminderAdded}
              style={{
                width: '100%',
                minHeight: '48px',
                padding: '13px 16px',
                borderRadius: '14px',
                border: reminderAdded ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(240,61,50,0.4)',
                background: reminderAdded ? 'rgba(16,185,129,0.08)' : 'rgba(240,61,50,0.1)',
                color: reminderAdded ? '#10b981' : '#f87171',
                fontSize: '0.85rem',
                fontWeight: 800,
                fontFamily: "'Outfit', sans-serif",
                letterSpacing: '0.3px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                cursor: reminderAdded ? 'default' : 'pointer',
              }}
            >
              <CalendarPlus size={18} />
              {reminderAdded ? 'RAPPEL AJOUTÉ À L\'AGENDA' : 'RAPPEL CRÉATINE 5 G (QUOTIDIEN)'}
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            style={{
              flex: 1.2,
              padding: '14px',
              borderRadius: '14px',
              border: 'none',
              background: 'linear-gradient(135deg, var(--vermilion), #c41e0b)',
              color: '#fff',
              fontWeight: 800,
              fontFamily: "'Outfit', sans-serif",
              fontSize: '0.88rem',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(240, 61, 50, 0.25)',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            onClick={handleSave}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(240, 61, 50, 0.35)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(240, 61, 50, 0.25)';
            }}
          >
            Enregistrer
          </button>
          <button 
            style={{
              flex: 0.8,
              padding: '14px',
              borderRadius: '14px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              background: 'rgba(255, 255, 255, 0.02)',
              color: '#a1a1aa',
              fontWeight: 700,
              fontFamily: "'Outfit', sans-serif",
              fontSize: '0.88rem',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            onClick={onClose}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
              e.currentTarget.style.color = '#fff';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
              e.currentTarget.style.color = '#a1a1aa';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
            }}
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

export default function StepWorkout({ dayIndex: initialDayIndex, onBack, onComplete, autoMode: initialAutoMode, onNotificationSettings }) {
  const [dayIndex, setDayIndex] = useState(initialDayIndex || 0);
  const [step, setStep] = useState(0);
  const [pause, setPause] = useState(false);
  const [isExerciseTransition, setIsExerciseTransition] = useState(false);
  const [setNum, setSetNum] = useState(0);
  const [pendingTransitionType, setPendingTransitionType] = useState(null);
  const [totalCaloriesBurned, setTotalCaloriesBurned] = useState(0);
  const [exerciseCompleted, setExerciseCompleted] = useState(false);
  const [workoutCompleted, setWorkoutCompleted] = useState(false);
  const [autoMode, setAutoMode] = useState(initialAutoMode || false); // Mode automatique pour les pauses
  const [showPreWorkout, setShowPreWorkout] = useState(false);
  // Synthèse vocale réactivée pour les exercices
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogConfig, setDialogConfig] = useState({
    title: '',
    message: '',
    confirmAction: () => {},
    cancelAction: () => {}
  });
  const [showAutoModeDialog, setShowAutoModeDialog] = useState(false);
  // Synthèse vocale : état activé/désactivé (mémorisé dans le SpeechService/localStorage)
  const [speechEnabled, setSpeechEnabledState] = useState(() => isSpeechEnabled());
  // Suivi de l'exercice / la série déjà annoncés pour éviter les doublons
  const prevStepRef = useRef(-1);
  const prevSetRef = useRef(-1);
  // Horodatage de début de séance pour mesurer la durée réelle
  const workoutStartRef = useRef(Date.now());
  // Durée en minutes (l'affichage des stats interprète totalDuration en minutes)
  const getElapsedMinutes = () =>
    Math.max(0, Math.round((Date.now() - workoutStartRef.current) / 60000));
  let beepTimeouts = [];
  
  // Mémoïser le plan : getWorkoutPlan() lit localStorage et, en cas de plan
  // personnalisé, JSON.parse renvoie de nouvelles références à chaque appel.
  // Sans mémoïsation, `day`/`exo` changeraient d'identité à chaque rendu, ce
  // qui relancerait le compteur de répétitions (effet de reset basé sur `exo`)
  // notamment en mode auto où le parent se re-rend souvent.
  // Plan effectif : exclut le vélo de fin de séance s'il est désactivé.
  const workoutPlan = useMemo(() => getActiveWorkoutPlan(), []);
  const day = workoutPlan?.[dayIndex];
  const total = day?.exercises?.length || 0;
  const exo = day?.exercises?.[step];
  
  // Utiliser totalSets de l'exercice en priorité, sinon calculer
  const baseTotalSets = exo?.totalSets ?? parseSets(exo?.sets || '1');
  
  // En mode automatique, conserver le nombre original de sets
  // mais utiliser les vraies valeurs de nbRep du data.js
  const totalSets = exo ? baseTotalSets : 1;

  const dataReady = !!(workoutPlan && day && exo);

  // Initialiser la synthèse vocale au démarrage
  useEffect(() => {
    initSpeechService();
  }, []);

  useEffect(()=>{
    setStep(0);
    setPause(false);
    setIsExerciseTransition(false);
    setSetNum(0);
    setPendingTransitionType(null);
    setTotalCaloriesBurned(0);
    // Réinitialiser le suivi des annonces pour ré-annoncer le 1er exercice du jour
    prevStepRef.current = -1;
    prevSetRef.current = -1;
  },[dayIndex]);

  // Annonce vocale française : nom de l'exercice + série au début de chaque
  // exercice, puis numéro de série à chaque nouvelle série du même exercice.
  // Silencieux pendant les pauses et l'écran de préparation.
  useEffect(() => {
    if (!exo || pause || showPreWorkout) return;

    const isNewExercise = prevStepRef.current !== step;
    const isNewSet = prevSetRef.current !== setNum;

    if (isNewExercise) {
      announceExercise(exo, setNum, totalSets, pause);
    } else if (isNewSet) {
      announceSet(setNum, totalSets);
    }

    prevStepRef.current = step;
    prevSetRef.current = setNum;
  }, [exo, step, setNum, totalSets, pause, showPreWorkout]);
  
  const applyPendingAdvance = useCallback(() => {
    if (pendingTransitionType === 'exercise') {
      setStep(s => s + 1);
      setSetNum(0);
    } else if (pendingTransitionType === 'set') {
      setSetNum(s => s + 1);
    }
    setPendingTransitionType(null);
  }, [pendingTransitionType]);

  const handlePauseEnd = () => {
    applyPendingAdvance();
    setPause(false);
    setIsExerciseTransition(false);
  };
  
  const handleSkipPause = () => {
    applyPendingAdvance();
    setPause(false);
    setIsExerciseTransition(false);
  };
  
  const handleCaloriesBurned = (calories) => {
    setTotalCaloriesBurned(prev => prev + calories);
  };

  const handleExerciseCompleted = () => {
    setExerciseCompleted(true);
    setTimeout(() => setExerciseCompleted(false), 1000);
  };

  const handleSetComplete = () => {
    // Si on a fait toutes les séries de cet exercice
    if (setNum + 1 >= totalSets) {
      // Si c'est le dernier exercice
      if (step + 1 >= total) {
        // Jour terminé
        setWorkoutCompleted(true);
      } else {
        // Pause de transition puis passage à l'exercice suivant
        setPendingTransitionType('exercise');
        setPause(true);
        setIsExerciseTransition(true);
      }
    } else {
      // Passer à la série suivante
      setPendingTransitionType('set');
      setPause(true);
    }
  };

  const next = () => {
    const currentExercise = day.exercises[step];
    const nextExercise = step < total - 1 ? day?.exercises?.[step + 1] : null;

    if (setNum < totalSets - 1) {
      setSetNum(s => s + 1);
      setPause(true);
      setIsExerciseTransition(autoMode ? true : false);
    } else if (step < total - 1) {
      setPause(true);
      setIsExerciseTransition(true);
      setSetNum(0);
      setStep(s => s + 1);
      
      // Enlever le bip automatique
      // playBeep();
    } else {
      setWorkoutCompleted(true);
    }
  };

  function clearBeepRhythm() {
    beepTimeouts.forEach(timeout => clearTimeout(timeout));
    beepTimeouts = [];
  }

  const handleCloseEndOfDayModal = () => {
    setWorkoutCompleted(false);
    onBack();
  };
  
  const handleSaveWorkout = (workoutData) => {
    const workoutDataWithMode = {
      ...workoutData,
      fatBurnerMode: autoMode
    };
    
    // Synthèse vocale pour la fin d'entraînement
    announceWorkoutComplete({ calories: workoutDataWithMode.calories });
    
    onComplete && onComplete(workoutDataWithMode);
    
    // Fermer la modale
    handleCloseEndOfDayModal();
  };
  
  const showConfirmDialog = (title, message, onConfirm, onCancel = () => {}) => {
    setDialogConfig({
      title,
      message,
      confirmAction: () => {
        onConfirm();
        setDialogOpen(false);
      },
      cancelAction: () => {
        onCancel();
        setDialogOpen(false);
      }
    });
    setDialogOpen(true);
  };
  
  // Mode automatique désactivé
  
  // Fonction pour toggler le mode automatique
  const handleToggleAutoMode = () => {
    setAutoMode(prev => !prev);
  };

  // Activer / désactiver la synthèse vocale (annonce exercice + série).
  // Le réglage est mémorisé par le SpeechService (localStorage).
  const handleToggleSpeech = () => {
    const next = !speechEnabled;
    setSpeechEnabledState(next);
    setSpeechEnabled(next); // persiste + coupe toute annonce en cours si désactivé
  };

  const handleBackClick = () => {
    showConfirmDialog(
      "Quitter l'entraînement ?",
      "Voulez-vous vraiment quitter ? Votre progression sera perdue.",
      () => {
        notificationService.clearCurrentExercise();
        onBack();
      },
      () => {}
    );
  };

  const handleSaveAndExit = async () => {
    showConfirmDialog(
      "Sauvegarder et quitter",
      "Voulez-vous enregistrer votre entraînement ?",
      async () => {
        try {
          // Sauvegarder la progression et créer un objet workout complet
          const workoutData = {
            title: day?.title,
            date: new Date().toISOString(),
            calories: totalCaloriesBurned,
            weightLifted: day.exercises.reduce((total, exercise) => {
              const weight = calculateWeight(exercise.equip);
              const sets = parseSets(exercise.sets);
              let reps = 0;
              const repsMatch = exercise.sets.match(/\d+\s*[x×]\s*(\d+)(?:-(\d+))?/i);
              if (repsMatch) {
                if (repsMatch[2]) {
                  reps = Math.round((parseInt(repsMatch[1], 10) + parseInt(repsMatch[2], 10)) / 2);
                } else {
                  reps = parseInt(repsMatch[1], 10);
                }
              }
              return total + (weight * sets * reps);
            }, 0),
            exerciseCount: step + 1,
            exercises: day.exercises.slice(0, step + 1).map(exercise => ({
              name: exercise.name,
              sets: parseSets(exercise.sets),
              weightLifted: calculateWeight(exercise.equip)
            })),
            fatBurnerMode: autoMode,
            duration: getElapsedMinutes()
          };

          // Sauvegarder d'abord localement
          const savedWorkout = saveWorkout(workoutData);
          
          // Informer le parent que l'entraînement a été sauvegardé
          onComplete && onComplete(savedWorkout);
          
          // Supprimer la notification
          notificationService.clearCurrentExercise();
          
          // Fermer la page
          onBack();
        } catch (error) {
          console.error('Erreur lors de la sauvegarde:', error);
          alert('Erreur lors de la sauvegarde. Veuillez réessayer.');
        }
      }
    );
  };

  const handleStartWorkout = () => {
    setShowPreWorkout(false);
    // Redémarrer le chrono au lancement effectif (si écran pré-séance affiché)
    workoutStartRef.current = Date.now();
    // L'entraînement se lance automatiquement
  };

  // Gestion des notifications d'exercice en cours
  useEffect(() => {
    if (showPreWorkout) return;
    if (exo && !pause && !workoutCompleted) {
      const exerciseData = {
        name: exo.name,
        currentSet: setNum + 1,
        totalSets: totalSets,
        dayTitle: day?.title,
        currentExercise: step + 1,
        totalExercises: total,
        autoMode: autoMode
      };

      notificationService.updateCurrentExercise(exerciseData);
    }
  }, [exo, setNum, totalSets, day?.title, step, total, autoMode, pause, workoutCompleted, showPreWorkout]);

  // Gestion des notifications d'exercice en cours avec plus de données
  useEffect(() => {
    if (showPreWorkout) return;
    if (exo && !pause && !workoutCompleted) {
      const exerciseData = {
        name: exo.name,
        currentSet: setNum + 1,
        totalSets: totalSets,
        dayTitle: day?.title,
        currentExercise: step + 1,
        totalExercises: total,
        autoMode: autoMode,
        exerciseType: exo.timer ? 'timer' : 'reps',
        remainingTime: exo.duration || null,
        currentRep: 0,
        totalReps: exo.nbRep || 0,
        isPaused: pause,
        calories: totalCaloriesBurned,
        progress: 0
      };

      notificationService.updateCurrentExercise(exerciseData);
    }
  }, [exo, setNum, totalSets, day?.title, step, total, autoMode, pause, workoutCompleted, totalCaloriesBurned, showPreWorkout]);

  // Gestion des notifications de pause avec timer
  useEffect(() => {
    if (showPreWorkout) return;
    if (pause && !workoutCompleted) {
      const pauseData = {
        remainingTime: getPauseDuration({ isExerciseTransition, setNum }),
        nextExercise: step < total - 1 ? day?.exercises?.[step + 1] : null,
        currentSet: setNum + 1,
        totalSets: totalSets,
        autoMode: autoMode
      };

      notificationService.showPauseNotification(pauseData);
    }
  }, [pause, workoutCompleted, autoMode, step, total, day?.exercises, setNum, totalSets, showPreWorkout, isExerciseTransition]);

  if (!dataReady) {
    return (
      <div style={{textAlign: 'center', marginTop: 40}}>
        <h2>Chargement...</h2>
        <p>Veuillez patienter.</p>
      </div>
    );
  }

  // Si on veut afficher le pre-workout, on l'affiche en premier
  if (showPreWorkout) {
    return (
      <PreWorkout
        autoOpen={true}
        onStartWorkout={handleStartWorkout}
        onClose={() => setShowPreWorkout(false)}
      />
    );
  }

  return (
    <div 
      className="day-content step-workout" 
      style={{
        paddingTop: 'env(safe-area-inset-top, 20px)',
        paddingBottom: 'env(safe-area-inset-bottom, 20px)',
        minHeight: '100dvh',
      }}
    >
      <div className="action-buttons workout-topbar">
        <div className="workout-topbar-left">
          <span className="workout-logo-chip">
            <img 
              src={getAssetPath('/logo.png')} 
              alt="PFL Logo" 
            />
          </span>
          <button 
            className="timer-btn workout-icon-btn" 
            onClick={handleBackClick}
            title="Retour"
            aria-label="Retour"
          >
            <ArrowLeft size={18} />
          </button>
        </div>
        
        <div className="workout-topbar-actions">
          <button
            className={`timer-btn workout-icon-btn ${speechEnabled ? 'is-active' : ''}`}
            onClick={handleToggleSpeech}
            title={speechEnabled ? "Désactiver les annonces vocales" : "Activer les annonces vocales"}
            aria-label={speechEnabled ? "Desactiver les annonces vocales" : "Activer les annonces vocales"}
            aria-pressed={speechEnabled}
          >
            {speechEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
          <button
            className={`timer-btn workout-icon-btn ${autoMode ? 'is-active' : ''}`}
            onClick={handleToggleAutoMode}
            title={autoMode ? "Désactiver le mode automatique" : "Activer le mode automatique"}
            aria-label={autoMode ? "Desactiver le mode automatique" : "Activer le mode automatique"}
          >
            <Rocket size={18} />
          </button>
          <button 
            className="timer-btn workout-icon-btn save-btn" 
            onClick={handleSaveAndExit}
            title="Sauvegarder et quitter"
            aria-label="Sauvegarder et quitter"
          >
            <Save size={18} />
          </button>
          {onNotificationSettings && (
            <button 
              className="timer-btn workout-icon-btn notification-btn" 
              onClick={onNotificationSettings}
              title="Paramètres de notification"
              aria-label="Parametres de notification"
            >
              <Bell size={18} />
            </button>
          )}
        </div>
      </div>

      <h2 className="workout-day-title">{day?.title}</h2>
      
      <>
        <ProgressTracker 
          currentExercise={step + 1}
          totalExercises={total}
          currentSet={setNum + 1}
          totalSets={totalSets}
          calories={totalCaloriesBurned}
        />

        {!pause ? (
          <StepSet
            exo={day.exercises[step]}
            exercises={day.exercises}
            step={step}
            setNum={setNum}
            totalSets={totalSets}
            onDone={handleSetComplete}
            onCaloriesBurned={handleCaloriesBurned}
            onExerciseCompleted={handleExerciseCompleted}
            isPaused={pause}
            dayIndex={dayIndex}
            autoMode={autoMode}
          />
        ) : (
          <Pause 
            onEnd={handlePauseEnd} 
            onSkip={handleSkipPause} 
            isExerciseTransition={isExerciseTransition}
            reducedTime={autoMode}
            day={day}
            step={step}
            total={total}
            setNum={setNum}
            totalSets={totalSets}
            autoMode={autoMode}
          />
        )}  

      </>
      
      {workoutCompleted && (
        <EndOfDayModal
          day={day}
          totalCalories={totalCaloriesBurned}
          duration={getElapsedMinutes()}
          onClose={handleCloseEndOfDayModal}
          onSaveWorkout={handleSaveWorkout}
        />
      )}
      
      {/* Boîte de dialogue des paramètres de synthèse vocale */}
      {/* Dialogue de paramètres vocaux supprimé */}

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      >
        <DialogTitle>{dialogConfig.title}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {dialogConfig.message}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={dialogConfig.cancelAction}>
            Annuler
          </Button>
          <Button onClick={dialogConfig.confirmAction} color="primary">
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

function StepSet({ exo, exercises = [], step, setNum, totalSets, onDone, onCaloriesBurned, onExerciseCompleted, isPaused, dayIndex, autoMode }) {
  const [timer, setTimer] = useState(() => {
    if (exo.timer) {
      return exo.duration || 30;
    }
    return null;
  });
  const [running, setRunning] = useState(false);
  const [showCalories, setShowCalories] = useState(false);
  const [caloriesToShow, setCaloriesToShow] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completionAnimation, setCompletionAnimation] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  
  // Limiter les répétitions "max" à 10
  const safeReps = exo.reps && exo.reps.toString().toLowerCase().includes('max') 
    ? 10 
    : (exo.reps || '');
  
  const iconType = iconsMap[exo.name] || 'dumbbell';
  
  // Calories MET-based pondérées par poids utilisateur (CalorieEstimator)
  // Remplace l'ancienne moyenne caloriesPerSet figée pour 80kg
  const caloriesPerSet = getCaloriesForSet(exo);

  const [isPulsing, setIsPulsing] = useState(false);
  const [currentRep, setCurrentRep] = useState(0);
  const [showOverlay, setShowOverlay] = useState(false);
  const [countdown, setCountdown] = useState(null); // null = pas de décompte, sinon 3,2,1
  const timerRef = useRef(null);

  // Nouvelle logique pour déterminer quels exercices utilisent le chronomètre
  // Jour 7 (index 6) OU exercices avec nbRep: 0 OU timer: true
  const isDaySevenCardio = dayIndex === 6; // Jour 7 (cardio & récupération)
  const hasTimerProperty = exo.timer === true;
  const hasZeroReps = exo.nbRep === 0;
  
  // Exercices du jour 7 qui utilisent le chrono
  const day7ChronoExercises = [
    'Vélo',
    'Cardio au choix', 
    'Étirements complets',
    'Mobilité articulaire'
  ];
  
  const isDay7ChronoExercise = isDaySevenCardio && day7ChronoExercises.some(name => 
    exo.name && exo.name.toLowerCase().includes(name.toLowerCase())
  );
  
  // Détecter si l'exercice utilise le chronomètre
  const isChrono = isDay7ChronoExercise || hasTimerProperty || hasZeroReps;

  // Exercices à faire sur chaque membre (nécessitant deux fois le rythme)
  const doubleSidedExercises = [
    'Planche latérale',
    'Mountain climbers lestés',
    'Extensions de hanche',
    'Step-ups'
  ];
  
  // Détecter les exercices "/côté" depuis les données
  const isSidedExercise = exo.sets && (exo.sets.includes('/côté') || exo.sets.includes('/jambe'));
  const isDoubleSided = isSidedExercise || doubleSidedExercises.some(name => 
    exo.name && exo.name.toLowerCase().includes(name.toLowerCase())
  );
  
  const [chrono, setChrono] = useState(0);
  const [chronoRunning, setChronoRunning] = useState(false);
  const [side, setSide] = useState(0); // 0: premier côté, 1: deuxième côté
  const chronoInterval = useRef(null);
  
  // Timer pour exercices avec duration
  const [exerciseTimer, setExerciseTimer] = useState(exo.duration || 0);
  const [timerRunning, setTimerRunning] = useState(false);
  const exerciseTimerRef = useRef(null);
  
  // Détecter si l'exercice a un timer basé sur les nouvelles règles
  const hasTimer = isChrono || exo.sets?.toLowerCase().includes('sec');

  // Remise à zéro des états internes à chaque changement d'exercice ou de série
  useEffect(() => {
    setIsPulsing(false);
    setCurrentRep(0);
    setShowOverlay(false);
    setCountdown(null);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Réinitialiser le timer d'exercice
    setExerciseTimer(exo.duration || 0);
    setTimerRunning(false);
    if (exerciseTimerRef.current) {
      clearInterval(exerciseTimerRef.current);
      exerciseTimerRef.current = null;
    }
    
    // Fonctionnalité d'annonce vocale désactivée
    // Identifiant stable de la série en cours (jour + index d'exercice + série)
    // plutôt que l'objet `exo` ou son nom : on réinitialise dès que l'exercice
    // ou la série change réellement — y compris pour deux exercices homonymes —
    // sans dépendre d'une référence d'objet qui pourrait changer sans raison.
  }, [dayIndex, step, setNum, totalSets]);

  // Timer dégressif pour exercices avec duration spécifique
  useEffect(() => {
    if (exo.duration && timerRunning) {
      exerciseTimerRef.current = setInterval(() => {
        setExerciseTimer(prev => {
          if (prev <= 1) {
            setTimerRunning(false);
            // Sons pour signaler la fin
            playBeep();
            setTimeout(() => playBeep(), 200);
            setTimeout(() => playBeep(), 400);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (exerciseTimerRef.current) {
      clearInterval(exerciseTimerRef.current);
      exerciseTimerRef.current = null;
    }
    return () => {
      if (exerciseTimerRef.current) {
        clearInterval(exerciseTimerRef.current);
        exerciseTimerRef.current = null;
      }
    };
  }, [timerRunning, exo.duration]);

  // Lancer le décompte avant le rythme (désactivé pour les exercices chronométrés)
  const handlePulse = () => {
    if (hasTimer || isChrono) return; // Désactiver le rythme pour les exercices chronométrés
    
    if (!isPulsing && countdown === null) {
      setCountdown(3);
      setShowOverlay(true);
    } else if (isPulsing) {
      setIsPulsing(false);
      setShowOverlay(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  // Décompte 3-2-1 avant le rythme
  useEffect(() => {
    if (countdown === null) return;
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(c => c - 1), 1000);
      playBeep();
      // Annonce vocale désactivée
      return () => clearTimeout(t);
    }
    if (countdown === 0) {
      setCountdown(null);
      setIsPulsing(true);
      setCurrentRep(0);
      // Laisser l'overlay affiché pour le rythme
    }
  }, [countdown]);

  useEffect(() => {
    if (isPulsing) {
      const interval = setInterval(() => {
        setCurrentRep(prev => {
          const newRep = prev + 1;
          if (newRep <= exo.nbRep) {
            playBeep();
            // Annonce vocale désactivée
            return newRep;
          }
          return exo.nbRep;
        });
      }, 2000);

      timerRef.current = interval;
      return () => clearInterval(interval);
    }
  }, [isPulsing, exo.nbRep]);

  useEffect(() => {
    if (currentRep === exo.nbRep && !hasTimer && !isChrono) {
      setShowOverlay(true);
      setIsPulsing(false);
    }
  }, [currentRep, exo.nbRep, hasTimer, isChrono]);

  // Gestion du chrono avec arrêt automatique
  useEffect(() => {
    if (!isChrono) return;
    if (chronoRunning) {
      chronoInterval.current = setInterval(() => {
        setChrono(prev => {
          const newTime = prev + 1;
          
          // Arrêt automatique après 5 minutes (300 secondes) pour la sécurité
          const maxDuration = 300; // 5 minutes maximum
          if (newTime >= maxDuration) {
            setChronoRunning(false);
            // Jouer un son pour indiquer l'arrêt automatique
            playBeep();
            setTimeout(() => playBeep(), 200);
            setTimeout(() => playBeep(), 400);
            return maxDuration;
          }
          
          return newTime;
        });
      }, 1000);
    } else if (chronoInterval.current) {
      clearInterval(chronoInterval.current);
      chronoInterval.current = null;
    }
    return () => {
      if (chronoInterval.current) {
        clearInterval(chronoInterval.current);
        chronoInterval.current = null;
      }
    };
  }, [chronoRunning, isChrono, isDoubleSided]);

  // Remise à zéro du chrono et du côté à chaque nouvel exercice
  // Démarrage automatique du timer si l'exercice en a besoin
  useEffect(() => {
    setChrono(0);
    setSide(0);
    
    // Démarrer automatiquement le timer pour les exercices qui en ont besoin
    if ((hasTimer || isChrono) && !isPaused) {
      // Délai court pour laisser l'interface se charger
      setTimeout(() => {
        setChronoRunning(true);
      }, 500);
    } else {
      setChronoRunning(false);
    }
  }, [exo.name, hasTimer, isChrono, isPaused]);

  // Remise à zéro du timer à chaque changement de côté (pour double sided timer uniquement)
  useEffect(() => {
    if (isDoubleSided && (hasTimer || isChrono)) {
      setChrono(0);
      // Ne pas redémarrer automatiquement ici, laisser l'utilisateur contrôler
    }
  }, [side, isDoubleSided, hasTimer, isChrono]);

  // Nouveau : bouton "Suivant" sur l'overlay OK
  const handleNext = () => {
    const calories = caloriesPerSet;
    setCaloriesToShow(calories);
    setShowCalories(true);
    onCaloriesBurned(calories);
    setTimeout(() => {
      setShowCalories(false);
      onDone();
    }, 2000);
  };
  
  // Ouvrir YouTube pour l'exercice actuel
  const handleYouTube = () => {
    const name = exo.name;
    const searchQuery = encodeURIComponent(`exercice ${name} tutoriel`);
    const searchPageUrl = `https://www.youtube.com/results?search_query=${searchQuery}`;
    
    // Ouvrir dans une popup au lieu d'un nouvel onglet
    const popup = window.open(
      searchPageUrl, 
      'youtube_popup',
      'width=1200,height=800,scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no,status=no'
    );
    
    // Focus sur la popup si elle est bloquée
    if (popup) {
      popup.focus();
    }
  };

  // Nouvelle fonction: Ouvrir la boîte de dialogue de confirmation
  const handleBackConfirmation = () => {
    setOpenConfirmDialog(true);
  };

  // Gérer la fermeture de la boîte de dialogue
  const handleCloseConfirmDialog = () => {
    setOpenConfirmDialog(false);
  };

  // Mode automatique: démarrer automatiquement le rythme si pas de timer/chrono
  useEffect(() => {
    if (autoMode && !hasTimer && !isChrono && !isPaused) {
      // Démarrer automatiquement le rythme après 2 secondes
      const autoStartTimer = setTimeout(() => {
        if (!isPulsing && countdown === null) {
          setCountdown(3);
          setShowOverlay(true);
        }
      }, 2000);
      
      return () => clearTimeout(autoStartTimer);
    }
  }, [autoMode, hasTimer, isChrono, isPaused, isPulsing, countdown]);

  // Mode automatique: terminer automatiquement l'exercice après les répétitions
  useEffect(() => {
    if (autoMode && currentRep === exo.nbRep && !hasTimer && !isChrono) {
      // Attendre 1 seconde puis terminer automatiquement
      const autoFinishTimer = setTimeout(() => {
        const calories = caloriesPerSet;
        onCaloriesBurned(calories);
        onDone();
      }, 1000);
      
      return () => clearTimeout(autoFinishTimer);
    }
  }, [autoMode, currentRep, exo.nbRep, hasTimer, isChrono, caloriesPerSet, onCaloriesBurned, onDone]);

  // Désactivation du mode auto : stopper proprement tout rythme automatique en
  // cours (décompte, pulsation, overlay) au lieu d'en relancer un.
  useEffect(() => {
    if (!autoMode) {
      setCountdown(null);
      setIsPulsing(false);
      setShowOverlay(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [autoMode]);

  return (
    // pb généreux : réserve l'espace occupé par les contrôles flottants fixes
    // (bottom: 30px) pour que la ligne de répétitions ne passe pas dessous.
    <Box
      className="exercise-detail-wrapper"
      sx={{
        p: 2,
        pb: 'calc(170px + env(safe-area-inset-bottom, 0px))',
        // Élargir la fiche sur tablette/desktop (cf. .day-content élargi en CSS)
        width: '100%',
        maxWidth: { xs: '100%', md: 760, lg: 860 },
        mx: 'auto'
      }}
    >
      <Paper
        elevation={3}
        className="exercise-detail-card"
        sx={{
          p: { xs: 3, md: 5 },
          mb: 2,
          position: 'relative',
          minHeight: 300,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        {/* Overlay OK désactivé pour les exercices chrono.
            En mode auto, l'overlay devient transparent et non bloquant pour
            ne pas masquer les instructions de l'exercice : seul le compteur de
            répétitions reste visible dans une pastille en haut de la carte. */}
        {showOverlay && !hasTimer && !isChrono && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: autoMode ? 'transparent' : 'rgba(0, 0, 0, 0.8)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: autoMode ? 'flex-start' : 'center',
              pointerEvents: autoMode ? 'none' : 'auto',
              p: autoMode ? 2 : 0,
              color: 'white',
              zIndex: 1
            }}
          >
            {countdown !== null ? (
              <Typography
                variant="h3"
                component="div"
                sx={{
                  mb: 2,
                  ...(autoMode && {
                    px: 3,
                    py: 1,
                    borderRadius: '100px',
                    backgroundColor: 'rgba(0, 0, 0, 0.72)',
                    backdropFilter: 'blur(8px)',
                    fontSize: '2rem'
                  })
                }}
              >
                {countdown > 0 ? countdown : "Go!"}
              </Typography>
            ) : currentRep < exo.nbRep ? (
              <Typography
                variant="h4"
                component="div"
                sx={{
                  mb: 2,
                  ...(autoMode && {
                    px: 3,
                    py: 1,
                    borderRadius: '100px',
                    backgroundColor: 'rgba(0, 0, 0, 0.72)',
                    backdropFilter: 'blur(8px)',
                    fontSize: '1.5rem'
                  })
                }}
              >
                Répétition {currentRep + 1} / {exo.nbRep}
              </Typography>
            ) : (
              <>
                <Typography variant="h4" component="div" sx={{ mb: 2, color: '#4CAF50' }}>
                  OK !
                </Typography>
                {isDoubleSided ? (
                  <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column', alignItems: 'center' }}>
                    <Typography variant="body1" sx={{ mb: 1, fontWeight: 600 }}>
                      Côté {side + 1} sur 2 terminé
                    </Typography>
                    {side === 0 ? (
                      <Button 
                        variant="contained" 
                        color="info"
                        onClick={() => {
                          setShowOverlay(false);
                          setSide(1);
                          setCurrentRep(0);
                          setIsPulsing(false);
                        }}
                        sx={{ minWidth: 200 }}
                      >
                        Passer au second côté
                      </Button>
                    ) : (
                      <Button 
                        variant="contained" 
                        color="success"
                        onClick={handleNext}
                        sx={{ minWidth: 200 }}
                      >
                        Terminer l'exercice
                      </Button>
                    )}
                  </Box>
                ) : (
                  <Button 
                    variant="contained" 
                    color="primary"
                    onClick={handleNext}
                    sx={{
                      mt: 2,
                      minWidth: 200,
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    Suivant
                  </Button>
                )}
              </>
            )}
          </Box>
        )}
        <Box
          className="exercise-illustration"
          sx={{
            width: '100%',
            // Illustration réduite pour que les instructions ne passent pas sous les contrôles fixes.
            maxWidth: { xs: 200, md: 260, lg: 300 },
            aspectRatio: '1/1',
            borderRadius: '16px',
            overflow: 'hidden',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            background: 'var(--illustration-surface, #101013)',
            mb: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.45)',
            position: 'relative'
          }}
        >
          <img
            src={getAssetPath(`/illustrations/${getExerciseIllustration(iconType, exo.name)}`)}
            alt={exo.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </Box>
        
        <Typography 
          variant="h6" 
          className="exercise-name"
          sx={{ 
            fontWeight: 'bold',
            color: 'text.primary',
            fontFamily: 'Inter, sans-serif',
            fontSize: '1.4rem'
          }}
        >
          {exo.name}
        </Typography>
        {/* Affichage du poids réel soulevé */}
        {calculateWeight(exo.equipment) > 0 && (
          <Typography variant="subtitle1" sx={{ color: '#F03D32', fontWeight: 'bold', mb: 2 }}>
            Poids cible : {calculateWeight(exo.equipment)} kg
          </Typography>
        )}
        
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center', mb: 2 }}>
          {exo.equip && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, background: 'rgba(255, 255, 255, 0.05)', px: 1.5, py: 0.5, borderRadius: '100px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <Dumbbell size={14} color="#a1a1aa" />
              <Typography variant="caption" sx={{ color: '#a1a1aa', fontWeight: 600 }}>{exo.equip}</Typography>
            </Box>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, background: 'rgba(240, 61, 50, 0.1)', px: 1.5, py: 0.5, borderRadius: '100px', border: '1px solid rgba(240, 61, 50, 0.3)' }}>
            <Repeat size={14} color="#F03D32" />
            <Typography variant="caption" sx={{ color: '#F03D32', fontWeight: 600 }}>Série {setNum + 1} / {totalSets}</Typography>
          </Box>
        </Box>
        
        <Typography 
          variant="body2" 
          color="text.primary"
          sx={{ 
            fontSize: '1rem',
            fontWeight: 400,
            color: '#888',
            mb: 2,
            textAlign: 'center',
            maxWidth: '90%'
          }}
        >
          {exo.desc}
        </Typography>
        
        {/* Timer spécial pour exercices avec duration fixe */}
        {exo.duration && !isChrono ? (
          <Box sx={{ mt: 2, mb: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold', mb: 1 }}>
              Timer - {Math.floor(exo.duration / 60)}:{(exo.duration % 60).toString().padStart(2, '0')}
            </Typography>
            <Typography variant="h3" sx={{ 
              mb: 2, 
              fontFamily: 'monospace', 
              letterSpacing: 2,
              color: exerciseTimer <= 10 ? '#FF5252' : (timerRunning ? 'success.main' : 'text.primary')
            }}>
              {Math.floor(exerciseTimer / 60).toString().padStart(2, '0')}:{(exerciseTimer % 60).toString().padStart(2, '0')}
            </Typography>
            {exerciseTimer <= 10 && exerciseTimer > 0 && (
              <Typography variant="body2" sx={{ mb: 1, color: '#FF5252', fontWeight: 'bold' }}>
                ⚠️ Plus que {exerciseTimer} secondes !
              </Typography>
            )}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <button 
                className={timerRunning ? 'btn-timer-outline' : 'btn-timer-primary'} 
                onClick={() => setTimerRunning(r => !r)}
              >
                {timerRunning ? 'Pause' : (exerciseTimer === exo.duration ? 'Démarrer' : 'Reprendre')}
              </button>
              <button 
                className="btn-timer-secondary" 
                onClick={() => { setExerciseTimer(exo.duration); setTimerRunning(false); }} 
                disabled={exerciseTimer === exo.duration}
              >
                Réinitialiser
              </button>
              <button 
                className="btn-timer-success" 
                onClick={() => { setTimerRunning(false); onDone(); }}
              >
                Terminer
              </button>
            </Box>
          </Box>
        ) : 
        /* Bloc chrono pour exercices spéciaux et exercices en secondes */
        (isChrono || hasTimer) && !isDoubleSided ? (
          <Box sx={{ mt: 2, mb: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold', mb: 1 }}>
              Chronomètre
            </Typography>
            <Typography variant="h3" sx={{ 
              mb: 2, 
              fontFamily: 'monospace', 
              letterSpacing: 2,
              color: chrono >= 300 ? '#FF5252' : 'inherit' // Rouge quand durée maximale atteinte
            }}>
              {Math.floor(chrono / 60).toString().padStart(2, '0')}:{(chrono % 60).toString().padStart(2, '0')}
            </Typography>
            {chrono >= 300 && (
              <Typography variant="body2" sx={{ mb: 1, color: '#FF5252', fontWeight: 'bold' }}>
                ⚠️ Durée maximale atteinte (5 min)
              </Typography>
            )}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <button 
                className={chronoRunning ? 'btn-timer-outline' : 'btn-timer-primary'} 
                onClick={() => setChronoRunning(r => !r)}
              >
                {chronoRunning ? 'Pause' : (chrono === 0 ? 'Démarrer' : 'Reprendre')}
              </button>
              <button 
                className="btn-timer-secondary" 
                onClick={() => { setChrono(0); setChronoRunning(false); }} 
                disabled={chrono === 0}
              >
                Réinitialiser
              </button>
              <button 
                className="btn-timer-success" 
                onClick={() => { setChronoRunning(false); onDone(); }}
              >
                Terminer
              </button>
            </Box>
          </Box>
        ) : (isChrono || hasTimer) && isDoubleSided ? (
          /* Bloc chrono spécial pour exercices à deux côtés comme la planche latérale */
          <Box sx={{ mt: 2, mb: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold', mb: 1 }}>
              Chronomètre - {side === 0 ? 'Côté Gauche' : 'Côté Droit'}
            </Typography>
            <Typography variant="h3" sx={{ 
              mb: 2, 
              fontFamily: 'monospace', 
              letterSpacing: 2, 
              color: chrono >= 300 ? '#FF5252' : (side === 0 ? 'primary.main' : 'success.main')
            }}>
              {Math.floor(chrono / 60).toString().padStart(2, '0')}:{(chrono % 60).toString().padStart(2, '0')}
            </Typography>
            {chrono >= 300 && (
              <Typography variant="body2" sx={{ mb: 1, color: '#FF5252', fontWeight: 'bold' }}>
                ⚠️ Durée maximale atteinte (5 min)
              </Typography>
            )}
            <Typography variant="body1" sx={{ mb: 2, fontWeight: 'bold' }}>
              Côté {side + 1} sur 2
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
              <button 
                className={chronoRunning ? 'btn-timer-outline' : 'btn-timer-primary'} 
                onClick={() => setChronoRunning(r => !r)}
              >
                {chronoRunning ? 'Pause' : (chrono === 0 ? 'Démarrer' : 'Reprendre')}
              </button>
              <button 
                className="btn-timer-secondary" 
                onClick={() => { setChrono(0); setChronoRunning(false); }} 
                disabled={chrono === 0}
              >
                Réinitialiser
              </button>
              {side === 0 ? (
                <button 
                  className="btn-timer-primary" 
                  style={{ background: '#3b82f6', boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)' }}
                  onClick={() => { 
                    setChronoRunning(false); 
                    setSide(1); 
                    setChrono(0); 
                    setTimeout(() => setChronoRunning(true), 1000);
                  }} 
                >
                  Côté Suivant
                </button>
              ) : (
                <button 
                  className="btn-timer-success" 
                  onClick={() => { 
                    setChronoRunning(false); 
                    onDone(); 
                  }} 
                >
                  Terminer
                </button>
              )}
            </Box>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, background: 'rgba(255, 255, 255, 0.05)', px: 2, py: 1, borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <RotateCcw size={18} color="#a1a1aa" />
              <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600 }}>{exo.nbRep} Reps</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, background: 'rgba(255, 255, 255, 0.05)', px: 2, py: 1, borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <Timer size={18} color="#a1a1aa" />
              <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600 }}>{exo.sets}</Typography>
            </Box>
          </Box>
        )}
        {/* Boutons flottants pour toutes les actions */}
        <FloatingButtons
          exercises={exercises}
          currentStep={step}
          onYouTube={handleYouTube}
          onToggleRhythm={!hasTimer && !isChrono ? handlePulse : null} // Masquer le rythme pour les exercices avec timer
          onNext={() => {
            // Vérifie si l'overlay n'est pas déjà affiché pour éviter de compléter deux fois
            if (!showOverlay) {
              const calories = caloriesPerSet;
              setCaloriesToShow(calories);
              setShowCalories(true);
              onCaloriesBurned(calories);
              setTimeout(() => {
                setShowCalories(false);
                onDone();
              }, 1000);
            }
          }}
          onBack={handleBackConfirmation}
          isRhythmActive={isPulsing || countdown !== null}
          exerciseName={exo.name}
        />

        {/* Boîte de dialogue de confirmation pour le retour au menu */}
        <Dialog
          open={openConfirmDialog}
          onClose={handleCloseConfirmDialog}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">
            {"Quitter l'entraînement ?"}
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Êtes-vous sûr de vouloir quitter cet entraînement ? Votre progression ne sera pas enregistrée.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseConfirmDialog} color="primary">
              Annuler
            </Button>
            <Button 
              onClick={() => {
                handleCloseConfirmDialog();
                window.location.href = '/';
              }} 
              color="primary" 
              autoFocus
            >
              Quitter
            </Button>
          </DialogActions>
        </Dialog>

        {showCalories && (
          <Box
            sx={{
              position: 'fixed',
              bottom: 20,
              left: 20, // Changé de right à left
              transition: 'all 0.3s ease',
              opacity: 1,
              transform: 'translateY(0)',
              animation: 'fadeInOut 2s ease-in-out',
            }}
          >
            <Paper
              elevation={3}
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: 'success.main',
                color: 'white',
              }}
            >
              <Typography variant="h6">
                +{caloriesToShow} calories !
              </Typography>
            </Paper>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
