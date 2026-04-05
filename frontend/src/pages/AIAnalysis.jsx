import { Link } from "react-router-dom";

const analysisTracks = [
  {
    title: "Symptom Intelligence",
    description: "Run focused triage simulation and risk-first analysis from your symptom history.",
    link: "/chat",
    cta: "Start in Chat",
  },
  {
    title: "Image-based Detection",
    description: "Upload skin/rash images directly in chat for AI-assisted image signal checks.",
    link: "/chat",
    cta: "Open Image Chat",
  },
  {
    title: "AI Diagnostics Hub",
    description: "Use real image-based disease triage and lab report AI parsing in one premium workspace.",
    link: "/ai-diagnostics",
    cta: "Open Diagnostics",
  },
  {
    title: "Advanced AI Suite",
    description: "Open complete AI modules including progression, lab intelligence, and ultra-insights.",
    link: "/ai-suite",
    cta: "Open AI Suite",
  },
  {
    title: "Doctor-ready Insights",
    description: "Generate structured findings and keep analysis outcomes organized by workflow.",
    link: "/health",
    cta: "See Insights",
  },
];

export default function AIAnalysis() {
  return (
    <div className="hb-premium-page" style={{ maxWidth: 1080, margin: "22px auto", padding: "0 20px" }}>
      <section
        className="hb-panel"
        style={{
          padding: 22,
          marginBottom: 14,
          background: "linear-gradient(140deg, rgba(14,165,233,.12), rgba(16,185,129,.14), rgba(15,23,42,.06))",
          border: "1px solid rgba(14,165,233,.24)",
        }}
      >
        <p style={{ margin: 0, fontSize: 12, color: "#0369a1", fontWeight: 700, letterSpacing: ".08em" }}>DEDICATED AI ANALYSIS</p>
        <h1 className="hb-premium-title" style={{ margin: "8px 0", fontSize: 30 }}>Power Analysis Command Center</h1>
        <p style={{ margin: 0, color: "#334155", maxWidth: 720 }}>
          A separate workspace for deeper diagnostics, image-assisted checks, and advanced medical AI workflows.
        </p>
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
        {analysisTracks.map((item, index) => (
          <article
            key={item.title}
            className="hb-panel"
            style={{
              padding: 16,
              animation: `hbTileIn .35s ease ${index * 0.05}s both`,
            }}
          >
            <h3 style={{ marginTop: 0, marginBottom: 8, color: "#0f172a" }}>{item.title}</h3>
            <p style={{ marginTop: 0, color: "#475569", minHeight: 64 }}>{item.description}</p>
            <Link className="hb-btn" to={item.link}>{item.cta}</Link>
          </article>
        ))}
      </section>

      <style>{`
        @keyframes hbTileIn {
          from { opacity: 0; transform: translateY(10px) scale(.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
