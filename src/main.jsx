import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { createAppTheme } from './theme';
import App from './pages/App';
import './index.css';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import './i18n';
import { registerSW } from 'virtual:pwa-register';

// Enregistrement du service worker avec mise à jour automatique
const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('Une nouvelle version est disponible. Voulez-vous mettre à jour ?')) {
      updateSW();
    }
  },
  onOfflineReady() {
    console.log('L\'application est prête pour une utilisation hors ligne');
  },
});

// Récupérer le thème initial depuis le localStorage
const initialDarkMode = localStorage.getItem('theme') !== 'light';
const theme = createAppTheme(initialDarkMode);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
