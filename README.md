# 🏥 HealthBot AI - Comprehensive Health Intelligence Platform

HealthBot is an advanced AI-powered healthcare platform with 60+ cutting-edge features including symptom progression simulation, digital twin health modeling, real-time emergency detection, and multi-platform support.

---

## 🚀 Core Features (Tier 1)

- **AI Symptom Progression Simulator** - Predicts disease progression patterns
- **Personalized Health Risk Scoring** - Individualized risk assessment algorithms
- **Prescription Image Scanner + Drug Safety Checker** - OCR + interaction analysis
- **Mental Health Emotion Detection** - Sentiment analysis + psychological profiling
- **Health Timeline Dashboard** - Visual health history tracking
- **Smart Follow-up Question Engine** - Adaptive diagnostic questioning
- **Nearby Medical Help Recommendation** - Context-aware location services
- **Lab Report Analyzer** - AI-powered medical result interpretation
- **Real-Time Emergency Detection Mode** - Critical symptom monitoring
- **AI Health Coach** - Daily personalized wellness guidance
- **Privacy + Data Control System** - HIPAA-compliant data management
- **Multi-user Family Health Dashboard** - Family-wide health tracking
- **Disease Probability Visualization** - Interactive risk charts
- **Voice + Tone Adaptive Responses** - Emotion-aware communication
- **"What If" Scenario Simulation** - Treatment outcome predictions

## 🧠 Advanced Features (Tier 2)

- **Digital Twin Health Model** - Personalized health digital replica
- **Adaptive Treatment Recommendation Engine** - ML-based treatment suggestions
- **Offline Emergency AI Mode** - Critical functionality without internet
- **Long-Term Context Memory Engine** - Persistent health context tracking
- **Medication Adherence Intelligence** - Smart compliance monitoring
- **Conversational Diagnosis Graph** - Visual diagnostic pathways
- **Health Habit Gamification System** - Engaging wellness challenges
- **Nutritional Deficiency Predictor** - Dietary gap analysis
- **Food Image Scanner with Nutrition Breakdown** - Visual calorie counting
- **Dynamic Severity Classification System** - Real-time severity assessment
- **Seasonal Disease Intelligence** - Environmental health predictions
- **AI Second Opinion Mode** - Multiple diagnostic perspectives
- **Recovery Prediction Engine** - Treatment timeline forecasting
- **Conversation Summary Generator** - Doctor-ready reports
- **Allergy Intelligence System** - Comprehensive allergy tracking

## 🔬 Ultra-Advanced Features (Tier 3)

- **Wearable Data Sync / Simulation** - IoT device integration
- **Multi-language + Local Dialect Support** - Global accessibility
- **Preventive Care Planner** - Proactive health scheduling
- **Explainable AI** - Transparent treatment reasoning
- **Micro-Habit Correction Engine** - Behavioral pattern optimization
- **Chat Behavior-Based Health Monitoring** - Conversational health insights
- **Drug Effectiveness Feedback Loop** - Treatment efficacy tracking
- **AI Health Audit Reports** - Weekly/monthly health summaries
- **Voice Stress & Breathing Analysis** - Vocal biomarker detection
- **Medical History Compression System** - Efficient data storage
- **Pandemic / Disaster Mode** - Emergency response protocols
- **AI Companion Mode** - Daily wellness companion
- **Body System Mapping Interface** - Interactive anatomy visualization
- **Habit vs Symptom Correlation Engine** - Pattern recognition system
- **Smart Triage System (ER-style)** - Emergency prioritization
- **Family History-Based Risk Simulation** - Genetic risk assessment

## 🚀 Next-Generation Features (Tier 4)

- **Multi-image Diagnosis Comparison** - Comparative medical imaging
- **ELI5 Medical Explanation Mode** - Simplified medical explanations
- **Smart Supplement Advisor** - Personalized supplement recommendations
- **AI Health Goal Planner** - Dynamic health objective setting
- **Silent Symptom Detection** - Subtle health indicator identification
- **Medication Cost Optimizer** - Affordable treatment options
- **Context-Aware Smart Reminder Engine** - Intelligent notification system
- **Conversational Drill-Down Engine** - Deep diagnostic exploration
- **Environmental Impact Analyzer** - External health factor assessment
- **Health Confidence Score** - Trust quantification system
- **Emergency Contact Intelligence** - Smart emergency notification
- **AI Recovery / Rehab Coach** - Post-treatment guidance
- **Cross-platform Sync** - Web + Mobile + CLI integration
- **Self-Debugging AI System** - Autonomous error correction
- **Health Knowledge Graph Backend** - Semantic health relationships
- **Doctor-Ready Report Export** - Professional medical documentation
- **Adaptive UI Based on User Type** - Personalized interface design
- **Rare Disease Detection Flag** - Uncommon condition identification
- **Community Disease Pattern Detection** - Public health monitoring

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
