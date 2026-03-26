import axios from "axios";

const API = axios.create({
    baseURL: "https://healthbot-k1ha.onrender.com" ,
    //|| "http://localhost:5000"
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