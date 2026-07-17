import { Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
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

const BOTTOM_NAV_LINKS = [
  { to: "/", label: "Home", icon: "🏠" },
  { to: "/chat", label: "Chat", icon: "💬" },
  { to: "/records", label: "Records", icon: "📋" },
  { to: "/profile", label: "Profile", icon: "🧑" },
];

function BottomNav() {
  const location = useLocation();
  const token = localStorage.getItem("token");

  // Don't show on login/register
  if (location.pathname === "/login" || location.pathname === "/register") return null;

  return (
    <div style={{
      position: "absolute", bottom: 0, left: 0, right: 0,
      height: 64, background: "#ffffff", borderTop: "1px solid #f1f5f9",
      display: "flex", justifyContent: "space-around", alignItems: "center",
      boxShadow: "0 -4px 16px rgba(0,0,0,0.02)", zIndex: 100,
      paddingBottom: "env(safe-area-inset-bottom)"
    }}>
      {BOTTOM_NAV_LINKS.map(link => {
        const isActive = location.pathname === link.to;
        return (
          <Link key={link.to} to={link.to} style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
            textDecoration: "none", color: isActive ? "#10b981" : "#94a3b8",
            width: 60
          }}>
            <span style={{ fontSize: 20, opacity: isActive ? 1 : 0.7, filter: isActive ? "none" : "grayscale(100%)" }}>
              {link.icon}
            </span>
            <span style={{ fontSize: 10, fontWeight: isActive ? 600 : 500 }}>
              {link.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Basic auth check for protected routes
    const token = localStorage.getItem("token");
    const publicRoutes = ["/login", "/register", "/"];
    if (!token && !publicRoutes.includes(location.pathname)) {
      // Allow unauthenticated users to access chat but restrict profile/records
      if (location.pathname !== "/chat") {
        navigate("/login");
      }
    }
  }, [location.pathname]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        
        .mobile-frame {
          width: 100%;
          max-width: 440px;
          height: 100vh;
          margin: 0 auto;
          background: #f8fafc;
          position: relative;
          overflow: hidden;
          box-shadow: 0 0 40px rgba(0,0,0,0.1);
          display: flex;
          flex-direction: column;
        }

        @media (max-width: 440px) {
          .mobile-frame {
            box-shadow: none;
          }
        }

        .scrollable-content {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          position: relative;
        }

        /* Hide scrollbar for a cleaner mobile look */
        .scrollable-content::-webkit-scrollbar { display: none; }
        .scrollable-content { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div className="mobile-frame">
        <div className="scrollable-content">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/records" element={<RecordsPage />} />
            <Route path="/profile" element={<ProfileMenu />} />
            
            {/* Existing Features */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/health" element={<HealthInsights />} />
            <Route path="/hospitals" element={<Hospitals />} />
            <Route path="/ai-suite" element={<AISuite />} />
            
            {/* SIH Features */}
            <Route path="/asha-copilot" element={<ASHADashboard />} />
            <Route path="/outbreak" element={<OutbreakHeatmap />} />
            <Route path="/privacy" element={<ConsentManager />} />
            <Route path="/abha" element={<ABHAIntegration />} />
          </Routes>
        </div>
        <BottomNav />
      </div>
    </>
  );
}

export default App;
