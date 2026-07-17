/**
 * ConsentManager.jsx
 * ------------------
 * SIH Blueprint Feature: DPDP-Compliant Consent Management
 * 
 * Provides users with granular control over data processing consent,
 * in compliance with the Digital Personal Data Protection (DPDP) Act 2023.
 * Users can grant or revoke consent for specific data processing purposes.
 */
import { useState } from "react";

const CONSENT_PURPOSES = [
    {
        id: "health_analysis",
        title: "Health Symptom Analysis",
        description: "Allow HealthBot to process your symptom data for AI-powered health assessments.",
        icon: "🩺",
        required: true,
    },
    {
        id: "chat_history",
        title: "Chat History Storage",
        description: "Store conversation history for personalized follow-up recommendations.",
        icon: "💬",
        required: false,
    },
    {
        id: "phr_sharing",
        title: "ABDM PHR Locker Sharing",
        description: "Push interaction summaries to your Ayushman Bharat Digital Health Account (ABHA) locker.",
        icon: "🔗",
        required: false,
    },
    {
        id: "anonymized_analytics",
        title: "Anonymized Epidemic Analytics",
        description: "Contribute anonymized symptom data to the outbreak surveillance heatmap for public health.",
        icon: "📊",
        required: false,
    },
    {
        id: "scheme_eligibility",
        title: "Government Scheme Matching",
        description: "Process your health and demographic data to check eligibility for PM-JAY and other schemes.",
        icon: "📜",
        required: false,
    },
];

const STYLES = `
  .consent-root {
    font-family: 'DM Sans', sans-serif;
    padding: 24px;
    max-width: 750px;
    margin: 0 auto;
  }
  .consent-header {
    background: linear-gradient(135deg, #7c3aed, #6d28d9);
    color: white;
    padding: 32px;
    border-radius: 20px;
    margin-bottom: 24px;
    box-shadow: 0 10px 40px rgba(124, 58, 237, 0.2);
  }
  .consent-title {
    font-size: 26px;
    font-weight: 700;
    margin-bottom: 8px;
  }
  .consent-subtitle {
    font-size: 14px;
    opacity: 0.85;
    line-height: 1.5;
  }
  .consent-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: rgba(255,255,255,0.15);
    padding: 6px 14px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 600;
    margin-top: 14px;
    letter-spacing: 0.04em;
  }
  .consent-card {
    background: #ffffff;
    border: 1px solid #f1f5f9;
    border-radius: 16px;
    padding: 20px 24px;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 16px;
    transition: all 0.2s;
    box-shadow: 0 1px 4px rgba(0,0,0,0.03);
  }
  .consent-card:hover {
    border-color: #c4b5fd;
    box-shadow: 0 4px 16px rgba(124, 58, 237, 0.08);
  }
  .consent-icon {
    font-size: 28px;
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f5f3ff;
    border-radius: 14px;
    flex-shrink: 0;
  }
  .consent-info {
    flex: 1;
  }
  .consent-info-title {
    font-size: 15px;
    font-weight: 600;
    color: #0f172a;
    margin-bottom: 4px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .consent-info-desc {
    font-size: 13px;
    color: #64748b;
    line-height: 1.5;
  }
  .required-tag {
    font-size: 9px;
    background: #fef2f2;
    color: #dc2626;
    padding: 2px 8px;
    border-radius: 999px;
    font-weight: 600;
    letter-spacing: 0.04em;
  }
  .toggle-track {
    width: 48px;
    height: 26px;
    border-radius: 13px;
    position: relative;
    cursor: pointer;
    transition: background 0.2s;
    flex-shrink: 0;
    border: none;
  }
  .toggle-track.on {
    background: #7c3aed;
  }
  .toggle-track.off {
    background: #e2e8f0;
  }
  .toggle-track.disabled {
    background: #7c3aed;
    opacity: 0.6;
    cursor: not-allowed;
  }
  .toggle-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: white;
    position: absolute;
    top: 3px;
    transition: left 0.2s;
    box-shadow: 0 1px 3px rgba(0,0,0,0.15);
  }
  .consent-footer {
    text-align: center;
    margin-top: 24px;
    padding: 20px;
    background: #f8fafc;
    border-radius: 14px;
    border: 1px solid #f1f5f9;
  }
  .consent-footer p {
    color: #94a3b8;
    font-size: 12px;
    line-height: 1.6;
    margin: 0;
  }
  .consent-footer a {
    color: #7c3aed;
    text-decoration: none;
    font-weight: 500;
  }
`;

export default function ConsentManager() {
    const [consents, setConsents] = useState(() => {
        const saved = localStorage.getItem("hb-consents");
        if (saved) return JSON.parse(saved);
        // Default: required ones are on, others off
        const defaults = {};
        CONSENT_PURPOSES.forEach(p => { defaults[p.id] = p.required; });
        return defaults;
    });

    const toggleConsent = (id) => {
        const purpose = CONSENT_PURPOSES.find(p => p.id === id);
        if (purpose.required) return; // Can't toggle required consents
        const updated = { ...consents, [id]: !consents[id] };
        setConsents(updated);
        localStorage.setItem("hb-consents", JSON.stringify(updated));
    };

    const grantedCount = Object.values(consents).filter(Boolean).length;

    return (
        <>
            <style>{STYLES}</style>
            <div className="consent-root">
                <div className="consent-header">
                    <div className="consent-title">🔒 Data Privacy & Consent</div>
                    <div className="consent-subtitle">
                        Manage how HealthBot processes your data, in compliance with the 
                        Digital Personal Data Protection (DPDP) Act 2023. You have full control 
                        over your data processing consents.
                    </div>
                    <div className="consent-badge">
                        🛡️ DPDP Act 2023 Compliant · {grantedCount}/{CONSENT_PURPOSES.length} Active
                    </div>
                </div>

                {CONSENT_PURPOSES.map(purpose => (
                    <div className="consent-card" key={purpose.id}>
                        <div className="consent-icon">{purpose.icon}</div>
                        <div className="consent-info">
                            <div className="consent-info-title">
                                {purpose.title}
                                {purpose.required && <span className="required-tag">REQUIRED</span>}
                            </div>
                            <div className="consent-info-desc">{purpose.description}</div>
                        </div>
                        <button
                            className={`toggle-track ${purpose.required ? "disabled" : consents[purpose.id] ? "on" : "off"}`}
                            onClick={() => toggleConsent(purpose.id)}
                            disabled={purpose.required}
                        >
                            <div
                                className="toggle-thumb"
                                style={{ left: consents[purpose.id] ? 25 : 3 }}
                            />
                        </button>
                    </div>
                ))}

                <div className="consent-footer">
                    <p>
                        Your consent preferences are stored locally on your device. 
                        In production, consent logs are recorded with timestamps and IP addresses 
                        per DPDP Act 2023 requirements. 
                        For more information, see the <a href="#">Privacy Policy</a>.
                    </p>
                </div>
            </div>
        </>
    );
}
