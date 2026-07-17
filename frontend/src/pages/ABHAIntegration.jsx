/**
 * ABHAIntegration.jsx
 * -------------------
 * SIH Blueprint Feature: ABDM V3 ABHA Integration
 * 
 * Frontend interface for Ayushman Bharat Health Account (ABHA) integration.
 * Allows users to generate OTP, verify identity, and link their health records
 * within the HealthBot conversational interface.
 * 
 * Connects to the backend /api/abdm/* mock endpoints.
 */
import { useState } from "react";
import API from "../services/api";

const STEPS = [
    { id: "input", label: "Enter Mobile", icon: "📱" },
    { id: "otp", label: "Verify OTP", icon: "🔐" },
    { id: "linked", label: "ABHA Linked", icon: "✅" },
];

const STYLES = `
  .abha-root {
    font-family: 'DM Sans', sans-serif;
    padding: 24px;
    max-width: 600px;
    margin: 0 auto;
  }
  .abha-header {
    background: linear-gradient(135deg, #059669, #047857);
    color: white;
    padding: 32px;
    border-radius: 20px;
    margin-bottom: 24px;
    box-shadow: 0 10px 40px rgba(5, 150, 105, 0.2);
    text-align: center;
  }
  .abha-logo {
    width: 64px;
    height: 64px;
    border-radius: 18px;
    background: rgba(255,255,255,0.15);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32px;
    margin: 0 auto 16px;
  }
  .abha-title {
    font-size: 24px;
    font-weight: 700;
    margin-bottom: 8px;
  }
  .abha-subtitle {
    font-size: 14px;
    opacity: 0.85;
    line-height: 1.5;
  }
  .abha-stepper {
    display: flex;
    justify-content: center;
    gap: 8px;
    margin-bottom: 28px;
    padding: 0 16px;
  }
  .step-item {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    border-radius: 999px;
    font-size: 13px;
    font-weight: 500;
    transition: all 0.2s;
  }
  .step-item.active {
    background: #ecfdf5;
    color: #059669;
    border: 1px solid #a7f3d0;
  }
  .step-item.done {
    background: #059669;
    color: white;
    border: 1px solid #059669;
  }
  .step-item.pending {
    background: #f8fafc;
    color: #94a3b8;
    border: 1px solid #e2e8f0;
  }
  .abha-card {
    background: white;
    border: 1px solid #f1f5f9;
    border-radius: 20px;
    padding: 32px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.04);
  }
  .abha-card h3 {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 8px;
    color: #0f172a;
  }
  .abha-card p {
    font-size: 14px;
    color: #64748b;
    margin-bottom: 20px;
    line-height: 1.5;
  }
  .abha-input {
    width: 100%;
    padding: 14px 18px;
    border-radius: 12px;
    border: 1.5px solid #e2e8f0;
    font-size: 16px;
    font-family: 'DM Sans', sans-serif;
    transition: border-color 0.2s;
    box-sizing: border-box;
    margin-bottom: 16px;
  }
  .abha-input:focus {
    outline: none;
    border-color: #059669;
    box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.1);
  }
  .abha-btn {
    width: 100%;
    padding: 14px;
    border-radius: 12px;
    border: none;
    background: linear-gradient(135deg, #059669, #047857);
    color: white;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    transition: opacity 0.15s, transform 0.15s;
    box-shadow: 0 4px 16px rgba(5, 150, 105, 0.25);
  }
  .abha-btn:hover { opacity: 0.9; transform: translateY(-1px); }
  .abha-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
  .success-card {
    text-align: center;
    padding: 40px 32px;
  }
  .success-icon {
    font-size: 56px;
    margin-bottom: 16px;
  }
  .success-title {
    font-size: 22px;
    font-weight: 700;
    color: #059669;
    margin-bottom: 8px;
  }
  .success-desc {
    font-size: 14px;
    color: #64748b;
    line-height: 1.5;
    margin-bottom: 24px;
  }
  .abha-id-display {
    background: #ecfdf5;
    border: 1px solid #a7f3d0;
    border-radius: 12px;
    padding: 16px;
    font-family: 'DM Mono', monospace;
    font-size: 18px;
    font-weight: 600;
    color: #059669;
    letter-spacing: 0.02em;
  }
  .info-box {
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    border-radius: 12px;
    padding: 14px 18px;
    margin-top: 20px;
    font-size: 12px;
    color: #166534;
    line-height: 1.6;
  }
  .error-msg {
    color: #dc2626;
    font-size: 13px;
    margin-bottom: 12px;
  }
`;

export default function ABHAIntegration() {
    const [step, setStep] = useState("input");
    const [mobile, setMobile] = useState("");
    const [otp, setOtp] = useState("");
    const [txnId, setTxnId] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [abhaAddress, setAbhaAddress] = useState("");

    const handleGenerateOTP = async () => {
        if (mobile.length !== 10) {
            setError("Please enter a valid 10-digit mobile number");
            return;
        }
        setLoading(true);
        setError("");
        try {
            const res = await API.post("/api/abdm/generate-otp", { mobile });
            setTxnId(res.data.txnId);
            setStep("otp");
        } catch (err) {
            setError(err.response?.data?.message || "Failed to send OTP. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async () => {
        if (otp.length !== 6) {
            setError("Please enter a valid 6-digit OTP");
            return;
        }
        setLoading(true);
        setError("");
        try {
            const res = await API.post("/api/abdm/verify-otp", { txnId, otp });
            setAbhaAddress(res.data.abhaAddress || "user@abdm");
            setStep("linked");
        } catch (err) {
            setError(err.response?.data?.message || "Invalid OTP. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const getStepStatus = (stepId) => {
        const order = ["input", "otp", "linked"];
        const currentIdx = order.indexOf(step);
        const stepIdx = order.indexOf(stepId);
        if (stepIdx < currentIdx) return "done";
        if (stepIdx === currentIdx) return "active";
        return "pending";
    };

    return (
        <>
            <style>{STYLES}</style>
            <div className="abha-root">
                <div className="abha-header">
                    <div className="abha-logo">🏥</div>
                    <div className="abha-title">ABHA Integration</div>
                    <div className="abha-subtitle">
                        Link your Ayushman Bharat Health Account to securely share 
                        health records with your digital health locker.
                    </div>
                </div>

                {/* Stepper */}
                <div className="abha-stepper">
                    {STEPS.map(s => (
                        <div key={s.id} className={`step-item ${getStepStatus(s.id)}`}>
                            {s.icon} {s.label}
                        </div>
                    ))}
                </div>

                {/* Card Content */}
                <div className="abha-card">
                    {step === "input" && (
                        <>
                            <h3>📱 Enter Your Mobile Number</h3>
                            <p>We'll send an OTP to your Aadhaar-linked mobile number to verify your ABHA identity.</p>
                            {error && <div className="error-msg">⚠️ {error}</div>}
                            <input
                                className="abha-input"
                                type="tel"
                                maxLength={10}
                                placeholder="Enter 10-digit mobile number"
                                value={mobile}
                                onChange={e => setMobile(e.target.value.replace(/\D/g, ""))}
                            />
                            <button className="abha-btn" onClick={handleGenerateOTP} disabled={loading || mobile.length !== 10}>
                                {loading ? "Sending OTP..." : "Send OTP →"}
                            </button>
                            <div className="info-box">
                                🔐 Your mobile number is encrypted using RSA/ECB/OAEP before transmission, 
                                compliant with ABDM V3 NHA standards.
                            </div>
                        </>
                    )}

                    {step === "otp" && (
                        <>
                            <h3>🔐 Verify OTP</h3>
                            <p>Enter the 6-digit OTP sent to ******{mobile.slice(-4)}</p>
                            {error && <div className="error-msg">⚠️ {error}</div>}
                            <input
                                className="abha-input"
                                type="text"
                                maxLength={6}
                                placeholder="Enter 6-digit OTP"
                                value={otp}
                                onChange={e => setOtp(e.target.value.replace(/\D/g, ""))}
                                style={{ textAlign: "center", letterSpacing: "0.5em", fontSize: 24 }}
                            />
                            <button className="abha-btn" onClick={handleVerifyOTP} disabled={loading || otp.length !== 6}>
                                {loading ? "Verifying..." : "Verify & Link ABHA ✓"}
                            </button>
                            <button
                                onClick={() => { setStep("input"); setOtp(""); setError(""); }}
                                style={{
                                    width: "100%", marginTop: 12, padding: 12,
                                    background: "none", border: "1px solid #e2e8f0",
                                    borderRadius: 12, cursor: "pointer", color: "#64748b",
                                    fontFamily: "'DM Sans', sans-serif", fontSize: 14,
                                }}
                            >
                                ← Change Number
                            </button>
                        </>
                    )}

                    {step === "linked" && (
                        <div className="success-card">
                            <div className="success-icon">🎉</div>
                            <div className="success-title">ABHA Linked Successfully!</div>
                            <div className="success-desc">
                                Your health records can now be synced to your ABDM PHR locker. 
                                HealthBot interaction summaries will be available for future consultations.
                            </div>
                            <div className="abha-id-display">
                                {abhaAddress}
                            </div>
                            <div className="info-box" style={{ marginTop: 20 }}>
                                ✅ Your ABHA address is linked. In production, interaction summaries 
                                are pushed to your PHR locker via ABDM V3 /sync-phr endpoints after explicit consent.
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
