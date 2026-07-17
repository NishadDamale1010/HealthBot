/**
 * ASHADashboard.jsx
 * -----------------
 * SIH Blueprint Feature: ASHA Worker Co-Pilot Mode
 * 
 * Specialized dashboard for Accredited Social Health Activists (ASHA) workers.
 * Provides instant access to maternal health guidelines, vaccination schedules,
 * government scheme eligibility checks, and disease outbreak alerts.
 * 
 * India has over 1 million ASHA workers serving ~800 million rural citizens.
 * This module directly reduces their cognitive load.
 */
import { useState } from "react";

/* ── Curated Maternal Health Guidelines ── */
const GUIDELINES = [
    {
        category: "Antenatal Care (ANC)",
        items: [
            "Register pregnancy within first trimester at nearest health facility",
            "Minimum 4 ANC checkups as per WHO recommendation (ideally 8)",
            "Iron & Folic Acid (IFA) supplementation — 1 tablet daily for 180 days",
            "Two doses of Tetanus Toxoid (TT) vaccine during pregnancy",
            "Monitor blood pressure at each visit to detect pre-eclampsia early",
            "Conduct hemoglobin test — refer if Hb < 7 g/dL (severe anemia)",
        ]
    },
    {
        category: "Safe Delivery",
        items: [
            "Encourage institutional delivery at PHC/CHC/District Hospital",
            "Prepare birth plan by 8th month — identify transport, blood donor",
            "Recognize danger signs: heavy bleeding, convulsions, severe headache",
            "Ensure clean delivery kit availability for home deliveries",
            "Janani Suraksha Yojana (JSY) cash benefit for institutional delivery",
        ]
    },
    {
        category: "Postnatal Care (PNC)",
        items: [
            "First PNC visit within 48 hours of delivery",
            "Initiate breastfeeding within 1 hour of birth (colostrum feeding)",
            "Exclusive breastfeeding for 6 months — no water, no other food",
            "Monitor for postpartum hemorrhage and infection signs",
            "3 additional PNC visits: Day 3, Day 7, and Day 42",
        ]
    },
    {
        category: "Newborn Care",
        items: [
            "Ensure warm chain — dry, wrap, skin-to-skin contact",
            "Do NOT apply anything on umbilical cord stump",
            "Watch for danger signs: not feeding, convulsions, fast breathing",
            "Birth dose vaccines: OPV-0, BCG, Hepatitis B within 24 hours",
            "Weigh baby — refer if birth weight < 2.5 kg (Low Birth Weight)",
        ]
    },
];

/* ── National Immunization Schedule (India) ── */
const VACCINATION_SCHEDULE = [
    { age: "Birth", vaccines: "BCG, OPV-0, Hepatitis B (Birth Dose)", icon: "👶" },
    { age: "6 Weeks", vaccines: "OPV-1, Pentavalent-1, Rotavirus-1, fIPV-1, PCV-1", icon: "💉" },
    { age: "10 Weeks", vaccines: "OPV-2, Pentavalent-2, Rotavirus-2", icon: "💉" },
    { age: "14 Weeks", vaccines: "OPV-3, Pentavalent-3, Rotavirus-3, fIPV-2, PCV-2", icon: "💉" },
    { age: "9 Months", vaccines: "MR-1 (Measles-Rubella), JE-1 (in endemic areas), PCV Booster", icon: "🩺" },
    { age: "16-24 Months", vaccines: "MR-2, OPV Booster, DPT Booster-1, JE-2", icon: "🩺" },
    { age: "5-6 Years", vaccines: "DPT Booster-2", icon: "🏫" },
    { age: "10 Years", vaccines: "TT (Tetanus Toxoid)", icon: "🏫" },
    { age: "16 Years", vaccines: "TT Booster", icon: "🎓" },
];

/* ── Government Health Schemes ── */
const SCHEMES = [
    {
        name: "Pradhan Mantri Jan Arogya Yojana (PM-JAY)",
        coverage: "₹5 lakh/family/year for secondary & tertiary care",
        eligibility: "BPL families, socio-economic caste census (SECC) listed",
        icon: "🏥",
    },
    {
        name: "Janani Suraksha Yojana (JSY)",
        coverage: "₹1,400 (rural) / ₹1,000 (urban) for institutional delivery",
        eligibility: "All BPL pregnant women, SC/ST women",
        icon: "🤰",
    },
    {
        name: "Janani Shishu Suraksha Karyakaram (JSSK)",
        coverage: "Free delivery + treatment + drugs + food + transport",
        eligibility: "All pregnant women delivering in public institutions",
        icon: "👩‍🍼",
    },
    {
        name: "Rashtriya Bal Swasthya Karyakram (RBSK)",
        coverage: "Free screening & management for children 0-18 years",
        eligibility: "All children enrolled in government/aided schools",
        icon: "👧",
    },
    {
        name: "National Health Mission (NHM) — ASHA Incentives",
        coverage: "Performance-based incentives for ASHA workers",
        eligibility: "Registered ASHA workers completing assigned tasks",
        icon: "💰",
    },
];

const STYLES = `
  .asha-root {
    font-family: 'DM Sans', sans-serif;
    padding: 24px;
    max-width: 1000px;
    margin: 0 auto;
    color: #1e293b;
  }
  .asha-header {
    background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
    color: white;
    padding: 32px;
    border-radius: 20px;
    margin-bottom: 28px;
    box-shadow: 0 10px 40px rgba(14, 165, 233, 0.25);
    position: relative;
    overflow: hidden;
  }
  .asha-header::before {
    content: '';
    position: absolute;
    top: -40%;
    right: -15%;
    width: 280px;
    height: 280px;
    background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
    border-radius: 50%;
  }
  .asha-title { font-size: 28px; font-weight: 700; margin-bottom: 8px; position: relative; }
  .asha-subtitle { font-size: 14px; opacity: 0.88; line-height: 1.5; max-width: 600px; position: relative; }
  .asha-badge {
    display: inline-flex; align-items: center; gap: 6px;
    background: rgba(255,255,255,0.15); padding: 6px 14px;
    border-radius: 999px; font-size: 11px; font-weight: 600;
    margin-top: 14px; letter-spacing: 0.04em; position: relative;
  }

  .asha-tabs {
    display: flex; gap: 8px; margin-bottom: 24px; flex-wrap: wrap;
  }
  .asha-tab {
    padding: 10px 20px; border-radius: 999px;
    border: 1px solid #e2e8f0; background: white;
    font-size: 14px; font-weight: 500; cursor: pointer;
    transition: all 0.15s; font-family: 'DM Sans', sans-serif;
    display: flex; align-items: center; gap: 6px;
  }
  .asha-tab:hover { border-color: #0ea5e9; color: #0ea5e9; }
  .asha-tab.active {
    background: #0ea5e9; color: white; border-color: #0ea5e9;
    box-shadow: 0 4px 12px rgba(14, 165, 233, 0.25);
  }

  .section-card {
    background: white; border: 1px solid #f1f5f9;
    border-radius: 16px; padding: 24px; margin-bottom: 16px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.03);
  }
  .section-title {
    font-size: 18px; font-weight: 600; margin-bottom: 14px;
    display: flex; align-items: center; gap: 8px;
    color: #0f172a;
  }
  .guideline-item {
    display: flex; align-items: flex-start; gap: 10px;
    padding: 10px 0; border-bottom: 1px solid #f8fafc;
    font-size: 14px; line-height: 1.5; color: #334155;
  }
  .guideline-item:last-child { border-bottom: none; }
  .guideline-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: #0ea5e9; flex-shrink: 0; margin-top: 7px;
  }

  .vax-table { width: 100%; border-collapse: separate; border-spacing: 0 6px; }
  .vax-table th {
    text-align: left; font-size: 12px; color: #64748b;
    text-transform: uppercase; letter-spacing: 0.05em;
    padding: 8px 14px; font-weight: 600;
  }
  .vax-table td {
    padding: 12px 14px; background: #f8fafc;
    font-size: 14px; color: #334155;
  }
  .vax-table tr td:first-child {
    border-radius: 10px 0 0 10px; font-weight: 600; color: #0f172a;
  }
  .vax-table tr td:last-child { border-radius: 0 10px 10px 0; }

  .scheme-card {
    background: white; border: 1px solid #f1f5f9;
    border-radius: 14px; padding: 20px; margin-bottom: 12px;
    transition: all 0.2s;
    box-shadow: 0 1px 4px rgba(0,0,0,0.03);
  }
  .scheme-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0,0,0,0.06);
    border-color: #bae6fd;
  }
  .scheme-name { font-size: 16px; font-weight: 600; margin-bottom: 6px; display: flex; align-items: center; gap: 8px; }
  .scheme-coverage { font-size: 13px; color: #059669; font-weight: 500; margin-bottom: 4px; }
  .scheme-elig { font-size: 13px; color: #64748b; }
`;

export default function ASHADashboard() {
    const [activeTab, setActiveTab] = useState("guidelines");

    const TABS = [
        { id: "guidelines", label: "Guidelines", icon: "📋" },
        { id: "vaccination", label: "Vaccination", icon: "💉" },
        { id: "schemes", label: "Schemes", icon: "📜" },
    ];

    return (
        <>
            <style>{STYLES}</style>
            <div className="asha-root">
                {/* Header */}
                <div className="asha-header">
                    <div className="asha-title">👩‍⚕️ ASHA Co-Pilot Workspace</div>
                    <div className="asha-subtitle">
                        Your AI-powered digital assistant for rural healthcare delivery. 
                        Access maternal health guidelines, vaccination schedules, and government
                        scheme eligibility — all in one place.
                    </div>
                    <div className="asha-badge">🩺 Empowering 1M+ ASHA Workers Across India</div>
                </div>

                {/* Tab Navigation */}
                <div className="asha-tabs">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            className={`asha-tab ${activeTab === tab.id ? "active" : ""}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>

                {/* Guidelines Tab */}
                {activeTab === "guidelines" && (
                    <>
                        {GUIDELINES.map((section, i) => (
                            <div className="section-card" key={i}>
                                <div className="section-title">
                                    {i === 0 ? "🤰" : i === 1 ? "🏥" : i === 2 ? "👩‍🍼" : "👶"} {section.category}
                                </div>
                                {section.items.map((item, j) => (
                                    <div className="guideline-item" key={j}>
                                        <div className="guideline-dot" />
                                        <span>{item}</span>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </>
                )}

                {/* Vaccination Tab */}
                {activeTab === "vaccination" && (
                    <div className="section-card">
                        <div className="section-title">💉 National Immunization Schedule (India — UIP)</div>
                        <table className="vax-table">
                            <thead>
                                <tr>
                                    <th></th>
                                    <th>Age</th>
                                    <th>Vaccines</th>
                                </tr>
                            </thead>
                            <tbody>
                                {VACCINATION_SCHEDULE.map((row, i) => (
                                    <tr key={i}>
                                        <td style={{ textAlign: "center", fontSize: 18 }}>{row.icon}</td>
                                        <td style={{ whiteSpace: "nowrap" }}>{row.age}</td>
                                        <td>{row.vaccines}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Schemes Tab */}
                {activeTab === "schemes" && (
                    <>
                        {SCHEMES.map((scheme, i) => (
                            <div className="scheme-card" key={i}>
                                <div className="scheme-name">{scheme.icon} {scheme.name}</div>
                                <div className="scheme-coverage">💰 {scheme.coverage}</div>
                                <div className="scheme-elig">👤 Eligibility: {scheme.eligibility}</div>
                            </div>
                        ))}
                    </>
                )}
            </div>
        </>
    );
}
