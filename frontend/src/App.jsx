import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { SocketProvider } from './contexts/SocketContext.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { HealthProvider } from './contexts/HealthContext.jsx';

// Components
import Navbar from './components/Navbar.jsx';
import Sidebar from './components/Sidebar.jsx';
import Dashboard from './pages/Dashboard.jsx';
import SymptomChecker from './pages/SymptomChecker.jsx';
import RiskAssessment from './pages/RiskAssessment.jsx';
import PrescriptionScanner from './pages/PrescriptionScanner.jsx';
import MentalHealth from './pages/MentalHealth.jsx';
import EmergencyMode from './pages/EmergencyMode.jsx';
import HealthTimeline from './pages/HealthTimeline.jsx';
import FamilyDashboard from './pages/FamilyDashboard.jsx';
import LabReports from './pages/LabReports.jsx';
import HealthCoach from './pages/HealthCoach.jsx';
import Settings from './pages/Settings.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';

// Advanced Features
import DigitalTwin from './pages/advanced/DigitalTwin.jsx';
import TreatmentEngine from './pages/advanced/TreatmentEngine.jsx';
import NutritionScanner from './pages/advanced/NutritionScanner.jsx';
import VoiceAnalysis from './pages/advanced/VoiceAnalysis.jsx';
import WearableSync from './pages/advanced/WearableSync.jsx';
import MultiLanguage from './pages/advanced/MultiLanguage.jsx';
import ExplainableAI from './pages/advanced/ExplainableAI.jsx';
import CommunityPatterns from './pages/advanced/CommunityPatterns.jsx';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [emergencyMode, setEmergencyMode] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
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
                    mt: 8,
                    ml: sidebarOpen ? 30 : 8,
                  }}
                >
                  <Routes>
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
                    
                    <Route path="/advanced/digital-twin" element={<DigitalTwin />} />
                    <Route path="/advanced/treatment-engine" element={<TreatmentEngine />} />
                    <Route path="/advanced/nutrition-scanner" element={<NutritionScanner />} />
                    <Route path="/advanced/voice-analysis" element={<VoiceAnalysis />} />
                    <Route path="/advanced/wearable-sync" element={<WearableSync />} />
                    <Route path="/advanced/multi-language" element={<MultiLanguage />} />
                    <Route path="/advanced/explainable-ai" element={<ExplainableAI />} />
                    <Route path="/advanced/community-patterns" element={<CommunityPatterns />} />
                    
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
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
