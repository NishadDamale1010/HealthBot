import { useState } from "react";
import API from "../services/api";

export default function AISuite() {
    const [symptoms, setSymptoms] = useState("");
    const [progression, setProgression] = useState(null);
    const [risk, setRisk] = useState(null);
    const [emotion, setEmotion] = useState(null);
    const [lab, setLab] = useState(null);
    const [loading, setLoading] = useState(false);

    const runProgression = async (treated) => {
        setLoading(true);
        try {
            const { data } = await API.post("/api/intelligence/progression", { symptoms, treated });
            setProgression(data);
        } finally {
            setLoading(false);
        }
    };

    const runRisk = async () => {
        setLoading(true);
        try {
            const { data } = await API.post("/api/intelligence/risk-score", {
                age: 32, bmi: 27, sleepHours: 6, activityDaysPerWeek: 2, sugarLevel: 7,
            });
            setRisk(data);
        } finally {
            setLoading(false);
        }
    };

    const runEmotion = async () => {
        setLoading(true);
        try {
            const { data } = await API.post("/api/intelligence/emotion-check", { message: symptoms });
            setEmotion(data);
        } finally {
            setLoading(false);
        }
    };

    const runLab = async () => {
        setLoading(true);
        try {
            const { data } = await API.post("/api/intelligence/lab-analyzer", { hemoglobin: 10.8, fastingGlucose: 112 });
            setLab(data);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: 920, margin: "24px auto", padding: "0 20px", fontFamily: "'DM Sans', sans-serif" }}>
            <h1 style={{ marginBottom: 8 }}>AI Health Intelligence Suite</h1>
            <p style={{ color: "#64748b", marginTop: 0 }}>Advanced features: progression simulator, risk scoring, emotion check, and lab insights.</p>

            <textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="Describe symptoms or feelings..."
                style={{ width: "100%", minHeight: 90, borderRadius: 12, border: "1px solid #cbd5e1", padding: 12, marginBottom: 12 }}
            />
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
                <button onClick={() => runProgression(false)} disabled={loading}>Simulate Untreated</button>
                <button onClick={() => runProgression(true)} disabled={loading}>Simulate Treated</button>
                <button onClick={runRisk} disabled={loading}>Run Risk Score</button>
                <button onClick={runEmotion} disabled={loading}>Check Emotion</button>
                <button onClick={runLab} disabled={loading}>Analyze Sample Lab</button>
            </div>

            {progression && (
                <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, padding: 14, marginBottom: 12 }}>
                    <h3>Symptom Progression</h3>
                    {progression.timeline?.map((t) => <p key={t.day} style={{ margin: "6px 0" }}>Day {t.day}: {t.status}</p>)}
                </div>
            )}

            {risk && (
                <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, padding: 14, marginBottom: 12 }}>
                    <h3>Personalized Health Risk Score</h3>
                    <p>Diabetes Risk: {risk.diabetesRisk.score}% ({risk.diabetesRisk.level})</p>
                    <p>Heart Risk: {risk.heartRisk.score}% ({risk.heartRisk.level})</p>
                </div>
            )}

            {emotion && (
                <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, padding: 14, marginBottom: 12 }}>
                    <h3>Mental Health Emotion Detection</h3>
                    <p>Mood: {emotion.mood}</p>
                    <p>{emotion.suggestion}</p>
                </div>
            )}

            {lab && (
                <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, padding: 14 }}>
                    <h3>Lab Report Analyzer</h3>
                    {lab.findings?.length ? lab.findings.map((f) => <p key={f}>• {f}</p>) : <p>No abnormalities detected.</p>}
                    <p style={{ color: "#64748b" }}>{lab.summary}</p>
                </div>
            )}
        </div>
    );
}
