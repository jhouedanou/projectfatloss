import { createTheme } from '@mui/material/styles';

// Palette de couleurs Project Fat Loss
const COLORS = {
  // Couleur principale - Rouge/Orange de l'app
  primary: {
    50: '#FFF3F0',
    100: '#FFEBE5',
    200: '#FFD1CC',
    300: '#FFB8B3',
    400: '#FF8A7A',
    500: '#F03D32', // Couleur principale
    600: '#E02A1F',
    700: '#C41E0B',
    800: '#A11708',
    900: '#7A1306',
  },
  
  // Couleur secondaire - Orange chaud
  secondary: {
    50: '#FFF7F0',
    100: '#FFEDE0',
    200: '#FFD6B3',
    300: '#FFBF85',
    400: '#FF9147',
    500: '#FF6B35', // Orange secondaire
    600: '#F55A24',
    700: '#E04A15',
    800: '#CC3A0A',
    900: '#B32D00',
  },
  
  // Couleurs de support
  neutral: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
  
  // Couleurs sémantiques
  success: {
    50: '#E8F5E8',
    100: '#C8E6C9',
    500: '#4CAF50',
    600: '#43A047',
    700: '#388E3C',
  },
  
  warning: {
    50: '#FFF8E1',
    100: '#FFECB3',
    500: '#FF9800',
    600: '#FB8C00',
    700: '#F57C00',
  },
  
  error: {
    50: '#FFEBEE',
    100: '#FFCDD2',
    500: '#F44336',
    600: '#E53935',
    700: '#D32F2F',
  },
  
  info: {
    50: '#E3F2FD',
    100: '#BBDEFB',
    500: '#2196F3',
    600: '#1E88E5',
    700: '#1976D2',
  }
};

// Fonction pour créer un thème avec mode clair ou sombre
export const createAppTheme = (darkMode) => createTheme({
  palette: {
    mode: darkMode ? 'dark' : 'light',
    primary: {
      light: COLORS.primary[300],
      main: COLORS.primary[500],
      dark: COLORS.primary[700],
      contrastText: '#FFFFFF',
    },
    secondary: {
      light: COLORS.secondary[300],
      main: COLORS.secondary[500],
      dark: COLORS.secondary[700],
      contrastText: '#FFFFFF',
    },
    success: {
      light: COLORS.success[100],
      main: COLORS.success[500],
      dark: COLORS.success[700],
      contrastText: '#FFFFFF',
    },
    warning: {
      light: COLORS.warning[100],
      main: COLORS.warning[500],
      dark: COLORS.warning[700],
      contrastText: '#FFFFFF',
    },
    error: {
      light: COLORS.error[100],
      main: COLORS.error[500],
      dark: COLORS.error[700],
      contrastText: '#FFFFFF',
    },
    info: {
      light: COLORS.info[100],
      main: COLORS.info[500],
      dark: COLORS.info[700],
      contrastText: '#FFFFFF',
    },
    background: {
      default: darkMode ? '#0A0A0A' : '#FAFAFA',
      paper: darkMode ? '#1A1A1A' : '#FFFFFF',
      secondary: darkMode ? '#2A2A2A' : COLORS.neutral[50],
    },
    text: {
      primary: darkMode ? '#FFFFFF' : COLORS.neutral[900],
      secondary: darkMode ? COLORS.neutral[300] : COLORS.neutral[600],
      disabled: darkMode ? COLORS.neutral[600] : COLORS.neutral[400],
    },
    divider: darkMode ? COLORS.neutral[800] : COLORS.neutral[200],
    // Couleurs personnalisées pour l'app
    gradient: {
      primary: `linear-gradient(45deg, ${COLORS.primary[500]} 30%, ${COLORS.secondary[500]} 90%)`,
      secondary: `linear-gradient(135deg, ${COLORS.secondary[400]} 0%, ${COLORS.primary[600]} 100%)`,
      success: `linear-gradient(45deg, ${COLORS.success[500]} 30%, ${COLORS.success[600]} 90%)`,
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.01562em',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: '-0.00833em',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
      letterSpacing: '0.00938em',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
      letterSpacing: '0.01071em',
    },
    button: {
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.75,
      letterSpacing: '0.02857em',
      textTransform: 'none',
    },
    caption: {
      fontSize: '0.75rem',
      lineHeight: 1.66,
      letterSpacing: '0.03333em',
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0px 2px 4px rgba(0, 0, 0, 0.05)',
    '0px 4px 8px rgba(0, 0, 0, 0.1)',
    '0px 8px 16px rgba(0, 0, 0, 0.1)',
    '0px 12px 24px rgba(0, 0, 0, 0.15)',
    '0px 16px 32px rgba(0, 0, 0, 0.15)',
    // ... autres ombres
    ...Array(19).fill('0px 16px 32px rgba(0, 0, 0, 0.15)'),
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          textTransform: 'none',
          fontWeight: 600,
          padding: '12px 24px',
          fontSize: '0.95rem',
          transition: 'all 0.2s ease-in-out',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'translateY(0px)',
          },
        },
        contained: {
          background: `linear-gradient(45deg, ${COLORS.primary[500]} 30%, ${COLORS.secondary[500]} 90%)`,
          '&:hover': {
            background: `linear-gradient(45deg, ${COLORS.primary[600]} 30%, ${COLORS.secondary[600]} 90%)`,
          },
        },
        outlined: {
          borderWidth: '2px',
          '&:hover': {
            borderWidth: '2px',
          },
        },
        text: {
          '&:hover': {
            backgroundColor: 'rgba(240, 61, 50, 0.04)',
          },
        },
      },
      variants: [
        {
          props: { variant: 'gradient' },
          style: {
            background: `linear-gradient(45deg, ${COLORS.primary[500]} 30%, ${COLORS.secondary[500]} 90%)`,
            color: '#FFFFFF',
            '&:hover': {
              background: `linear-gradient(45deg, ${COLORS.primary[600]} 30%, ${COLORS.secondary[600]} 90%)`,
              boxShadow: '0px 6px 20px rgba(240, 61, 50, 0.3)',
            },
          },
        },
      ],
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.05)',
          border: `1px solid ${darkMode ? COLORS.neutral[800] : COLORS.neutral[200]}`,
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.1)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          fontWeight: 500,
        },
        filled: {
          '&.MuiChip-colorPrimary': {
            background: `linear-gradient(45deg, ${COLORS.primary[500]} 30%, ${COLORS.secondary[500]} 90%)`,
            color: '#FFFFFF',
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          border: 'none',
        },
        standardSuccess: {
          backgroundColor: COLORS.success[50],
          color: COLORS.success[700],
          '& .MuiAlert-icon': {
            color: COLORS.success[600],
          },
        },
        standardError: {
          backgroundColor: COLORS.error[50],
          color: COLORS.error[700],
          '& .MuiAlert-icon': {
            color: COLORS.error[600],
          },
        },
        standardWarning: {
          backgroundColor: COLORS.warning[50],
          color: COLORS.warning[700],
          '& .MuiAlert-icon': {
            color: COLORS.warning[600],
          },
        },
        standardInfo: {
          backgroundColor: COLORS.info[50],
          color: COLORS.info[700],
          '& .MuiAlert-icon': {
            color: COLORS.info[600],
          },
        },
      },
    },
    MuiStepLabel: {
      styleOverrides: {
        iconContainer: {
          '& .Mui-active': {
            color: COLORS.primary[500],
          },
          '& .Mui-completed': {
            color: COLORS.success[500],
          },
        },
      },
    },
  },
});

// Export des couleurs pour utilisation directe
export { COLORS };