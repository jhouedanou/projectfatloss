// Correction des bugs liés à pause/isPaused - v1.0.1
import React, { useState, useEffect, useRef, createContext, useCallback } from 'react';
import { Box, Typography, Paper, Button, FormControlLabel, Switch, IconButton, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { ArrowLeft, Rocket, Save, Flame, Dumbbell, Repeat, Timer, Play, Pause as PauseIconLucide, RotateCcw, Check, MonitorPlay, Bell } from 'lucide-react';
const beepSound = '/beep.mp3';
import YouTubeButton from '../components/YouTubeButton';
import ExoIcon from '../components/ExoIcon';
import FloatingButtons from '../components/FloatingButtons/FloatingButtons';
import ProgressTracker from '../components/ProgressTracker';
import SpeechSettingsDialog from '../components/SpeechSettingsDialog';
import DayPills from '../components/DayPills';
import { getWorkoutPlan } from '../services/WorkoutCustomization';
import { initSpeechService, announceExercise, announcePause, announceCount, announceRepetition, announceWorkoutComplete, setEnabled as setSpeechEnabled } from '../services/SpeechService';
import { saveWorkout } from '../services/WorkoutStorage';
import notificationService from '../services/NotificationService';
import { useTranslation } from 'react-i18next';
import YouTube from 'react-youtube';
import { getExerciseIconsPath, getAssetPath } from '../utils/paths';
import GoogleFitService from '../services/GoogleFitService';

import '../components/SpeechSettings.css';
import './StepWorkout.css';

// Fonction utilitaire simple pour formater le temps
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const PAUSE_DURATION_SECONDS = 10;

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

// Créer un contexte audio unique pour toute l'application
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

function playBeep() {
  try {
    // Créer un oscillateur pour générer le son
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    // Connecter les nœuds
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Configurer le son
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    
    // Jouer le son
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.1);
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
  const defaultTime = PAUSE_DURATION_SECONDS;
  
  const [time, setTime] = useState(defaultTime);
  
  const currentExercise = day.exercises[step];
  const nextExercise = step < total - 1 ? day.exercises[step + 1] : null;
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
  }, [onEnd]); // Retirer 'time' des dépendances pour éviter le redémarrage

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


function EndOfDayModal({ day, totalCalories, onClose, onSaveWorkout }) {
  const [isLoadingFit, setIsLoadingFit] = useState(false);
  const [isSynced, setIsSynced] = useState(false);

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
        name: `Project Fat Loss - ${day.title}`,
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
      alert('Erreur lors de la synchronisation avec Google Fit. Assurez-vous d\'avoir configuré votre Client ID dans GoogleFitService.js.');
    } finally {
      setIsLoadingFit(false);
    }
  };

  const handleSave = async () => {
    const workoutData = {
      title: day.title,
      date: new Date().toISOString(),
      calories: totalCalories,
      weightLifted: totalWeightLifted,
      exerciseCount: day.exercises.length,
      exercises: day.exercises.map(exercise => ({
        name: exercise.name,
        sets: parseSets(exercise.sets),
        weightLifted: calculateWeight(exercise.equip)
      })),
      duration: day.exercises.length * 180 // Estimation de la durée : 3 minutes par exercice
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
      <div className="modal-content" style={{ background: '#111', border: '1px solid #333' }}>
        <h2>Félicitations !</h2>
        <div className="completion-icon" style={{ background: 'transparent', boxShadow: 'none' }}><Flame size={64} color="#F03D32" /></div>
        <h3>Séance terminée : {day.title}</h3>
        <p className="calorie-total">Vous avez brûlé <span>{totalCalories}</span> calories !</p>
        <p className="weight-total">Poids total soulevé : <span>{totalWeightLifted} kg</span></p>
        <p className="motivation-text">Excellent travail ! Continuez ainsi pour atteindre vos objectifs.</p>
        
        <div style={{ margin: '20px 0', width: '100%' }}>
          <button 
            onClick={handleGoogleFitSync}
            disabled={isLoadingFit || isSynced}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              background: isSynced ? 'rgba(76, 175, 80, 0.2)' : 'linear-gradient(135deg, #4285F4, #34A853)',
              color: isSynced ? '#4CAF50' : 'white',
              fontSize: '0.95rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              cursor: isSynced ? 'default' : 'pointer',
              boxShadow: isSynced ? 'none' : '0 4px 12px rgba(66, 133, 244, 0.25)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              if (!isLoadingFit && !isSynced) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(66, 133, 244, 0.35)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isSynced) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(66, 133, 244, 0.25)';
              }
            }}
          >
            <img 
              src="https://www.gstatic.com/images/branding/product/1x/gfit_512dp.png" 
              alt="Google Fit" 
              style={{ width: '22px', height: '22px', objectFit: 'contain' }}
            />
            {isLoadingFit ? 'Synchronisation...' : isSynced ? 'Synchronisé avec Google Fit' : 'Synchroniser avec Google Fit'}
          </button>
        </div>

        <div className="modal-actions">
          <button className="timer-btn save-btn" onClick={handleSave}>Enregistrer</button>
          <button className="timer-btn close-btn" onClick={onClose}>Fermer</button>
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
  const isFirstRender = useRef(true);
  let beepTimeouts = [];
  
  const workoutPlan = getWorkoutPlan();
  const day = workoutPlan?.[dayIndex];
  const total = day?.exercises?.length || 0;
  const exo = day?.exercises?.[step];
  
  // Utiliser totalSets de l'exercice en priorité, sinon calculer
  const baseTotalSets = exo?.totalSets ?? parseSets(exo?.sets || '1');
  
  // En mode automatique, conserver le nombre original de sets
  // mais utiliser les vraies valeurs de nbRep du data.js
  const totalSets = exo ? baseTotalSets : 1;

  // Ajout d'une vérification pour éviter le crash si les données ne sont pas prêtes
  if (!workoutPlan || !day || !exo) {
    return (
      <div style={{textAlign: 'center', marginTop: 40}}>
        <h2>Chargement...</h2>
        <p>Veuillez patienter.</p>
      </div>
    );
  }

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
  },[dayIndex]);
  
  // Annoncer l'exercice uniquement au début de chaque nouvel exercice
  const prevStepRef = useRef(step);
  
  useEffect(() => {
    // Vérifier si c'est un nouvel exercice
    const isNewExercise = prevStepRef.current !== step;
    
    if (isNewExercise && exo && !isFirstRender.current && !pause) {
      // Annoncer uniquement au début du premier exercice de la série
      if (setNum === 0) {
        announceExercise(exo, setNum, totalSets, pause);
      }
    }
    
    // Mettre à jour la référence
    prevStepRef.current = step;
  }, [exo, step, setNum, totalSets, pause]);
  
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
    const nextExercise = step < total - 1 ? day.exercises[step + 1] : null;

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
            title: day.title,
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
            fatBurnerMode: autoMode
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
    // L'entraînement se lance automatiquement
  };

  // Si on veut afficher le pre-workout, on l'affiche en premier
  if (showPreWorkout) {
    return (
      <PreWorkout 
        onStartWorkout={handleStartWorkout}
        onClose={() => setShowPreWorkout(false)}
      />
    );
  }

  // Gestion des notifications d'exercice en cours
  useEffect(() => {
    if (exo && !pause && !workoutCompleted) {
      // Afficher/mettre à jour la notification avec l'exercice en cours
      const exerciseData = {
        name: exo.name,
        currentSet: setNum + 1,
        totalSets: totalSets,
        dayTitle: day.title,
        currentExercise: step + 1,
        totalExercises: total,
        autoMode: autoMode
      };
      
      notificationService.updateCurrentExercise(exerciseData);
    }
  }, [exo, setNum, totalSets, day.title, step, total, autoMode, pause, workoutCompleted]);

  // Gestion des notifications d'exercice en cours avec plus de données
  useEffect(() => {
    if (exo && !pause && !workoutCompleted) {
      // Déterminer le type d'exercice pour les notifications
      let exerciseType = 'reps';
      let remainingTime = null;
      
      // Simplifier - utiliser des valeurs par défaut pour les variables inaccessibles
      // Les variables exerciseTimer, chrono, isChrono, hasTimer sont dans StepSet, pas ici
      
      // Afficher/mettre à jour la notification avec l'exercice en cours
      const exerciseData = {
        name: exo.name,
        currentSet: setNum + 1,
        totalSets: totalSets,
        dayTitle: day.title,
        currentExercise: step + 1,
        totalExercises: total,
        autoMode: autoMode,
        // Données simplifiées pour éviter les erreurs de portée
        exerciseType: exo.timer ? 'timer' : 'reps',
        remainingTime: exo.duration || null,
        currentRep: 0, // Valeur par défaut
        totalReps: exo.nbRep || 0,
        isPaused: pause,
        calories: totalCaloriesBurned,
        progress: 0 // Progression par défaut
      };
      
      notificationService.updateCurrentExercise(exerciseData);
    }
  }, [exo, setNum, totalSets, day.title, step, total, autoMode, pause, workoutCompleted, totalCaloriesBurned]);

  // Gestion des notifications de pause avec timer
  useEffect(() => {
    if (pause && !workoutCompleted) {
      const pauseData = {
        remainingTime: PAUSE_DURATION_SECONDS,
        nextExercise: step < total - 1 ? day.exercises[step + 1] : null,
        currentSet: setNum + 1,
        totalSets: totalSets,
        autoMode: autoMode
      };
      
      notificationService.showPauseNotification(pauseData);
    }
  }, [pause, workoutCompleted, autoMode, step, total, day.exercises, setNum, totalSets]);
  
  return (
    <div 
      className="day-content" 
      style={{
        paddingTop: 'env(safe-area-inset-top, 20px)',
        paddingBottom: 'env(safe-area-inset-bottom, 20px)',
        minHeight: '100vh',
      }}
    >
      <div className="action-buttons" style={{ position: 'sticky', top: 0, zIndex: 1000, backgroundColor: 'transparent', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backdropFilter: 'blur(15px)', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img 
            src={getAssetPath('/logo.png')} 
            alt="PFL Logo" 
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '9px',
              objectFit: 'cover',
              border: '1px solid rgba(240, 61, 50, 0.25)'
            }}
          />
          <button 
            className="timer-btn" 
            onClick={handleBackClick}
            title="Retour"
            style={{ background: 'rgba(255, 255, 255, 0.08)', color: '#fff', border: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '10px', padding: 0, cursor: 'pointer', transition: 'all 0.2s' }}
          >
            <ArrowLeft size={18} />
          </button>
        </div>
        
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button 
            className={`timer-btn ${autoMode ? 'active' : ''}`} 
            onClick={handleToggleAutoMode}
            title={autoMode ? "Désactiver le mode automatique" : "Activer le mode automatique"}
            style={{ 
              background: autoMode ? 'rgba(240, 61, 50, 0.15)' : 'rgba(255, 255, 255, 0.08)',
              color: autoMode ? '#F03D32' : '#fff',
              border: autoMode ? '1px solid rgba(240, 61, 50, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '10px', padding: 0, cursor: 'pointer', transition: 'all 0.2s'
            }}
          >
            <Rocket size={18} />
          </button>
          <button 
            className="timer-btn save-btn" 
            onClick={handleSaveAndExit}
            title="Sauvegarder et quitter"
            style={{ background: 'rgba(255, 255, 255, 0.08)', color: '#fff', border: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '10px', padding: 0, cursor: 'pointer', transition: 'all 0.2s' }}
          >
            <Save size={18} />
          </button>
          {onNotificationSettings && (
            <button 
              className="timer-btn notification-btn" 
              onClick={onNotificationSettings}
              title="Paramètres de notification"
              style={{ background: 'rgba(255, 255, 255, 0.08)', color: '#fff', border: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '10px', padding: 0, cursor: 'pointer', transition: 'all 0.2s' }}
            >
              <Bell size={18} />
            </button>
          )}
        </div>
      </div>

      <h2 style={{fontSize:'1.1rem',marginBottom:8}}> {day.title}</h2>
      
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

function StepSet({ exo, setNum, totalSets, onDone, onCaloriesBurned, onExerciseCompleted, isPaused, dayIndex, autoMode }) {
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
  
  // Calculer les calories pour la série avec une valeur par défaut sécurisée
  const caloriesPerSet = exo.caloriesPerSet ? 
    Math.round((exo.caloriesPerSet[0] + exo.caloriesPerSet[1]) / 2) : 10;

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
  }, [exo, setNum, totalSets]);

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

  return (
    <Box sx={{ p: 2 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 3, 
          mb: 2, 
          position: 'relative',
          minHeight: 300,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        {/* Overlay OK désactivé pour les exercices chrono */}
        {showOverlay && !hasTimer && !isChrono && (
          <Box 
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              zIndex: 1
            }}
          >
            {countdown !== null ? (
              <Typography variant="h3" component="div" sx={{ mb: 2 }}>
                {countdown > 0 ? countdown : "Go!"}
              </Typography>
            ) : currentRep < exo.nbRep ? (
              <Typography variant="h4" component="div" sx={{ mb: 2 }}>
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
        <div style={{ 
          width: '100%', 
          maxWidth: '280px', 
          aspectRatio: '1/1', 
          borderRadius: '16px', 
          overflow: 'hidden', 
          border: '1px solid rgba(255, 255, 255, 0.08)', 
          background: '#070707', 
          marginBottom: '20px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.45)',
          position: 'relative'
        }}>
          <img 
            src={getAssetPath(`/illustrations/${getExerciseIllustration(iconType, exo.name)}`)} 
            alt={exo.name} 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          />
        </div>
        
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
