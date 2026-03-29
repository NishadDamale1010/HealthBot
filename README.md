# 🧠 HealthBot – AI Health Assistant

HealthBot is an AI-powered health assistant that helps users with disease awareness, basic guidance, and chatbot interaction. It integrates a web app + WhatsApp bot for accessibility.

---

## 🚀 Features

- 🤖 AI Chatbot for health queries  
- 🔐 User Authentication (JWT based)  
- 💬 Real-time chat interface  
- 📱 WhatsApp Bot Integration  
- 📊 Dashboard (Upcoming)  
- 🌙 Dark Mode (Planned)  

---

## 🛠️ Tech Stack

### Frontend
- React (Vite)
- Axios
- React Router

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)

### Other Tools
- WhatsApp Web.js
- JWT Authentication
- bcrypt (password hashing)

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


⚠️ Never push `.env` file to GitHub

For frontend deployment, create `frontend/.env` from `frontend/.env.example` and set:

```
VITE_API_BASE_URL=https://healthbot-k1ha.onrender.com
```

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
