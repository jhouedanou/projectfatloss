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
import NotificationSettingsDialog from '../components/NotificationSettingsDialog';
import PreWorkout from '../components/PreWorkout';
import { initNotificationService } from '../services/NotificationService';
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
  
  const [workoutPlan, setWorkoutPlan] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  
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
      
      // Initialiser les notifications
      initNotificationService();
      
      // Enregistrer le service worker pour les notifications
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
          .then(registration => {
            console.log('Service Worker enregistré avec succès:', registration);
          })
          .catch(error => {
            console.error('Erreur lors de l\'enregistrement du Service Worker:', error);
          });
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
  
  // Forcer le retour à la vue workout lors du démarrage d'une séance
  useEffect(() => {
    if (stepMode && viewMode !== 'workout') {
      setViewMode('workout');
    }
  }, [stepMode, viewMode]);
  
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
    
    // Initialiser le service de notifications
    initNotificationService();
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
        <Header onNotificationSettings={() => setShowNotificationSettings(true)} />
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
                className={`view-toggle ${viewMode === 'history' ? 'active' : ''} ${stepMode ? 'disabled' : ''}`}
                onClick={() => !stepMode && setViewMode('history')}
                title={stepMode ? t('nav.historyDisabled') : t('nav.history')}
                disabled={stepMode}
              >
                <span className="view-icon">📊</span>
                <span className="view-text">{t('nav.history')}</span>
              </button>
              <button 
                className={`view-toggle ${viewMode === 'weight' ? 'active' : ''} ${stepMode ? 'disabled' : ''}`}
                onClick={() => !stepMode && setViewMode('weight')}
                title={stepMode ? t('nav.weightDisabled') : t('nav.weight')}
                disabled={stepMode}
              >
                <span className="view-icon">⚖️</span>
                <span className="view-text">{t('nav.weight')}</span>
              </button>
            </div>
          </header>
          
          <div className="settings-bar">
            
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
                      
                      {/* Boutons de démarrage */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: 16 }}>
                        <button className="timer-btn" onClick={()=>setStepMode(true)}>
                          {t('workout.start')}
                        </button>
                        <PreWorkout 
                          onStartWorkout={() => setStepMode(true)}
                          onClose={() => {}}
                        />
                      </div>
                      
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
        
        {/* Boîte de dialogue des paramètres de notification */}
        <NotificationSettingsDialog 
          open={showNotificationSettings}
          onClose={() => setShowNotificationSettings(false)}
        />
      </div>
    </ThemeProvider>
  );
}
