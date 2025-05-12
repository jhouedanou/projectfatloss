import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#F03D32',
      light: '#F34430',
      dark: '#6A1D1C',
      contrastText: '#FDF6F0',
    },
    secondary: {
      main: '#F13D30',
      light: '#F6452F',
      dark: '#6A1D1C',
      contrastText: '#FDF6F0',
    },
    background: {
      default: '#FDF6F0',
      paper: '#FDF6F0',
    },
    text: {
      primary: '#6A1D1C',
      secondary: '#F03D32',
    }
  }
});
