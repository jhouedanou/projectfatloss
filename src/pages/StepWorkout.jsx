import React, { useState, useEffect, useRef } from 'react';
import { getWorkoutPlan } from '../services/WorkoutCustomization';
import { Button, Box, Typography, Paper, LinearProgress } from '@mui/material';
import ProgressTracker from '../components/ProgressTracker';
import YouTubeButton from '../components/YouTubeButton';
import ExoIcon, { EquipIcon } from '../components/ExoIcon';
import ProgressBar from '../components/ProgressBar';
import GoogleFitButton from '../components/GoogleFitButton';
import CompletionAnimation from '../components/CompletionAnimation';

import iconsMap from '../../public/exo-icons.json';

import beepSound from '../beep.mp3';

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
  
  useEffect(() => {
    if (time === 0) {
      onEnd();
      return;
    }
    
    if (time === 6 || time === 3 || time === 2 || time === 1) {
      playBeep();
    } else if (time === 0) {
      playBeep();
      setTimeout(() => playBeep(), 200);
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

export default function StepWorkout({ dayIndex, onBack, onComplete, fatBurnerMode }) {
  const [step, setStep] = useState(0);
  const [pause, setPause] = useState(false);
  const [isExerciseTransition, setIsExerciseTransition] = useState(false);
  const [setNum, setSetNum] = useState(0);
  const [totalCaloriesBurned, setTotalCaloriesBurned] = useState(0);
  const [showEndOfDayModal, setShowEndOfDayModal] = useState(false);
  const [workoutCompleted, setWorkoutCompleted] = useState(false);
  const [stepMode, setStepMode] = useState(false);
  const isFirstRender = useRef(true);
  
  const workoutPlan = getWorkoutPlan();
  const day = workoutPlan[dayIndex];
  const total = day.exercises.length;
  const exo = day.exercises[step];
  const totalSets = fatBurnerMode 
    ? Math.max(1, Math.floor(parseSets(exo.sets) / 2))
    : parseSets(exo.sets);
  
  const fatBurnerCalorieFactor = fatBurnerMode ? 1.5 : 1;
  
  useEffect(()=>{
    setStep(0);
    setPause(false);
    setIsExerciseTransition(false);
    setSetNum(0);
    setTotalCaloriesBurned(0);
    setShowEndOfDayModal(false);
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
    const adjustedCalories = Math.round(calories * fatBurnerCalorieFactor);
    setTotalCaloriesBurned(prev => prev + adjustedCalories);
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
    } else {
      setWorkoutCompleted(true);
      setShowEndOfDayModal(true);
    }
  };
  
  const handleCloseEndOfDayModal = () => {
    setShowEndOfDayModal(false);
    onBack();
  };
  
  const handleSaveWorkout = (workoutData) => {
    const workoutDataWithMode = {
      ...workoutData,
      fatBurnerMode: fatBurnerMode
    };
    
    onComplete && onComplete(workoutDataWithMode);
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
      
      {!stepMode ? (
        <>
          <button className="timer-btn" style={{marginBottom:16}} onClick={()=>setStepMode(true)}>
            Commencer
          </button>
          <div className="exercises-list">
            {day.exercises.map((exo, i) => (
              <div key={i} className="exercise-card">
                <h3>{exo.name}</h3>
                <p>{exo.sets} séries</p>
                <p>{exo.equip}</p>
                <p>{exo.desc}</p>
                <YouTubeButton exercise={exo} />
              </div>
            ))}
          </div>
        </>
      ) : (
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
              fatBurnerMode={fatBurnerMode}
            />
          )}
          
          <FloatingCalorieCounter 
            calories={totalCaloriesBurned} 
            exerciseCompleted={workoutCompleted}
            fatBurnerMode={fatBurnerMode} 
          />
        </>
      )}
      
      {showEndOfDayModal && (
        <EndOfDayModal 
          day={day} 
          totalCalories={totalCaloriesBurned} 
          onClose={handleCloseEndOfDayModal}
          onSaveWorkout={handleSaveWorkout}
          fatBurnerMode={fatBurnerMode}
        />
      )}
    </div>
  );
}

function StepSet({ exo, setNum, totalSets, onDone, onCaloriesBurned, fatBurnerMode }) {
  const iconType = iconsMap[exo.name] || 'dumbbell';
  const [isPulsing, setIsPulsing] = useState(false);
  const [currentRep, setCurrentRep] = useState(0);
  const [showOverlay, setShowOverlay] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (isPulsing) {
      const interval = setInterval(() => {
        setCurrentRep(prev => {
          const newRep = prev + 1;
          if (newRep <= exo.nbRep) {
            playBeep();
            return newRep;
          }
          return exo.nbRep; // Empêche d'aller au-delà de nbRep
        });
      }, 2000); // 2 secondes entre chaque répétition

      timerRef.current = interval;
      return () => clearInterval(interval);
    }
  }, [isPulsing, exo.nbRep]);

  useEffect(() => {
    if (currentRep === exo.nbRep) {
      // Affiche "OK !" pendant 2 secondes
      setShowOverlay(true);
      setTimeout(() => {
        setShowOverlay(false);
        setIsPulsing(false);
        onDone();
      }, 2000);
    }
  }, [currentRep, exo.nbRep, onDone]);

  const handlePulse = () => {
    if (!isPulsing) {
      setIsPulsing(true);
      setCurrentRep(0);
      setShowOverlay(true);
    } else {
      setIsPulsing(false);
      setShowOverlay(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
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
          minHeight: 300
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
            {currentRep < exo.nbRep ? (
              <Typography variant="h4" component="div" sx={{ mb: 2 }}>
                Répétition {currentRep + 1} / {exo.nbRep}
              </Typography>
            ) : (
              <Typography variant="h4" component="div" sx={{ mb: 2, color: 'green' }}>
                OK !
              </Typography>
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

        <Button 
          variant="contained" 
          color="primary"
          onClick={onDone}
          sx={{
            mt: 2,
            minWidth: 200,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          Terminer
        </Button>

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
          {isPulsing ? 'Arrêter le rythme' : 'Démarrer le rythme'}
        </Button>

        <Box
          sx={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            transition: 'all 0.3s ease',
            opacity: 1,
            transform: 'translateY(0)',
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
              +{caloriesPerSet} calories !
            </Typography>
          </Paper>
        </Box>
      </Paper>
    </Box>
  );
}