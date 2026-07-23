import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import GlassCard from "../components/shared/GlassCard";
import AnimatedButton from "../components/shared/AnimatedButton";
import OnboardingFlow from "../components/shared/OnboardingFlow";
import Header from "../components/layout/Header";

export default function LandingPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem("user"));
      if (u) setUser(u);
    } catch (e) { }

    if (!localStorage.getItem("onboarding_complete")) {
      setShowOnboarding(true);
    }
  }, []);

  const name = user?.name ? user.name.split(" ")[0] : "Guest";
  const isAsha = user?.role === "ASHA_WORKER";

  const quickActions = [
    { id: "symptom", icon: "🩺", label: "Symptom Checker", link: "/chat", bg: "bg-primary/10 text-primary border-primary/20" },
    { id: "health", icon: "💡", label: "Health Insights", link: "/health", bg: "bg-info/10 text-info border-info/20" },
    { id: "doctors", icon: "👨‍⚕️", label: "Find Hospitals", link: "/hospitals", bg: "bg-[var(--color-warning)]/10 text-[var(--color-warning)] border-[var(--color-warning)]/20" },
    { id: "emergency", icon: "🚨", label: "Emergency", link: "/chat", bg: "bg-[var(--color-danger)]/10 text-[var(--color-danger)] border-[var(--color-danger)]/20" },
    { id: "ai", icon: "✨", label: "AI Suite", link: "/ai-suite", bg: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
    { id: "outbreak", icon: "🗺️", label: "Outbreak Map", link: "/outbreak", bg: "bg-teal-500/10 text-teal-500 border-teal-500/20" },
  ];

  if (isAsha) {
    quickActions.push({ id: "asha", icon: "👩‍🍼", label: "ASHA Co-Pilot", link: "/asha-copilot", bg: "bg-sky-500/10 text-sky-500 border-sky-500/20" });
  }

  return (
    <>
      {showOnboarding && <OnboardingFlow onComplete={() => setShowOnboarding(false)} />}
      
      <div className="min-h-full pb-20 animate-fadeIn relative">
        <Header title="HealthBot" />
        
        {/* Hero Background Elements */}
        <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none"></div>
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-32 -left-24 w-48 h-48 bg-info/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="px-5 pt-6 relative z-10">
          {/* Welcome Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">
                Hello, {name} 👋
              </h1>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                How can I help you today?
              </p>
            </div>
            <button className="w-10 h-10 rounded-full bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-center text-lg relative hover:border-primary transition-colors">
              🔔
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-[var(--color-danger)] rounded-full border-2 border-[var(--bg-card)] animate-pulse"></span>
            </button>
          </div>

          {/* Health Score Glass Card */}
          <GlassCard className="mb-6 border-t-4 border-t-primary">
            <div className="flex justify-between items-center mb-5">
              <div>
                <div className="text-xs text-[var(--text-secondary)] font-medium mb-1">Health Score</div>
                <div className="flex items-baseline gap-1 text-primary">
                  <span className="text-4xl font-bold">85</span>
                  <span className="text-sm text-[var(--text-secondary)] font-medium">/100</span>
                </div>
                <div className="text-xs font-semibold text-primary mt-1 bg-primary/10 inline-block px-2 py-0.5 rounded-full">Great!</div>
              </div>
              <div className="w-16 h-16 rounded-[var(--radius-xl)] bg-primary/10 flex items-center justify-center text-3xl animate-float">
                💚
              </div>
            </div>

            <div className="flex justify-between border-t border-[var(--border-color)] pt-4">
              <div className="text-center">
                <div className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider font-semibold mb-1">Steps</div>
                <div className="text-sm font-bold text-[var(--text-primary)]">7,842</div>
              </div>
              <div className="w-px bg-[var(--border-color)]"></div>
              <div className="text-center">
                <div className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider font-semibold mb-1">Water</div>
                <div className="text-sm font-bold text-[var(--text-primary)]">6/8</div>
              </div>
              <div className="w-px bg-[var(--border-color)]"></div>
              <div className="text-center">
                <div className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider font-semibold mb-1">Sleep</div>
                <div className="text-sm font-bold text-primary">7h 26m</div>
              </div>
            </div>
          </GlassCard>

          {/* Start Chat CTA */}
          <div className="mb-8">
            <AnimatedButton 
              onClick={() => navigate('/chat')}
              className="w-full py-4 text-lg font-bold shadow-lg shadow-primary/30 flex items-center justify-center gap-2"
            >
              <span>🤖</span> Ask AI Health Assistant
            </AnimatedButton>
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base font-bold text-[var(--text-primary)]">Quick Actions</h2>
              <Link to="/ai-suite" className="text-xs font-semibold text-primary hover:underline">View All</Link>
            </div>
            
            <div className="grid grid-cols-4 gap-3">
              {quickActions.map(action => (
                <div 
                  key={action.id} 
                  className="flex flex-col items-center gap-2 cursor-pointer group" 
                  onClick={() => navigate(action.link)}
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl border transition-all duration-300 group-hover:scale-105 group-hover:shadow-md ${action.bg}`}>
                    {action.icon}
                  </div>
                  <div className="text-[10px] font-semibold text-[var(--text-secondary)] text-center leading-tight group-hover:text-primary transition-colors">
                    {action.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Daily Tip */}
          <div className="bg-gradient-to-br from-primary to-[var(--color-primary-dark)] rounded-[var(--radius-xl)] p-5 text-white relative overflow-hidden shadow-lg shadow-primary/20">
            <div className="absolute -top-4 -right-4 text-8xl opacity-10 rotate-12">🍋</div>
            <div className="relative z-10">
              <div className="inline-block bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold tracking-wider mb-3">
                DAILY TIP
              </div>
              <p className="text-sm leading-relaxed font-medium max-w-[85%] text-emerald-50">
                Drink a glass of warm water with lemon in the morning. It helps boost your metabolism!
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
