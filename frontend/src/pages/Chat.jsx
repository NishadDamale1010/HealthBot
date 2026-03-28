import { useState, useRef, useEffect } from "react";
import API from "../services/api";
import SeasonalAlert from "../components/SeasonalAlert";

export default function Chat() {
    const [message, setMessage] = useState("");
    const [chat, setChat] = useState([]);
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState("");
    const [language, setLanguage] = useState("en");
    const [listening, setListening] = useState(false);
    const [emergency, setEmergency] = useState(false);

    const recognitionRef = useRef(null);
    const chatEndRef = useRef(null);

    const langMap = {
        en: { placeholder: "Describe your symptoms..." },
        hi: { placeholder: "अपने लक्षण बताएं..." },
        mr: { placeholder: "तुमचे लक्षण सांगा..." },
    };

    // 🚨 Emergency keywords
    const emergencyKeywords = [
        "chest pain",
        "heart attack",
        "not breathing",
        "unconscious",
        "heavy bleeding",
        "stroke",
        "severe pain",
        "accident",
        "fainted",
    ];

    const playAlarm = () => {
        const audio = new Audio("/alarm.mp3");
        audio.play();
    };

    const detectEmergency = (text, risk) => {
        const lower = text.toLowerCase();

        const keywordMatch = emergencyKeywords.some((word) =>
            lower.includes(word)
        );

        if (risk === "High" || keywordMatch) {
            setEmergency(true);
            playAlarm();
        }
    };

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chat, loading]);

    const handleMic = () => {
        if (!recognitionRef.current) {
            alert("Speech not supported in this browser");
            return;
        }
        recognitionRef.current.start();
    };

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

            detectEmergency(message, botMsg.risk);

        } catch (err) {
            setAlert("⚠️ Server error");
            setTimeout(() => setAlert(""), 3000);
        }

        setMessage("");
        setLoading(false);
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter") sendMessage();
    };

    const getRiskColor = (risk) => {
        switch (risk?.toLowerCase()) {
            case "high":
                return "bg-red-500";
            case "medium":
                return "bg-yellow-400 text-black";
            default:
                return "bg-green-500";
        }
    };

    // 🎤 Speech Recognition
    useEffect(() => {
        if (!("webkitSpeechRecognition" in window)) return;

        const recognition = new window.webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.lang =
            language === "hi"
                ? "hi-IN"
                : language === "mr"
                    ? "mr-IN"
                    : "en-US";

        recognition.onstart = () => setListening(true);
        recognition.onend = () => setListening(false);

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setMessage(transcript);
        };

        recognitionRef.current = recognition;
    }, [language]);

    return (
        <div className="min-h-screen flex flex-col items-center">

            <SeasonalAlert />

            {/* 🚨 EMERGENCY POPUP */}
            {emergency && (
                <div className="fixed top-0 left-0 w-full h-full bg-black/70 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl text-center shadow-xl max-w-sm">

                        <h2 className="text-xl font-bold text-red-600">
                            🚨 EMERGENCY DETECTED
                        </h2>

                        <p className="text-sm mt-2 text-gray-600">
                            Immediate medical attention required!
                        </p>

                        <div className="flex gap-3 mt-4 justify-center">
                            <a
                                href="tel:102"
                                className="bg-red-600 text-white px-4 py-2 rounded-lg"
                            >
                                📞 Call Ambulance
                            </a>

                            <button
                                onClick={() => window.location.href = "/hospitals"}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                            >
                                🗺 View Hospitals
                            </button>
                        </div>

                        <button
                            onClick={() => setEmergency(false)}
                            className="mt-4 text-gray-500 text-sm"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            {/* HEADER */}
            <div className="w-full max-w-4xl mt-4 bg-white shadow-sm rounded-xl px-4 py-3 flex justify-between items-center border">
                <h1 className="text-lg font-semibold text-green-600">
                    🩺 AI Health Assistant
                </h1>

                <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="border rounded-md px-2 py-1 text-sm"
                >
                    <option value="en">English</option>
                    <option value="hi">हिंदी</option>
                    <option value="mr">मराठी</option>
                </select>
            </div>

            {/* CHAT */}
            <div className="w-full max-w-4xl mt-3 bg-white rounded-xl shadow-md flex flex-col h-[65vh] border">

                <div className="flex-1 overflow-y-auto p-4 space-y-3">

                    {/* 🔥 INTRO SCREEN */}
                    {chat.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-center">

                            <img
                                src="/logo.png"
                                alt="logo"
                                className="w-16 h-16 mb-3"
                            />

                            <h2 className="text-lg font-semibold text-green-600">
                                HealthBot Assistant
                            </h2>

                            <p className="text-sm text-gray-500 mt-1">
                                Smart AI for disease awareness & guidance
                            </p>

                            <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs max-w-md">

                                <div className="bg-green-50 px-3 py-2 rounded-lg">
                                    🩺 Symptom Checker
                                </div>

                                <div className="bg-blue-50 px-3 py-2 rounded-lg">
                                    📊 Health Insights
                                </div>

                                <div className="bg-purple-50 px-3 py-2 rounded-lg">
                                    ⚡ Instant AI Advice
                                </div>

                            </div>
                        </div>
                    )}

                    {/* CHAT MESSAGES */}
                    {chat.map((msg, i) => (
                        <div
                            key={i}
                            className={`flex ${msg.sender === "user"
                                ? "justify-end"
                                : "justify-start"
                                }`}
                        >
                            <div
                                className={`px-4 py-2 rounded-2xl text-sm ${msg.sender === "user"
                                    ? "bg-blue-500 text-white"
                                    : "bg-gray-100"
                                    }`}
                            >
                                {msg.text}

                                {msg.sender === "bot" && (
                                    <div
                                        className={`text-xs mt-2 px-2 py-1 rounded-full text-white ${getRiskColor(msg.risk)}`}
                                    >
                                        {msg.risk} Risk
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {loading && <div>Typing...</div>}
                    <div ref={chatEndRef}></div>
                </div>

                {/* INPUT */}
                <div className="border-t p-3 flex gap-2 items-center">
                    <input
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder={langMap[language].placeholder}
                        className="flex-1 border rounded-full px-4 py-2"
                    />

                    <button onClick={handleMic}>
                        🎤
                    </button>

                    <button
                        onClick={sendMessage}
                        className="bg-green-600 text-white px-4 py-2 rounded-full"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
}