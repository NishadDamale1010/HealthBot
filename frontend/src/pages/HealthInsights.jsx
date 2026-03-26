import { useEffect, useState } from "react";
import API from "../services/api";

export default function HealthInsightsPreview() {
    const [history, setHistory] = useState([]);

    useEffect(() => {
        API.get("/api/health/history")
            .then(res => setHistory(res.data.slice(0, 3)));
    }, []);

    return (
        <div className="bg-white rounded-xl shadow-lg p-5 hover:shadow-xl transition">

            {/* HEADER */}
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-blue-600">
                    🧠 Health Insights
                </h2>
                <span className="text-xs text-gray-400">Recent</span>
            </div>

            {/* CONTENT */}
            {history.length === 0 ? (
                <p className="text-gray-400 text-sm">
                    No data yet. Start chatting to generate insights.
                </p>
            ) : (
                <div className="space-y-3">
                    {history.map((item, i) => (
                        <div
                            key={i}
                            className="p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition cursor-pointer"
                        >
                            <p className="font-medium text-sm text-gray-800 truncate">
                                {item.symptoms}
                            </p>

                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                {item.response.slice(0, 80)}...
                            </p>
                        </div>
                    ))}
                </div>
            )}

            {/* BUTTON */}
            <button
                onClick={() => window.location.href = "/health"}
                className="mt-4 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition text-sm"
            >
                View Full Insights →
            </button>
        </div>
    );
}