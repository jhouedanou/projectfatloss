import { ThemeProvider } from '@mui/material/styles';
import { theme } from './theme/theme';

// ...existing code...

function App() {
  return (
    <ThemeProvider theme={theme}>
      // ...existing code...
    </ThemeProvider>
  );
}

// ...existing code...