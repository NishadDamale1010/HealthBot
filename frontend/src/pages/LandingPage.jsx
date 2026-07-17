import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function LandingPage() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        try {
            const u = JSON.parse(localStorage.getItem("user"));
            if (u) setUser(u);
        } catch (e) { }
    }, []);

    const name = user?.name ? user.name.split(" ")[0] : "Guest";
    const isAsha = user?.role === "ASHA_WORKER";

    const quickActions = [
        { id: "symptom", icon: "🩺", label: "Symptom Checker", link: "/chat" },
        { id: "health", icon: "💡", label: "Health Insights", link: "/health" },
        { id: "doctors", icon: "👨‍⚕️", label: "Find Hospitals", link: "/hospitals" },
        { id: "emergency", icon: "🚨", label: "Emergency", link: "/chat", color: "#ef4444" },
        { id: "ai", icon: "✨", label: "AI Suite", link: "/ai-suite" },
        { id: "outbreak", icon: "🗺️", label: "Outbreak Map", link: "/outbreak" },
    ];

    if (isAsha) {
        quickActions.push({ id: "asha", icon: "👩‍🍼", label: "ASHA Co-Pilot", link: "/asha-copilot", color: "#0ea5e9" });
    }

    return (
        <div style={{ padding: "24px 20px 100px", fontFamily: "'DM Sans', sans-serif" }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <div>
                    <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1e293b", margin: 0 }}>
                        Hello, {name} 👋
                    </h1>
                    <p style={{ fontSize: 14, color: "#64748b", margin: "4px 0 0" }}>
                        How can I help you today?
                    </p>
                </div>
                <div style={{ position: "relative" }}>
                    <div style={{
                        width: 40, height: 40, borderRadius: "50%", background: "#f1f5f9",
                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20
                    }}>🔔</div>
                    <div style={{
                        position: "absolute", top: 8, right: 10, width: 8, height: 8,
                        background: "#ef4444", borderRadius: "50%", border: "2px solid #f8fafc"
                    }} />
                </div>
            </div>

            {/* Health Score Card */}
            <div style={{
                background: "#ffffff", borderRadius: 20, padding: 20,
                boxShadow: "0 4px 20px rgba(0,0,0,0.05)", marginBottom: 24,
                border: "1px solid #f1f5f9"
            }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                    <div>
                        <div style={{ fontSize: 13, color: "#64748b", fontWeight: 500, marginBottom: 4 }}>Health Score</div>
                        <div style={{ fontSize: 32, fontWeight: 700, color: "#10b981", display: "flex", alignItems: "baseline", gap: 4 }}>
                            85<span style={{ fontSize: 14, color: "#94a3b8", fontWeight: 500 }}>/100</span>
                        </div>
                        <div style={{ fontSize: 13, color: "#10b981", fontWeight: 600 }}>Great!</div>
                    </div>
                    <div style={{
                        width: 64, height: 64, borderRadius: 20, background: "#ecfdf5",
                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32,
                        color: "#10b981"
                    }}>
                        💚
                    </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #f1f5f9", paddingTop: 16 }}>
                    <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Steps</div>
                        <div style={{ fontSize: 16, fontWeight: 600, color: "#1e293b" }}>7,842</div>
                        <div style={{ fontSize: 10, color: "#94a3b8" }}>/10,000</div>
                    </div>
                    <div style={{ width: 1, background: "#f1f5f9" }} />
                    <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Water</div>
                        <div style={{ fontSize: 16, fontWeight: 600, color: "#1e293b" }}>6/8</div>
                        <div style={{ fontSize: 10, color: "#94a3b8" }}>Glasses</div>
                    </div>
                    <div style={{ width: 1, background: "#f1f5f9" }} />
                    <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Sleep</div>
                        <div style={{ fontSize: 16, fontWeight: 600, color: "#1e293b" }}>7h 26m</div>
                        <div style={{ fontSize: 10, color: "#10b981", fontWeight: 500 }}>Good</div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <h2 style={{ fontSize: 16, fontWeight: 700, color: "#1e293b", margin: 0 }}>Quick Actions</h2>
                    <Link to="/ai-suite" style={{ fontSize: 12, color: "#10b981", fontWeight: 600, textDecoration: "none" }}>View All</Link>
                </div>
                
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
                    {quickActions.slice(0, 4).map(action => (
                        <div key={action.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, cursor: "pointer" }} onClick={() => navigate(action.link)}>
                            <div style={{
                                width: 56, height: 56, borderRadius: 16,
                                background: action.color ? `${action.color}15` : "#f1f5f9",
                                color: action.color || "#10b981",
                                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24,
                                border: `1px solid ${action.color ? `${action.color}30` : "#e2e8f0"}`
                            }}>
                                {action.icon}
                            </div>
                            <div style={{ fontSize: 11, fontWeight: 500, color: "#475569", textAlign: "center", lineHeight: 1.2 }}>
                                {action.label}
                            </div>
                        </div>
                    ))}
                </div>
                
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginTop: 16 }}>
                    {quickActions.slice(4).map(action => (
                        <div key={action.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, cursor: "pointer" }} onClick={() => navigate(action.link)}>
                            <div style={{
                                width: 56, height: 56, borderRadius: 16,
                                background: action.color ? `${action.color}15` : "#f1f5f9",
                                color: action.color || "#10b981",
                                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24,
                                border: `1px solid ${action.color ? `${action.color}30` : "#e2e8f0"}`
                            }}>
                                {action.icon}
                            </div>
                            <div style={{ fontSize: 11, fontWeight: 500, color: "#475569", textAlign: "center", lineHeight: 1.2 }}>
                                {action.label}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Daily Tip */}
            <div style={{
                background: "linear-gradient(135deg, #10b981, #059669)",
                borderRadius: 20, padding: 20, color: "white",
                position: "relative", overflow: "hidden",
                boxShadow: "0 8px 24px rgba(16, 185, 129, 0.25)"
            }}>
                <div style={{ position: "absolute", top: -20, right: -20, fontSize: 100, opacity: 0.1 }}>🍋</div>
                <div style={{ position: "relative", zIndex: 1 }}>
                    <div style={{ display: "inline-block", background: "rgba(255,255,255,0.2)", padding: "4px 10px", borderRadius: 999, fontSize: 11, fontWeight: 600, letterSpacing: "0.05em", marginBottom: 12 }}>
                        DAILY TIP
                    </div>
                    <p style={{ fontSize: 14, lineHeight: 1.5, margin: 0, fontWeight: 500, maxWidth: "85%" }}>
                        Drink a glass of warm water with lemon in the morning. It helps boost your metabolism!
                    </p>
                </div>
            </div>
        </div>
    );
}
