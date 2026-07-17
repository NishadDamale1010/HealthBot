import { useEffect, useMemo, useRef, useState } from "react";
import API from "../services/api";
import SeasonalAlert from "../components/SeasonalAlert";
import { downloadHealthReport } from "../services/reportDownload";

const QUICK_REPLIES = ["I have fever", "Chest pain", "Headache", "Stomach pain", "Shortness of breath"];
const SYMPTOM_KEYWORDS = ["fever", "cough", "pain", "headache", "nausea", "breath", "fatigue", "dizziness"];
const EMERGENCY_TERMS = ["chest pain", "breathing", "shortness of breath", "unconscious", "severe bleeding", "high fever"];
const STORAGE_KEY = "healthbot.chat.conversations.v2";

const nowText = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const createConversationState = () => ({
  symptoms: [],
  duration: "",
  severity: "",
  previousAnswers: [],
  riskLevel: "Low",
  lastPrediction: null,
  messageType: "greeting",
});

const createChat = (seed = {}) => ({
  id: seed.id || crypto.randomUUID(),
  title: seed.title || "New Conversation",
  preview: seed.preview || "Start a health conversation",
  updatedAt: seed.updatedAt || new Date().toISOString(),
  messages: seed.messages || [
    {
      role: "bot",
      text: "Hi, I’m HealthBot AI. Tell me your symptoms and I’ll guide you step by step.",
      time: nowText(),
    },
  ],
  state: { ...createConversationState(), ...(seed.state || {}) },
});

const statusByState = (loading) => (loading ? { label: "Thinking", dot: "🟡" } : { label: "Online", dot: "🟢" });

const parseConversationState = (messages, previousState = createConversationState(), incomingPrediction = null, incomingType = "") => {
  const combined = messages.map((m) => m.text.toLowerCase()).join(" ");
  const symptoms = SYMPTOM_KEYWORDS.filter((k) => combined.includes(k));

  const durationMatch = combined.match(/(\d+\s*(day|days|week|weeks|month|months)|since\s+\w+)/i);
  const severityMatch = combined.match(/\b(mild|moderate|high|severe|unbearable|low)\b/i);

  const previousAnswers = messages
    .filter((m) => m.role === "user")
    .slice(-6)
    .map((m) => m.text);

  return {
    ...previousState,
    symptoms,
    duration: durationMatch?.[0] || previousState.duration,
    severity: severityMatch?.[0] || previousState.severity,
    previousAnswers,
    riskLevel: incomingPrediction?.risk || previousState.riskLevel || "Low",
    lastPrediction: incomingPrediction || previousState.lastPrediction || null,
    messageType: incomingType || previousState.messageType || "followup",
  };
};
const EMERGENCY_KEYWORDS = [
    "chest pain", "heart attack", "not breathing", "unconscious",
    "heavy bleeding", "stroke", "severe pain", "accident", "fainted",
];
/* ── Keywords that indicate high-severity conditions ── */
const HIGH_SEVERITY_SYMPTOMS = [
    "chest pain", "heart attack", "stroke", "not breathing", "unconscious",
    "heavy bleeding", "severe pain", "accident", "fainted", "seizure",
    "difficulty breathing", "shortness of breath", "blood in stool",
    "blood in urine", "high fever", "severe headache", "paralysis",
    "loss of consciousness", "suicidal", "overdose", "poisoning",
    "meningitis", "appendicitis", "anaphylaxis", "sepsis",
];
const MODERATE_SEVERITY_SYMPTOMS = [
    "persistent cough", "prolonged fever", "vomiting", "dehydration",
    "dizziness", "blurred vision", "numbness", "swelling",
    "persistent pain", "infection", "rash with fever", "ear pain",
    "urinary pain", "joint pain", "chest tightness",
];
/* ─── Helpers ──────────────────────────────────────────────────────────────── */
/**
 * Split bot reply into max 3-4 logical section cards instead of one card per sentence.
 * Tries to detect section headers first, then falls back to paragraph splitting.
 */
function splitIntoCards(text) {
    if (!text || !text.trim()) return [text];
    // Pattern to detect common section headers in the AI response
    const sectionPattern = /\n(?=(?:\*{0,2})(?:Prediction|Assessment|Diagnosis|Likely Condition|Most likely|Possible Causes?|Other possible|Causes?|Precaution|Recommendation|Advice|Treatment|Note|Warning|Risk|When to seek|Urgent|Emergency|Follow[- ]?up|Next steps|Symptoms?|Prevention|Summary|Overview|Home Remedies|Self[- ]?care|Do['']?s and Don['']?ts|Disclaimer|Important)s?[\s:*])/gi;
    let parts = text.split(sectionPattern).map(s => s.trim()).filter(Boolean);
    // If section-header split didn't produce multiple parts, try double-newline split
    if (parts.length <= 1) {
        parts = text.split(/\n\n+/).map(s => s.trim()).filter(Boolean);
    }
    // If still a single block, just return it as one card
    if (parts.length <= 1) {
        return [text.trim()];
    }
    // Cap at 4 cards max — merge any extras into the last card
    if (parts.length > 4) {
        const consolidated = parts.slice(0, 3);
        consolidated.push(parts.slice(3).join("\n\n"));
        return consolidated;
    }
    return parts;
}
function delay(ms) { return new Promise(res => setTimeout(res, ms)); }
/**
 * Infer the correct risk level using:
 *  1. Backend-provided risk (if present)
 *  2. User self-reported severity from intake
 *  3. Symptom keyword matching for dangerous conditions
 */
function inferRisk(predictionRisk, answers) {
    const backendRisk = (predictionRisk || "").toLowerCase();
    // Check symptom text against known high/moderate severity keywords
    const allText = [
        answers?.symptom || "",
        answers?.extra || "",
        answers?.location || "",
    ].join(" ").toLowerCase();
    const hasHighKeyword = HIGH_SEVERITY_SYMPTOMS.some(k => allText.includes(k));
    const hasModerateKeyword = MODERATE_SEVERITY_SYMPTOMS.some(k => allText.includes(k));
    // Parse user-reported severity (1-10 scale or chip selection)
    const sevText = (answers?.severity || "").toLowerCase();
    let sevNum = parseInt(sevText) || 0;
    if (sevText.includes("unbearable")) sevNum = 10;
    else if (sevText.includes("severe")) sevNum = Math.max(sevNum, 8);
    else if (sevText.includes("moderate")) sevNum = Math.max(sevNum, 5);
    else if (sevText.includes("mild")) sevNum = Math.max(sevNum, 2);
    // Determine risk: highest signal wins
    if (backendRisk === "high" || hasHighKeyword || sevNum >= 7) {
        return "High";
    }
    if (backendRisk === "medium" || hasModerateKeyword || sevNum >= 4) {
        return "Medium";
    }
    if (backendRisk === "low") {
        return "Low";
    }
    // Default: use backend value if present, otherwise Low
    return predictionRisk || "Low";
}
function riskConfig(risk, dark) {
    switch (risk?.toLowerCase()) {
        case "high": return { bg: dark ? "rgba(239,68,68,.15)" : "rgba(220,38,38,.08)", color: dark ? "#ef4444" : "#dc2626", dot: dark ? "#ef4444" : "#dc2626", label: "HIGH RISK" };
        case "medium": return { bg: dark ? "rgba(245,158,11,.15)" : "rgba(217,119,6,.08)", color: dark ? "#f59e0b" : "#d97706", dot: dark ? "#f59e0b" : "#d97706", label: "MEDIUM RISK" };
        default: return { bg: dark ? "rgba(16,185,129,.15)" : "rgba(5,150,105,.08)", color: dark ? "#10b981" : "#059669", dot: dark ? "#10b981" : "#059669", label: "LOW RISK" };
    }
}
/* ─── Sub-components ───────────────────────────────────────────────────────── */
function EcgLine() {
    return (
        <div style={{ width: 120, height: 28, overflow: "hidden" }}>
            <svg viewBox="0 0 120 28" style={{ width: "100%", height: "100%" }}>
                <polyline className="ecg-line"
                    points="0,14 20,14 28,14 32,2 36,26 40,14 50,14 54,8 58,14 80,14 84,4 88,24 92,14 120,14" />
            </svg>
        </div>
    );
}
function TypingDots() {
    return <div className="dot-bounce"><span /><span /><span /></div>;
}
/* ─── Styles ───────────────────────────────────────────────────────────────── */
const STYLES = `
  .hb-root {
    --bg:#f0fdf4; --surface:#ffffff; --card:#f8fffe;
    --border:rgba(16,185,129,0.15); --green:#059669;
    --green-light:#d1fae5; --green-dim:#ecfdf5; --green-mid:#a7f3d0;
    --blue:#0284c7; --red:#dc2626; --yellow:#d97706;
    --text:#064e3b; --text-body:#1f2937; --muted:#6b7280;
    --user-bubble:linear-gradient(135deg,#059669,#047857); --user-text:#ffffff;
    --bot-bubble:#ffffff; --bot-border:rgba(16,185,129,0.2);
    --profile-bg:rgba(2,132,199,0.07); --profile-bdr:rgba(2,132,199,0.2);
    --input-bg:#ffffff; --input-bar:#f0fdf4;
    --shadow:0 4px 24px rgba(5,150,105,0.1);
    --shadow-user:0 4px 16px rgba(5,150,105,0.3);
    font-family:'DM Sans',sans-serif;
    background:var(--bg); min-height:100vh; color:var(--text-body);
  }
  .hb-root.hb-dark {
    --bg:#0b0f1a; --surface:#111827; --card:#161d2e;
    --border:rgba(255,255,255,0.07); --green:#10b981;
    --green-light:#064e3b; --green-dim:#064e3b; --green-mid:#065f46;
    --blue:#3b82f6; --red:#ef4444; --yellow:#f59e0b;
    --text:#e2e8f0; --text-body:#e2e8f0; --muted:#64748b;
    --user-bubble:linear-gradient(135deg,#10b981,#059669); --user-text:#ffffff;
    --bot-bubble:#111827; --bot-border:rgba(255,255,255,0.07);
    --profile-bg:rgba(16,185,129,0.1); --profile-bdr:rgba(16,185,129,0.25);
    --input-bg:#161d2e; --input-bar:#111827;
    --shadow:0 24px 60px rgba(0,0,0,.5);
    --shadow-user:0 4px 20px rgba(16,185,129,0.3);
  }
  .hb-root:not(.hb-dark) {
    background:
      radial-gradient(ellipse at 10% 20%,rgba(167,243,208,0.4) 0%,transparent 50%),
      radial-gradient(ellipse at 90% 80%,rgba(110,231,183,0.3) 0%,transparent 50%),
      radial-gradient(ellipse at 50% 50%,rgba(240,253,244,1) 0%,#e6faf2 100%);
  }
  .ecg-line {
    stroke:var(--green); stroke-width:1.8; fill:none;
    stroke-dasharray:300; stroke-dashoffset:300;
    animation:ecg-draw 2.2s ease-in-out infinite;
  }
  @keyframes ecg-draw {
    0%  { stroke-dashoffset:300; opacity:1; }
    70% { stroke-dashoffset:0;   opacity:1; }
    90% { stroke-dashoffset:0;   opacity:0; }
    100%{ stroke-dashoffset:300; opacity:0; }
  }
  .dot-bounce { display:inline-flex; gap:4px; align-items:center; }
  .dot-bounce span {
    width:6px; height:6px; border-radius:50%; background:var(--green);
    animation:bounce 1.2s ease-in-out infinite;
  }
  .dot-bounce span:nth-child(2){ animation-delay:.2s; }
  .dot-bounce span:nth-child(3){ animation-delay:.4s; }
  @keyframes bounce {
    0%,80%,100%{ transform:translateY(0); opacity:.4; }
    40%        { transform:translateY(-6px); opacity:1; }
  }
  .msg-in { animation:slideIn .25s cubic-bezier(.22,1,.36,1) both; }
  @keyframes slideIn { from{ opacity:0; transform:translateY(10px); } to{ opacity:1; transform:translateY(0); } }
  .hb-input { color:var(--text-body) !important; }
  .hb-input::placeholder{ color:var(--muted); }
  .hb-input:focus{ outline:none; box-shadow:0 0 0 2px var(--green); }
  .hb-scroll::-webkit-scrollbar{ width:4px; }
  .hb-scroll::-webkit-scrollbar-track{ background:transparent; }
  .hb-scroll::-webkit-scrollbar-thumb{ background:var(--green-mid); border-radius:4px; }
  .send-btn:not(:disabled):hover{ box-shadow:0 0 18px rgba(16,185,129,.5); }
  .send-btn{ transition:box-shadow .2s, opacity .2s; }
  .theme-btn {
    background:var(--card); border:1px solid var(--border);
    border-radius:10px; width:36px; height:36px;
    display:flex; align-items:center; justify-content:center;
    cursor:pointer; font-size:16px; transition:all .2s;
  }
  .theme-btn:hover{ border-color:var(--green); background:var(--green-dim); }
  .lang-select {
    background:var(--card); color:var(--text-body);
    border:1px solid var(--border); border-radius:8px;
    padding:4px 10px; font-size:13px; cursor:pointer;
    font-family:'DM Sans',sans-serif;
  }
  .lang-select:focus{ outline:none; box-shadow:0 0 0 2px var(--green); }
  .quick-chip {
    background:var(--surface); border:1px solid var(--border);
    border-radius:999px; padding:7px 15px;
    font-size:12px; color:var(--muted); cursor:pointer;
    transition:all .15s; white-space:nowrap;
    font-family:'DM Sans',sans-serif;
    box-shadow:0 1px 4px rgba(5,150,105,0.07);
  }
  .quick-chip:hover{ border-color:var(--green); color:var(--green); background:var(--green-dim); }
  .intake-chip {
    background:var(--surface); border:1.5px solid var(--border);
    border-radius:999px; padding:8px 16px;
    font-size:12px; color:var(--muted); cursor:pointer;
    transition:all .15s; white-space:nowrap;
    font-family:'DM Sans',sans-serif;
  }
  .intake-chip:hover{ border-color:var(--green); color:var(--green); background:var(--green-dim); }
  .risk-pill {
    display:inline-flex; align-items:center; gap:4px;
    font-family:'DM Mono',monospace; font-size:10px; font-weight:500;
    padding:2px 9px; border-radius:999px; margin-top:8px; letter-spacing:.04em;
  }
  .analyze-btn {
    background:linear-gradient(135deg,#10b981,#059669);
    border:none; border-radius:14px; padding:12px 32px; color:#fff;
    font-size:15px; font-weight:700; cursor:pointer;
    font-family:'DM Sans',sans-serif;
    box-shadow:0 4px 20px rgba(16,185,129,.35);
    display:flex; align-items:center; gap:8px;
    transition:opacity .15s, transform .15s;
  }
  .analyze-btn:hover{ opacity:.92; transform:translateY(-1px); }
  .analyze-btn:active{ transform:translateY(0); }
  .analyze-btn:disabled{ opacity:.4; cursor:not-allowed; transform:none; }
  .mic-active{ animation:micPulse 1s ease-in-out infinite; }
  @keyframes micPulse{ 0%,100%{ transform:scale(1); } 50%{ transform:scale(1.2); } }
  .hb-root:not(.hb-dark) .online-dot{ box-shadow:0 0 6px #10b981,0 0 12px #a7f3d0; }
  .emergency-overlay{
    position:fixed; inset:0; background:rgba(0,0,0,.82);
    display:flex; align-items:center; justify-content:center;
    z-index:999; animation:fadeIn .2s ease;
  }
  @keyframes fadeIn{ from{opacity:0} to{opacity:1} }
  .emergency-card{
    background:var(--card); border:1px solid rgba(239,68,68,.4);
    border-radius:20px; padding:32px 28px;
    max-width:340px; width:90%; text-align:center;
    box-shadow:0 0 60px rgba(239,68,68,.25);
    animation:scaleIn .25s cubic-bezier(.22,1,.36,1);
  }
  @keyframes scaleIn{ from{transform:scale(.9);opacity:0} to{transform:scale(1);opacity:1} }
  .summary-card{
    background:var(--green-dim); border:1px solid var(--border);
    border-radius:14px; padding:12px 16px; margin:0 16px 10px;
  }
`;
/* ===============================================================================
   MAIN COMPONENT
    };

    loadTimeline();
  }, []);

  useEffect(() => {
    if (!activeId && conversations[0]) setActiveId(conversations[0].id);
  }, [activeId, conversations]);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (!mobileSidebarOpen) return;
      if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setMobileSidebarOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [mobileSidebarOpen]);

  useEffect(() => {
    if (!emergencyAlert) return undefined;
    const timer = setTimeout(() => setEmergencyAlert(null), 6500);
    return () => clearTimeout(timer);
  }, [emergencyAlert]);

  const activeChat = useMemo(
    () => conversations.find((c) => c.id === activeId) || conversations[0],
    [conversations, activeId],
  );

  const messages = useMemo(() => activeChat?.messages ?? [], [activeChat]);

  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const detectedSymptoms = useMemo(() => {
    const text = messages.map((m) => m.text.toLowerCase()).join(" ");
    return SYMPTOM_KEYWORDS.filter((k) => text.includes(k)).slice(0, 5);
  }, [messages]);

  const riskLabel = activeChat?.state?.riskLevel || "Low";
  const riskPercent = riskLabel === "High" ? 84 : riskLabel === "Medium" ? 56 : 28;
  const aiConfidence = activeChat?.state?.lastPrediction?.confidence
    ? Number.parseFloat(activeChat.state.lastPrediction.confidence) * 100
    : Math.min(98, 68 + detectedSymptoms.length * 6);

  const updateConversation = (chatId, updater) => {
    setConversations((prev) => prev.map((c) => (c.id === chatId ? updater(c) : c)));
  };

  const updateChatState = (chatId, patch) => {
    updateConversation(chatId, (chat) => ({ ...chat, state: { ...(chat.state || {}), ...patch } }));
  };

  const addMessage = (chatId, message, meta = {}) => {
    updateConversation(chatId, (chat) => {
      const next = [...chat.messages, message];
      const firstUser = next.find((m) => m.role === "user")?.text || "New Conversation";
      return {
        ...chat,
        messages: next,
        title: firstUser.slice(0, 32),
        preview: message.text.slice(0, 58),
        updatedAt: new Date().toISOString(),
        state: parseConversationState(next, chat.state, meta.prediction, meta.messageType),
      };
    });
  };

  const maybeTriggerEmergency = ({ botReply, prediction, messageType }) => {
    const highRisk = String(prediction?.risk || "").toLowerCase() === "high";
    const emergencyType = String(messageType || "").toLowerCase() === "emergency";
    const containsEmergencySignal = EMERGENCY_TERMS.some((term) => String(botReply).toLowerCase().includes(term));

    if (highRisk || emergencyType || containsEmergencySignal) {
      setEmergencyAlert({
        title: "Emergency Alert",
        reason: buildEmergencyReason(botReply, prediction),
      });
      if (typeof window !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate([200, 100, 200]);
      }
    }
  };

  const sendMessage = async (text, overrides = {}) => {
    if (!text.trim() || !activeChat || loading) return;

    const userText = text.trim();
    setInput("");
    addMessage(activeChat.id, { role: "user", text: userText, time: nowText() });
    setLoading(true);

    const historyPayload = [...(activeChat.messages || []), { role: "user", text: userText }]
      .slice(-12)
      .map((m) => ({ role: m.role === "bot" ? "assistant" : "user", content: m.text }));

    const contextState = {
      ...(activeChat.state || createConversationState()),
      history: historyPayload,
      aiMode,
      detectedSymptoms,
      ...(overrides.context || {}),
    };

    try {
      console.log("[Chat] sending request", { type: overrides.type || "followup", history: historyPayload.length, contextState });
      const { data } = await API.post("/api/chat", {
        type: overrides.type || "followup",
        message: userText,
        context: contextState,
      });

      const reply = data?.reply || "I’m here to help.";
      const prediction = data?.prediction || null;
      const messageType = data?.messageType || "followup";

      addMessage(activeChat.id, { role: "bot", text: reply, time: nowText() }, { prediction, messageType });
      maybeTriggerEmergency({ botReply: reply, prediction, messageType });
    } catch (err) {
      console.error("[Chat] request failed", err);
      addMessage(activeChat.id, { role: "bot", text: "Server is busy. Please try again.", time: nowText() });
      setAlert("Unable to reach AI service. Please retry.");
      setTimeout(() => setAlert(""), 2200);
    } finally {
      setLoading(false);
    }
    useEffect(() => () => stopAlarm(), []);
    function showAlert(msg) { setAlert(msg); setTimeout(() => setAlert(""), 3000); }
    /* ── Section-based bot message (max 3-4 cards) ── */
    async function pushBotAnimated(fullText, extra = {}) {
        if (voiceEnabled && "speechSynthesis" in window) {
            // Cancel any ongoing speech
            window.speechSynthesis.cancel();
            const u = new SpeechSynthesisUtterance(fullText);
            u.lang = language === "hi" ? "hi-IN" : language === "mr" ? "mr-IN" : "en-US";
            window.speechSynthesis.speak(u);
        }
        const cards = splitIntoCards(fullText);
        setBotTyping(true);
        for (let i = 0; i < cards.length; i++) {
            await delay(i === 0 ? 650 : 480);
            setBotTyping(false);
            setMessages(prev => [...prev, { role: "bot", text: cards[i], ...extra }]);
            if (i < cards.length - 1) { await delay(280); setBotTyping(true); }
        }
        setBotTyping(false);
    }
    if (kind === "predict") {
      setLoading(true);
      try {
        const { data } = await API.post("/api/intelligence/risk-score", {
          age: 32,
          bmi: 24,
          sleepHours: 7,
          activityDaysPerWeek: 3,
          sugarLevel: detectedSymptoms.length >= 3 ? 7 : 5,
        });
        const heartLevel = data?.heartRisk?.level || "Low";
        const diabetesLevel = data?.diabetesRisk?.level || "Low";
        const rank = { Low: 1, Moderate: 2, Medium: 2, High: 3 };
        const risk = rank[heartLevel] >= rank[diabetesLevel] ? heartLevel : diabetesLevel;
        const normalizedRisk = risk === "Moderate" ? "Medium" : risk;
        updateChatState(activeChat.id, {
          riskLevel: normalizedRisk,
          lastPrediction: { confidence: (0.62 + detectedSymptoms.length * 0.07).toFixed(2) },
        });
        addMessage(
          activeChat.id,
          {
            role: "bot",
            text: `📊 Risk prediction updated.\nHeart Risk: ${heartLevel}\nDiabetes Risk: ${diabetesLevel}\nOverall Risk: ${normalizedRisk}`,
            time: nowText(),
          },
          { prediction: { risk: normalizedRisk }, messageType: "prediction" },
        );
      } catch {
        addMessage(activeChat.id, { role: "bot", text: "Risk prediction is currently unavailable.", time: nowText() });
      } finally {
        setLoading(false);
      }
      return;
    }
    if (kind === "followup") return sendMessage("Ask me important follow-up questions for diagnosis.");
    if (kind === "report") {
      try {
        await downloadHealthReport();
      } catch {
        setAlert("Could not generate report right now.");
        setTimeout(() => setAlert(""), 2000);
      }
    }
  };

  const handleNewChat = () => {
    const chat = createChat();
    setConversations((prev) => [chat, ...prev]);
    setActiveId(chat.id);
    setMobileSidebarOpen(false);
  };

  const fileToBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const handleImageFile = async (file) => {
    if (!file || !file.type?.startsWith("image/")) return;
    if (!activeChat || imageAnalyzing) return;

    setImageAnalyzing(true);
    const dataUrl = await fileToBase64(file);
    setImagePreview(dataUrl);
    addMessage(activeChat.id, { role: "user", text: `📎 Uploaded image: ${file.name}`, time: nowText() });
    try {
      const { data } = await API.post("/api/predict/image", { imageBase64: dataUrl, mimeType: file.type });
      const responseMessage = data.message || "Image analyzed.";
      addMessage(activeChat.id, { role: "bot", text: responseMessage, time: nowText() });
      maybeTriggerEmergency({ botReply: responseMessage, prediction: data?.prediction, messageType: data?.messageType });
    } catch {
      addMessage(activeChat.id, { role: "bot", text: "Image analysis failed.", time: nowText() });
    } finally {
      setImageAnalyzing(false);
    }
  };

  const tryVoiceInput = () => {
    const Recognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    if (!Recognition) {
      setAlert("Voice not supported in this browser.");
      setTimeout(() => setAlert(""), 2000);
      return;
    }
    /* ── Derived ── */
    const currentQ = INTAKE_QUESTIONS[step] || null;
    const showChips = phase === "intake" && currentQ?.chips && !botTyping && !loading;
    const showAnalyze = phase === "ready" && !botTyping && !loading;
    const inputLocked = phase === "ready" || botTyping || loading;
    const cardShadow = dark
        ? "0 24px 60px rgba(0,0,0,.5)"
        : "0 8px 40px rgba(5,150,105,.12), 0 1px 0 rgba(16,185,129,.1)";
    /* ════════════════════════════════════════════════════════════════
       RENDER
    ════════════════════════════════════════════════════════════════ */
    return (
        <>
            <style>{STYLES}</style>
            <div className={`hb-root${dark ? " hb-dark" : ""}`} style={{ padding: "0 12px 24px" }}>
                <SeasonalAlert />
                {/* ── Alert banner ── */}
                {alert && (
                    <div style={{
                        position: "fixed", top: 16, left: "50%", transform: "translateX(-50%)",
                        background: dark ? "#450a0a" : "#fef2f2",
                        color: dark ? "#fca5a5" : "#dc2626",
                        border: `1px solid ${dark ? "#ef4444" : "#fca5a5"}`,
                        padding: "10px 20px", borderRadius: 10, zIndex: 100,
                        fontFamily: "'DM Sans',sans-serif", fontSize: 13,
                        boxShadow: "0 4px 20px rgba(220,38,38,.2)",
                    }}>{alert}</div>
                )}
                {/* ── Emergency overlay ── */}
                {emergency && (
                    <div className="emergency-overlay">
                        <div className="emergency-card">
                            <div style={{ fontSize: 40, marginBottom: 8 }}>{"\u{1F6A8}"}</div>
                            <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, color: "var(--red)", marginBottom: 6 }}>
                                Emergency Detected
                            </h2>
                            <p style={{ color: "var(--muted)", fontSize: 13, marginBottom: 20 }}>
                                Immediate medical attention may be required.
                            </p>
                            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                                <a href="tel:102" style={{
                                    background: "#dc2626", color: "#fff", padding: "10px 20px",
                                    borderRadius: 10, textDecoration: "none", fontSize: 13, fontWeight: 600,
                                }}>{"\u{1F4DE}"} Call 102</a>
                                <button onClick={() => window.location.href = "/hospitals"} style={{
                                    background: "#1d4ed8", color: "#fff", padding: "10px 20px",
                                    border: "none", borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 600,
                                }}>{"\u{1F3E5}"} Find Hospitals</button>
                            </div>
                            <button onClick={stopAlarm} style={{
                                marginTop: 12, color: "#b91c1c", background: "none",
                                border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600,
                            }}>🔇 Silence alarm</button>
                            <button onClick={() => { stopAlarm(); setEmergency(false); }} style={{
                                marginTop: 18, color: "var(--muted)", background: "none",
                                border: "none", cursor: "pointer", fontSize: 13,
                            }}>Dismiss</button>
                        </div>
                    </div>
                )}
                {/* ── Header ── */}
                <div style={{
                    maxWidth: 780, margin: "0 auto", padding: "20px 0 16px",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <div style={{
                            width: 42, height: 42, borderRadius: 13,
                            background: "linear-gradient(135deg,#10b981,#059669)",
                            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 21,
                            boxShadow: dark ? "0 0 20px rgba(16,185,129,.3)" : "0 4px 16px rgba(5,150,105,.25)",
                        }}>{"\u{1FA7A}"}</div>
                        <div>
                            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 17, letterSpacing: "-.01em", color: "var(--text)" }}>
                                HealthBot
                            </div>
                            <div style={{ fontSize: 11, color: "var(--muted)", display: "flex", alignItems: "center", gap: 6 }}>
                                <span className="online-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", display: "inline-block" }} />
                                AI Online
                            </div>
                        </div>
                        <EcgLine />
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <button className="theme-btn" onClick={() => {
                            setVoiceEnabled(v => {
                                if (v && window.speechSynthesis) window.speechSynthesis.cancel();
                                return !v;
                            });
                        }} title="Toggle voice output">
                            {voiceEnabled ? "🔊" : "🔇"}
                        </button>
                        <button className="theme-btn" onClick={() => setDark(d => !d)} title="Toggle theme">
                            {dark ? "\u2600\uFE0F" : "\u{1F319}"}
                        </button>
                        <select className="lang-select" value={language} onChange={e => setLanguage(e.target.value)}>
                            <option value="en">{"\u{1F310}"} English</option>
                            <option value="hi">{"\u{1F1EE}\u{1F1F3}"} {"\u0939\u093F\u0902\u0926\u0940"}</option>
                            <option value="mr">{"\u{1F1EE}\u{1F1F3}"} {"\u092E\u0930\u093E\u0920\u0940"}</option>
                        </select>
                    </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="chat2-msg bot">
                <div className="chat2-avatar glow">🤖</div>
                <div className="chat2-bubble thinking">
                  <p>AI is thinking</p>
                  <div className="chat2-dots"><span /><span /><span /></div>
                </div>
              </div>
            )}
            <div ref={listEndRef} />
          </main>

          <aside className="chat2-intel-panel">
            <h3>AI Intelligence</h3>
            <div className="chat2-tag-wrap">
              {detectedSymptoms.length ? detectedSymptoms.map((s) => <span key={s}>{s}</span>) : <span>none yet</span>}
            </div>
            <div className="chat2-meter"><label>Risk Level ({riskLabel})</label><div><span style={{ width: `${riskPercent}%` }} /></div></div>
            <div className="chat2-meter"><label>AI Confidence</label><div><span style={{ width: `${Math.max(8, Math.min(100, aiConfidence))}%` }} /></div></div>
            <div className="chat2-smart-actions">
              <button onClick={() => runSmartAction("summary")} disabled={loading}>Summarize</button>
              <button onClick={() => runSmartAction("predict")} disabled={loading}>Predict Risk</button>
              <button onClick={() => runSmartAction("followup")} disabled={loading}>Follow-up</button>
              <button onClick={() => runSmartAction("report")} disabled={loading}>Generate Report</button>
            </div>
          </aside>
        </div>

        <div className="chat2-suggestions">
          {QUICK_REPLIES.map((q) => <button key={q} onClick={() => sendMessage(q)} disabled={loading}>{q}</button>)}
        </div>

        <div
          className={`chat2-upload-zone ${dragActive ? "drag" : ""}`}
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => { e.preventDefault(); setDragActive(false); handleImageFile(e.dataTransfer.files?.[0]); }}
          onClick={() => fileInputRef.current?.click()}
        >
          <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={(e) => handleImageFile(e.target.files?.[0])} />
          <p>{imageAnalyzing ? "🔍 AI scanning image..." : "📎 Drag & drop image for AI detection (or click to upload)"}</p>
          {imagePreview && <img src={imagePreview} alt="preview" />}
        </div>

        <footer className="chat2-input-bar">
          <button className={listening ? "active" : ""} onClick={tryVoiceInput}>🎤</button>
          <button onClick={() => fileInputRef.current?.click()}>📎</button>
          <button onClick={() => setAiMode((m) => (m === "balanced" ? "deep" : "balanced"))}>🧠 {aiMode}</button>
          <input
            value={input}
            disabled={loading}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask HealthBot anything about your symptoms..."
            onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
          />
          <button className="send" disabled={loading} onClick={() => sendMessage(input)}>{loading ? "…" : "➤"}</button>
        </footer>
      </section>
    </div>
  );
}
