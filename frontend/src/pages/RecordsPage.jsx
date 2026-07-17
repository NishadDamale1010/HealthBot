import { useNavigate } from "react-router-dom";

export default function RecordsPage() {
    const navigate = useNavigate();

    const sections = [
        { id: "history", title: "Health History", desc: "View your past symptom assessments", icon: "📋", link: "/dashboard" },
        { id: "reports", title: "Health Insights & Reports", desc: "AI-generated summaries and PDFs", icon: "📊", link: "/health" },
        { id: "abha", title: "ABHA Linkage", desc: "Manage your Ayushman Bharat Health Account", icon: "🏥", link: "/abha" },
    ];

    return (
        <div style={{ padding: "24px 20px 100px", fontFamily: "'DM Sans', sans-serif" }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: "#1e293b", marginBottom: 24 }}>Health Records</h1>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {sections.map(sec => (
                    <div 
                        key={sec.id} 
                        onClick={() => navigate(sec.link)}
                        style={{
                            background: "#ffffff", border: "1px solid #f1f5f9", borderRadius: 16,
                            padding: 20, display: "flex", alignItems: "center", gap: 16,
                            cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.03)"
                        }}
                    >
                        <div style={{
                            width: 52, height: 52, borderRadius: 14, background: "#ecfdf5",
                            color: "#10b981", display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 24, flexShrink: 0
                        }}>
                            {sec.icon}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 16, fontWeight: 600, color: "#1e293b", marginBottom: 4 }}>{sec.title}</div>
                            <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.4 }}>{sec.desc}</div>
                        </div>
                        <div style={{ color: "#cbd5e1" }}>➔</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
