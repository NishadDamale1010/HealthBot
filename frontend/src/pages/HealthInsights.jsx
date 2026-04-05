import { useEffect, useMemo, useState } from "react";
import API from "../services/api";
import { downloadHealthReport } from "../services/reportDownload";

const SYMPTOM_CATALOG = [
  { key: "fever", label: "Fever", icon: "🔥" },
  { key: "cough", label: "Cough", icon: "🤧" },
  { key: "breath", label: "Breathing", icon: "⚠️" },
  { key: "headache", label: "Headache", icon: "🧠" },
  { key: "pain", label: "Pain", icon: "🩹" },
  { key: "dizzy", label: "Dizziness", icon: "🌀" },
  { key: "nausea", label: "Nausea", icon: "🤢" },
  { key: "fatigue", label: "Fatigue", icon: "🔋" },
];

const severityTone = (score) => {
  if (score >= 70) return "high";
  if (score >= 40) return "medium";
  return "low";
};

const normalizeText = (v) => (v || "").toLowerCase();

export default function HealthInsightsPreview() {
  const [insights, setInsights] = useState("");
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingReport, setDownloadingReport] = useState(false);
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [completed, setCompleted] = useState({});
  const [simulatedRisk, setSimulatedRisk] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [insightsRes, historyRes] = await Promise.all([
          API.get("/api/health/insights"),
          API.get("/api/health/history"),
        ]);
        setInsights(insightsRes.data.insights || "");
        setSessions((historyRes.data.history || []).slice(0, 6));
      } catch {
        setError("Failed to load health insights. Please log in and try again.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const allMessages = useMemo(
    () => sessions.flat().map((m) => normalizeText(m.content)).join(" "),
    [sessions],
  );

  const symptomTags = useMemo(() => {
    return SYMPTOM_CATALOG.filter((item) => allMessages.includes(item.key)).slice(0, 6);
  }, [allMessages]);

  const riskScore = useMemo(() => {
    const base = insights ? 35 : 15;
    const keywordWeight = ["severe", "urgent", "high", "critical", "danger", "immediate"]
      .reduce((sum, key) => (normalizeText(insights).includes(key) ? sum + 12 : sum), 0);
    const symptomWeight = symptomTags.length * 5;
    return Math.min(95, base + keywordWeight + symptomWeight);
  }, [insights, symptomTags.length]);

  const effectiveRisk = simulatedRisk ?? riskScore;
  const riskTone = severityTone(effectiveRisk);

  const confidenceScore = useMemo(() => Math.min(98, 72 + symptomTags.length * 3), [symptomTags.length]);

  const recommendationItems = useMemo(() => {
    const lines = (insights || "")
      .split(/\n|\.|•/)
      .map((l) => l.trim())
      .filter(Boolean)
      .slice(0, 6);

    if (!lines.length) {
      return [
        "Hydrate consistently through the day.",
        "Track symptoms every 6 hours.",
        "Avoid heavy physical stress for 24 hours.",
      ];
    }
    return lines;
  }, [insights]);

  const predictedSymptoms = useMemo(() => {
    const fallback = ["Mild fatigue", "Light headache", "Cough progression"];
    if (!symptomTags.length) return fallback;
    return symptomTags.map((s) => `Potential ${s.label.toLowerCase()} fluctuation`);
  }, [symptomTags]);

  const timelineData = useMemo(() => {
    return sessions.slice(0, 5).map((session, idx) => {
      const userMsgs = session.filter((m) => m.role === "user").length;
      return {
        day: `S${idx + 1}`,
        value: Math.min(10, userMsgs + 2),
      };
    });
  }, [sessions]);

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

  const handleShare = async () => {
    const payload = `HealthBot AI Insights\nRisk Score: ${effectiveRisk}%\n\n${insights || "No insights yet."}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "HealthBot Insight Report", text: payload });
      } else {
        await navigator.clipboard.writeText(payload);
        setError("Report copied to clipboard for sharing.");
      }
    } catch {
      setError("Sharing is currently unavailable.");
    }
  };

  const toggleDone = (idx) => {
    setCompleted((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  if (loading) {
    return (
      <div className={`hi-page ${darkMode ? "dark" : ""}`}>
        <div className="hi-shell">
          <div className="hi-skeleton hi-skel-xl" />
          <div className="hi-skeleton hi-skel-grid" />
          <div className="hi-skeleton hi-skel-grid" />
        </div>
      </div>
    );
  }

  return (
    <div className={`hi-page ${darkMode ? "dark" : ""}`}>
      <div className="hi-shell">
        <header className="hi-topbar">
          <div>
            <p className="hi-kicker">AI HEALTH INTELLIGENCE</p>
            <h1>Health Insights Command Center</h1>
            <p>Futuristic symptom intelligence dashboard with predictive analytics and guided recovery workflow.</p>
          </div>
          <div className="hi-top-actions">
            <button className="hi-btn ghost" onClick={() => setDarkMode((s) => !s)}>{darkMode ? "☀️ Light" : "🌙 Dark"}</button>
            <button className="hi-btn primary" onClick={() => setSimulatedRisk(Math.max(8, effectiveRisk - 14))}>🔮 What-if Simulation</button>
          </div>
        </header>

        {error && <div className="hi-alert">{error}</div>}

        <section className="hi-grid-main">
          <article className="hi-card">
            <div className="hi-card-head">
              <h2>Symptom Summary</h2>
              <span className={`hi-pill ${riskTone}`}>{riskTone.toUpperCase()} SIGNAL</span>
            </div>
            <div className="hi-chip-wrap">
              {symptomTags.length ? symptomTags.map((tag) => (
                <span key={tag.key} className={`hi-chip ${riskTone}`}>{tag.icon} {tag.label}</span>
              )) : <span className="hi-muted">No strong symptom keywords detected yet.</span>}
            </div>

            <div className="hi-section-title">Recommendations Checklist</div>
            <div className="hi-checklist">
              {recommendationItems.map((item, idx) => (
                <button key={item} className={`hi-check-item ${completed[idx] ? "done" : ""}`} onClick={() => toggleDone(idx)}>
                  <span>{completed[idx] ? "✅" : "☑️"}</span>
                  <span>{item}</span>
                </button>
              ))}
            </div>

            <div className="hi-doctor-alert">
              <strong>⚠️ Doctor Suggestion:</strong> If risk remains elevated for the next 24 hours, consult a physician.
            </div>
          </article>

          <article className="hi-card">
            <div className="hi-card-head">
              <h2>Risk + Analytics</h2>
              <span className="hi-muted">Live AI updates</span>
            </div>

            <div className="hi-risk-wrap">
              <div className="hi-gauge" style={{ background: `conic-gradient(${effectiveRisk < 40 ? "#22c55e" : effectiveRisk < 70 ? "#f59e0b" : "#ef4444"} ${effectiveRisk * 3.6}deg, rgba(148,163,184,.2) 0deg)` }}>
                <div className="hi-gauge-inner">
                  <strong>{effectiveRisk}%</strong>
                  <small>Risk Score</small>
                </div>
              </div>
              <div className="hi-metrics">
                <div><span>AI Confidence</span><strong>{confidenceScore}%</strong></div>
                <div><span>Predicted Next</span><strong>{predictedSymptoms[0]}</strong></div>
                <div><span>Health Signal</span><strong>{riskTone.toUpperCase()}</strong></div>
              </div>
            </div>

            <div className="hi-chart-block">
              <h3>Symptom Activity Trend</h3>
              <svg viewBox="0 0 320 120" className="hi-line-chart">
                <polyline
                  fill="none"
                  stroke="url(#lineGradient)"
                  strokeWidth="3"
                  points={timelineData.map((d, i) => `${20 + i * 70},${110 - d.value * 9}`).join(" ")}
                />
                {timelineData.map((d, i) => (
                  <circle key={d.day} cx={20 + i * 70} cy={110 - d.value * 9} r="4" fill="#38bdf8" />
                ))}
                <defs>
                  <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="hi-chart-labels">
                {timelineData.map((d) => <span key={d.day}>{d.day}</span>)}
              </div>
            </div>
          </article>
        </section>

        <section className="hi-grid-secondary">
          <article className="hi-card">
            <h2>Recent Conversations</h2>
            <div className="hi-chat-cards">
              {sessions.length ? sessions.map((session, i) => {
                const userMsgs = session.filter((m) => m.role === "user");
                const preview = userMsgs[0]?.content || "Conversation";
                const aiReply = session.find((m) => m.role === "bot")?.content || "AI summary pending";
                const date = session[0]?.createdAt ? new Date(session[0].createdAt).toLocaleString() : "";
                return (
                  <article key={i} className="hi-chat-item">
                    <p className="hi-user-msg">👤 {preview.length > 90 ? `${preview.slice(0, 90)}...` : preview}</p>
                    <p className="hi-ai-msg">🤖 {aiReply.length > 90 ? `${aiReply.slice(0, 90)}...` : aiReply}</p>
                    <small>{date}</small>
                  </article>
                );
              }) : <p className="hi-muted">No conversations yet.</p>}
            </div>
          </article>

          <article className="hi-card">
            <h2>Report Actions</h2>
            <div className="hi-cta-stack">
              <button className="hi-btn primary" onClick={handleDownloadReport} disabled={downloadingReport}>
                {downloadingReport ? "Preparing PDF..." : "📥 Download PDF"}
              </button>
              <button className="hi-btn secondary" onClick={handleShare}>📤 Share Report</button>
              <a className="hi-btn ghost" href={`mailto:?subject=HealthBot Insight Report&body=${encodeURIComponent(insights || "No insights available")}`}>
                ✉️ Email Report
              </a>
            </div>

            <div className="hi-section-title">Predicted Next Symptoms</div>
            <ul className="hi-pred-list">
              {predictedSymptoms.map((p) => <li key={p}>{p}</li>)}
            </ul>
          </article>
        </section>
      </div>
    </div>
  );
}
