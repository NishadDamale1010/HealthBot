// server.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

// ✅ Import WhatsApp (DO NOT initialize again)
require("./src/whatsapp/whatsapp");

dotenv.config();
const app = express();

// 🔐 Middleware
app.use(cors());
app.use(express.json());

// 📦 Routes
app.use("/api/predict", require("./src/routes/predict.routes"));
app.use("/api/auth", require("./src/routes/auth.route"));
app.use("/api/chat", require("./src/routes/chat.routes"));

// 🏠 Root
app.get("/", (req, res) => {
  res.send("🚀 Health AI Backend Running");
});

// ❌ 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ⚠️ Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled API error:", err.message);
  res.status(500).json({ message: "Internal server error" });
});

// 🚀 Start server
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // 🗄️ MongoDB
    if (!process.env.MONGO_DB) {
      console.warn("⚠️ MONGO_DB not configured");
    } else {
      await mongoose.connect(process.env.MONGO_DB);
      console.log("✅ MongoDB connected");
    }

    app.listen(PORT, () => {
      console.log(`🚀 Server running on ${PORT}`);
    });

  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
}

startServer();