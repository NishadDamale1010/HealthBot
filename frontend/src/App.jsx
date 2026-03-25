import { useState, useRef, useEffect } from "react";
import axios from "axios";
import "./App.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

function App() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState("");
  const chatEndRef = useRef(null);

  // 🔥 Auto Scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, loading]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMsg = { sender: "user", text: message };
    setChat((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE_URL}/api/chat`, {
        message,
      });

      const botMsg = {
        sender: "bot",
        text: res.data.reply,
        risk: res.data.prediction?.risk || "Low",
      };

      setChat((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      setAlert("⚠️ Server error. Please try again.");
      setTimeout(() => setAlert(""), 3000);
    }

    setMessage("");
    setLoading(false);
  };

  // 🎤 Voice Input
  const startVoice = () => {
    if (!("webkitSpeechRecognition" in window)) {
      setAlert("❌ Voice not supported in this browser");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-IN";

    recognition.onstart = () => {
      setAlert("🎤 Listening...");
    };

    recognition.onresult = (event) => {
      setMessage(event.results[0][0].transcript);
      setAlert("");
    };

    recognition.onerror = () => {
      setAlert("⚠️ Voice recognition failed");
    };

    recognition.start();
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div className="app">
      {/* ✅ Header */}
      <div className="header">
        🧠 AI Health Assistant
        <small>Early Detection • Preventive Care</small>
      </div>

      {/* ✅ Alert */}
      {alert && <div className="alert">{alert}</div>}

      {/* ✅ Chat */}
      <div className="chat-box">
        {chat.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>

            {/* Avatar */}
            <div className="avatar">
              {msg.sender === "bot" ? "🤖" : "🧑"}
            </div>

            {/* Content */}
            <div className="content">
              <div className="text">{msg.text}</div>

              {msg.sender === "bot" && msg.risk && (
                <span className={`badge ${msg.risk.toLowerCase()}`}>
                  {msg.risk} Risk
                </span>
              )}
            </div>
          </div>
        ))}

        {/* Typing */}
        {loading && (
          <div className="typing">
            <span></span><span></span><span></span>
          </div>
        )}

        <div ref={chatEndRef}></div>
      </div>

      {/* ✅ Input */}
      <div className="input-box">
        <button className="voice-btn" onClick={startVoice}>
          🎤
        </button>

        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Describe your symptoms..."
        />

        <button
          onClick={sendMessage}
          disabled={loading}
          className="send-btn"
        >
          ➤
        </button>
      </div>
    </div>
  );
}

export default App;