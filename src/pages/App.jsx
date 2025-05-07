import React, { useState, useEffect } from 'react';
import { days } from '../data';
import StepWorkout from './StepWorkout';
import WorkoutCalendar from '../components/WorkoutCalendar';
import WorkoutStats from '../components/WorkoutStats';
import WeightTracker from '../components/WeightTracker';
import '../components/WeightTracker.css';

function Tabs({ days, current, setCurrent }) {
  return (
    <nav className="tabs">
      {days.map((d, i) => (
        <div
          key={i}
          className={"tab" + (i === current ? " active" : "")}
          onClick={() => setCurrent(i)}
        >
          Jour {i + 1}
        </div>
      ))}
    </nav>
  );
}

export default function App() {
  const [current, setCurrent] = useState(0);
  const [stepMode, setStepMode] = useState(false);
  const [viewMode, setViewMode] = useState('workout'); // 'workout', 'history' ou 'weight'
  const [darkTheme, setDarkTheme] = useState(() => {
    const savedTheme = localStorage.getItem('darkTheme');
    return savedTheme === 'true';
  });

  useEffect(() => {
    // Appliquer le thème à chaque changement
    if (darkTheme) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
    // Sauvegarder la préférence
    localStorage.setItem('darkTheme', darkTheme);
  }, [darkTheme]);

  const toggleTheme = () => {
    setDarkTheme(prev => !prev);
  };
  
  const handleWorkoutComplete = (workoutData) => {
    // Cette fonction sera passée à StepWorkout pour enregistrer les données d'entraînement
    // lorsqu'une séance est terminée
    console.log('Entraînement terminé:', workoutData);
    // Après l'enregistrement, passer à la vue historique
    setViewMode('history');
    setStepMode(false);
  };

  return (
    <div>
      <header className="app-header">
        <button className="theme-toggle" onClick={toggleTheme}>
          {darkTheme ? '☀️' : '🌙'}
        </button>
        <span className="header-title">Project Fat Loss</span>
        <div className="header-controls">
          <button 
            className="view-toggle" 
            onClick={() => setViewMode('workout')}
            title="Mode entraînement"
          >
            🏋️
          </button>
          <button 
            className="view-toggle" 
            onClick={() => setViewMode('history')}
            title="Historique et statistiques"
          >
            📊
          </button>
          <button 
            className="view-toggle" 
            onClick={() => setViewMode('weight')}
            title="Suivi de poids"
          >
            ⚖️
          </button>
        </div>
      </header>
      
      {viewMode === 'workout' ? (
        // Mode Entraînement
        <>
          <Tabs days={days} current={current} setCurrent={i=>{setCurrent(i);setStepMode(false);}} />
          {!stepMode ? (
            <div className="day-content">
              <h2 style={{ fontSize: '1.1rem', marginBottom: 16 }}>{days[current].title}</h2>
              <button className="timer-btn" style={{marginBottom:16}} onClick={()=>setStepMode(true)}>Commencer la séance</button>
              {days[current].exercises.map((exo, i) => (
                <div className="exo-card" key={i}>
                  <div className="exo-header">
                    <span className="exo-title">{exo.name}</span>
                    <span className="exo-series">{exo.sets}</span>
                  </div>
                  <div className="exo-equip">{exo.equip}</div>
                  <div className="exo-desc">{exo.desc}</div>
                </div>
              ))}
            </div>
          ) : (
            <StepWorkout 
              dayIndex={current} 
              onBack={()=>setStepMode(false)}
              onComplete={handleWorkoutComplete}
            />
          )}
        </>
      ) : viewMode === 'history' ? (
        // Mode Historique et Statistiques
        <div className="history-content">
          <WorkoutStats />
          <WorkoutCalendar />
        </div>
      ) : (
        // Mode Suivi de Poids
        <div className="weight-content">
          <WeightTracker />
        </div>
      )}
    </div>
  );
}
