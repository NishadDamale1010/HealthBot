import { useMemo, useState } from "react";
import API from "../services/api";

const FEATURE_GROUPS = [
  {
    title: "Core Intelligence",
    tone: "live",
    items: [
      "AI Symptom Progression Simulator",
      "Personalized Health Risk Scoring",
      "Prescription Image Scanner + Drug Safety Checker",
      "Mental Health Emotion Detection",
      "Health Timeline Dashboard",
      "Smart Follow-up Question Engine",
      "Nearby Medical Help Recommendation",
      "Lab Report Analyzer",
      "Real-Time Emergency Detection Mode",
      "AI Health Coach (daily guidance)",
    ],
  },
  {
    title: "Predictive + Adaptive Systems",
    tone: "simulated",
    items: [
      "Digital Twin Health Model",
      "Adaptive Treatment Recommendation Engine",
      "Medication Adherence Intelligence",
      "Nutritional Deficiency Predictor",
      "Dynamic Severity Classification System",
      "AI Second Opinion Mode",
      "Recovery Prediction Engine",
      "Allergy Intelligence System",
    ],
  },
  {
    title: "Experience + Personalization",
    tone: "enhanced",
    items: [
      "Wearable Data Sync / Simulation",
      "Multi-language + Local Dialect Support",
      "Preventive Care Planner",
      "Explainable AI",
      "Micro-Habit Correction Engine",
      "AI Health Audit Reports",
      "Body System Mapping Interface",
      "Smart Triage System",
    ],
  },
  {
    title: "Advanced Insight Stack",
    tone: "flagship",
    items: [
      "Family History-Based Risk Simulation",
      "Multi-image Diagnosis Comparison",
      "Smart Supplement Advisor",
      "Health Confidence Score",
      "AI Recovery / Rehab Coach",
      "Doctor-Ready Report Export",
      "Rare Disease Detection Flag",
      "Community Disease Pattern Detection",
    ],
  },
];

const KPI_CARDS = [
  { label: "AI Modules", value: "65", icon: "🧠", tone: "primary" },
  { label: "Feature Layers", value: "4", icon: "🧩", tone: "secondary" },
  { label: "Active Monitoring", value: "24/7", icon: "🟢", tone: "accent" },
];

const ACTIONS = [
  { key: "progression-untreated", label: "Simulate Untreated", icon: "📉", style: "primary" },
  { key: "progression-treated", label: "Simulate Treated", icon: "📈", style: "secondary" },
  { key: "risk", label: "Run Risk Score", icon: "🧮", style: "primary" },
  { key: "emotion", label: "Check Emotion", icon: "💬", style: "secondary" },
  { key: "lab", label: "Analyze Sample Lab", icon: "🧪", style: "primary" },
  { key: "advanced", label: "Advanced AI", icon: "⚡", style: "secondary" },
  { key: "ultra", label: "Ultra AI", icon: "🚀", style: "primary" },
];

const summarizeFeature = (name) => {
  if (name.includes("Risk")) return "Predicts likelihood and severity signals.";
  if (name.includes("Lab")) return "Extracts actionable findings from reports.";
  if (name.includes("AI")) return "Context-aware intelligence with explainable output.";
  if (name.includes("Detection")) return "Flags important conditions for faster action.";
  return "Premium workflow for smarter health decisions.";
};

const featureIcon = (name) => {
  if (name.includes("Risk")) return "📊";
  if (name.includes("Lab")) return "🧪";
  if (name.includes("Emergency")) return "🚨";
  if (name.includes("Recovery")) return "🩹";
  if (name.includes("Multi")) return "🧬";
  return "✨";
};

export default function AISuite() {
  const [darkMode, setDarkMode] = useState(false);
  const [symptoms, setSymptoms] = useState("");
  const [progression, setProgression] = useState(null);
  const [risk, setRisk] = useState(null);
  const [emotion, setEmotion] = useState(null);
  const [lab, setLab] = useState(null);
  const [advanced, setAdvanced] = useState(null);
  const [ultra, setUltra] = useState(null);
  const [loading, setLoading] = useState(false);

  const featureCount = useMemo(() => FEATURE_GROUPS.reduce((sum, group) => sum + group.items.length, 0), []);

  const runProgression = async (treated) => {
    setLoading(true);
    try {
      const { data } = await API.post("/api/intelligence/progression", { symptoms, treated });
      setProgression(data);
    } finally {
      setLoading(false);
    }
  };

  const runRisk = async () => {
    setLoading(true);
    try {
      const { data } = await API.post("/api/intelligence/risk-score", {
        age: 32, bmi: 27, sleepHours: 6, activityDaysPerWeek: 2, sugarLevel: 7,
      });
      setRisk(data);
    } finally {
      setLoading(false);
    }
  };

  const runEmotion = async () => {
    setLoading(true);
    try {
      const { data } = await API.post("/api/intelligence/emotion-check", { message: symptoms });
      setEmotion(data);
    } finally {
      setLoading(false);
    }
  };

  const runLab = async () => {
    setLoading(true);
    try {
      const { data } = await API.post("/api/intelligence/lab-analyzer", { hemoglobin: 10.8, fastingGlucose: 112 });
      setLab(data);
    } finally {
      setLoading(false);
    }
  };

  const runAdvanced = async () => {
    setLoading(true);
    try {
      const { data } = await API.post("/api/intelligence/advanced-insights", {
        symptoms,
        sleepHours: 6,
        steps: 4500,
        diet: "vegetarian, indoor lifestyle",
        diagnosis: "Gastritis",
        medsTaken: 5,
        medsPrescribed: 7,
        language: "hinglish",
      });
      setAdvanced(data);
    } finally {
      setLoading(false);
    }
  };

  const runUltra = async () => {
    setLoading(true);
    try {
      const { data } = await API.post("/api/intelligence/ultra-insights", {
        symptoms,
        sleepHours: 5.5,
        typingSpeedWpm: 22,
        lateNightChats: 4,
        familyHistory: "diabetes, heart disease",
        medsHelped: "no",
        weather: "humid",
        aqi: 140,
        goal: "lose 5kg",
        userType: "advanced",
        bodyPart: "chest",
      });
      setUltra(data);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (actionKey) => {
    if (actionKey === "progression-untreated") return runProgression(false);
    if (actionKey === "progression-treated") return runProgression(true);
    if (actionKey === "risk") return runRisk();
    if (actionKey === "emotion") return runEmotion();
    if (actionKey === "lab") return runLab();
    if (actionKey === "advanced") return runAdvanced();
    if (actionKey === "ultra") return runUltra();
  };

  return (
    <div className={`ai-suite-page ${darkMode ? "dark" : ""}`}>
      <div className="ai-suite-container">
        <header className="ai-suite-topbar">
          <div>
            <p className="ai-suite-kicker">AI Health Intelligence</p>
            <h1>Premium Intelligence Suite</h1>
            <p className="ai-suite-subtitle">
              Investor-grade product surface for multi-modal health intelligence, explainable analysis, and proactive care workflows.
            </p>
          </div>
          <div className="ai-suite-topbar-actions">
            <span className="ai-suite-badge">{featureCount} Features Live</span>
            <button className="ai-ghost-btn" onClick={() => setDarkMode((s) => !s)}>
              {darkMode ? "☀️ Light" : "🌙 Dark"}
            </button>
          </div>
        </header>

        <section className="ai-kpi-grid">
          {KPI_CARDS.map((kpi) => (
            <article key={kpi.label} className={`ai-kpi-card tone-${kpi.tone}`}>
              <div className="ai-kpi-icon">{kpi.icon}</div>
              <div>
                <p>{kpi.label}</p>
                <h3>{kpi.value}</h3>
              </div>
            </article>
          ))}
        </section>

        <section className="ai-dashboard-grid">
          <div className="ai-card ai-input-card">
            <h2>Interactive Intelligence Controls</h2>
            <p>Enter symptoms, context, and behavior patterns to unlock high-confidence health guidance.</p>
            <textarea
              className="ai-textarea"
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="Describe symptoms, mood patterns, lifestyle, history, and goals..."
            />
            <div className="ai-action-grid">
              {ACTIONS.map((action) => (
                <button
                  key={action.key}
                  className={`ai-action-btn ${action.style}`}
                  onClick={() => handleAction(action.key)}
                  disabled={loading}
                  title={`Run ${action.label}`}
                >
                  <span>{action.icon}</span> {action.label}
                </button>
              ))}
            </div>
          </div>

          <div className="ai-card ai-side-card">
            <h3>Diagnostics moved to dedicated workspace</h3>
            <p className="ai-note">
              Image upload and lab report analysis have been moved to the dedicated <strong>AI Diagnostics</strong> page for a cleaner flow.
            </p>
            <a className="ai-action-btn primary" href="/ai-diagnostics">🔬 Open AI Diagnostics</a>
          </div>
        </section>

        <section className="ai-feature-groups">
          {FEATURE_GROUPS.map((group) => (
            <div key={group.title} className={`ai-card ai-feature-group tone-${group.tone}`}>
              <div className="ai-feature-header">
                <h3>{group.title}</h3>
                <span>{group.items.length} modules</span>
              </div>
              <div className="ai-feature-grid">
                {group.items.map((item) => (
                  <article key={item} className="ai-feature-item" title={summarizeFeature(item)}>
                    <div className="ai-feature-icon">{featureIcon(item)}</div>
                    <div>
                      <h4>{item}</h4>
                      <p>{summarizeFeature(item)}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </section>

        <section className="ai-results-grid">
          {progression && (
            <div className="ai-card">
              <h3>Symptom Progression</h3>
              {progression.timeline?.map((t) => <p key={t.day}>Day {t.day}: {t.status}</p>)}
            </div>
          )}
          {risk && (
            <div className="ai-card">
              <h3>Health Risk Score</h3>
              <p>Diabetes Risk: {risk.diabetesRisk.score}% ({risk.diabetesRisk.level})</p>
              <p>Heart Risk: {risk.heartRisk.score}% ({risk.heartRisk.level})</p>
            </div>
          )}
          {emotion && (
            <div className="ai-card">
              <h3>Emotion Detection</h3>
              <p>Mood: {emotion.mood}</p>
              <p>{emotion.suggestion}</p>
            </div>
          )}
          {lab && (
            <div className="ai-card">
              <h3>Lab Analyzer</h3>
              {lab.findings?.length ? lab.findings.map((f) => <p key={f}>• {f}</p>) : <p>No abnormalities detected.</p>}
            </div>
          )}
          {advanced && (
            <div className="ai-card">
              <h3>Advanced AI Bundle</h3>
              <p>Digital Twin: {advanced.digitalTwin?.fatigueRiskIn5Days}</p>
              <p>Severity: {advanced.dynamicSeverityClassification}</p>
              <p>Adherence: {advanced.medicationAdherence?.adherencePercent}%</p>
            </div>
          )}
          {ultra && (
            <div className="ai-card">
              <h3>Ultra AI Output</h3>
              <pre>{JSON.stringify(ultra, null, 2)}</pre>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
