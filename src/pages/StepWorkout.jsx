// Correction des bugs liés à pause/isPaused - v1.0.1
import React, { useState, useEffect, useRef, createContext } from 'react';
import { Box, Typography, Paper, Button, FormControlLabel, Switch, IconButton, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import SettingsIcon from '@mui/icons-material/Settings';
import beepSound from '../../public/beep.mp3';
import YouTubeButton from '../components/YouTubeButton';
import ExoIcon from '../components/ExoIcon';
import FloatingButtons from '../components/FloatingButtons/FloatingButtons';
import ProgressTracker from '../components/ProgressTracker';
import SpeechSettingsDialog from '../components/SpeechSettingsDialog';
import DayPills from '../components/DayPills';
import { getWorkoutPlan } from '../services/WorkoutCustomization';
import { initSpeechService, announceExercise, announcePause, announceCount, announceRepetition, announceWorkoutComplete, setEnabled as setSpeechEnabled } from '../services/SpeechService';
import { saveWorkout } from '../services/WorkoutStorage';

import '../components/SpeechSettings.css';
import './StepWorkout.css';
import iconsMap from '../../public/exo-icons.json';

// Créer un contexte pour partager le mode automatique entre composants
const WorkoutContext = createContext({
  autoMode: false,
});

function playBeep() {
  const beep = new Audio(beepSound);
  beep.volume = 1.0;
  beep.play().catch(err => console.error("Erreur de lecture audio:", err));
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
  const defaultTime = reducedTime ? 10 : 15;
  const [time, setTime] = useState(defaultTime);
  const currentExercise = day.exercises[step];
  const nextExercise = step < total - 1 ? day.exercises[step + 1] : null;
  const isLastSet = setNum === totalSets - 1;
  
  // Synthèse vocale réactivée uniquement pour les exercices
  // Aucune annonce vocale pendant la pause
  
  useEffect(() => {
    // Si mode automatique activé, réduire le temps de pause de moitié
    if (autoMode && time === defaultTime) {
      setTime(Math.ceil(defaultTime / 2));
    }
    
    const timer = setInterval(() => {
      setTime((prevTime) => {
        // Bip seulement dans les 4 dernières secondes (pas au début)
        if (prevTime <= 4 && prevTime > 1) {
          playBeep();
        }
        
        if (prevTime === 1) {
          clearInterval(timer);
          onEnd();
          // Fonctionnalité d'annonce vocale désactivée pour les pauses
        }
        return prevTime - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [time, onEnd, nextExercise, isLastSet]);

  return (
    <div className="pause-screen">
      <div className="pause-header">
        <h2 className="pause-title">Pause {reducedTime && "Rapide"}</h2>
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
      
      {/* Afficher le bouton pour passer la pause */}
      <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
        <button 
          onClick={onSkip}
          style={{
            padding: '10px 20px',
            backgroundColor: 'var(--button-bg)',
            color: 'white',
            border: 'none',
            borderRadius: '20px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: 500,
            transition: 'background-color 0.2s, transform 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--button-active)'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--button-bg)'}
        >
          Passer la pause
        </button>
      </div>
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

function FloatingCalorieCounter({ calories, exerciseCompleted }) {
  const [pulse, setPulse] = useState(false);
  
  useEffect(() => {
    if (calories > 0) {
      setPulse(true);
      const timer = setTimeout(() => setPulse(false), 500);
      return () => clearTimeout(timer);
    }
  }, [calories]);
  
  return (
    <div className={`floating-calories ${exerciseCompleted ? 'completed' : ''} ${pulse ? 'pulse' : ''}`}>
      <p className="floating-calories-value">{calories}</p>
      <p className="floating-calories-label">CALORIES</p>
    </div>
  );
}

function EndOfDayModal({ day, totalCalories, onClose, onSaveWorkout }) {
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
      <div className="modal-content">
        <h2>Félicitations !</h2>
        <div className="completion-icon">🔥</div>
        <h3>Séance terminée : {day.title}</h3>
        <p className="calorie-total">Vous avez brûlé <span>{totalCalories}</span> calories !</p>
        <p className="weight-total">Poids total soulevé : <span>{totalWeightLifted} kg</span></p>
        <p className="motivation-text">Excellent travail ! Continuez ainsi pour atteindre vos objectifs.</p>
        
        <div className="modal-actions">
          <button className="timer-btn save-btn" onClick={handleSave}>Enregistrer</button>
          <button className="timer-btn close-btn" onClick={onClose}>Fermer</button>
        </div>
      </div>
    </div>
  );
}

export default function StepWorkout({ dayIndex: initialDayIndex, onBack, onComplete }) {
  const [dayIndex, setDayIndex] = useState(initialDayIndex || 0);
  const [step, setStep] = useState(0);
  const [pause, setPause] = useState(false);
  const [isExerciseTransition, setIsExerciseTransition] = useState(false);
  const [setNum, setSetNum] = useState(0);
  const [totalCaloriesBurned, setTotalCaloriesBurned] = useState(0);
  const [exerciseCompleted, setExerciseCompleted] = useState(false);
  const [workoutCompleted, setWorkoutCompleted] = useState(false);
  const [autoMode, setAutoMode] = useState(false); // Mode automatique pour les pauses
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
  const totalSets = exo
    ? (autoMode 
        ? Math.max(1, Math.floor(parseSets(exo.sets) / 2))
        : parseSets(exo.sets))
    : 1;

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
  
  const handlePauseEnd = () => {
    setPause(false);
    setIsExerciseTransition(false);
  };
  
  const handleSkipPause = () => {
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
        // Passer à l'exercice suivant
        setStep(step + 1);
        setSetNum(0); // Réinitialiser le numéro de série
        setPause(true);
        setIsExerciseTransition(true);
      }
    } else {
      // Passer à la série suivante
      setSetNum(setNum + 1);
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

  const handleBackClick = () => {
    showConfirmDialog(
      "Quitter l'entraînement ?",
      "Voulez-vous vraiment quitter ? Votre progression sera perdue.",
      () => onBack(),
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

  return (
    <div 
      className="day-content" 
      style={{
        paddingTop: 'env(safe-area-inset-top, 20px)',
        paddingBottom: 'env(safe-area-inset-bottom, 20px)',
        minHeight: '100vh',
      }}
    >
      <div className="action-buttons" style={{ position: 'sticky', top: 0, zIndex: 1000, backgroundColor:'#2e2e3f' }}>
        <button className="timer-btn" onClick={handleBackClick}>Retour</button>
        <button className="timer-btn save-btn" onClick={handleSaveAndExit}>
          Sauvegarder et quitter
        </button>
      </div>

      <h2 style={{fontSize:'1.1rem',marginBottom:8}}>{day.title}</h2>
      
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
            totalSets={day.exercises[step]?.sets || 1}
            onDone={handleSetComplete}
            onCaloriesBurned={handleCaloriesBurned}
            onExerciseCompleted={handleExerciseCompleted}
            isPaused={pause}
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
        
        <Box
          sx={{
            position: 'fixed',
            top: 50,
            left: 20, // Changé de right à left
            zIndex: 1000
          }}
        >
          <FloatingCalorieCounter 
            calories={totalCaloriesBurned} 
            exerciseCompleted={exerciseCompleted} 
          />
        </Box>
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

function StepSet({ exo, setNum, totalSets, onDone, onCaloriesBurned, onExerciseCompleted, isPaused }) {
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

  // Liste des exercices chrono (nom normalisé)
  const chronoExercises = [
    'Planche latérale',
    'Planche lestée',
    'Cardio au choix',
    'Étirements complets',
    'Mobilité articulaire',
    'Vélo',
    'Vélo d\'appartement',
    'Vélo elliptique',
    'Cardio',
    'Cardio (30-45 min à intensité modérée)',
    'Mountain climbers lestés',
    'Extensions de hanche',
    'Step-ups',
    'Fentes avant alternées',
    'Squats bulgares',
    'Dead bug',
  ];

  // Exercices à faire sur chaque membre (nécessitant deux fois le rythme)
  const doubleSidedExercises = [
    'Planche latérale',
    'Mountain climbers lestés',
    'Extensions de hanche',
    'Step-ups',
    'Fentes avant alternées',
    'Squats bulgares',
    'Dead bug',
  ];
  
  const isDoubleSided = doubleSidedExercises.some(name => exo.name && exo.name.toLowerCase().includes(name.toLowerCase()));
  const isChrono = chronoExercises.some(name => exo.name && exo.name.toLowerCase().includes(name.toLowerCase()));
  const [chrono, setChrono] = useState(0);
  const [chronoRunning, setChronoRunning] = useState(false);
  const [side, setSide] = useState(0); // 0: premier côté, 1: deuxième côté
  const chronoInterval = useRef(null);
  
  // Détecter si l'exercice a un timer
  const hasTimer = exo.timer || exo.sets?.toLowerCase().includes('sec') || exo.name?.toLowerCase().includes('planche');

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
    
    // Fonctionnalité d'annonce vocale désactivée
  }, [exo, setNum, totalSets]);

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
        <ExoIcon type={iconType} size={48} />
        
        <Typography 
          variant="h6" 
          className="exercise-name"
          sx={{ 
            fontWeight: 'bold',
            color: 'text.primary',
          }}
        >
          {exo.name}
        </Typography>
        {/* Affichage du poids réel soulevé */}
        {calculateWeight(exo.equipment) > 0 && (
          <Typography variant="subtitle1" color="primary" sx={{ fontWeight: 'bold', mb: 1 }}>
            Poids soulevé : {calculateWeight(exo.equipment)} kg
          </Typography>
        )}
        
        <Typography variant="body1" color="text.secondary">
          Matériel : <span style={{ color: 'white', fontWeight: 'bold', backgroundColor: '#455A64', padding: '2px 6px', borderRadius: '4px' }}>{exo.equip}</span>
        </Typography>
        
        <Typography variant="body1" color="text.secondary">
          Série <span style={{ color: 'white', fontWeight: 'bold', backgroundColor: '#3949AB', padding: '2px 6px', borderRadius: '4px' }}>{setNum + 1}</span> / {totalSets}
        </Typography>
        
        <Typography 
          variant="body2" 
          color="text.primary"
          sx={{ 
            fontSize: '1.1rem',
            fontWeight: 500,
            opacity: theme => theme.palette.mode === 'dark' ? 1 : 0.87,
            mb: 2
          }}
        >
          {exo.desc}
        </Typography>
        
        {/* Bloc chrono pour exercices spéciaux et exercices en secondes */}
        {(isChrono || hasTimer) && !isDoubleSided ? (
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
              <Button variant={chronoRunning ? 'outlined' : 'contained'} color="primary" onClick={() => setChronoRunning(r => !r)}>
                {chronoRunning ? 'Pause' : (chrono === 0 ? 'Démarrer' : 'Reprendre')}
              </Button>
              <Button variant="outlined" color="secondary" onClick={() => { setChrono(0); setChronoRunning(false); }} disabled={chrono === 0}>
                Réinitialiser
              </Button>
              <Button variant="contained" color="success" onClick={() => { setChronoRunning(false); onDone(); }} sx={{ ml: 2 }}>
                Terminer
              </Button>
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
              <Button variant={chronoRunning ? 'outlined' : 'contained'} color="primary" onClick={() => setChronoRunning(r => !r)}>
                {chronoRunning ? 'Pause' : (chrono === 0 ? 'Démarrer' : 'Reprendre')}
              </Button>
              <Button variant="outlined" color="secondary" onClick={() => { setChrono(0); setChronoRunning(false); }} disabled={chrono === 0}>
                Réinitialiser
              </Button>
              {side === 0 ? (
                <Button 
                  variant="contained" 
                  color="info" 
                  onClick={() => { 
                    setChronoRunning(false); 
                    setSide(1); 
                    setChrono(0); 
                    setTimeout(() => setChronoRunning(true), 1000);
                  }} 
                  sx={{ ml: 1 }}
                >
                  Côté Suivant
                </Button>
              ) : (
                <Button 
                  variant="contained" 
                  color="success" 
                  onClick={() => { 
                    setChronoRunning(false); 
                    onDone(); 
                  }} 
                  sx={{ ml: 1 }}
                >
                  Terminer
                </Button>
              )}
            </Box>
          </Box>
        ) : (
          <>
            <Typography variant="body1" color="text.secondary">
              Répétitions : <span style={{ color: 'white', fontWeight: 'bold', backgroundColor: '#2E7D32', padding: '2px 6px', borderRadius: '4px' }}>{exo.nbRep}</span>
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Longueur de la série : <span style={{ color: 'white', fontWeight: 'bold', backgroundColor: '#536DFE', padding: '2px 6px', borderRadius: '4px' }}>{exo.sets}</span>
            </Typography>
          </>
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