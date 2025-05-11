import React, { useState, useEffect, useRef } from 'react';
import { getWorkoutPlan } from '../services/WorkoutCustomization';
import { Button, Box, Typography, Paper, LinearProgress, Switch, FormControlLabel, IconButton } from '@mui/material';
import ProgressTracker from '../components/ProgressTracker';
import ExoIcon, { EquipIcon } from '../components/ExoIcon';
import ProgressBar from '../components/ProgressBar';
import GoogleFitButton from '../components/GoogleFitButton';
import CompletionAnimation from '../components/CompletionAnimation';
import DayPills from '../components/DayPills';
import YouTubeButton from '../components/YouTubeButton';
import SpeechSettingsDialog from '../components/SpeechSettingsDialog';
import '../components/SpeechSettings.css';
import { 
  initSpeechService, 
  speak, 
  setEnabled as setSpeechEnabled, 
  announceExercise, 
  announcePause, 
  announceCount,
  announceRepetition,
  announceWorkoutComplete 
} from '../services/SpeechService';

import iconsMap from '../../public/exo-icons.json';

import beepSound from '../../public/beep.mp3';

function playBeep() {
  const beep = new Audio(beepSound);
  beep.volume = 1.0;
  beep.play().catch(err => console.error("Erreur de lecture audio:", err));
}

function parseSets(sets) {
  const m = sets.match(/(\d+)\s*[x×]/i);
  return m ? parseInt(m[1], 10) : 1;
}

function Pause({ onEnd, onSkip, isExerciseTransition, reducedTime, day, step, total }) {
  const defaultTime = reducedTime ? 10 : 15;
  const [time, setTime] = useState(defaultTime);
  const nextExercise = step < total - 1 ? day.exercises[step + 1] : null;
  
  // Annoncer la pause lorsqu'elle commence
  useEffect(() => {
    if (isExerciseTransition && nextExercise) {
      announcePause(defaultTime, true, nextExercise);
    } else {
      announcePause(defaultTime, false);
    }
  }, []);
  
  useEffect(() => {
    if (time === 0) {
      // Jouer un double beep à la fin de la pause uniquement
      playBeep();
      setTimeout(() => playBeep(), 200);
      onEnd();
      return;
    }
    
    // Jouer les beeps uniquement à partir de 4 secondes
    if (time <= 4 && time > 0) {
      playBeep();
      // Annoncer le compte à rebours avec la synthèse vocale
      announceCount(time);
    }
    
    const id = setTimeout(() => setTime(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [time, onEnd, isExerciseTransition]);

  return (
    <div style={{textAlign:'center',marginTop:40}}>
      <h2>Pause {reducedTime && "Rapide"}</h2>
      <div style={{fontSize:40,margin:20}}>{time}s</div>
      
      {/* {isExerciseTransition && nextExercise && (
        <Box sx={{ mt: 2, mb: 2, p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            Prochain exercice:
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
            {nextExercise.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Équipement: {nextExercise.equip}
          </Typography>
        </Box>
      )} */}
      
      <button 
        className="timer-btn" 
        style={{marginTop:20}}
        onClick={onSkip}
      >
        Passer la pause
      </button>
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

function FloatingCalorieCounter({ calories, exerciseCompleted, fatBurnerMode }) {
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

function EndOfDayModal({ day, totalCalories, onClose, onSaveWorkout, fatBurnerMode }) {
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
  
  const handleSave = () => {
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
      fatBurnerMode: fatBurnerMode
    };
    
    const savedWorkout = saveWorkout(workoutData);
    onSaveWorkout && onSaveWorkout(savedWorkout);
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
        
        <div className="google-fit-section">
          <GoogleFitButton 
            exercise={{
              name: day.title,
              desc: `Séance complète : ${day.exercises.length} exercices`,
              caloriesPerSet: [totalCalories, totalCalories],
              totalSets: 1,
              googleFitActivity: {
                type: 'strength_training',
                name: day.title,
                muscleGroups: ['full_body']
              }
            }} 
          />
        </div>
        
        <div className="modal-actions">
          <button className="timer-btn save-btn" onClick={handleSave}>Enregistrer</button>
          <button className="timer-btn close-btn" onClick={onClose}>Fermer</button>
        </div>
      </div>
    </div>
  );
}

import { saveWorkout } from '../services/WorkoutStorage';

export default function StepWorkout({ dayIndex: initialDayIndex, onBack, onComplete, fatBurnerMode }) {
  const [dayIndex, setDayIndex] = useState(initialDayIndex || 0);
  const [step, setStep] = useState(0);
  const [pause, setPause] = useState(false);
  const [isExerciseTransition, setIsExerciseTransition] = useState(false);
  const [setNum, setSetNum] = useState(0);
  const [totalCaloriesBurned, setTotalCaloriesBurned] = useState(0);
  const [exerciseCompleted, setExerciseCompleted] = useState(false);
  const [workoutCompleted, setWorkoutCompleted] = useState(false);
  const [speechEnabled, setSpeechEnabledState] = useState(false);
  const [speechSettingsOpen, setSpeechSettingsOpen] = useState(false);
  const isFirstRender = useRef(true);
  let beepTimeouts = [];
  
  // Initialiser le service de synthèse vocale
  useEffect(() => {
    initSpeechService();
  }, []);
  
  // Gérer l'activation/désactivation de la synthèse vocale
  const handleSpeechToggle = (event) => {
    const newState = event.target.checked;
    setSpeechEnabledState(newState);
    setSpeechEnabled(newState);
  };
  
  // Ouvrir la boîte de dialogue des paramètres
  const handleOpenSpeechSettings = () => {
    setSpeechSettingsOpen(true);
  };
  
  // Fermer la boîte de dialogue des paramètres
  const handleCloseSpeechSettings = () => {
    setSpeechSettingsOpen(false);
  };
  
  const workoutPlan = getWorkoutPlan();
  const day = workoutPlan?.[dayIndex];
  const total = day?.exercises?.length || 0;
  const exo = day?.exercises?.[step];
  const totalSets = exo
    ? (fatBurnerMode 
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
  
  useEffect(()=>{
    setStep(0);
    setPause(false);
    setIsExerciseTransition(false);
    setSetNum(0);
    setTotalCaloriesBurned(0);
  },[dayIndex]);
  
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    
    if (step > 0 || setNum > 0) {
      try {
        playBeep();
      } catch (error) {
        console.error("Erreur lors de la lecture du son :", error);
      }
    }
  }, [step, setNum]);
  
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

  const next = () => {
    const currentExercise = day.exercises[step];
    const nextExercise = step < total - 1 ? day.exercises[step + 1] : null;

    if (setNum < totalSets - 1) {
      setSetNum(s => s + 1);
      setPause(true);
      setIsExerciseTransition(fatBurnerMode ? true : false);
    } else if (step < total - 1) {
      setPause(true);
      setIsExerciseTransition(true);
      setSetNum(0);
      setStep(s => s + 1);
      
      // Play initial beep
      playBeep();

      // Start rhythm based on repetitions
      const repetitions = parseSets(nextExercise.sets);
      beepTimeouts = [];
      for (let i = 0; i < repetitions; i++) {
        beepTimeouts.push(setTimeout(() => {
          playBeep();
          if (i === repetitions - 1) {
            clearBeepRhythm(); // Clear rhythm when reaching 0 repetitions
          }
        }, (i + 1) * 1000)); // Adjust timing as needed
      }
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
      fatBurnerMode: fatBurnerMode
    };
    
    // Annoncer la fin de l'entraînement
    announceWorkoutComplete({
      calories: totalCaloriesBurned
    });
    
    onComplete && onComplete(workoutDataWithMode);
    
    // Fermer la modale
    handleCloseEndOfDayModal();
  };
  
  return (
    <div className="day-content">
      <button className="timer-btn" style={{marginBottom:10}} onClick={onBack}>Retour</button>
      <h2 style={{fontSize:'1.1rem',marginBottom:8}}>{day.title}</h2>
      
      {fatBurnerMode && (
        <div className="fat-burner-indicator">
          🔥 Mode Fat Burner actif ! 🔥
        </div>
      )}
      
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 1 }} className="speech-controls">
        <FormControlLabel
          control={<Switch checked={speechEnabled} onChange={handleSpeechToggle} />}
          label="Synthèse vocale"
        />
        {speechEnabled && (
          <IconButton 
            onClick={handleOpenSpeechSettings} 
            color="primary" 
            size="small"
            aria-label="Paramètres vocaux"
            className="speech-settings-button"
          >
            <span role="img" aria-label="Paramètres">⚙️</span>
          </IconButton>
        )}
      </Box>
      
      {/* DayPills masqué selon la demande */}
      {/* <DayPills 
        days={workoutPlan} 
        current={dayIndex} 
        setCurrent={setDayIndex}
      /> */}
      
      <>
        <ProgressTracker 
          currentExercise={step + 1}
          totalExercises={total}
          currentSet={setNum + 1}
          totalSets={totalSets}
          calories={totalCaloriesBurned}
          fatBurnerMode={fatBurnerMode}
        />

        {pause ? (
          <Pause 
            onEnd={handlePauseEnd} 
            onSkip={handleSkipPause} 
            isExerciseTransition={isExerciseTransition}
            reducedTime={fatBurnerMode}
            day={day}
            step={step}
            total={total}
          />
        ) : (
          <StepSet 
            exo={exo} 
            setNum={setNum} 
            totalSets={totalSets} 
            onDone={next}
            onCaloriesBurned={handleCaloriesBurned}
            onExerciseCompleted={handleExerciseCompleted}
            fatBurnerMode={fatBurnerMode}
          />
        )}
        
        <Box
          sx={{
            position: 'fixed',
            top: 50,
            right: 20,
            zIndex: 1000
          }}
        >
          <FloatingCalorieCounter 
            calories={totalCaloriesBurned} 
            exerciseCompleted={exerciseCompleted} 
            fatBurnerMode={fatBurnerMode}
          />
        </Box>
      </>
      
      {workoutCompleted && (
        <EndOfDayModal 
          day={day} 
          totalCalories={totalCaloriesBurned} 
          onClose={handleCloseEndOfDayModal}
          onSaveWorkout={handleSaveWorkout}
          fatBurnerMode={fatBurnerMode}
        />
      )}
      
      {/* Boîte de dialogue des paramètres de synthèse vocale */}
      <SpeechSettingsDialog 
        open={speechSettingsOpen} 
        onClose={handleCloseSpeechSettings}
        speechEnabled={speechEnabled}
      />
    </div>
  );
}

function StepSet({ exo, setNum, totalSets, onDone, onCaloriesBurned, onExerciseCompleted, fatBurnerMode }) {
  const iconType = iconsMap[exo.name] || 'dumbbell';
  const [isPulsing, setIsPulsing] = useState(false);
  const [currentRep, setCurrentRep] = useState(0);
  const [showOverlay, setShowOverlay] = useState(false);
  const [showCalories, setShowCalories] = useState(false);
  const [caloriesToShow, setCaloriesToShow] = useState(0);
  const [countdown, setCountdown] = useState(null); // null = pas de décompte, sinon 3,2,1
  const timerRef = useRef(null);

  // Remise à zéro des états internes à chaque changement d'exercice ou de série
  useEffect(() => {
    setIsPulsing(false);
    setCurrentRep(0);
    setShowOverlay(false);
    setShowCalories(false);
    setCaloriesToShow(0);
    setCountdown(null);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Annoncer le nouvel exercice avec le numéro de série
    announceExercise(exo, setNum, totalSets);
  }, [exo, setNum, totalSets]);

  // Lancer le décompte avant le rythme
  const handlePulse = () => {
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
      // Annoncer le compte à rebours
      announceCount(countdown);
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
            // Annoncer certaines répétitions
            announceRepetition(newRep, exo.nbRep);
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
    if (currentRep === exo.nbRep) {
      setShowOverlay(true);
      setIsPulsing(false);
    }
  }, [currentRep, exo.nbRep]);

  // Nouveau : bouton "Suivant" sur l'overlay OK
  const handleNext = () => {
    const calories = exo.caloriesPerSet ? Math.round((exo.caloriesPerSet[0] + exo.caloriesPerSet[1]) / 2) : 10;
    setCaloriesToShow(calories);
    onCaloriesBurned(calories);
    onExerciseCompleted();
    setShowCalories(true);
    setShowOverlay(false);
    setTimeout(() => {
      setShowCalories(false);
      onDone();
    }, 2000);
  };

  const caloriesPerSet = exo.caloriesPerSet ? 
    Math.round((exo.caloriesPerSet[0] + exo.caloriesPerSet[1]) / 2) : 10;

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
        {showOverlay && (
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
                <Typography variant="h4" component="div" sx={{ mb: 2, color: 'green' }}>
                  OK !
                </Typography>
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
              </>
            )}
          </Box>
        )}
        <ExoIcon type={iconType} size={48} />
        
        <Typography 
          variant="h5" 
          gutterBottom 
          sx={{ 
            fontWeight: 'bold',
            color: 'text.primary',
          }}
        >
          {exo.name}
        </Typography>
        
        <Typography variant="body1" color="text.secondary">
          Matériel : <span>{exo.equip}</span>
        </Typography>
        
        <Typography variant="body1" color="text.secondary">
          Série <span style={{ color: 'red', fontWeight: 'bold' }}>{setNum + 1}</span> / {totalSets}
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
        
        <Typography variant="body1" color="text.secondary">
          Répétitions : <span style={{ fontWeight: 'bold', color: 'red' }}>{exo.nbRep}</span>
        </Typography>
        
        <Typography variant="body1" color="text.secondary">
          Longueur de la série : <span style={{ fontWeight: 'bold', color: 'red' }}>{exo.sets}</span>
        </Typography>

        <YouTubeButton exercise={exo} /> {/* Ajout du bouton YouTube */}

        <Button 
          variant="contained" 
          color="primary"
          onClick={handlePulse}
          sx={{
            mt: 2,
            minWidth: 200,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {isPulsing || countdown !== null ? 'Arrêter le rythme' : 'Démarrer le rythme'}
        </Button>

        {/* Déplacement du bouton "Exercice suivant" ici, il sera toujours visible */}
        <Button
          variant="outlined"
          color="secondary"
          onClick={() => {
            // On considère que l'utilisateur saute l'exercice, on affiche les calories
            const calories = exo.caloriesPerSet ? Math.round((exo.caloriesPerSet[0] + exo.caloriesPerSet[1]) / 2) : 10;
            setCaloriesToShow(calories);
            onCaloriesBurned(calories);
            onExerciseCompleted();
            setShowCalories(true);
            setShowOverlay(false);
            setTimeout(() => {
              setShowCalories(false);
              onDone();
            }, 1000);
          }}
          sx={{
            mt: 2,
            minWidth: 200,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          Exercice suivant
        </Button>

        {showCalories && (
          <Box
            sx={{
              position: 'fixed',
              bottom: 20,
              right: 20,
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