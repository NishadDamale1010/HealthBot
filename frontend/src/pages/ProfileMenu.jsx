import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function ProfileMenu() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        try {
            const u = JSON.parse(localStorage.getItem("user"));
            if (u) setUser(u);
        } catch (e) { }
    }, []);

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };

    const initials = user?.name ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "?";

    return (
        <div style={{ padding: "24px 20px 100px", fontFamily: "'DM Sans', sans-serif" }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: "#1e293b", marginBottom: 24 }}>Profile</h1>
            
            {/* User Info Card */}
            <div style={{
                background: "#ffffff", border: "1px solid #f1f5f9", borderRadius: 20,
                padding: 24, display: "flex", alignItems: "center", gap: 16,
                boxShadow: "0 4px 16px rgba(0,0,0,0.03)", marginBottom: 24
            }}>
                <div style={{
                    width: 64, height: 64, borderRadius: "50%", background: "#ecfdf5",
                    color: "#10b981", display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 24, fontWeight: 700, border: "2px solid #a7f3d0"
                }}>
                    {initials}
                </div>
                <div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: "#1e293b" }}>{user?.name || "Guest"}</div>
                    <div style={{ fontSize: 14, color: "#64748b", marginTop: 2 }}>{user?.email || "Not signed in"}</div>
                </div>
            </div>

            {/* Menu Items */}
            <div style={{ background: "#ffffff", border: "1px solid #f1f5f9", borderRadius: 16, overflow: "hidden", marginBottom: 24 }}>
                <div 
                    onClick={() => navigate("/privacy")}
                    style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid #f1f5f9", cursor: "pointer" }}
                >
                    <span style={{ fontSize: 20 }}>🔒</span>
                    <span style={{ flex: 1, fontSize: 15, fontWeight: 500, color: "#1e293b" }}>Data Privacy & Consent</span>
                    <span style={{ color: "#cbd5e1" }}>➔</span>
                </div>
                <div 
                    onClick={() => navigate("/hospitals")}
                    style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid #f1f5f9", cursor: "pointer" }}
                >
                    <span style={{ fontSize: 20 }}>🏥</span>
                    <span style={{ flex: 1, fontSize: 15, fontWeight: 500, color: "#1e293b" }}>Saved Hospitals</span>
                    <span style={{ color: "#cbd5e1" }}>➔</span>
                </div>
                <div 
                    onClick={() => {}}
                    style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}
                >
                    <span style={{ fontSize: 20 }}>⚙️</span>
                    <span style={{ flex: 1, fontSize: 15, fontWeight: 500, color: "#1e293b" }}>Settings</span>
                    <span style={{ color: "#cbd5e1" }}>➔</span>
                </div>
            </div>

            {/* Logout */}
            <button 
                onClick={logout}
                style={{
                    width: "100%", padding: 16, borderRadius: 16, border: "1px solid #fecaca",
                    background: "#fef2f2", color: "#dc2626", fontSize: 15, fontWeight: 600,
                    cursor: "pointer", fontFamily: "'DM Sans', sans-serif"
                }}
            >
                Log Out
            </button>
        </div>
    );
}
