import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box, Container } from '@mui/material';
import { SocketProvider } from './contexts/SocketContext';
import { AuthProvider } from './contexts/AuthContext';
import { HealthProvider } from './contexts/HealthContext';

// Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import SymptomChecker from './pages/SymptomChecker';
import RiskAssessment from './pages/RiskAssessment';
import PrescriptionScanner from './pages/PrescriptionScanner';
import MentalHealth from './pages/MentalHealth';
import EmergencyMode from './pages/EmergencyMode';
import HealthTimeline from './pages/HealthTimeline';
import FamilyDashboard from './pages/FamilyDashboard';
import LabReports from './pages/LabReports';
import HealthCoach from './pages/HealthCoach';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';

// Advanced Features
import DigitalTwin from './pages/advanced/DigitalTwin';
import TreatmentEngine from './pages/advanced/TreatmentEngine';
import NutritionScanner from './pages/advanced/NutritionScanner';
import VoiceAnalysis from './pages/advanced/VoiceAnalysis';
import WearableSync from './pages/advanced/WearableSync';
import MultiLanguage from './pages/advanced/MultiLanguage';
import ExplainableAI from './pages/advanced/ExplainableAI';
import CommunityPatterns from './pages/advanced/CommunityPatterns';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#dc004e',
      light: '#ff5983',
      dark: '#9a0036',
    },
    success: {
      main: '#2e7d32',
      light: '#4caf50',
      dark: '#1b5e20',
    },
    warning: {
      main: '#ed6c02',
      light: '#ff9800',
      dark: '#e65100',
    },
    error: {
      main: '#d32f2f',
      light: '#ef5350',
      dark: '#c62828',
    },
    info: {
      main: '#0288d1',
      light: '#03a9f4',
      dark: '#01579b',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          borderRadius: 12,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
  },
});

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [emergencyMode, setEmergencyMode] = useState(false);

  useEffect(() => {
    // Check for existing authentication
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
    }

    // Check for emergency mode
    const emergencyStatus = localStorage.getItem('emergencyMode');
    if (emergencyStatus === 'true') {
      setEmergencyMode(true);
    }
  }, []);

  const handleLogin = (userData, token) => {
    setIsAuthenticated(true);
    setUser(userData);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('emergencyMode');
    setEmergencyMode(false);
  };

  const toggleEmergencyMode = () => {
    const newMode = !emergencyMode;
    setEmergencyMode(newMode);
    localStorage.setItem('emergencyMode', newMode.toString());
  };

  if (!isAuthenticated) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Routes>
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/register" element={<Register onLogin={handleLogin} />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider value={{ user, isAuthenticated, handleLogin, handleLogout }}>
        <SocketProvider>
          <HealthProvider>
            <Router>
              <Box sx={{ display: 'flex' }}>
                <Navbar 
                  user={user} 
                  onLogout={handleLogout}
                  emergencyMode={emergencyMode}
                  toggleEmergencyMode={toggleEmergencyMode}
                />
                <Sidebar 
                  open={sidebarOpen}
                  setOpen={setSidebarOpen}
                  emergencyMode={emergencyMode}
                />
                <Box
                  component="main"
                  sx={{
                    flexGrow: 1,
                    p: 3,
                    mt: 8, // Account for navbar height
                    ml: sidebarOpen ? 30 : 8, // Account for sidebar width
                    transition: 'margin 0.3s ease',
                  }}
                >
                  <Container maxWidth="xl">
                    <Routes>
                      {/* Main Routes */}
                      <Route path="/" element={<Navigate to="/dashboard" replace />} />
                      <Route path="/dashboard" element={<Dashboard user={user} />} />
                      <Route path="/symptom-checker" element={<SymptomChecker />} />
                      <Route path="/risk-assessment" element={<RiskAssessment />} />
                      <Route path="/prescription-scanner" element={<PrescriptionScanner />} />
                      <Route path="/mental-health" element={<MentalHealth />} />
                      <Route path="/emergency" element={<EmergencyMode />} />
                      <Route path="/timeline" element={<HealthTimeline />} />
                      <Route path="/family" element={<FamilyDashboard />} />
                      <Route path="/lab-reports" element={<LabReports />} />
                      <Route path="/health-coach" element={<HealthCoach />} />
                      <Route path="/settings" element={<Settings user={user} />} />
                      
                      {/* Advanced Features */}
                      <Route path="/advanced/digital-twin" element={<DigitalTwin />} />
                      <Route path="/advanced/treatment-engine" element={<TreatmentEngine />} />
                      <Route path="/advanced/nutrition-scanner" element={<NutritionScanner />} />
                      <Route path="/advanced/voice-analysis" element={<VoiceAnalysis />} />
                      <Route path="/advanced/wearable-sync" element={<WearableSync />} />
                      <Route path="/advanced/multi-language" element={<MultiLanguage />} />
                      <Route path="/advanced/explainable-ai" element={<ExplainableAI />} />
                      <Route path="/advanced/community-patterns" element={<CommunityPatterns />} />
                      
                      {/* Catch all */}
                      <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                  </Container>
                </Box>
              </Box>
            </Router>
          </HealthProvider>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
