import { useState, useRef, useEffect } from "react";
import "../App.css";
import API from "../services/api";
import SeasonalAlert from "../components/SeasonalAlert";

export default function Chat() {
    const [message, setMessage] = useState("");
    const [chat, setChat] = useState([]);
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState("");
    const [language, setLanguage] = useState("en");
    const [showIntro, setShowIntro] = useState(false);

    const chatEndRef = useRef(null);

    const langMap = {
        en: { placeholder: "Describe your symptoms..." },
        hi: { placeholder: "अपने लक्षण बताएं..." },
        mr: { placeholder: "तुमचे लक्षण सांगा..." },
    };

    // ✅ Auto scroll
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chat, loading]);

    // ✅ First visit intro message (FIXED)
    useEffect(() => {
        const firstVisit = !localStorage.getItem("visited");

        if (firstVisit) {
            const introMsg = {
                sender: "bot",
                text: `⚠️ Seasonal Alert:
Common diseases: Dengue, Malaria
Stay safe!`,
                risk: "Low",
            };

            setChat([introMsg]);
            localStorage.setItem("visited", "true");
        }
    }, []);

    const sendMessage = async () => {
        if (!message.trim()) return;

        const userMsg = { sender: "user", text: message };
        setChat((prev) => [...prev, userMsg]);
        setLoading(true);

        try {
            const res = await API.post("/api/chat", {
                message,
                lang: language,
            });

            const botMsg = {
                sender: "bot",
                text: res.data.reply,
                risk: res.data.prediction?.risk || "Low",
            };

            setChat((prev) => [...prev, botMsg]);
        } catch (err) {
            console.error("Chat request failed:", err?.response?.data || err?.message);
            setAlert("⚠️ Server error");
            setTimeout(() => setAlert(""), 3000);
        }

        setMessage("");
        setLoading(false);
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter") sendMessage();
    };

    return (
        <div>
            <SeasonalAlert />

            <div className="main-layout">

                {/* 🔥 LEFT SIDE LOGO */}
                <div className="side-logo">
                    <img src="/logo.png" alt="Team Innovators" />
                    <span>Team Innovators</span>
                </div>

                <div className="app">

                    {/* 🔷 HEADER */}
                    <div className="header">
                        <div className="header-row">
                            <div className="left-header">
                                <span className="brand-mini">🧠 AI Health Assistant</span>
                            </div>

                            <span className="header-sub">
                                {localStorage.getItem("token")
                                    ? "Personalized mode enabled"
                                    : "No login required"}
                            </span>
                        </div>

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

                    {/* ⚠️ ALERT */}
                    {alert && <div className="alert">{alert}</div>}

                    {/* 💬 CHAT BOX */}
                    <div className="chat-box">
                        {chat.map((msg, i) => (
                            <div key={i} className={`message ${msg.sender}`}>
                                <div className="avatar">
                                    {msg.sender === "bot" ? "🤖" : "🧑"}
                                </div>

                                <div className="content">
                                    <div className="text">{msg.text}</div>

                                    {msg.sender === "bot" && (
                                        <span
                                            className={`badge ${String(msg.risk || "Low").toLowerCase()}`}
                                        >
                                            {msg.risk} Risk
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* ⏳ Typing */}
                        {loading && (
                            <div className="typing">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        )}

                        <div ref={chatEndRef}></div>
                    </div>

                    {/* 📝 INPUT */}
                    <div className="input-box">
                        <input
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder={langMap[language].placeholder}
                        />

                        <button onClick={sendMessage}>Send</button>
                    </div>

                    {/* 🤖 FLOATING BOT */}
                    <div className="floating-bot" onClick={() => setShowIntro(true)}>
                        <img src="/bot.png" alt="Chatbot" />
                    </div>

                    {/* 📢 POPUP */}
                    {showIntro && (
                        <div className="popup">
                            <div className="popup-content">
                                <h3>🤖 About HealthBot</h3>

                                <p>
                                    I am your AI Health Assistant 🤖. I help you understand symptoms,
                                    provide disease awareness, and suggest preventive measures.
                                </p>

                                <ul>
                                    <li>✔ Symptom Analysis</li>
                                    <li>✔ Disease Awareness</li>
                                    <li>✔ Preventive Tips</li>
                                    <li>✔ Multi-language Support</li>
                                </ul>

                                <button onClick={() => setShowIntro(false)}>
                                    Close
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}