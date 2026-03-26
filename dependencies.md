## 🔧 Backend Setup

```bash
cd backend
npm install
📦 Backend Dependencies
npm install express mongoose dotenv cors bcryptjs jsonwebtoken
npm install whatsapp-web.js qrcode-terminal
npm install axios
npm install nodemon --save-dev
🎨 Frontend Setup
cd ../frontend
npm install
📦 Frontend Dependencies
npm install axios react-router-dom

(If using Vite/React, dependencies will already be inside package.json)

🔐 Environment Variables (IMPORTANT)

Create a .env file inside backend/

Example:
PORT=5000
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret_key
OPENAI_API_KEY=your_api_key

⚠️ Do NOT push .env file to GitHub

▶️ Run Project
Backend
cd backend
npm run dev
Frontend
cd frontend
npm run dev
---