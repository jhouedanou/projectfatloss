import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { createAppTheme } from './theme';
import App from './pages/App';
import './index.css';
import './styles/light-theme.css';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import './i18n';
import { registerSW } from 'virtual:pwa-register';
import { initNotificationService } from './services/NotificationService';

// ErrorBoundary simple pour capturer les erreurs de rendu
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Application Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '20px', 
          textAlign: 'center', 
          minHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column', 
          justifyContent: 'center',
          backgroundColor: '#f5f5f5'
        }}>
          <h2>Oops ! Une erreur s'est produite</h2>
          <p>Veuillez rafraîchir la page ou réessayer plus tard.</p>
          <button 
            onClick={() => window.location.reload()} 
            style={{ 
              padding: '10px 20px', 
              backgroundColor: '#F03D32', 
              color: 'white', 
              border: 'none', 
              borderRadius: '5px',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            Rafraîchir la page
          </button>
          <details style={{ marginTop: '20px', textAlign: 'left' }}>
            <summary>Détails de l'erreur</summary>
            <pre style={{ background: '#fff', padding: '10px', borderRadius: '5px', marginTop: '10px' }}>
              {this.state.error?.toString()}
            </pre>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

// Enregistrement du service worker avec gestion d'erreur améliorée
let updateSW = null;
try {
  updateSW = registerSW({
    onNeedRefresh() {
      if (confirm('Une nouvelle version est disponible. Voulez-vous mettre à jour ?')) {
        updateSW && updateSW();
      }
    },
    onOfflineReady() {
      console.log('L\'application est prête pour une utilisation hors ligne');
    },
    onRegisterError(error) {
      console.warn('Erreur enregistrement Service Worker:', error);
    }
  });
} catch (error) {
  console.warn('Service Worker non disponible:', error);
}

// Récupérer le thème initial depuis le localStorage avec fallback
let initialDarkMode = false;
try {
  initialDarkMode = localStorage.getItem('theme') !== 'light';
} catch (error) {
  console.warn('localStorage non disponible:', error);
}

const theme = createAppTheme(initialDarkMode);

// Initialiser le service de notifications de façon plus sûre
const initNotificationsAsync = async () => {
  try {
    // Attendre un peu pour que l'app se charge d'abord
    await new Promise(resolve => setTimeout(resolve, 1000));
    await initNotificationService();
    console.log('Service de notifications initialisé');
  } catch (error) {
    console.warn('Avertissement initialisation notifications:', error);
    // Ne pas bloquer l'application pour les notifications
  }
};

// Lancer l'initialisation sans bloquer
initNotificationsAsync();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
