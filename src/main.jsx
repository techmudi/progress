import React from 'react';
import ReactDOM from 'react-dom/client';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import App from './App';
import './index.css';

import { Paper, Typography } from '@mui/material';

const theme = createTheme({
  palette: {
    primary: { main: '#719430' },
    secondary: { main: '#1A1A1A' },
    text: { primary: "#1a1a1a", secondary: "#1A1A1A" },
    background: {
      default: '#F1F2EF',
      
    },

  },
  typography: {
    h1: { color: "#1a1a1a"},
    h2: { color:   "#1A1A1A"},
    h3: { color:  "#1A1A1A"},
    h4: { color:  "#1A1A1A" },
    h5: { color:  "#1A1A1A" },
    h6: { color: "#1A1A1A"},
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
        },
        containedPrimary: {
          backgroundColor: '#719430',
          '&:hover': {
            backgroundColor: '#5A7B2A',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          border: '1px solid #719430',
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        },
      },
    },
  },
});
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
