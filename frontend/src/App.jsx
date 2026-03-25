import { useState, useRef, useEffect } from "react";
import axios from "axios";
import "./App.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

function App() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState("");
  const [language, setLanguage] = useState("en"); // 🌐 NEW
  const chatEndRef = useRef(null);

  // 🌐 Language Labels
  const langMap = {
    en: {
      name: "English",
      placeholder: "Describe your symptoms...",
    },
    hi: {
      name: "हिंदी",
      placeholder: "अपने लक्षण बताएं...",
    },
    mr: {
      name: "मराठी",
      placeholder: "तुमचे लक्षण सांगा...",
    },
  };

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
        lang: language, // 🌐 SEND LANGUAGE
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

  // 🎤 Voice Input (MULTILINGUAL)
  const startVoice = () => {
    if (!("webkitSpeechRecognition" in window)) {
      setAlert("❌ Voice not supported in this browser");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();

    // 🌐 Set language dynamically
    if (language === "hi") recognition.lang = "hi-IN";
    else if (language === "mr") recognition.lang = "mr-IN";
    else recognition.lang = "en-IN";

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

        {/* 🌐 Language Selector */}
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="lang-select"
        >
          <option value="en">English</option>
          <option value="hi">हिंदी</option>
          <option value="mr">मराठी</option>
        </select>
      </div>

      {/* ✅ Alert */}
      {alert && <div className="alert">{alert}</div>}

      {/* ✅ Chat */}
      <div className="chat-box">
        {chat.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            <div className="avatar">
              {msg.sender === "bot" ? "🤖" : "🧑"}
            </div>

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
          placeholder={langMap[language].placeholder} // 🌐 Dynamic
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