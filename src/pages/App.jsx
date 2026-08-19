import React, { useState, useEffect, useMemo } from 'react';
import { Fade } from '@mui/material';
import { Dumbbell, BarChart2, Scale, Play, Settings, Calendar, Award, ArrowLeft, Apple, Bike, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  getActiveWorkoutPlan,
  isVeloEnabled,
  setVeloEnabled,
  dayHasVelo,
  isRideStartEnabled,
  setRideStartEnabled,
} from '../services/WorkoutCustomization';
import StepWorkout from './StepWorkout';
import WorkoutCalendar from '../components/WorkoutCalendar';
import WorkoutStats from '../components/WorkoutStats';
import WeightTracker from '../components/WeightTracker';
import CalorieCounter from '../components/CalorieCounter';
import LanguageSelector from '../components/LanguageSelector';
import WorkoutCustomizer from '../components/WorkoutCustomizer'; 
import NotificationSettingsDialog from '../components/NotificationSettingsDialog';
import ProfileDialog from '../components/ProfileDialog';
import YouTubeButton from '../components/YouTubeButton';
import { initNotificationService } from '../services/NotificationService';
// Import de la synthèse vocale supprimé
import { days as initialWorkoutPlan } from '../data'; 
import '../components/WeightTracker.css';
import '../components/WorkoutCustomizer.css'; 
import HomeExerciseCarousel from '../components/HomeExerciseCarousel';
import HomeDashboard from '../components/HomeDashboard';
import HomeTrackers from '../components/HomeTrackers';
import WeekSelector from '../components/WeekSelector';
import Header from '../components/Header/Header';
import { getServiceWorkerPath, getAssetPath } from '../utils/paths';
import { hasContactInfo, sendWorkoutReport, getContactInfo } from '../services/ContactService';
import { getWeightHistory } from '../services/WeightStorage';
import { onAuthChange, signOut } from '../services/AuthService';
import { fullSync } from '../services/SyncService';
import LoginForm from '../components/LoginForm';
import CardioTracker from '../components/CardioTracker';

const NOTIFICATION_DURATION = 3000;

/** Ligne de réglage on/off utilisée pour les options vélo de la page séance. */
function SettingToggle({ icon, title, subtitle, checked, onToggle, ariaLabel }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px',
      padding: '14px 16px',
      margin: '0 0 12px 0',
      borderRadius: 'var(--r-card)',
      background: 'var(--surface)',
      border: 'none',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
        {icon}
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary, #fff)' }}>
            {title}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #a1a1aa)' }}>
            {subtitle}
          </div>
        </div>
      </div>
      <button
        onClick={onToggle}
        role="switch"
        aria-checked={checked}
        aria-label={ariaLabel}
        style={{
          position: 'relative',
          width: '48px',
          height: '28px',
          flexShrink: 0,
          borderRadius: '100px',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          background: checked ? 'var(--ok)' : 'var(--surface-3)',
          transition: 'background 0.25s ease',
        }}
      >
        <span style={{
          position: 'absolute',
          top: '3px',
          left: checked ? '23px' : '3px',
          width: '22px',
          height: '22px',
          borderRadius: '50%',
          background: '#fff',
          transition: 'left 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
        }} />
      </button>
    </div>
  );
}

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
  const [showLanguageSelector, setShowLanguageSelector] = useState(() => {
    const savedPref = localStorage.getItem('showLanguageSelector');
    return false;
  });
  
  const [workoutPlan, setWorkoutPlan] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showExercises, setShowExercises] = useState(false);
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  // Vélo de fin de séance optionnel (réglage global mémorisé)
  const [veloEnabled, setVeloEnabledState] = useState(() => isVeloEnabled());
  // Sortie vélo en ouverture de séance (vidéo + vélo connecté)
  const [rideStartEnabled, setRideStartEnabledState] = useState(() => isRideStartEnabled());
  // Le jour courant propose-t-il un vélo (dans le plan brut) ? Sinon pas d'interrupteur.
  const currentDayHasVelo = useMemo(() => dayHasVelo(current), [current, showCustomizer]);

  // Auth Supabase : suit l'état de connexion et synchronise à la connexion
  useEffect(() => {
    const unsubscribe = onAuthChange((u) => {
      setUser(u);
      if (u) {
        setShowLogin(false);
        // Pull + merge + push à la connexion (offline-first)
        fullSync()
          .then(() => console.log('Synchronisation Supabase terminée'))
          .catch((e) => console.warn('Sync échouée:', e?.message));
      }
    });
    return unsubscribe;
  }, []);

  const handleLogout = async () => {
    await signOut();
    setUser(null);
  };

  useEffect(() => {
    try {
      setIsLoading(true);
      const plan = getActiveWorkoutPlan();
      
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
      const plan = getActiveWorkoutPlan();
      if (plan && plan.length > 0) {
        setWorkoutPlan(plan);
      }
    } catch (error) {
      console.error('Erreur lors du rechargement du plan:', error);
    }
  };

  // Recharge le programme affiché après un changement de réglage vélo.
  const reloadActivePlan = () => {
    try {
      const plan = getActiveWorkoutPlan();
      if (plan && plan.length > 0) {
        setWorkoutPlan(plan);
      }
    } catch (error) {
      console.error('Erreur lors du rechargement du plan:', error);
    }
  };

  // Active/désactive le vélo de fin de séance et recharge le plan affiché.
  const handleToggleVelo = () => {
    const next = !veloEnabled;
    setVeloEnabledState(next);
    setVeloEnabled(next);
    reloadActivePlan();
  };

  // Active/désactive la sortie vélo d'ouverture. Quand elle est active, le vélo
  // de fin de séance sort du programme : c'est le même effort, déplacé.
  const handleToggleRideStart = () => {
    const next = !rideStartEnabled;
    setRideStartEnabledState(next);
    setRideStartEnabled(next);
    reloadActivePlan();
  };

  useEffect(() => {
    localStorage.setItem('currentWorkoutDay', current.toString());
  }, [current]);

  useEffect(() => {
    localStorage.setItem('showLanguageSelector', showLanguageSelector);
  }, [showLanguageSelector]);

  // Initialisation de la synthèse vocale supprimée

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

  // Bouton Start central : lance la séance du jour (un jour de repos ouvre
  // simplement la carte repos — mêmes sémantiques que le bouton de la vue jour).
  const handleStartSession = () => {
    setViewMode('workout');
    setShowExercises(true);
    if (workoutPlan && workoutPlan.length > 0 && current < workoutPlan.length
        && !workoutPlan[current].isRestDay) {
      setStepMode(true);
    }
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
          src={getAssetPath('/logo.png')}
          alt="Project Fat Loss"
          className="loading-logo"
        />
        <div className="loading-spinner"></div>
        <p>{t('app.loading')}</p>
      </div>
    );
  }

  const isPlanAvailable = workoutPlan && workoutPlan.length > 0 && current < workoutPlan.length;

  return (
    <>
      <div className="app" style={{
        width: '100%',
        overflowX: 'hidden',
        position: 'relative',
        minHeight: '100dvh',
        paddingBottom: stepMode ? 0 : 'calc(94px + env(safe-area-inset-bottom))',
      }}>
        {!stepMode && (
          <Header
            onNotificationSettings={() => setShowNotificationSettings(true)}
            onProfile={() => setShowProfile(true)}
            onBack={showExercises ? () => setShowExercises(false) : null}
            user={user}
            onAccountClick={() => (user ? handleLogout() : setShowLogin(true))}
          />
        )}

        {/* Modale de connexion */}
        {showLogin && !user && (
          <div
            onClick={() => setShowLogin(false)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 2000,
              background: 'rgba(0,0,0,0.55)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
            }}
          >
            <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: '400px' }}>
              <LoginForm onClose={() => setShowLogin(false)} />
            </div>
          </div>
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
                        <HomeTrackers />

                        {/* Lien rapide Cardio (sorti de la barre d'onglets) */}
                        <div className="home-quicklinks">
                          <button className="card press home-quicklink" onClick={() => setViewMode('cardio')}>
                            <span className="home-quicklink-tile"><Bike size={20} /></span>
                            <span className="home-quicklink-copy">
                              <span className="home-quicklink-title">Cardio</span>
                              <span className="home-quicklink-sub">Sorties vélo & marche à la demande</span>
                            </span>
                            <ChevronRight size={18} className="home-quicklink-chevron" />
                          </button>
                        </div>

                        {/* En-tête de section programme + accès personnalisation */}
                        <div className="section-head">
                          <h2 className="section-title">Programme</h2>
                          <button className="btn-soft" onClick={() => setShowCustomizer(true)}>
                            <Settings size={15} /> Personnaliser
                          </button>
                        </div>
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
                            <button className="btn-soft hero-back" onClick={() => setShowExercises(false)}>
                              <ArrowLeft size={14} strokeWidth={2.5} />
                              <span>Programme</span>
                            </button>
                            <h2 className="hero-title">{workoutPlan[current].title.replace(/^JOUR \d+:\s*/i, '').split(' — ')[0]}</h2>
                            <p className="hero-subtitle">
                              {workoutPlan[current].isRestDay
                                ? t('restDay.subtitle', { defaultValue: 'Journée de récupération' })
                                : `Jour ${current + 1} · ${workoutPlan[current].exercises.length} exercices · ~1 h`}
                            </p>
                          </div>
                        </div>
                      
                      {workoutPlan[current].isRestDay ? (
                        /* Affichage jour de repos */
                        <div className="rest-day-card">
                          <Award size={72} color="var(--ok)" style={{ marginBottom: '24px' }} />
                          <h3>{t('restDay.title', { defaultValue: 'Repos total' })}</h3>
                          <p>{t('restDay.description', { defaultValue: 'La croissance musculaire a lieu pendant le repos. Hydratez-vous bien et préparez-vous pour demain.' })}</p>
                          <div className="sticky-btn-wrapper">
                            <button
                              className="sticky-start-btn rest-btn"
                              onClick={() => moveToNextDay()}
                            >
                              Passer au jour suivant
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="exercises-container">
                          {/* Sortie vélo d'ouverture : vidéo + vélo connecté.
                              Proposée uniquement si le jour contient du vélo (plan
                              personnalisé) — le programme par défaut est 100 % muscu. */}
                          {currentDayHasVelo && (
                            <SettingToggle
                              icon={<Bike size={20} color={rideStartEnabled ? '#3B82F6' : '#71717a'} />}
                              title="Sortie vélo en début de séance"
                              subtitle={rideStartEnabled
                                ? 'Vidéo + vélo connecté avant la muscu (remplace le vélo de fin)'
                                : 'La séance commence directement par la muscu'}
                              checked={rideStartEnabled}
                              onToggle={handleToggleRideStart}
                              ariaLabel="Activer ou désactiver la sortie vélo en début de séance"
                            />
                          )}

                          {/* Interrupteur : vélo de fin de séance optionnel */}
                          {currentDayHasVelo && !rideStartEnabled && (
                            <SettingToggle
                              icon={<Bike size={20} color={veloEnabled ? '#3B82F6' : '#71717a'} />}
                              title="Vélo en fin de séance"
                              subtitle={veloEnabled ? 'Inclus dans la séance' : 'Retiré de la séance'}
                              checked={veloEnabled}
                              onToggle={handleToggleVelo}
                              ariaLabel="Activer ou désactiver le vélo de fin de séance"
                            />
                          )}

                          {/* Liste groupée des exercices */}
                          <div className="exercise-list card">
                            {workoutPlan[current].exercises.map((exo, index) => (
                              <div key={index} className="exercise-row">
                                <span className="exercise-row-num">{index + 1}</span>
                                <div className="exercise-row-copy">
                                  <h3 className="exercise-row-name">{exo.name}</h3>
                                  <span className="exercise-row-meta">
                                    {exo.sets}{exo.equip ? ` · ${exo.equip}` : ''}
                                  </span>
                                  {exo.desc && <p className="exercise-row-desc">{exo.desc}</p>}
                                </div>
                                <div className="exercise-row-action">
                                  <YouTubeButton exercise={exo} />
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Sticky Start Button */}
                          <div className="sticky-btn-wrapper">
                            <button
                              className="sticky-start-btn"
                              onClick={() => setStepMode(true)}
                            >
                              <Play size={18} fill="currentColor" />
                              Commencer l'entraînement
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

          <Fade in={viewMode === 'cardio'} timeout={300} unmountOnExit mountOnEnter>
            <div className="cardio-content">
              <CardioTracker />
            </div>
          </Fade>
        </div>
        
        {/* Barre d'onglets — 2+2 autour du bouton Start central, cachée en séance */}
        {!stepMode && (
          <nav className="tabbar">
            <button
              className={`tabbar-tab${viewMode === 'workout' ? ' active' : ''}`}
              onClick={() => { setViewMode('workout'); setShowExercises(false); }}
            >
              <Dumbbell size={22} />
              <span>{t('nav.workout')}</span>
            </button>
            <button
              className={`tabbar-tab${viewMode === 'history' ? ' active' : ''}`}
              onClick={() => setViewMode('history')}
            >
              <BarChart2 size={22} />
              <span>{t('nav.history')}</span>
            </button>
            <button
              className="tabbar-start"
              aria-label="Démarrer la séance du jour"
              onClick={handleStartSession}
            >
              <Play size={26} fill="currentColor" />
            </button>
            <button
              className={`tabbar-tab${viewMode === 'calorie' ? ' active' : ''}`}
              onClick={() => setViewMode('calorie')}
            >
              <Apple size={22} />
              <span>{t('nav.calorie', { defaultValue: 'Nutrition' })}</span>
            </button>
            <button
              className={`tabbar-tab${viewMode === 'weight' ? ' active' : ''}`}
              onClick={() => setViewMode('weight')}
            >
              <Scale size={22} />
              <span>{t('nav.weight')}</span>
            </button>
          </nav>
        )}

        {/* Boîte de dialogue des paramètres de notification */}
        <NotificationSettingsDialog
          open={showNotificationSettings}
          onClose={() => setShowNotificationSettings(false)}
        />

        {/* Boîte de dialogue du profil (poids, taille, âge, sexe) */}
        <ProfileDialog
          open={showProfile}
          onClose={() => setShowProfile(false)}
        />
      </div>
    </>
  );
}
