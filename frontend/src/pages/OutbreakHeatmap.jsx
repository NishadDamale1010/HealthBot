/**
 * OutbreakHeatmap.jsx
 * -------------------
 * SIH Blueprint Feature: Epidemic Outbreak Heatmap
 * 
 * Displays a simulated syndromic surveillance dashboard showing
 * anonymized, aggregated symptom query data across Indian districts.
 * This empowers public health officials with early warning capabilities
 * for vector-borne diseases like dengue or malaria.
 * 
 * Uses: 100% free, no external APIs. All data is simulated for demonstration.
 */
import { useState, useEffect } from "react";

/* ── Simulated outbreak data for Indian districts ── */
const OUTBREAK_DATA = [
    { district: "Pune", state: "Maharashtra", disease: "Dengue", cases: 187, trend: "rising", severity: "high", lat: 18.52, lng: 73.85 },
    { district: "Chennai", state: "Tamil Nadu", disease: "Malaria", cases: 134, trend: "rising", severity: "high", lat: 13.08, lng: 80.27 },
    { district: "Kolkata", state: "West Bengal", disease: "Chikungunya", cases: 98, trend: "stable", severity: "medium", lat: 22.57, lng: 88.36 },
    { district: "Jaipur", state: "Rajasthan", disease: "Dengue", cases: 76, trend: "falling", severity: "medium", lat: 26.91, lng: 75.78 },
    { district: "Lucknow", state: "Uttar Pradesh", disease: "Typhoid", cases: 63, trend: "rising", severity: "medium", lat: 26.85, lng: 80.95 },
    { district: "Patna", state: "Bihar", disease: "Japanese Encephalitis", cases: 45, trend: "rising", severity: "high", lat: 25.61, lng: 85.14 },
    { district: "Mumbai", state: "Maharashtra", disease: "Leptospirosis", cases: 52, trend: "stable", severity: "medium", lat: 19.07, lng: 72.87 },
    { district: "Guwahati", state: "Assam", disease: "Malaria", cases: 89, trend: "rising", severity: "high", lat: 26.14, lng: 91.74 },
    { district: "Bengaluru", state: "Karnataka", disease: "Dengue", cases: 41, trend: "falling", severity: "low", lat: 12.97, lng: 77.59 },
    { district: "Hyderabad", state: "Telangana", disease: "Chikungunya", cases: 33, trend: "stable", severity: "low", lat: 17.38, lng: 78.48 },
    { district: "Bhopal", state: "Madhya Pradesh", disease: "Dengue", cases: 67, trend: "rising", severity: "medium", lat: 23.26, lng: 77.41 },
    { district: "Thiruvananthapuram", state: "Kerala", disease: "Nipah Virus", cases: 8, trend: "rising", severity: "critical", lat: 8.52, lng: 76.93 },
];

const SEVERITY_CONFIG = {
    critical: { bg: "#7f1d1d", color: "#fca5a5", border: "#ef4444", dot: "#ef4444", label: "CRITICAL" },
    high: { bg: "#991b1b", color: "#fca5a5", border: "#dc2626", dot: "#dc2626", label: "HIGH" },
    medium: { bg: "#92400e", color: "#fde68a", border: "#f59e0b", dot: "#f59e0b", label: "MEDIUM" },
    low: { bg: "#065f46", color: "#6ee7b7", border: "#10b981", dot: "#10b981", label: "LOW" },
};

const TREND_ICONS = { rising: "📈", falling: "📉", stable: "➡️" };

const STYLES = `
  .heatmap-root {
    font-family: 'DM Sans', sans-serif;
    padding: 24px;
    max-width: 1100px;
    margin: 0 auto;
  }
  .heatmap-header {
    background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
    color: white;
    padding: 32px;
    border-radius: 20px;
    margin-bottom: 24px;
    box-shadow: 0 10px 40px rgba(220, 38, 38, 0.25);
    position: relative;
    overflow: hidden;
  }
  .heatmap-header::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -20%;
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
    border-radius: 50%;
  }
  .heatmap-title {
    font-size: 28px;
    font-weight: 700;
    margin-bottom: 8px;
    position: relative;
  }
  .heatmap-subtitle {
    font-size: 14px;
    opacity: 0.85;
    position: relative;
    max-width: 600px;
    line-height: 1.5;
  }
  .heatmap-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin-bottom: 24px;
  }
  .stat-card {
    background: #ffffff;
    border: 1px solid #f1f5f9;
    border-radius: 16px;
    padding: 20px;
    text-align: center;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  }
  .stat-value {
    font-size: 32px;
    font-weight: 700;
    margin-bottom: 4px;
  }
  .stat-label {
    font-size: 12px;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-weight: 500;
  }
  .filter-bar {
    display: flex;
    gap: 12px;
    margin-bottom: 20px;
    flex-wrap: wrap;
  }
  .filter-btn {
    padding: 8px 18px;
    border-radius: 999px;
    border: 1px solid #e2e8f0;
    background: white;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s;
    font-family: 'DM Sans', sans-serif;
  }
  .filter-btn:hover { border-color: #dc2626; color: #dc2626; }
  .filter-btn.active {
    background: #dc2626;
    color: white;
    border-color: #dc2626;
  }
  .outbreak-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 16px;
  }
  .outbreak-card {
    background: white;
    border: 1px solid #f1f5f9;
    border-radius: 16px;
    padding: 20px;
    transition: transform 0.2s, box-shadow 0.2s;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    position: relative;
    overflow: hidden;
  }
  .outbreak-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 24px rgba(0,0,0,0.08);
  }
  .outbreak-card-stripe {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
  }
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 12px;
  }
  .card-district {
    font-size: 18px;
    font-weight: 600;
    color: #0f172a;
  }
  .card-state {
    font-size: 12px;
    color: #64748b;
    margin-top: 2px;
  }
  .severity-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    border-radius: 999px;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.06em;
  }
  .card-body {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 14px;
    padding-top: 14px;
    border-top: 1px solid #f1f5f9;
  }
  .card-disease {
    font-size: 15px;
    font-weight: 500;
    color: #334155;
  }
  .card-cases {
    font-size: 24px;
    font-weight: 700;
  }
  .card-cases-label {
    font-size: 11px;
    color: #94a3b8;
  }
  .card-trend {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: #64748b;
  }
  .disclaimer {
    text-align: center;
    color: #94a3b8;
    font-size: 11px;
    margin-top: 24px;
    padding: 16px;
    background: #f8fafc;
    border-radius: 12px;
    border: 1px solid #f1f5f9;
  }
`;

export default function OutbreakHeatmap() {
    const [filter, setFilter] = useState("all");
    const [data, setData] = useState(OUTBREAK_DATA);

    useEffect(() => {
        if (filter === "all") {
            setData(OUTBREAK_DATA);
        } else {
            setData(OUTBREAK_DATA.filter(d => d.severity === filter));
        }
    }, [filter]);

    const totalCases = OUTBREAK_DATA.reduce((sum, d) => sum + d.cases, 0);
    const criticalZones = OUTBREAK_DATA.filter(d => d.severity === "critical" || d.severity === "high").length;
    const risingTrends = OUTBREAK_DATA.filter(d => d.trend === "rising").length;

    return (
        <>
            <style>{STYLES}</style>
            <div className="heatmap-root">
                {/* Header */}
                <div className="heatmap-header">
                    <div className="heatmap-title">🗺️ Epidemic Outbreak Surveillance</div>
                    <div className="heatmap-subtitle">
                        Real-time syndromic surveillance dashboard aggregating anonymized symptom queries 
                        across Indian districts. Provides early warning for vector-borne disease outbreaks.
                    </div>
                </div>

                {/* Stats Row */}
                <div className="heatmap-stats">
                    <div className="stat-card">
                        <div className="stat-value" style={{ color: "#dc2626" }}>{totalCases}</div>
                        <div className="stat-label">Total Reported Queries</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value" style={{ color: "#f59e0b" }}>{OUTBREAK_DATA.length}</div>
                        <div className="stat-label">Active Districts</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value" style={{ color: "#ef4444" }}>{criticalZones}</div>
                        <div className="stat-label">High/Critical Zones</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value" style={{ color: "#0ea5e9" }}>{risingTrends}</div>
                        <div className="stat-label">Rising Trends</div>
                    </div>
                </div>

                {/* Filters */}
                <div className="filter-bar">
                    {["all", "critical", "high", "medium", "low"].map(f => (
                        <button
                            key={f}
                            className={`filter-btn ${filter === f ? "active" : ""}`}
                            onClick={() => setFilter(f)}
                        >
                            {f === "all" ? "All Zones" : f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Outbreak Cards */}
                <div className="outbreak-grid">
                    {data.map((item, i) => {
                        const sev = SEVERITY_CONFIG[item.severity];
                        return (
                            <div className="outbreak-card" key={i}>
                                <div className="outbreak-card-stripe" style={{ background: sev.border }} />
                                <div className="card-header">
                                    <div>
                                        <div className="card-district">{item.district}</div>
                                        <div className="card-state">{item.state}</div>
                                    </div>
                                    <div
                                        className="severity-badge"
                                        style={{
                                            background: sev.bg,
                                            color: sev.color,
                                            border: `1px solid ${sev.border}33`,
                                        }}
                                    >
                                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: sev.dot, display: "inline-block" }} />
                                        {sev.label}
                                    </div>
                                </div>
                                <div className="card-disease">{item.disease}</div>
                                <div className="card-body">
                                    <div>
                                        <div className="card-cases" style={{ color: sev.border }}>{item.cases}</div>
                                        <div className="card-cases-label">symptom queries</div>
                                    </div>
                                    <div className="card-trend">
                                        {TREND_ICONS[item.trend]} {item.trend}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Disclaimer */}
                <div className="disclaimer">
                    ⚠️ This is a simulated syndromic surveillance dashboard for demonstration purposes.
                    Data is anonymized and aggregated from user symptom queries. Not a substitute for official epidemiological data.
                </div>
            </div>
        </>
    );
}
