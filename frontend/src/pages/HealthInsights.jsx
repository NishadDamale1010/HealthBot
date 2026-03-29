import { useEffect, useState } from "react";
import API from "../services/api";

export default function HealthInsightsPreview() {
    const [insights, setInsights] = useState(null);
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                const [insightsRes, historyRes] = await Promise.all([
                    API.get("/api/health/insights"),
                    API.get("/api/health/history"),
                ]);
                setInsights(insightsRes.data.insights);
                setSessions((historyRes.data.history || []).slice(0, 3));
            } catch {
                setError("Failed to load health insights. Please log in and try again.");
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    if (loading) {
        return (
            <div style={{
                minHeight: "60vh", display: "flex", alignItems: "center",
                justifyContent: "center", fontFamily: "'DM Sans', sans-serif"
            }}>
                <p style={{ color: "#64748b", fontSize: 14 }}>Loading health insights...</p>
            </div>
        );
    }

    return (
        <div style={{
            maxWidth: 800, margin: "32px auto", padding: "0 24px",
            fontFamily: "'DM Sans', sans-serif"
        }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>
                Health Insights
            </h1>
            <p style={{ color: "#64748b", fontSize: 14, marginBottom: 24 }}>
                AI-generated insights based on your chat history.
            </p>

            {error && (
                <div style={{
                    padding: "12px 16px", borderRadius: 12, fontSize: 14,
                    background: "#fef2f2", color: "#dc2626",
                    border: "1px solid #fecaca", marginBottom: 16
                }}>{error}</div>
            )}

            {/* AI Insights */}
            {insights ? (
                <div style={{
                    background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0",
                    padding: "20px 24px", marginBottom: 24, whiteSpace: "pre-wrap",
                    lineHeight: 1.7, fontSize: 14, color: "#1e293b"
                }}>
                    {insights}
                </div>
            ) : (
                <div style={{
                    background: "#f8fafc", borderRadius: 16, border: "1px solid #e2e8f0",
                    padding: "20px 24px", marginBottom: 24, textAlign: "center",
                    color: "#94a3b8", fontSize: 14
                }}>
                    No data yet. Start chatting to generate insights.
                </div>
            )}

            {/* Recent Sessions */}
            {sessions.length > 0 && (
                <>
                    <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", marginBottom: 12 }}>
                        Recent Conversations
                    </h2>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {sessions.map((session, i) => {
                            const userMsgs = session.filter(m => m.role === "user");
                            const preview = userMsgs.length > 0 ? userMsgs[0].content : "Conversation";
                            const date = session[0]?.createdAt
                                ? new Date(session[0].createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                                : "";
                            return (
                                <div key={i} style={{
                                    background: "#fff", borderRadius: 12,
                                    border: "1px solid #e2e8f0", padding: "12px 16px",
                                }}>
                                    <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: "#1e293b" }}>
                                        {preview.length > 80 ? preview.slice(0, 80) + "..." : preview}
                                    </p>
                                    <p style={{ margin: "4px 0 0", fontSize: 12, color: "#94a3b8" }}>
                                        {date} &middot; {session.length} messages
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}

            {/* Download Report */}
            <button
                onClick={() => {
                    const base = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
                    const token = localStorage.getItem("token");
                    window.open(`${base}/api/health/report?token=${token}`, "_blank");
                }}
                style={{
                    marginTop: 24, width: "100%", padding: "12px",
                    borderRadius: 12, border: "none",
                    background: "linear-gradient(135deg, #0ea5e9, #06b6d4)",
                    color: "#fff", fontWeight: 600, fontSize: 14, cursor: "pointer",
                    fontFamily: "'DM Sans', sans-serif"
                }}
            >
                Download Health Report (PDF)
            </button>
        </div>
    );
}
