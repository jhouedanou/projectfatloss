import React, { useState, useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';
import { createAppTheme } from '../theme';
import { useTranslation } from 'react-i18next';
import { getWorkoutPlan } from '../services/WorkoutCustomization'; // Importer le service de personnalisation
import StepWorkout from './StepWorkout';
import WorkoutCalendar from '../components/WorkoutCalendar';
import WorkoutStats from '../components/WorkoutStats';
import WeightTracker from '../components/WeightTracker';
import LanguageSelector from '../components/LanguageSelector';
import WorkoutCustomizer from '../components/WorkoutCustomizer'; // Importer le composant de personnalisation
import LoginForm from '../components/LoginForm'; // Importer le formulaire de connexion
import SyncPanel from '../components/SyncPanel'; // Importer le panneau de synchronisation
import { getCurrentUser } from '../services/AuthService'; // Importer le service d'authentification
// Importer les données initiales au cas où le chargement échoue
import { days as initialWorkoutPlan } from '../data'; 
import '../components/WeightTracker.css';
import '../components/WorkoutCustomizer.css'; // Importer les styles CSS
import '../components/LoginForm.css'; // Importer les styles CSS du formulaire de connexion
import '../components/SyncPanel.css'; // Importer les styles CSS du panneau de synchronisation
import HomeExerciseCarousel from '../components/HomeExerciseCarousel';
import DayPills from '../components/DayPills';

function Tabs({ days, current, setCurrent }) {
  if (!days || days.length === 0) {
    return null;
  }

  return <DayPills days={days} current={current} setCurrent={setCurrent} />;
}

export default function App() {
  const { t } = useTranslation();
  // Restaurer le jour actuel depuis localStorage
  const [current, setCurrent] = useState(() => {
    const savedDay = localStorage.getItem('currentWorkoutDay');
    return savedDay !== null ? parseInt(savedDay, 10) : 0;
  });
  const [stepMode, setStepMode] = useState(false);
  const [viewMode, setViewMode] = useState('workout'); // 'workout', 'history' ou 'weight'
  const [darkTheme, setDarkTheme] = useState(
    localStorage.getItem('theme') !== 'light' // Par défaut en mode sombre si pas de préférence
  );
  // État pour contrôler l'affichage du sélecteur de langue
  const [showLanguageSelector, setShowLanguageSelector] = useState(() => {
    const savedPref = localStorage.getItem('showLanguageSelector');
    // Toujours masquer le sélecteur de langue selon la demande
    return false;
  });
  
  // État pour le mode d'urgence "Fat Burner"
  const [fatBurnerMode, setFatBurnerMode] = useState(false);
  
  // État pour le programme d'entraînement personnalisé, initialiser avec un tableau vide
  const [workoutPlan, setWorkoutPlan] = useState([]);
  // État de chargement pour indiquer si le plan est prêt
  const [isLoading, setIsLoading] = useState(true);
  
  // État pour afficher/masquer le customizer
  const [showCustomizer, setShowCustomizer] = useState(false);
  
  // État pour l'authentification et la synchronisation
  const [user, setUser] = useState(null);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showSyncPanel, setShowSyncPanel] = useState(false);
  
  // État pour le thème Material UI
  const [appTheme, setAppTheme] = useState(() => createAppTheme(
    localStorage.getItem('theme') !== 'light'
  ));

  // Charger l'utilisateur connecté au démarrage
  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);
  
  // Charger le programme d'entraînement personnalisé
  useEffect(() => {
    try {
      setIsLoading(true);
      // Essayer de charger le plan personnalisé
      const plan = getWorkoutPlan();
      
      // Si le plan est vide ou invalide, utiliser le plan initial
      if (!plan || plan.length === 0) {
        setWorkoutPlan(initialWorkoutPlan);
      } else {
        setWorkoutPlan(plan);
      }
    } catch (error) {
      console.error('Erreur lors du chargement du plan d\'entraînement:', error);
      // En cas d'erreur, utiliser le plan initial
      setWorkoutPlan(initialWorkoutPlan);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // S'assurer que l'index current est valide
  useEffect(() => {
    if (!isLoading && workoutPlan.length > 0 && current >= workoutPlan.length) {
      setCurrent(0);
    }
  }, [workoutPlan, current, isLoading]);
  
  // Rafraîchir le programme quand le customizer est fermé
  const handleCloseCustomizer = () => {
    setShowCustomizer(false);
    // Recharger le programme mis à jour
    try {
      const plan = getWorkoutPlan();
      if (plan && plan.length > 0) {
        setWorkoutPlan(plan);
      }
    } catch (error) {
      console.error('Erreur lors du rechargement du plan:', error);
    }
  };
  
  // Gestion du login
  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setShowLoginForm(false);
    setShowSyncPanel(true); // Afficher le panneau de synchronisation après connexion
  };
  
  // Gestion du logout
  const handleLogout = () => {
    setUser(null);
    setShowSyncPanel(false);
  };
  
  // Gestion de la synchronisation complète
  const handleSyncComplete = () => {
    // Recharger les données après synchronisation
    try {
      const plan = getWorkoutPlan();
      if (plan && plan.length > 0) {
        setWorkoutPlan(plan);
      }
    } catch (error) {
      console.error('Erreur lors du rechargement du plan après synchronisation:', error);
    }
  };
  
  // Sauvegarder le jour actuel dans localStorage quand il change
  useEffect(() => {
    localStorage.setItem('currentWorkoutDay', current.toString());
  }, [current]);

  useEffect(() => {
    // Appliquer le thème à chaque changement
    if (darkTheme) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
    localStorage.setItem('darkTheme', darkTheme);
    // Mettre à jour le thème Material UI
    setAppTheme(createAppTheme(darkTheme));
  }, [darkTheme]);

  // Sauvegarder la préférence du sélecteur de langue dans localStorage
  useEffect(() => {
    localStorage.setItem('showLanguageSelector', showLanguageSelector);
  }, [showLanguageSelector]);

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
    // S'assurer que workoutPlan est chargé et non vide
    if (workoutPlan && workoutPlan.length > 0) {
      // Passer au jour suivant en suivant la séquence de 7 jours
      setCurrent(prev => (prev + 1) % workoutPlan.length);
    }
    setStepMode(false); // Réinitialiser en mode non-étape
  };
  
  const handleWorkoutComplete = (workoutData) => {
    // Cette fonction sera passée à StepWorkout pour enregistrer les données d'entraînement
    // lorsqu'une séance est terminée
    console.log('Entraînement terminé:', workoutData);
    
    // Affichage d'une notification si l'API est disponible
    if ("Notification" in window && Notification.permission === "granted" && workoutPlan && workoutPlan.length > 0) {
      new Notification(t('notifications.workoutComplete'), {
        body: t('notifications.nextDay', { day: (current + 1) % workoutPlan.length + 1 }),
        icon: '/favicon.ico'
      });
    }
    
    // Passage automatique au jour suivant d'entraînement
    moveToNextDay();
    
    // Après l'enregistrement, passer à la vue historique
    setViewMode('history');
  };
  
  // Demander la permission pour les notifications lors du premier chargement
  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "denied") {
      Notification.requestPermission();
    }
  }, []);

  // Afficher un indicateur de chargement si nécessaire
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>{t('app.loading')}</p>
      </div>
    );
  }

  // Vérifier si le plan d'entraînement est disponible
  const isPlanAvailable = workoutPlan && workoutPlan.length > 0 && current < workoutPlan.length;

  return (
    <ThemeProvider theme={appTheme}>
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
        
        {/* Menu de configuration - ajouté pour permettre de masquer le sélecteur de langue */}
        <div className="settings-bar">
          {/* Bouton du sélecteur de langue masqué selon la demande */}
          {/* <button 
            className="settings-button"
            onClick={toggleLanguageSelector}
            title={showLanguageSelector ? t('settings.hideLanguage') : t('settings.showLanguage')}
          >
            {showLanguageSelector ? t('settings.hideLanguage') : t('settings.showLanguage')} 🌐
          </button> */}
          
          {/* Bouton pour le mode Fat Burner */}
          <button 
            className={`settings-button ${fatBurnerMode ? 'active-mode' : ''}`}
            onClick={toggleFatBurnerMode}
            title={t('settings.fatBurnerMode')}
          >
            {t('settings.fatBurner')} 🔥
          </button>
          
          {/* Bouton pour personnaliser le programme */}
          <button 
            className="settings-button"
            onClick={() => setShowCustomizer(true)}
            title={t('settings.customizeProgram')}
          >
            {t('settings.customize')} ⚙️
          </button>
          
          {/* Bouton pour se connecter/synchroniser */}
          {user ? (
            <button 
              className="settings-button sync-toggle-button"
              onClick={() => setShowSyncPanel(!showSyncPanel)}
              title={t('settings.sync')}
            >
              {t('settings.sync')} ☁️
            </button>
          ) : (
            <button 
              className="settings-button"
              onClick={() => setShowLoginForm(true)}
              title={t('auth.login')}
            >
              {t('auth.login')} 🔒
            </button>
          )}
        </div>
        
        {/* Sélecteur de langue */}
        {showLanguageSelector && <LanguageSelector />}
        
        {/* Formulaire de connexion */}
        {showLoginForm && <LoginForm onLoginSuccess={handleLoginSuccess} onClose={() => setShowLoginForm(false)} />}
        
        {/* Panneau de synchronisation */}
        {showSyncPanel && user && (
          <SyncPanel 
            user={user}
            onLogout={handleLogout}
            onSyncComplete={handleSyncComplete}
          />
        )}
        
        {/* Customizer de programme */}
        {showCustomizer && <WorkoutCustomizer onClose={handleCloseCustomizer} />}
        
        {viewMode === 'workout' ? (
          <>
            {isPlanAvailable && (
              <>
                {!stepMode ? (
                  <div className="day-content">
                    {/* Sélecteur de jour */}
                    <DayPills days={workoutPlan} current={current} setCurrent={setCurrent} />
                    <h2 style={{ fontSize: '1.1rem', marginBottom: 16 }}>{workoutPlan[current].title}</h2>
                    {/* Bannière Fat Burner */}
                    {fatBurnerMode && (
                      <div className="fat-burner-banner">
                        <span className="fat-burner-icon">🔥</span>
                        <span className="fat-burner-text">{t('mode.fatBurner')}</span>
                      </div>
                    )}
                    <button className="timer-btn" style={{marginBottom:16}} onClick={()=>setStepMode(true)}>
                      {t('workout.start')}
                    </button>
                    {/* Carousel des exercices du jour */}
                    <HomeExerciseCarousel exercises={workoutPlan[current].exercises} />
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
    </ThemeProvider>
  );
}
