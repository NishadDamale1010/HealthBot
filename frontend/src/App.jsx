import { Routes, Route, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Chat from "./pages/Chat";
import Dashboard from "./pages/Dashboard";

function App() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");

  const token = localStorage.getItem("token");

  useEffect(() => {
    document.body.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="layout">
      <header className="topbar">
        <div className="brand" role="banner">
          HealthBot
          <span className="brand-sub">AI Disease Awareness</span>
        </div>

        <nav className="topbar-nav">
          <Link className="topbar-link" to="/chat">
            Chat
          </Link>
          {token && (
            <Link className="topbar-link" to="/dashboard">
              Dashboard
            </Link>
          )}
        </nav>

        <div className="topbar-right">
          <button
            className="theme-toggle"
            type="button"
            onClick={() => setTheme(t => (t === "dark" ? "light" : "dark"))}
          >
            {theme === "dark" ? "Light" : "Dark"} Mode
          </button>

          {token ? (
            <button className="auth-btn" type="button" onClick={logout}>
              Logout
            </button>
          ) : (
            <>
              <Link className="auth-btn" to="/login">
                Login
              </Link>
            </>
          )}
        </div>
      </header>

      <main className="main">
        <Routes>
          <Route path="/" element={<Chat />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;