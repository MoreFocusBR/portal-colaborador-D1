import React from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ptBR } from '@mui/material/locale';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR as ptBRLocale } from 'date-fns/locale';
import { NotificationProvider } from '../Notification/NotificationSystem';

// Definindo o tema personalizado
const theme = createTheme(
  {
    palette: {
      primary: {
        main: '#000000',
      },
      secondary: {
        main: '#ff571f',
      },
      background: {
        default: '#f5f5f5',
      },
    },
    typography: {
      fontFamily: [
        'Roboto',
        'Arial',
        'sans-serif',
      ].join(','),
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
          },
        },
      },
    },
  },
  ptBR // Adiciona localização em português
);

interface AppProviderProps {
  children: React.ReactNode;
}

const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBRLocale}>
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
};

export default AppProvider;
