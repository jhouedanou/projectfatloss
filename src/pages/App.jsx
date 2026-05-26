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
import { Dumbbell, BarChart2, Scale, Sun, Moon, Settings, Calendar, Award, ArrowLeft, Apple } from 'lucide-react';
import { createAppTheme } from '../theme';
import { useTranslation } from 'react-i18next';
import { getWorkoutPlan } from '../services/WorkoutCustomization'; 
import StepWorkout from './StepWorkout';
import WorkoutCalendar from '../components/WorkoutCalendar';
import WorkoutStats from '../components/WorkoutStats';
import WeightTracker from '../components/WeightTracker';
import CalorieCounter from '../components/CalorieCounter';
import LanguageSelector from '../components/LanguageSelector';
import WorkoutCustomizer from '../components/WorkoutCustomizer'; 
import NotificationSettingsDialog from '../components/NotificationSettingsDialog';
import YouTubeButton from '../components/YouTubeButton';
import { initNotificationService } from '../services/NotificationService';
// Import de la synthèse vocale supprimé
import { days as initialWorkoutPlan } from '../data'; 
import '../components/WeightTracker.css';
import '../components/WorkoutCustomizer.css'; 
import HomeExerciseCarousel from '../components/HomeExerciseCarousel';
import HomeDashboard from '../components/HomeDashboard';
import WeekSelector from '../components/WeekSelector';
import Header from '../components/Header/Header';
import { getServiceWorkerPath, getAssetPath } from '../utils/paths';
import { hasContactInfo, sendWorkoutReport, getContactInfo } from '../services/ContactService';
import { getWeightHistory } from '../services/WeightStorage';

const NOTIFICATION_DURATION = 3000; 

export default function App() {
  const { t } = useTranslation();
  const [current, setCurrent] = useState(() => {
    const savedDay = localStorage.getItem('currentWorkoutDay');
    const dayOfWeek = (new Date().getDay() + 6) % 7; // 0 = Lundi, 6 = Dimanche
    if (savedDay !== null) {
      const savedIndex = parseInt(savedDay, 10);
      const activeWeek = Math.floor(savedIndex / 7);
      return activeWeek * 7 + dayOfWeek;
    }
    return dayOfWeek; // Par défaut, jour de la semaine en cours de la Semaine 1
  });
  const [stepMode, setStepMode] = useState(false);
  const [autoMode, setAutoMode] = useState(false);
  const [viewMode, setViewMode] = useState('workout'); 
  const [darkTheme, setDarkTheme] = useState(true);
  const [showLanguageSelector, setShowLanguageSelector] = useState(() => {
    const savedPref = localStorage.getItem('showLanguageSelector');
    return false;
  });
  
  const [workoutPlan, setWorkoutPlan] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [showExercises, setShowExercises] = useState(false);
  const [appTheme, setAppTheme] = useState(() => createAppTheme(true));

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
    setShowExercises(false);
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
        <img
          src="/logo.png"
          alt="Project Fat Loss"
          className="loading-logo"
        />
        <div className="loading-spinner"></div>
        <p>{t('app.loading')}</p>
      </div>
    );
  }

  const isPlanAvailable = workoutPlan && workoutPlan.length > 0 && current < workoutPlan.length;

  const viewModeToIndex = { workout: 0, history: 1, weight: 2, calorie: 3 };
  const indexToViewMode = ['workout', 'history', 'weight', 'calorie'];

  return (
    <ThemeProvider theme={appTheme}>
      <div className="app" style={{ 
        width: '100%', 
        overflowX: 'hidden', 
        position: 'relative',
        minHeight: '100vh',
        paddingBottom: stepMode ? 0 : '72px',
      }}>
        {!stepMode && (
          <Header 
            onNotificationSettings={() => setShowNotificationSettings(true)} 
            onBack={showExercises ? () => setShowExercises(false) : null} 
          />
        )}
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
                    !showExercises ? (
                      <>
                        <HomeDashboard onStartWorkout={() => setShowExercises(true)} />
                        <WeekSelector
                          days={workoutPlan}
                          current={current}
                          onSelectDay={(dayIndex) => {
                            setCurrent(dayIndex);
                            setShowExercises(true);
                          }}
                        />
                      </>
                    ) : (
                      <div className="day-content">
                        <div className="hero-section">
                          <div className="hero-content">
                            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                              <button
                                onClick={() => setShowExercises(false)}
                                style={{
                                  background: 'rgba(255, 255, 255, 0.08)',
                                  border: '1px solid rgba(255, 255, 255, 0.1)',
                                  color: '#fff',
                                  padding: '8px 18px',
                                  borderRadius: '100px',
                                  fontSize: '0.8rem',
                                  fontWeight: 700,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  cursor: 'pointer',
                                  transition: 'all 0.25s ease',
                                }}
                              >
                                <ArrowLeft size={14} color="#F03D32" strokeWidth={2.5} />
                                <span>PROGRAMME</span>
                              </button>
                            </div>
                            <h2 className="hero-title">{workoutPlan[current].title}</h2>
                            <p className="hero-subtitle">
                              {workoutPlan[current].isRestDay 
                                ? t('restDay.subtitle', { defaultValue: 'Journée de récupération' })
                                : `${workoutPlan[current].exercises.length} EXERCICES • HAUTE INTENSITÉ`}
                            </p>
                          </div>
                          <div className="hero-overlay"></div>
                        </div>
                      
                      {workoutPlan[current].isRestDay ? (
                        /* Affichage jour de repos */
                        <div className="rest-day-card">
                          <Award size={80} color="#4CAF50" style={{ marginBottom: '24px' }} />
                          <h3>{t('restDay.title', { defaultValue: 'REPOS TOTAL' })}</h3>
                          <p>{t('restDay.description', { defaultValue: 'La croissance musculaire a lieu pendant le repos. Hydratez-vous bien et préparez-vous pour demain.' })}</p>
                          <div className="sticky-btn-wrapper">
                            <button
                              className="sticky-start-btn rest-btn"
                              onClick={() => moveToNextDay()}
                            >
                              PASSER AU JOUR SUIVANT
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="exercises-container">
                          {/* Liste d'exercices avec numérotation géante */}
                          <div className="exercise-grid">
                            {workoutPlan[current].exercises.map((exo, index) => (
                              <div key={index} className="exercise-card-premium" style={{ animationDelay: `${index * 0.1}s` }}>
                                <div className="huge-number">{index + 1}</div>
                                <div className="exercise-card-content" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                                  <div style={{ flex: 1 }}>
                                    <h3 className="exo-name" style={{ margin: '0 0 8px 0' }}>{exo.name}</h3>
                                    <div className="exo-tags">
                                      <span className="tag sets-tag">{exo.sets}</span>
                                      {exo.equip && <span className="tag equip-tag">{exo.equip}</span>}
                                    </div>
                                    {exo.desc && <p className="exo-desc" style={{ margin: '8px 0 0 0' }}>{exo.desc}</p>}
                                  </div>
                                  <div style={{ alignSelf: 'center', zIndex: 10 }}>
                                    <YouTubeButton exercise={exo} />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          {/* Sticky Start Button */}
                          <div className="sticky-btn-wrapper">
                            <button 
                              className="sticky-start-btn pulse-glow" 
                              onClick={() => setStepMode(true)}
                            >
                              COMMENCER L'ENTRAÎNEMENT
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                ) : (
                  <StepWorkout 
                      dayIndex={current} 
                      onBack={() => {
                        setStepMode(false);
                        setAutoMode(false);
                      }}
                      onComplete={handleWorkoutComplete}
                      autoMode={autoMode}
                      onNotificationSettings={() => setShowNotificationSettings(true)}
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

          <Fade in={viewMode === 'calorie'} timeout={300} unmountOnExit mountOnEnter>
            <div className="calorie-content">
              <CalorieCounter />
            </div>
          </Fade>
        </div>
        
        {/* Bouton flottant personnaliser - repositionné au-dessus de la bottom nav */}
        {!stepMode && viewMode === 'workout' && !showExercises && (
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
              background: '#F03D32',
              border: 'none',
              color: 'white',
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
              e.currentTarget.style.transform = 'translateY(-3px) scale(1.1)';
              e.currentTarget.style.boxShadow = '0 10px 24px rgba(240, 61, 50, 0.45)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(240, 61, 50, 0.35)';
            }}
          >
            <Settings size={22} />
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
            <Box sx={{ display: 'flex', height: '68px', alignItems: 'stretch' }}>
              <BottomNavigation
                value={viewModeToIndex[viewMode]}
                onChange={(event, newValue) => {
                  setViewMode(indexToViewMode[newValue]);
                }}
                sx={{
                  flex: 1,
                  height: '68px',
                  backgroundColor: 'transparent',
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
                  icon={<Dumbbell size={20} />} 
                  sx={{
                    '&.Mui-selected': {
                      color: (theme) => theme.palette.primary.main,
                    },
                  }}
                />
                <BottomNavigationAction 
                  label={t('nav.history')} 
                  icon={<BarChart2 size={20} />} 
                  sx={{
                    '&.Mui-selected': {
                      color: (theme) => theme.palette.secondary.main,
                    },
                  }}
                />
                <BottomNavigationAction 
                  label={t('nav.weight')} 
                  icon={<Scale size={20} />} 
                  sx={{
                    '&.Mui-selected': {
                      color: '#10B981',
                    },
                  }}
                />
                <BottomNavigationAction 
                  label={t('nav.calorie', { defaultValue: 'Calories' })} 
                  icon={<Apple size={20} />} 
                  sx={{
                    '&.Mui-selected': {
                      color: '#F03D32',
                    },
                  }}
                />
              </BottomNavigation>
            </Box>
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
