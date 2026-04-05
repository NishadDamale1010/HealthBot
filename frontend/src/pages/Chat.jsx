import { useEffect, useMemo, useRef, useState } from "react";
import API from "../services/api";
import SeasonalAlert from "../components/SeasonalAlert";
import { downloadHealthReport } from "../services/reportDownload";

const QUICK_REPLIES = ["I have fever", "Chest pain", "Headache", "Stomach pain", "Shortness of breath"];
const SYMPTOM_KEYWORDS = ["fever", "cough", "pain", "headache", "nausea", "breath", "fatigue", "dizziness"];

const nowText = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const createChat = () => ({
  id: crypto.randomUUID(),
  title: "New Conversation",
  preview: "Start a health conversation",
  updatedAt: new Date().toISOString(),
  messages: [
    {
      role: "bot",
      text: "Hi, I’m HealthBot AI. Tell me your symptoms and I’ll guide you step by step.",
      time: nowText(),
    },
  ],
});

const statusByState = (loading) => (loading ? { label: "Thinking", dot: "🟡" } : { label: "Online", dot: "🟢" });

export default function Chat() {
  const [conversations, setConversations] = useState([createChat()]);
  const [activeId, setActiveId] = useState(() => null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [imageAnalyzing, setImageAnalyzing] = useState(false);
  const [aiMode, setAiMode] = useState("balanced");
  const [alert, setAlert] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [listening, setListening] = useState(false);

  const fileInputRef = useRef(null);
  const listEndRef = useRef(null);

  useEffect(() => {
    if (!activeId && conversations[0]) setActiveId(conversations[0].id);
  }, [activeId, conversations]);

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

  const riskPercent = Math.min(95, 20 + detectedSymptoms.length * 12 + (messages.length > 8 ? 10 : 0));
  const riskLabel = riskPercent >= 70 ? "High" : riskPercent >= 40 ? "Medium" : "Low";
  const aiConfidence = Math.min(98, 68 + detectedSymptoms.length * 6);

  const updateConversation = (chatId, updater) => {
    setConversations((prev) => prev.map((c) => (c.id === chatId ? updater(c) : c)));
  };

  const addMessage = (chatId, message) => {
    updateConversation(chatId, (chat) => {
      const next = [...chat.messages, message];
      const firstUser = next.find((m) => m.role === "user")?.text || "New Conversation";
      return {
        ...chat,
        messages: next,
        title: firstUser.slice(0, 32),
        preview: message.text.slice(0, 48),
        updatedAt: new Date().toISOString(),
      };
    });
  };

  const sendMessage = async (text) => {
    if (!text.trim() || !activeChat) return;
    const userText = text.trim();
    setInput("");
    addMessage(activeChat.id, { role: "user", text: userText, time: nowText() });
    setLoading(true);
    try {
      const { data } = await API.post("/api/chat", {
        type: "followup",
        message: userText,
        context: { aiMode, detectedSymptoms },
      });
      addMessage(activeChat.id, { role: "bot", text: data.reply || "I’m here to help.", time: nowText() });
    } catch {
      addMessage(activeChat.id, { role: "bot", text: "Server is busy. Please try again.", time: nowText() });
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
  };

  const fileToBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const handleImageFile = async (file) => {
    if (!file || !file.type?.startsWith("image/")) return;
    setImageAnalyzing(true);
    const dataUrl = await fileToBase64(file);
    setImagePreview(dataUrl);
    addMessage(activeChat.id, { role: "user", text: `📎 Uploaded image: ${file.name}`, time: nowText() });
    try {
      const { data } = await API.post("/api/predict/image", { imageBase64: dataUrl, mimeType: file.type });
      addMessage(activeChat.id, { role: "bot", text: data.message || "Image analyzed.", time: nowText() });
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
    <div className={`chat2-page ${darkMode ? "dark" : ""}`}>
      <SeasonalAlert />
      {alert && <div className="chat2-alert">{alert}</div>}
      <aside className={`chat2-sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
        <div className="chat2-sidebar-head">
          <button className="chat2-new" onClick={handleNewChat}>+ New Chat</button>
          <button className="chat2-collapse" onClick={() => setSidebarCollapsed((s) => !s)}>{sidebarCollapsed ? "➡️" : "⬅️"}</button>
        </div>
        <div className="chat2-history">
          {conversations.map((chat) => (
            <button key={chat.id} className={`chat2-history-item ${chat.id === activeChat?.id ? "active" : ""}`} onClick={() => setActiveId(chat.id)}>
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
            <div className="chat2-meter"><label>AI Confidence</label><div><span style={{ width: `${aiConfidence}%` }} /></div></div>
            <div className="chat2-smart-actions">
              <button onClick={() => runSmartAction("summary")}>Summarize</button>
              <button onClick={() => runSmartAction("predict")}>Predict Risk</button>
              <button onClick={() => runSmartAction("followup")}>Follow-up</button>
              <button onClick={() => runSmartAction("report")}>Generate Report</button>
            </div>
          </aside>
        </div>

        <div className="chat2-suggestions">
          {QUICK_REPLIES.map((q) => <button key={q} onClick={() => sendMessage(q)}>{q}</button>)}
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
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask HealthBot anything about your symptoms..."
            onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
          />
          <button className="send" onClick={() => sendMessage(input)}>➤</button>
        </footer>
      </section>
    </div>
  );
}
