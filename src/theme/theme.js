import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#F03D32', // vermilion
      light: '#F34430', // cinnabar
      dark: '#6A1D1C', // rosewood
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#F13D30', // vermilion-2
      light: '#F6452F', // cinnabar-2
      dark: '#6A1D1C', // rosewood
      contrastText: '#FFFFFF',
    },
    success: {
      light: '#F6452F', // cinnabar-2
      main: '#F03D32', // vermilion
      dark: '#6A1D1C', // rosewood
    },
    error: {
      light: '#F34430', // cinnabar
      main: '#F03D32', // vermilion
      dark: '#6A1D1C', // rosewood
    },
    background: {
      default: '#000000',
      paper: '#121212',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#F03D32', // vermilion
    }
  }
});
