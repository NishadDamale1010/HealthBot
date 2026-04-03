import { Link } from "react-router-dom";

const featureCards = [
  {
    title: "Symptom Deep Analysis",
    description: "Run progression simulations, risk scoring, and advanced diagnostic insights.",
    cta: "Open AI Suite",
    to: "/ai-suite",
  },
  {
    title: "Image-based Skin Check",
    description: "Upload an image for AI-assisted skin condition detection with confidence and severity.",
    cta: "Go to Image Analysis",
    to: "/ai-suite",
  },
  {
    title: "Lab Report Intelligence",
    description: "Paste your lab values to receive a structured summary and notable findings.",
    cta: "Analyze Lab Report",
    to: "/ai-suite",
  },
  {
    title: "Conversation-first Guidance",
    description: "Prefer chat? Keep using the Chat experience and switch to image workflows when needed.",
    cta: "Open Chat",
    to: "/chat",
  },
];

export default function AIAnalysis() {
  return (
    <div className="hb-premium-page" style={{ maxWidth: 1080, margin: "24px auto", padding: "0 20px" }}>
      <section
        className="hb-panel"
        style={{
          padding: 22,
          marginBottom: 18,
          background:
            "linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(59,130,246,0.09) 50%, rgba(14,165,233,0.09) 100%)",
          border: "1px solid rgba(16,185,129,0.22)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: -40,
            top: -40,
            width: 170,
            height: 170,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(59,130,246,0.2), transparent 65%)",
            animation: "hbFloat 8s ease-in-out infinite",
          }}
        />
        <p style={{ margin: 0, color: "#0f766e", fontWeight: 700, letterSpacing: 0.25 }}>AI ANALYSIS HUB</p>
        <h1 className="hb-premium-title" style={{ margin: "8px 0 10px", fontSize: 32 }}>
          Dedicated AI Analysis Workspace
        </h1>
        <p style={{ margin: 0, color: "#334155", maxWidth: 760 }}>
          This page separates advanced analysis from regular chat so you can quickly run medical intelligence,
          image-assisted checks, and lab-focused workflows in one premium space.
        </p>
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
          gap: 12,
        }}
      >
        {featureCards.map((card) => (
          <article
            key={card.title}
            className="hb-panel"
            style={{
              padding: 16,
              border: "1px solid rgba(148,163,184,0.35)",
              transition: "transform .2s ease, box-shadow .2s ease",
              animation: "hbCardIn .35s ease both",
            }}
          >
            <h3 style={{ marginTop: 0, marginBottom: 8 }}>{card.title}</h3>
            <p style={{ color: "#475569", marginTop: 0 }}>{card.description}</p>
            <Link className="hb-btn" to={card.to}>
              {card.cta}
            </Link>
          </article>
        ))}
      </section>

      <style>{`
        @keyframes hbFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(8px); }
        }
        @keyframes hbCardIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
