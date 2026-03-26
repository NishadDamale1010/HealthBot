import { useEffect, useState } from "react";
import API from "../services/api";
import "../App.css";

export default function SeasonalAlert() {
    const [alert, setAlert] = useState(null);
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const fetchAlert = async () => {
            const res = await API.get("/api/seasonal-alert");
            setAlert(res.data);
            const timer = setTimeout(() => setVisible(false), 5000);
            return () => clearTimeout(timer);
        };
        fetchAlert();
    }, []);

    if (!alert || !visible) return null;

    return (
        <div className="alert-strip">
            <span className="alert-text">
                ⚠️ {alert.season.toUpperCase()} ALERT: {alert.diseases.join(", ")}
            </span>

            <button className="close-btn" onClick={() => setVisible(false)}>
                ✖
            </button>
        </div>
    );
}