import { createTheme } from '@mui/material/styles';

// Fonction pour créer un thème avec mode clair ou sombre
export const createAppTheme = (darkMode) => createTheme({
  palette: {
    mode: darkMode ? 'dark' : 'light',
    primary: {
      light: '#536DFE', // Bleu indigo clair
      main: '#3949AB', // Bleu indigo
      dark: '#1A237E', // Bleu indigo foncé
      contrastText: '#FDF6F0', // seashell
    },
    secondary: {
      light: '#80CBC4', // Vert-bleu clair
      main: '#455A64', // Bleu-gris
      dark: '#263238', // Bleu-gris foncé
      contrastText: '#FDF6F0', // seashell
    },
    success: {
      light: '#66BB6A', // Vert clair
      main: '#2E7D32', // Vert
      dark: '#1B5E20', // Vert foncé
    },
    error: {
      light: '#EF9A9A', // Rouge clair
      main: '#D32F2F', // Rouge
      dark: '#B71C1C', // Rouge foncé
    },
    background: {
      default: darkMode ? '#000000' : '#FDF6F0', // Noir en mode sombre, seashell en mode clair
      paper: darkMode ? '#1e1e30' : '#FFFFFF',
    },
    text: {
      primary: darkMode ? '#FDF6F0' : '#263238', // seashell en sombre, bleu-gris foncé en clair
      secondary: darkMode ? '#90CAF9' : '#455A64', // bleu clair en sombre, bleu-gris en clair
    },
  },
  typography: {
    fontFamily: '"Roboto", "Inter", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 500,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.43,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          textTransform: 'none',
          fontWeight: 500,
          padding: '8px 16px',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
});