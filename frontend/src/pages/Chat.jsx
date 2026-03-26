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
    const recognitionRef = useRef(null);
    const chatEndRef = useRef(null);

    const langMap = {
        en: { placeholder: "Describe your symptoms..." },
        hi: { placeholder: "अपने लक्षण बताएं..." },
        mr: { placeholder: "तुमचे लक्षण सांगा..." },
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
    useEffect(() => {
        if (!("webkitSpeechRecognition" in window)) return;

        const recognition = new window.webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = language === "hi" ? "hi-IN" : language === "mr" ? "mr-IN" : "en-US";

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

            {/* HEADER */}
            <div className="w-full max-w-4xl mt-4 bg-white shadow-sm rounded-xl px-4 py-3 flex justify-between items-center border">
                <div>
                    <h1 className="text-lg font-semibold text-green-600">
                        🩺 AI Health Assistant
                    </h1>
                    <p className="text-xs text-gray-500">
                        {localStorage.getItem("token")
                            ? "Personalized mode enabled"
                            : "No login required"}
                    </p>
                </div>

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

            {/* CHAT CONTAINER */}
            <div className="w-full max-w-4xl mt-3 bg-white rounded-xl shadow-md flex flex-col h-[65vh] border">

                {/* MESSAGES */}
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

                            {/* FEATURES */}
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
                            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                        >
                            <div
                                className={`px-4 py-2 rounded-2xl shadow-sm text-sm ${msg.sender === "user"
                                    ? "bg-blue-500 text-white"
                                    : "bg-gray-100"
                                    } max-w-[70%]`}
                            >
                                {msg.text}

                                {msg.sender === "bot" && (
                                    <div
                                        className={`text-xs mt-2 inline-block px-2 py-1 rounded-full text-white ${getRiskColor(msg.risk)}`}
                                    >
                                        {msg.risk} Risk
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {loading && (
                        <div className="text-gray-400 text-sm">Typing...</div>
                    )}

                    <div ref={chatEndRef}></div>
                </div>

                {/* INPUT */}
                <div className="border-t p-3 flex gap-2 items-center">

                    <input
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder={langMap[language].placeholder}
                        className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                    />

                    {/* 🎤 MIC BUTTON */}
                    <button
                        onClick={handleMic}
                        className={`px-3 py-2 rounded-full transition ${listening
                                ? "bg-red-500 text-white animate-pulse"
                                : "bg-gray-200"
                            }`}
                    >
                        🎤
                    </button>

                    {/* SEND */}
                    <button
                        onClick={sendMessage}
                        className="bg-green-600 text-white px-5 py-2 rounded-full hover:bg-green-700 transition text-sm"
                    >
                        Send
                    </button>
                </div>
            </div>

            {/* FLOATING BOT */}
            <div className="fixed bottom-6 right-6">
                <img
                    src="/bot.png"
                    alt="bot"
                    className="w-14 h-14 rounded-full shadow-lg hover:scale-110 transition cursor-pointer"
                />
            </div>
        </div>
    );
}