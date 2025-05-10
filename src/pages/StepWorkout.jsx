import React, { useState, useEffect, useRef } from 'react';
import { getWorkoutPlan } from '../services/WorkoutCustomization';
import { Button, Box, Typography, Paper, LinearProgress } from '@mui/material';
import ProgressTracker from '../components/ProgressTracker';
import YouTubeButton from '../components/YouTubeButton';
import ExoIcon, { EquipIcon } from '../components/ExoIcon';
import ProgressBar from '../components/ProgressBar';
import GoogleFitButton from '../components/GoogleFitButton';
import CompletionAnimation from '../components/CompletionAnimation';

// Load icons map
import iconsMap from '../../public/exo-icons.json';

// Son de notification
import beepSound from '../beep.mp3'; // Correct path from src/pages to src

function playBeep() {
  const beep = new Audio(beepSound);
  beep.volume = 1.0; // Set volume
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

// Component for displaying animated calories
function CalorieDisplay({ calories, visible }) {
  return (
    <div className={`calorie-display ${visible ? 'visible' : ''}`}>
      <span>+{calories} calories brûlées !</span>
    </div>
  );
}

// Component for floating calorie counter
function FloatingCalorieCounter({ calories, exerciseCompleted, fatBurnerMode }) {
  const [pulse, setPulse] = useState(false);
  
  // Effet pour déclencher l'animation de pouls quand les calories changent
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

// Component for end of day summary modal
function EndOfDayModal({ day, totalCalories, onClose, onSaveWorkout, fatBurnerMode }) {
  // Fonction pour calculer le poids total en fonction de l'équipement
  function calculateWeight(equipment) {
    // Extraire les nombres de la chaîne d'équipement (ex: "Haltères 15 kg" -> 15)
    const match = equipment && equipment.match(/(\d+)\s*kg/i);
    return match ? parseInt(match[1], 10) : 0;
  }
  
  // Calculer le poids total soulevé pendant la séance
  const totalWeightLifted = day.exercises.reduce((total, exercise) => {
    const weight = calculateWeight(exercise.equip);
    const sets = parseSets(exercise.sets);
    // Estimation des répétitions basée sur le format "4 × 12-15"
    let reps = 0;
    const repsMatch = exercise.sets.match(/\d+\s*[x×]\s*(\d+)(?:-(\d+))?/i);
    if (repsMatch) {
      if (repsMatch[2]) {
        // Si format "12-15", prendre la moyenne
        reps = Math.round((parseInt(repsMatch[1], 10) + parseInt(repsMatch[2], 10)) / 2);
      } else {
        reps = parseInt(repsMatch[1], 10);
      }
    }
    return total + (weight * sets * reps);
  }, 0);
  
  const handleSave = () => {
    // Préparer les données de l'entraînement à sauvegarder
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
    
    // Sauvegarder dans le stockage local
    const savedWorkout = saveWorkout(workoutData);
    
    // Appeler le callback de sauvegarde
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
        
        {/* Ajouter le bouton Google Fit */}
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
  const [step, setStep] = useState(0); // exercice
  const [pause, setPause] = useState(false);
  const [isExerciseTransition, setIsExerciseTransition] = useState(false); // Indique si on est dans une transition entre exercices
  const [setNum, setSetNum] = useState(0);
  const [totalCaloriesBurned, setTotalCaloriesBurned] = useState(0);
  const [showEndOfDayModal, setShowEndOfDayModal] = useState(false);
  const [workoutCompleted, setWorkoutCompleted] = useState(false); // Nouvel état pour suivre si l'entraînement est terminé
  const [stepMode, setStepMode] = useState(false); // État pour le mode étape par étape
  const isFirstRender = useRef(true);
  
  // Utiliser le programme d'entraînement personnalisé
  const workoutPlan = getWorkoutPlan();
  const day = workoutPlan[dayIndex];
  const total = day.exercises.length;
  const exo = day.exercises[step];
  const totalSets = fatBurnerMode 
    ? Math.max(1, Math.floor(parseSets(exo.sets) / 2)) // Réduire de moitié le nombre de séries en mode Fat Burner (minimum 1)
    : parseSets(exo.sets);
  
  // En mode Fat Burner, on augmente le facteur de calories brûlées
  const fatBurnerCalorieFactor = fatBurnerMode ? 1.5 : 1;
  
  useEffect(()=>{
    setStep(0);
    setPause(false);
    setIsExerciseTransition(false);
    setSetNum(0);
    setTotalCaloriesBurned(0);
    setShowEndOfDayModal(false);
  },[dayIndex]);
  
  // Effet pour jouer le bip sonore lors du changement d'exercice
  useEffect(() => {
    // Ne pas jouer le son au premier rendu
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    
    // Jouer le son quand on passe à un nouvel exercice ou à une nouvelle série
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
    // Autoriser le saut de la pause dans tous les cas
    setPause(false);
    setIsExerciseTransition(false);
  };
  
  const handleCaloriesBurned = (calories) => {
    // Appliquer le facteur de calories du mode Fat Burner
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
    onBack(); // Return to workout list
  };
  
  const handleSaveWorkout = (workoutData) => {
    // Ajouter l'information sur le mode Fat Burner
    const workoutDataWithMode = {
      ...workoutData,
      fatBurnerMode: fatBurnerMode
    };
    
    // Appeler le callback pour enregistrer les données
    onComplete && onComplete(workoutDataWithMode);
  };
  
  return (
    <div className="day-content">
      <button className="timer-btn" style={{marginBottom:10}} onClick={onBack}>Retour</button>
      <h2 style={{fontSize:'1.1rem',marginBottom:8}}>{day.title}</h2>
      
      {/* Afficher une bannière Fat Burner si nécessaire */}
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
      
      {/* End of day modal */}
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
  const [timer, setTimer] = useState(null);

  useEffect(() => {
    if (isPulsing) {
      const interval = setInterval(() => {
        if (currentRep < exo.nbRep) {
          setCurrentRep(prev => prev + 1);
          playBeep();
        } else {
          // Arrête le compteur et le son
          clearInterval(interval);
          setTimer(null);
          // Affiche "OK !" pendant 2 secondes
          setShowOverlay(true);
          setTimeout(() => {
            setShowOverlay(false);
            onDone();
          }, 2000);
        }
      }, 2000); // 2 secondes entre chaque répétition

      setTimer(interval);
    }
  }, [isPulsing, exo.nbRep, onDone]);

  const handlePulse = () => {
    if (!isPulsing) {
      setIsPulsing(true);
      setCurrentRep(0);
      setShowOverlay(true);
    } else {
      setIsPulsing(false);
      setShowOverlay(false);
      if (timer) {
        clearInterval(timer);
        setTimer(null);
      }
    }
  };

  // Calculer les calories pour la série
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

        {/* Bouton de fin de série */}
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

        {/* Bouton de rythme */}
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

        {/* Affichage des calories */}
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
