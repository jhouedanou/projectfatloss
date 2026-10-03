import { createTheme } from '@mui/material/styles';

/**
 * Thème MUI unique — sombre uniquement, aligné sur les tokens CSS
 * d'index.css (style iOS-dark : noir pur, surfaces #1c1c1e, hairlines,
 * accent rouge plat, aucun gradient, aucune ombre décorative).
 */
export const appTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#F03D32',
      dark: '#c9271d',
      light: '#F03D32',
      contrastText: '#fff',
    },
    // Les usages résiduels de color="secondary" restent sur l'accent.
    secondary: {
      main: '#F03D32',
      dark: '#c9271d',
      contrastText: '#fff',
    },
    success: { main: '#30d158' },
    warning: { main: '#ff9f0a' },
    error: { main: '#ff453a' },
    info: { main: '#0a84ff' },
    background: {
      default: '#000000',
      paper: '#1c1c1e',
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(235, 235, 245, .6)',
      disabled: 'rgba(235, 235, 245, .32)',
    },
    divider: 'rgba(84, 84, 88, .6)',
  },
  shape: {
    borderRadius: 14,
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
    h1: { fontSize: '2.125rem', fontWeight: 800, letterSpacing: '-.02em', fontFamily: '"Outfit", "Inter", sans-serif' },
    h2: { fontSize: '1.5rem', fontWeight: 600, letterSpacing: '-.01em' },
    h3: { fontSize: '1.25rem', fontWeight: 600, letterSpacing: '-.01em' },
    h4: { fontSize: '1.0625rem', fontWeight: 600 },
    h5: { fontSize: '1rem', fontWeight: 600 },
    h6: { fontSize: '.875rem', fontWeight: 600 },
    body1: { fontSize: '1.0625rem', lineHeight: 1.45, letterSpacing: '-.01em' },
    body2: { fontSize: '.9375rem', lineHeight: 1.4 },
    button: { fontWeight: 600, textTransform: 'none', letterSpacing: 0 },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        // Tue la teinte d'élévation MUI en mode sombre : une seule
        // valeur de surface dans toute l'app.
        root: { backgroundImage: 'none' },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: 'none',
          transition: 'transform 140ms cubic-bezier(.32,.72,0,1), background-color 140ms cubic-bezier(.32,.72,0,1)',
          '&:hover': { boxShadow: 'none' },
          '&:active': { transform: 'scale(.98)' },
        },
        contained: {
          background: '#F03D32',
          color: '#fff',
          '&:hover': { background: '#c9271d', boxShadow: 'none' },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#1c1c1e',
          borderRadius: 14,
          border: 'none',
          boxShadow: 'none',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: '#1c1c1e',
          backgroundImage: 'none',
          borderRadius: 16,
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: { backgroundColor: '#1c1c1e', backgroundImage: 'none', borderRadius: 12 },
      },
    },
    MuiPopover: {
      styleOverrides: {
        paper: { backgroundColor: '#1c1c1e', backgroundImage: 'none' },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 8, fontWeight: 600 },
        colorPrimary: { background: '#F03D32', color: '#fff' },
      },
    },
    MuiAlert: {
      styleOverrides: {
        standardSuccess: { backgroundColor: 'rgba(48, 209, 88, .16)', color: '#30d158' },
        standardError: { backgroundColor: 'rgba(255, 69, 58, .16)', color: '#ff453a' },
        standardWarning: { backgroundColor: 'rgba(255, 159, 10, .16)', color: '#ff9f0a' },
        standardInfo: { backgroundColor: 'rgba(10, 132, 255, .16)', color: '#0a84ff' },
      },
    },
  },
});
