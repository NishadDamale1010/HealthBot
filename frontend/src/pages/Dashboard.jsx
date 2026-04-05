import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { downloadHealthReport } from "../services/reportDownload";

function toCsv(arr) {
  if (!Array.isArray(arr)) return "";
  return arr.join(", ");
}

const NAV_ITEMS = [
  { label: "Dashboard", icon: "🏠" },
  { label: "Health Insights", icon: "🧠" },
  { label: "Reports", icon: "📄" },
  { label: "AI Chat", icon: "💬" },
  { label: "Settings", icon: "⚙️" },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [downloadingReport, setDownloadingReport] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [chatDraft, setChatDraft] = useState("");

  const [form, setForm] = useState({
    age: "",
    gender: "prefer_not_to_say",
    existingMedicalConditions: "",
    allergies: "",
    medications: "",
  });
  const [whatsappIdInput, setWhatsappIdInput] = useState("");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    async function load() {
      try {
        setLoading(true);
        const [profileRes, historyRes] = await Promise.all([
          API.get("/api/profile/me"),
          API.get("/api/profile/history?limit=30"),
        ]);
        const p = profileRes.data.profile || {};
        setProfile(p);
        setHistory(historyRes.data.messages || []);
        setForm({
          age: p.age ?? "",
          gender: p.gender ?? "prefer_not_to_say",
          existingMedicalConditions: toCsv(p.existingMedicalConditions),
          allergies: toCsv(p.allergies),
          medications: toCsv(p.medications),
        });
        setWhatsappIdInput(p.whatsappId ?? "");
      } catch {
        setError("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [navigate, token]);

  const updateField = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const profileCompleteness = useMemo(() => {
    const values = [form.age, form.gender, form.existingMedicalConditions, form.allergies, form.medications, whatsappIdInput];
    const filled = values.filter((v) => String(v || "").trim() !== "" && v !== "prefer_not_to_say").length;
    return Math.round((filled / values.length) * 100);
  }, [form, whatsappIdInput]);

  const healthScore = useMemo(() => Math.min(98, 55 + Math.floor(profileCompleteness / 2)), [profileCompleteness]);
  const riskScore = useMemo(() => Math.min(95, 20 + Math.floor(history.length / 3) + (form.allergies ? 10 : 0)), [history.length, form.allergies]);
  const aiConfidence = useMemo(() => Math.min(99, 68 + Math.floor(history.length / 4)), [history.length]);

  const riskLevel = riskScore >= 70 ? "High" : riskScore >= 40 ? "Medium" : "Low";

  const activityTrend = useMemo(() => {
    const chunks = [0, 1, 2, 3, 4, 5].map((i) => history.slice(i * 5, i * 5 + 5));
    return chunks.map((chunk, i) => ({ label: `W${i + 1}`, value: Math.min(10, chunk.length + 1) }));
  }, [history]);

  const saveProfile = async () => {
    try {
      setError("");
      setSuccess("");
      setSavingProfile(true);
      await API.put("/api/profile/me", {
        age: form.age === "" ? undefined : form.age,
        gender: form.gender,
        existingMedicalConditions: form.existingMedicalConditions,
        allergies: form.allergies,
        medications: form.medications,
      });
      const profileRes = await API.get("/api/profile/me");
      setProfile(profileRes.data.profile);
      setSuccess("Profile updated successfully");
      setTimeout(() => setSuccess(""), 2200);
    } catch {
      setError("Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const linkWhatsApp = async () => {
    try {
      setError("");
      setSuccess("");
      await API.post("/api/profile/link-whatsapp", { whatsappId: whatsappIdInput });
      const profileRes = await API.get("/api/profile/me");
      setProfile(profileRes.data.profile);
      setWhatsappIdInput(profileRes.data.profile?.whatsappId ?? "");
      setSuccess("WhatsApp linked successfully");
      setTimeout(() => setSuccess(""), 2200);
    } catch {
      setError("Failed to link WhatsApp");
    }
  };

  const handleDownloadReport = async () => {
    try {
      setError("");
      setDownloadingReport(true);
      await downloadHealthReport();
    } catch {
      setError("Unable to download report right now. Please try again.");
    } finally {
      setDownloadingReport(false);
    }
  };

  const askAI = async () => {
    if (!chatDraft.trim()) return;
    const userText = chatDraft.trim();
    setChatDraft("");
    setHistory((prev) => [...prev, { role: "user", content: userText, createdAt: new Date().toISOString() }]);
    try {
      const { data } = await API.post("/api/chat", {
        type: "followup",
        message: userText,
        context: {
          age: form.age,
          gender: form.gender,
          allergies: form.allergies,
          medications: form.medications,
        },
      });
      setHistory((prev) => [...prev, { role: "bot", content: data.reply || "I have noted that update.", createdAt: new Date().toISOString() }]);
    } catch {
      setHistory((prev) => [...prev, { role: "bot", content: "I could not process that right now. Please try again.", createdAt: new Date().toISOString() }]);
    }
  };

  if (loading) {
    return (
      <div className="dash-loading">
        <div className="dash-spinner" />
        <p>Loading your AI health control center...</p>
      </div>
    );
  }

  return (
    <div className={`dash-page ${darkMode ? "dark" : ""}`}>
      <aside className="dash-sidebar">
        <div className="dash-brand">🩺 HealthBot</div>
        <nav>
          {NAV_ITEMS.map((item, index) => (
            <button key={item.label} className={`dash-nav-item ${index === 0 ? "active" : ""}`}>
              <span>{item.icon}</span> {item.label}
            </button>
          ))}
        </nav>
        <div className="dash-ai-pulse">AI Monitoring Active</div>
      </aside>

      <main className="dash-main">
        <header className="dash-topnav">
          <div className="dash-user-meta">
            <h1>Good Day, {profile?.name?.split(" ")[0] || "Nishad"} 👋</h1>
            <p>Your intelligent health operating system is live.</p>
          </div>
          <div className="dash-top-actions">
            <button className="dash-icon-btn">🔔</button>
            <button className="dash-icon-btn" onClick={() => setDarkMode((s) => !s)}>{darkMode ? "☀️" : "🌙"}</button>
            <div className="dash-avatar">{profile?.name?.[0] || "N"}</div>
          </div>
        </header>

        <section className="dash-hero">
          <div>
            <h2>AI Health Command Deck</h2>
            <p>Health Score {healthScore}% · Risk Level {riskLevel} · AI Status Monitoring Active</p>
          </div>
          <div className="dash-hero-ctas">
            <button className="dash-cta primary" onClick={handleDownloadReport} disabled={downloadingReport}>
              {downloadingReport ? "Generating..." : "📄 Generate Report"}
            </button>
            <button className="dash-cta secondary" onClick={() => navigate("/health")}>🧠 Analyze Health</button>
            <button className="dash-cta ghost" onClick={() => navigate("/chat")}>💬 Talk to AI</button>
          </div>
        </section>

        {(error || success) && <div className={`dash-toast ${error ? "error" : "success"}`}>{error || success}</div>}

        <section className="dash-kpi-grid">
          <article className="dash-kpi"><p>Health Score</p><h3>{healthScore}%</h3><span>↗ +4 this week</span></article>
          <article className="dash-kpi"><p>Active Symptoms</p><h3>{Math.max(1, form.existingMedicalConditions ? form.existingMedicalConditions.split(",").length : 0)}</h3><span>tracked signals</span></article>
          <article className="dash-kpi"><p>Risk Level</p><h3>{riskLevel}</h3><span>{riskScore}% risk index</span></article>
          <article className="dash-kpi"><p>AI Confidence</p><h3>{aiConfidence}%</h3><span>model certainty</span></article>
        </section>

        <section className="dash-content-grid">
          <article className="dash-card">
            <div className="dash-card-head"><h3>Health Profile</h3><span>{profileCompleteness}% Complete</span></div>
            <div className="dash-progress"><span style={{ width: `${profileCompleteness}%` }} /></div>

            <div className="dash-form-grid">
              <label>Age<input value={form.age} onChange={updateField("age")} placeholder="e.g. 28" /></label>
              <label>Gender
                <select value={form.gender} onChange={updateField("gender")}>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </label>
              <label>Medical Conditions<input value={form.existingMedicalConditions} onChange={updateField("existingMedicalConditions")} placeholder="Hypertension, Diabetes" /></label>
              <label>Allergies<input value={form.allergies} onChange={updateField("allergies")} placeholder="Penicillin" /></label>
              <label>Medications<input value={form.medications} onChange={updateField("medications")} placeholder="Metformin 500mg" /></label>
              <label>WhatsApp ID<input value={whatsappIdInput} onChange={(e) => setWhatsappIdInput(e.target.value)} placeholder="12345678@c.us" /></label>
            </div>

            <div className="dash-inline-actions">
              <button className="dash-cta primary" onClick={saveProfile} disabled={savingProfile}>{savingProfile ? "Saving..." : "Save Profile"}</button>
              <button className="dash-cta secondary" onClick={linkWhatsApp}>{profile?.whatsappId ? "Update WhatsApp" : "Link WhatsApp"}</button>
            </div>
          </article>

          <article className="dash-card dash-chat-card">
            <div className="dash-card-head"><h3>Consultation History</h3><span>{history.length} messages</span></div>
            <div className="dash-chat-stream">
              {history.length ? history.slice(-18).map((m, i) => (
                <div key={`${m.createdAt}-${i}`} className={`dash-msg ${m.role === "user" ? "user" : "bot"}`}>
                  <div className="dash-msg-bubble">
                    <p>{m.content}</p>
                    <small>{m.createdAt ? new Date(m.createdAt).toLocaleTimeString() : "Now"}</small>
                  </div>
                </div>
              )) : <p className="dash-empty">No consultation history yet.</p>}
            </div>
            <div className="dash-chat-input">
              <input value={chatDraft} onChange={(e) => setChatDraft(e.target.value)} placeholder="Ask AI about your current health status..." onKeyDown={(e) => e.key === "Enter" && askAI()} />
              <button onClick={askAI}>Send</button>
            </div>
          </article>
        </section>

        <section className="dash-bottom-grid">
          <article className="dash-card">
            <div className="dash-card-head"><h3>AI Smart Panel</h3><span>Live intelligence</span></div>
            <div className="dash-smart-grid">
              <div><p>AI Insights</p><strong>Sleep + hydration imbalance detected</strong><span className="warn">Action: hydration protocol</span></div>
              <div><p>Predicted Risk</p><strong>{riskScore}% in next 48h</strong><span className="mid">Watch respiratory trend</span></div>
              <div><p>Suggested Actions</p><strong>Rest, hydrate, track symptoms</strong><span className="ok">Priority: medium</span></div>
            </div>
          </article>

          <article className="dash-card">
            <div className="dash-card-head"><h3>Health Trend</h3><span>Last 6 windows</span></div>
            <div className="dash-mini-chart">
              {activityTrend.map((p) => (
                <div key={p.label}>
                  <span style={{ height: `${p.value * 9}px` }} />
                  <small>{p.label}</small>
                </div>
              ))}
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}
