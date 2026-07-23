import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useDarkMode } from "./hooks/useDarkMode";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Chat from "./pages/Chat";
import Dashboard from "./pages/Dashboard";
import HealthInsights from "./pages/HealthInsights";
import Hospitals from "./pages/Hospitals";
import AISuite from "./pages/AISuite";
import ASHADashboard from "./pages/ASHADashboard";
import OutbreakHeatmap from "./pages/OutbreakHeatmap";
import ConsentManager from "./pages/ConsentManager";
import ABHAIntegration from "./pages/ABHAIntegration";
import LandingPage from "./pages/LandingPage";
import RecordsPage from "./pages/RecordsPage";
import ProfileMenu from "./pages/ProfileMenu";

import BottomNav from "./components/layout/BottomNav";

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Initialize dark mode
  useDarkMode();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const publicRoutes = ["/login", "/register", "/"];
    if (!token && !publicRoutes.includes(location.pathname)) {
      if (location.pathname !== "/chat") {
        navigate("/login");
      }
    }
  }, [location.pathname, navigate]);

  return (
    <div className="w-full max-w-[440px] h-[100dvh] mx-auto bg-[var(--bg-secondary)] relative overflow-hidden shadow-2xl flex flex-col transition-colors duration-300">
      <div className="flex-1 overflow-y-auto overflow-x-hidden relative scrollable-content pb-16">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/records" element={<RecordsPage />} />
          <Route path="/profile" element={<ProfileMenu />} />
          
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/health" element={<HealthInsights />} />
          <Route path="/hospitals" element={<Hospitals />} />
          <Route path="/ai-suite" element={<AISuite />} />
          
          <Route path="/asha-copilot" element={<ASHADashboard />} />
          <Route path="/outbreak" element={<OutbreakHeatmap />} />
          <Route path="/privacy" element={<ConsentManager />} />
          <Route path="/abha" element={<ABHAIntegration />} />
        </Routes>
      </div>
      <BottomNav />
    </div>
  );
}

export default App;
