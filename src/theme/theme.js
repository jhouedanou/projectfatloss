import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#F03D32', // vermilion
      light: '#F34430', // cinnabar
      dark: '#6A1D1C', // rosewood
      contrastText: '#FDF6F0', // seashell
    },
    secondary: {
      main: '#F13D30', // vermilion-2
      light: '#F6452F', // cinnabar-2
      dark: '#6A1D1C', // rosewood
      contrastText: '#FDF6F0', // seashell
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
      default: '#FDF6F0', // seashell
      paper: '#FFFFFF',
    },
    text: {
      primary: '#6A1D1C', // rosewood
      secondary: '#F03D32', // vermilion
    }
  }
});
