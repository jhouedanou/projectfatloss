import React, { useState, useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';
import { 
  BottomNavigation, 
  BottomNavigationAction, 
  Paper, 
  Fade, 
  Slide,
  Box,
  alpha
} from '@mui/material';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import BarChartIcon from '@mui/icons-material/BarChart';
import MonitorWeightIcon from '@mui/icons-material/MonitorWeight';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import SpaIcon from '@mui/icons-material/Spa';
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
import { initNotificationService } from '../services/NotificationService';
// Import de la synthèse vocale supprimé
import { days as initialWorkoutPlan } from '../data'; 
import '../components/WeightTracker.css';
import '../components/WorkoutCustomizer.css'; 
import HomeExerciseCarousel from '../components/HomeExerciseCarousel';
import DayPills from '../components/DayPills';
import Header from '../components/Header/Header';
import { getServiceWorkerPath, getAssetPath } from '../utils/paths';
import { hasContactInfo, sendWorkoutReport, getContactInfo } from '../services/ContactService';
import { getWeightHistory } from '../services/WeightStorage';

const NOTIFICATION_DURATION = 3000; 

export default function App() {
  const { t } = useTranslation();
  const [current, setCurrent] = useState(() => {
    const savedDay = localStorage.getItem('currentWorkoutDay');
    return savedDay !== null ? parseInt(savedDay, 10) : 0;
  });
  const [stepMode, setStepMode] = useState(false);
  const [autoMode, setAutoMode] = useState(false);
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
        navigator.serviceWorker.register(getServiceWorkerPath())
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
    
    // Récupérer le poids actuel si disponible
    const weightHistory = getWeightHistory();
    const currentWeight = weightHistory.length > 0 
      ? weightHistory[weightHistory.length - 1].weight 
      : null;
    
    // Ajouter le poids actuel aux données
    const completeWorkoutData = {
      ...workoutData,
      currentWeight
    };
    
    // Envoyer le rapport d'entraînement
    if (hasContactInfo()) {
      sendWorkoutReport(completeWorkoutData).then(success => {
        if (success) {
          console.log('Rapport d\'entraînement envoyé');
        }
      });
    }
    
    if ("Notification" in window && Notification.permission === "granted" && workoutPlan && workoutPlan.length > 0) {
      new Notification(t('notifications.workoutComplete'), {
        body: t('notifications.nextDay', { day: (current + 1) % workoutPlan.length + 1 }),
        icon: getAssetPath('/favicon.ico')
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

  const viewModeToIndex = { workout: 0, history: 1, weight: 2 };
  const indexToViewMode = ['workout', 'history', 'weight'];

  return (
    <ThemeProvider theme={appTheme}>
      <div className="app" style={{ 
        width: '100%', 
        overflowX: 'hidden', 
        position: 'relative',
        minHeight: '100vh',
        paddingBottom: stepMode ? 0 : '72px',
      }}>
        <Header onNotificationSettings={() => setShowNotificationSettings(true)} />
        <div style={{ 
          width: '100%', 
          overflowX: 'hidden',
          position: 'relative'
        }}>
          
          {showLanguageSelector && <LanguageSelector />}
          
          {showCustomizer && <WorkoutCustomizer onClose={handleCloseCustomizer} />}
          
          {/* Contenu principal avec transitions */}
          <Fade in={viewMode === 'workout'} timeout={300} unmountOnExit mountOnEnter>
            <div>
              {isPlanAvailable && (
                <>
                  {!stepMode ? (
                    <div className="day-content">
                      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                        <DayPills days={workoutPlan} current={current} setCurrent={setCurrent} />
                      </div>
                      <h2 className="day-title">{workoutPlan[current].title}</h2>
                      
                      {workoutPlan[current].isRestDay ? (
                        /* Affichage jour de repos */
                        <div className="rest-day-container" style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '48px 24px',
                          textAlign: 'center',
                          gap: '16px',
                        }}>
                          <SpaIcon style={{ fontSize: '4rem', opacity: 0.6, color: '#4CAF50' }} />
                          <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 600 }}>
                            {t('restDay.title', { defaultValue: 'Jour de repos' })}
                          </h3>
                          <p style={{ margin: 0, opacity: 0.7, maxWidth: '300px', lineHeight: 1.6 }}>
                            {t('restDay.description', { defaultValue: 'Profitez de cette journée pour récupérer. Hydratez-vous bien et reposez vos muscles.' })}
                          </p>
                          <button
                            className="start-workout-btn"
                            onClick={() => moveToNextDay()}
                            style={{ marginTop: '8px' }}
                          >
                            <span className="start-workout-icon">➡️</span>
                            <span className="start-workout-text">{t('restDay.nextDay', { defaultValue: 'Passer au jour suivant' })}</span>
                          </button>
                        </div>
                      ) : (
                        <>
                          {/* Bouton de démarrage amélioré */}
                          <div className="start-workout-container">
                            <button 
                              className="start-workout-btn" 
                              onClick={() => setStepMode(true)}
                            >
                              <span className="start-workout-icon">💪</span>
                              <span className="start-workout-text">{t('workout.start')}</span>
                              <span className="start-workout-subtitle">{workoutPlan[current].exercises.length} {t('workout.exercises', { defaultValue: 'exercices' })}</span>
                            </button>
                          </div>
                          
                          {/* Liste d'exercices avec numérotation */}
                          <div className="exercise-list">
                            {workoutPlan[current].exercises.map((exo, index) => (
                              <div key={index} className="exercise-item" style={{ animationDelay: `${index * 0.05}s` }}>
                                <div className="exercise-number">{index + 1}</div>
                                <div className="exercise-content">
                                  <h3 className="exercise-name">{exo.name}</h3>
                                  <div className="exercise-details">
                                    <span className="exercise-sets">{exo.sets}</span>
                                    {exo.equip && (
                                      <span className="exercise-equipment">{exo.equip}</span>
                                    )}
                                  </div>
                                  {exo.desc && <p className="exercise-description">{exo.desc}</p>}
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <StepWorkout 
                      dayIndex={current} 
                      onBack={() => {
                        setStepMode(false);
                        setAutoMode(false);
                      }}
                      onComplete={handleWorkoutComplete}
                      autoMode={autoMode}
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
            </div>
          </Fade>

          <Fade in={viewMode === 'history'} timeout={300} unmountOnExit mountOnEnter>
            <div className="history-content">
              <WorkoutStats />
              <WorkoutCalendar />
            </div>
          </Fade>

          <Fade in={viewMode === 'weight'} timeout={300} unmountOnExit mountOnEnter>
            <div className="weight-content">
              <WeightTracker />
            </div>
          </Fade>
        </div>
        
        {/* Bouton flottant personnaliser - repositionné au-dessus de la bottom nav */}
        {!stepMode && (
          <button 
            className="floating-customize-button"
            onClick={() => setShowCustomizer(true)}
            title={t('settings.customizeProgram')}
            style={{
              position: 'fixed',
              bottom: '88px',
              right: '20px',
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #F03D32 0%, #FF6B35 50%, #F7931E 100%)',
              border: 'none',
              color: 'white',
              fontSize: '1.4rem',
              cursor: 'pointer',
              boxShadow: '0 6px 16px rgba(240, 61, 50, 0.35)',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-3px) scale(1.1)';
              e.target.style.boxShadow = '0 10px 24px rgba(240, 61, 50, 0.45)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0) scale(1)';
              e.target.style.boxShadow = '0 6px 16px rgba(240, 61, 50, 0.35)';
            }}
          >
            ⚙️
          </button>
        )}

        {/* Bottom Navigation Bar - cachée en mode workout actif */}
        {!stepMode && (
          <Paper 
            sx={{ 
              position: 'fixed', 
              bottom: 0, 
              left: 0, 
              right: 0, 
              zIndex: 1100,
              borderTop: (theme) => `1px solid ${alpha(theme.palette.divider, 0.12)}`,
              backdropFilter: 'blur(20px)',
              backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.92),
            }} 
            elevation={8}
          >
            <BottomNavigation
              value={viewModeToIndex[viewMode]}
              onChange={(event, newValue) => {
                setViewMode(indexToViewMode[newValue]);
              }}
              sx={{
                height: '68px',
                '& .MuiBottomNavigationAction-root': {
                  minWidth: 'auto',
                  padding: '6px 0',
                  transition: 'all 0.2s ease-in-out',
                  '&.Mui-selected': {
                    '& .MuiSvgIcon-root': {
                      transform: 'scale(1.15)',
                    },
                  },
                },
                '& .MuiBottomNavigationAction-label': {
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  letterSpacing: '0.3px',
                  '&.Mui-selected': {
                    fontSize: '0.72rem',
                  },
                },
              }}
            >
              <BottomNavigationAction 
                label={t('nav.workout')} 
                icon={<FitnessCenterIcon />} 
                sx={{
                  '&.Mui-selected': {
                    color: (theme) => theme.palette.primary.main,
                  },
                }}
              />
              <BottomNavigationAction 
                label={t('nav.history')} 
                icon={<BarChartIcon />} 
                sx={{
                  '&.Mui-selected': {
                    color: (theme) => theme.palette.secondary.main,
                  },
                }}
              />
              <BottomNavigationAction 
                label={t('nav.weight')} 
                icon={<MonitorWeightIcon />} 
                sx={{
                  '&.Mui-selected': {
                    color: '#4CAF50',
                  },
                }}
              />
              <BottomNavigationAction 
                label={darkTheme ? t('theme.light', { defaultValue: 'Clair' }) : t('theme.dark', { defaultValue: 'Sombre' })} 
                icon={darkTheme ? <LightModeIcon /> : <DarkModeIcon />} 
                onClick={(e) => {
                  e.stopPropagation();
                  toggleTheme();
                }}
                sx={{
                  color: (theme) => theme.palette.text.secondary,
                }}
              />
            </BottomNavigation>
          </Paper>
        )}
        
        {/* Boîte de dialogue des paramètres de notification */}
        <NotificationSettingsDialog 
          open={showNotificationSettings}
          onClose={() => setShowNotificationSettings(false)}
        />
        
      </div>
    </ThemeProvider>
  );
}
