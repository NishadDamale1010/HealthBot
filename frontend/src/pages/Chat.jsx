import { useState, useRef, useEffect } from "react";
import "../App.css";
import API from "../services/api";

export default function Chat() {
    const [message, setMessage] = useState("");
    const [chat, setChat] = useState([]);
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState("");
    const [language, setLanguage] = useState("en");
    const chatEndRef = useRef(null);

    const langMap = {
        en: { placeholder: "Describe your symptoms..." },
        hi: { placeholder: "अपने लक्षण बताएं..." },
        mr: { placeholder: "तुमचे लक्षण सांगा..." },
    };

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chat, loading]);

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
        <div className="app">
            <div className="header">
                <div className="header-row">
                    <span className="brand-mini">🧠 AI Health Assistant</span>
                    <span className="header-sub">
                        {localStorage.getItem("token") ? "Personalized mode enabled" : "No login required"}
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

            {alert && <div className="alert">{alert}</div>}

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
                                    className={`badge ${
                                        String(msg.risk || "Low").toLowerCase()
                                    }`}
                                >
                                    {msg.risk} Risk
                                </span>
                            )}
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="typing" aria-live="polite">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                )}

                <div ref={chatEndRef}></div>
            </div>

            <div className="input-box">
                <input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder={langMap[language].placeholder}
                />

                <button onClick={sendMessage}>Send</button>
            </div>
        </div>
    );
}