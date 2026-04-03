# 🏥 HealthBot AI - Comprehensive Health Intelligence Platform

HealthBot is an advanced AI-powered healthcare platform with 60+ cutting-edge features including symptom progression simulation, digital twin health modeling, real-time emergency detection, and multi-platform support.

---

## 🚀 Features

- 🤖 AI Chatbot for health queries  
- 🔐 User Authentication (JWT based)  
- 💬 Real-time chat interface  
- ✨ AI Health Intelligence Suite (progression simulation, risk scoring, emotion/lab insights)  
- 🧠 Advanced AI bundle (digital twin, adherence, recovery prediction, second opinion scaffolds)  
- 🚀 Ultra AI bundle (continuous monitoring, triage colors, confidence score, habit correlation, rare-flag scaffolds)  
- 🧪 Skin image detection + lab report explanation endpoints (AI-assisted, preliminary)  
- 📱 WhatsApp Bot Integration  
- 📊 Dashboard (Upcoming)  
- 🌙 Dark Mode (Planned)  

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI framework
- **React Native** - Mobile application
- **TensorFlow.js** - Client-side ML
- **Chart.js + D3.js** - Advanced visualizations
- **TailwindCSS** - Modern styling
- **PWA** - Offline functionality

### Backend
- **Node.js + Express** - Server framework
- **TensorFlow.js Node** - Server-side ML
- **OpenCV** - Computer vision
- **Tesseract.js** - OCR processing
- **MongoDB + SQLite** - Multi-database approach
- **Redis** - Caching layer
- **Socket.io** - Real-time communication

### AI/ML Technologies
- **Natural Language Processing** - Medical text analysis
- **Computer Vision** - Image recognition
- **Machine Learning** - Predictive analytics
- **Deep Learning** - Neural network models
- **Speech Recognition** - Voice processing

### Integration & APIs
- **WhatsApp API** - Messaging platform
- **Google Maps API** - Location services
- **Medical APIs** - Drug databases
- **Emergency Services** - Alert systems
- **Wearable APIs** - Health device integration

---

## 📁 Project Structure

HealthBot/
│
├── backend/ # Node.js + Express API
├── frontend/ # React frontend
├── dependencies.md # Setup guide
└── README.md


---

## ⚙️ Setup Instructions

Follow the guide in 👉 `dependencies.md`

---

## 🔐 Environment Variables

Create a `.env` file inside `backend/`


PORT=5000
MONGO_DB=your_mongodb_connection
JWT_SECRET=your_secret_key
GROQ_API_KEY=your_groq_api_key
FRONTEND_ORIGIN=https://your-frontend-domain.com


⚠️ Never push `.env` file to GitHub

For frontend deployment, create `frontend/.env` from `frontend/.env.example` and set:

```
VITE_API_BASE_URL=https://healthbot-k1ha.onrender.com
```

`frontend/vercel.json` includes SPA rewrite rules so route refreshes like `/dashboard` or `/hospitals` do not return 404 on Vercel.

Backend readiness endpoint: `GET /healthz`

---

## ▶️ Run Project

### Backend

cd backend
npm run dev


### Frontend

cd frontend
npm run dev


---

## 🤝 Contribution Guidelines

1. Clone the repo  
2. Create a new branch  

git checkout -b feature-yourname

3. Make changes  
4. Commit  

git commit -m "Your message"

5. Push  

git push origin feature-yourname

6. Create Pull Request  

---
