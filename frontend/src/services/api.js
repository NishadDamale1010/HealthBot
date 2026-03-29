import axios from "axios";

const DEPLOYED_BACKEND_URL = "https://healthbot-k1ha.onrender.com";
const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ||
    (import.meta.env.DEV ? "http://localhost:5000" : DEPLOYED_BACKEND_URL);

const API = axios.create({
    baseURL: API_BASE_URL,
});

// 🔐 Attach token automatically
API.interceptors.request.use((req) => {
    const token = localStorage.getItem("token");

    if (token) {
        req.headers = req.headers || {};
        req.headers.Authorization = `Bearer ${token}`;
    }

    return req;
});

export default API;
