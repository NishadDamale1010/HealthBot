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

const buildEmergencyReason = (text, prediction) => {
  const lower = String(text || "").toLowerCase();
  if (prediction?.risk?.toLowerCase?.() === "high") return "AI marked this case as high risk.";
  const matched = EMERGENCY_TERMS.find((term) => lower.includes(term));
  if (matched) return `Detected emergency symptom: ${matched}.`;
  return "Potential emergency pattern detected.";
};

export default function Chat() {
  const [conversations, setConversations] = useState([createChat()]);
  const [activeId, setActiveId] = useState(() => null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [imageAnalyzing, setImageAnalyzing] = useState(false);
  const [aiMode, setAiMode] = useState("balanced");
  const [alert, setAlert] = useState("");
  const [emergencyAlert, setEmergencyAlert] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [listening, setListening] = useState(false);
  const [timelineLoading, setTimelineLoading] = useState(false);

  const fileInputRef = useRef(null);
  const listEndRef = useRef(null);
  const sidebarRef = useRef(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || !parsed.length) return;
      const restored = parsed.map((chat) => createChat(chat));
      setConversations(restored);
      setActiveId(restored[0]?.id || null);
      console.log("[Chat] restored conversations from local storage", restored.length);
    } catch (err) {
      console.warn("[Chat] could not restore local chat history", err);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    const loadTimeline = async () => {
      setTimelineLoading(true);
      try {
        const { data } = await API.get("/api/intelligence/timeline");
        const events = data?.events || [];
        if (!events.length) return;
        setConversations((prev) => {
          if (prev.some((c) => c.source === "timeline")) return prev;
          const grouped = events.slice(0, 4).map((evt, idx) => ({
            id: `timeline-${idx}-${evt.at}`,
            title: evt.text?.slice(0, 26) || "Past chat",
            preview: evt.text?.slice(0, 56) || "Recovered from timeline",
            updatedAt: evt.at || new Date().toISOString(),
            source: "timeline",
            messages: [{ role: evt.role === "assistant" ? "bot" : "user", text: evt.text, time: nowText() }],
            state: createConversationState(),
          }));
          console.log("[Chat] timeline history fetched", grouped.length);
          return [...prev, ...grouped];
        });
      } catch (err) {
        console.warn("[Chat] timeline unavailable", err?.response?.status || err?.message);
      } finally {
        setTimelineLoading(false);
      }
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
  };

  const runSmartAction = async (kind) => {
    if (kind === "summary") return sendMessage("Summarize this conversation with key symptoms and advice.");
    if (kind === "predict") return sendMessage("Predict my risk level based on the chat so far.");
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
    const recognition = new Recognition();
    recognition.lang = "en-US";
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onresult = (event) => setInput(event.results[0][0].transcript);
    recognition.start();
  };

  const status = statusByState(loading);

  return (
    <div className={`chat2-page ${darkMode ? "dark" : ""} ${sidebarCollapsed ? "sidebar-closed" : ""}`}>
      <SeasonalAlert />

      {mobileSidebarOpen && <div className="chat2-sidebar-overlay" onClick={() => setMobileSidebarOpen(false)} />}

      {alert && (
        <div className="chat2-alert" role="status">
          <span>⚠️ {alert}</span>
          <button onClick={() => setAlert("")}>✕</button>
        </div>
      )}

      {emergencyAlert && (
        <div className="chat2-emergency-toast" role="alert">
          <div>
            <strong>⚠️ {emergencyAlert.title}</strong>
            <p>{emergencyAlert.reason}</p>
            <small>Please seek urgent medical care if symptoms are severe.</small>
          </div>
          <button onClick={() => setEmergencyAlert(null)}>✕</button>
        </div>
      )}

      <aside
        ref={sidebarRef}
        className={`chat2-sidebar ${sidebarCollapsed ? "collapsed" : ""} ${mobileSidebarOpen ? "mobile-open" : ""}`}
      >
        <div className="chat2-sidebar-head">
          <button className="chat2-new" onClick={handleNewChat}>+ New Chat</button>
          <button className="chat2-collapse" onClick={() => setSidebarCollapsed((s) => !s)}>{sidebarCollapsed ? "➡️" : "⬅️"}</button>
        </div>
        <div className="chat2-history">
          {timelineLoading && <div className="chat2-history-loading">Syncing previous chats…</div>}
          {conversations.map((chat) => (
            <button
              key={chat.id}
              className={`chat2-history-item ${chat.id === activeChat?.id ? "active" : ""}`}
              onClick={() => {
                setActiveId(chat.id);
                setMobileSidebarOpen(false);
              }}
            >
              <strong>{chat.title}</strong>
              <span>{chat.preview}</span>
              <small>{new Date(chat.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</small>
            </button>
          ))}
        </div>
      </aside>

      <section className="chat2-main">
        <header className="chat2-topbar">
          <div className="chat2-status">{status.dot} AI {status.label}</div>
          <div className="chat2-top-actions">
            <button className="chat2-desktop-sidebar" onClick={() => setSidebarCollapsed((s) => !s)}>
              {sidebarCollapsed ? "☰" : "⟨"}
            </button>
            <button className="chat2-mobile-menu" onClick={() => setMobileSidebarOpen((s) => !s)}>☰</button>
            <button onClick={() => setDarkMode((s) => !s)}>{darkMode ? "☀️" : "🌙"}</button>
            <div className="chat2-user">N</div>
          </div>
        </header>

        <div className="chat2-content-wrap">
          <main className="chat2-thread">
            {messages.map((msg, index) => (
              <div key={`${msg.time}-${index}`} className={`chat2-msg ${msg.role}`}>
                <div className="chat2-avatar">{msg.role === "bot" ? "🤖" : "🧑"}</div>
                <div className="chat2-bubble">
                  <p>{msg.text}</p>
                  <small>{msg.time}</small>
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
