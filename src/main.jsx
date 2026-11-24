import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './pages/App';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

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
          backgroundColor: 'var(--bg, #000)',
          color: 'var(--label, #fff)'
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
            <pre style={{ background: 'var(--surface, #1c1c1e)', padding: '10px', borderRadius: '5px', marginTop: '10px' }}>
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

// L'app est sombre uniquement : purge la préférence de thème héritée pour
// qu'aucun ancien 'theme=light' ne subsiste dans le stockage.
try {
  localStorage.removeItem('theme');
} catch (error) {
  console.warn('localStorage non disponible:', error);
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
