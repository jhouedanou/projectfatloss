import React, { useState, useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';
import { createAppTheme } from '../theme';
import { useTranslation } from 'react-i18next';
import { getWorkoutPlan } from '../services/WorkoutCustomization'; 
import StepWorkout from './StepWorkout';
import WorkoutCalendar from '../components/WorkoutCalendar';
import WorkoutStats from '../components/WorkoutStats';
import WeightTracker from '../components/WeightTracker';
import LanguageSelector from '../components/LanguageSelector';
import WorkoutCustomizer from '../components/WorkoutCustomizer'; 
// Import de la synthèse vocale supprimé
import { days as initialWorkoutPlan } from '../data'; 
import '../components/WeightTracker.css';
import '../components/WorkoutCustomizer.css'; 
import HomeExerciseCarousel from '../components/HomeExerciseCarousel';
import DayPills from '../components/DayPills';
import Header from '../components/Header/Header';

const NOTIFICATION_DURATION = 3000; 

export default function App() {
  const { t } = useTranslation();
  const [current, setCurrent] = useState(() => {
    const savedDay = localStorage.getItem('currentWorkoutDay');
    return savedDay !== null ? parseInt(savedDay, 10) : 0;
  });
  const [stepMode, setStepMode] = useState(false);
  const [viewMode, setViewMode] = useState('workout'); 
  const [darkTheme, setDarkTheme] = useState(
    localStorage.getItem('theme') !== 'light' 
  );
  const [showLanguageSelector, setShowLanguageSelector] = useState(() => {
    const savedPref = localStorage.getItem('showLanguageSelector');
    return false;
  });
  
  const [fatBurnerMode, setFatBurnerMode] = useState(false);
  
  const [workoutPlan, setWorkoutPlan] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [showCustomizer, setShowCustomizer] = useState(false);
  
  const [appTheme, setAppTheme] = useState(() => createAppTheme(
    localStorage.getItem('theme') !== 'light'
  ));

  useEffect(() => {
    try {
      setIsLoading(true);
      const plan = getWorkoutPlan();
      
      if (!plan || plan.length === 0) {
        setWorkoutPlan(initialWorkoutPlan);
      } else {
        setWorkoutPlan(plan);
      }
    } catch (error) {
      console.error('Erreur lors du chargement du plan d\'entraînement:', error);
      setWorkoutPlan(initialWorkoutPlan);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  useEffect(() => {
    if (!isLoading && workoutPlan.length > 0 && current >= workoutPlan.length) {
      setCurrent(0);
    }
  }, [workoutPlan, current, isLoading]);
  
  const handleCloseCustomizer = () => {
    setShowCustomizer(false);
    try {
      const plan = getWorkoutPlan();
      if (plan && plan.length > 0) {
        setWorkoutPlan(plan);
      }
    } catch (error) {
      console.error('Erreur lors du rechargement du plan:', error);
    }
  };
  
  useEffect(() => {
    localStorage.setItem('currentWorkoutDay', current.toString());
  }, [current]);

  useEffect(() => {
    if (darkTheme) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
    localStorage.setItem('theme', darkTheme ? 'dark' : 'light');
    setAppTheme(createAppTheme(darkTheme));
  }, [darkTheme]);

  useEffect(() => {
    localStorage.setItem('showLanguageSelector', showLanguageSelector);
  }, [showLanguageSelector]);

  // Initialisation de la synthèse vocale supprimée

  const toggleTheme = () => {
    setDarkTheme(prev => !prev);
  };

  const toggleLanguageSelector = () => {
    setShowLanguageSelector(prev => !prev);
  };
  
  const toggleFatBurnerMode = () => {
    setFatBurnerMode(prev => !prev);
  };
  
  const moveToNextDay = () => {
    if (workoutPlan && workoutPlan.length > 0) {
      setCurrent(prev => (prev + 1) % workoutPlan.length);
    }
    setStepMode(false); 
  };
  
  const handleWorkoutComplete = (workoutData) => {
    console.log('Entraînement terminé:', workoutData);
    
    if ("Notification" in window && Notification.permission === "granted" && workoutPlan && workoutPlan.length > 0) {
      new Notification(t('notifications.workoutComplete'), {
        body: t('notifications.nextDay', { day: (current + 1) % workoutPlan.length + 1 }),
        icon: '/favicon.ico'
      });
    }
    
    moveToNextDay();
    
    setViewMode('history');
  };
  
  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "denied") {
      Notification.requestPermission();
    }
  }, []);

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>{t('app.loading')}</p>
      </div>
    );
  }

  const isPlanAvailable = workoutPlan && workoutPlan.length > 0 && current < workoutPlan.length;

  return (
    <ThemeProvider theme={appTheme}>
      <div className="app">
        <Header />
        <div>
          <header className="app-header">
            <button className="theme-toggle" onClick={toggleTheme} title={darkTheme ? t('theme.light') : t('theme.dark')}>
              {darkTheme ? '☀️' : '🌙'}
            </button>
            <span className="header-title">{t('app.title')}</span>
            <div className="header-controls">
              <button 
                className={`view-toggle ${viewMode === 'workout' ? 'active' : ''}`}
                onClick={() => setViewMode('workout')}
                title={t('nav.workout')}
              >
                <span className="view-icon">🏋️</span>
                <span className="view-text">{t('nav.workout')}</span>
              </button>
              <button 
                className={`view-toggle ${viewMode === 'history' ? 'active' : ''}`}
                onClick={() => setViewMode('history')}
                title={t('nav.history')}
              >
                <span className="view-icon">📊</span>
                <span className="view-text">{t('nav.history')}</span>
              </button>
              <button 
                className={`view-toggle ${viewMode === 'weight' ? 'active' : ''}`}
                onClick={() => setViewMode('weight')}
                title={t('nav.weight')}
              >
                <span className="view-icon">⚖️</span>
                <span className="view-text">{t('nav.weight')}</span>
              </button>
            </div>
          </header>
          
          <div className="settings-bar">
            
            <button 
              className={`settings-button ${fatBurnerMode ? 'active-mode' : ''}`}
              onClick={toggleFatBurnerMode}
              title={t('settings.fatBurnerMode')}
            >
              {t('settings.fatBurner')} 🔥
            </button>
            
            <button 
              className="settings-button"
              onClick={() => setShowCustomizer(true)}
              title={t('settings.customizeProgram')}
            >
              {t('settings.customize')} ⚙️
            </button>
          </div>
          
          {showLanguageSelector && <LanguageSelector />}
          
          {showCustomizer && <WorkoutCustomizer onClose={handleCloseCustomizer} />}
          
          {viewMode === 'workout' ? (
            <>
              {isPlanAvailable && (
                <>
                  {!stepMode ? (
                    <div className="day-content">
                      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                        <DayPills days={workoutPlan} current={current} setCurrent={setCurrent} />
                      </div>
                      <h2 style={{ fontSize: '1.1rem', marginBottom: 16 }}>{workoutPlan[current].title}</h2>
                      {fatBurnerMode && (
                        <div className="fat-burner-banner">
                          <span className="fat-burner-icon">🔥</span>
                          <span className="fat-burner-text">{t('mode.fatBurner')}</span>
                        </div>
                      )}
                      <button className="timer-btn" style={{marginBottom:16}} onClick={()=>setStepMode(true)}>
                        {t('workout.start')}
                      </button>
                      <div className="exercise-list">
                        {workoutPlan[current].exercises.map((exo, index) => (
                          <div key={index} className="exercise-item">
                            <h3 className="exercise-name">{exo.name}</h3>
                            <div className="exercise-details">
                              <span className="exercise-sets">{exo.sets}</span>
                              {exo.equip && (
                                <span className="exercise-equipment">{exo.equip}</span>
                              )}
                            </div>
                            {exo.desc && <p className="exercise-description">{exo.desc}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <StepWorkout 
                      dayIndex={current} 
                      onBack={()=>setStepMode(false)}
                      onComplete={handleWorkoutComplete}
                      fatBurnerMode={fatBurnerMode}
                    />
                  )}
                </>
              )}
              {!isPlanAvailable && (
                <div className="error-message">
                  <h2>{t('app.planError')}</h2>
                  <p>{t('app.planErrorDetails')}</p>
                  <button 
                    className="reload-button"
                    onClick={() => window.location.reload()}
                  >
                    {t('app.reload')}
                  </button>
                </div>
              )}
            </>
          ) : viewMode === 'history' ? (
            <div className="history-content">
              <WorkoutStats />
              <WorkoutCalendar />
            </div>
          ) : (
            <div className="weight-content">
              <WeightTracker />
            </div>
          )}
        </div>
      </div>
    </ThemeProvider>
  );
}
