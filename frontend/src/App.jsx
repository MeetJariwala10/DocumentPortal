import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import './App.css'

// Layout
import MainLayout from './layouts/MainLayout'

// Pages
import HomePage from './pages/HomePage'
import DocumentAnalyzer from './pages/DocumentAnalyzer'
import DocumentCompare from './pages/DocumentCompare'
import DocumentChat from './pages/DocumentChat'
import NotFound from './pages/NotFound'

// Create a theme with warm, natural colors
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: 'rgb(116, 136, 115)', // Sage green
      light: 'rgb(142, 162, 141)',
      dark: 'rgb(90, 110, 89)',
      contrastText: '#ffffff',
    },
    secondary: {
      main: 'rgb(244, 194, 142)', // Warm peach
      light: 'rgb(250, 210, 158)',
      dark: 'rgb(238, 178, 126)',
      contrastText: '#2c2c2c',
    },
    background: {
      default: '#ffffff', // Pure white
      paper: '#ffffff',    // Pure white
    },
    text: {
      primary: '#2c2c2c',   // Dark text
      secondary: '#5a5a5a', // Medium dark text
    },
    error: {
      main: '#d32f2f',      // Red
    },
    warning: {
      main: '#ed6c02',      // Orange
    },
    info: {
      main: '#0288d1',      // Blue
    },
    success: {
      main: '#2e7d32',      // Green
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      lineHeight: 1.2,
      letterSpacing: '-0.01562em',
      marginBottom: '0.5em',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.2,
      letterSpacing: '-0.00833em',
      marginBottom: '0.5em',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.2,
      letterSpacing: '0em',
      marginBottom: '0.5em',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.2,
      letterSpacing: '0.00735em',
      marginBottom: '0.5em',
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.2,
      letterSpacing: '0em',
      marginBottom: '0.5em',
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.2,
      letterSpacing: '0.0075em',
      marginBottom: '0.5em',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
      letterSpacing: '0.00938em',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
      letterSpacing: '0.01071em',
    },
    button: {
      textTransform: 'none', // Avoid all-caps buttons for better readability
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8, // Slightly rounded corners for a modern look
  },
  spacing: 8, // Base spacing unit
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          boxShadow: 'none', // Remove default shadow for flat appearance
          '&:hover': {
            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)', // Subtle shadow on hover
          },
        },
        contained: {
          padding: '8px 24px',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)', // Subtle shadow for papers
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)', // Lighter shadow for app bar
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)', // Consistent with Paper
          overflow: 'hidden',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: 'rgba(0, 0, 0, 0.12)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(0, 0, 0, 0.24)',
            },
          },
        },
      },
    },
  },
});

function App() {
  useEffect(() => {
    document.title = 'Document Portal'
  }, [])
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="analyze" element={<DocumentAnalyzer />} />
            <Route path="compare" element={<DocumentCompare />} />
            <Route path="chat" element={<DocumentChat />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
