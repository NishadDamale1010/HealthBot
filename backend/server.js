// server.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

const authRoutes = require("./src/routes/auth.route");
const chatRoutes = require("./src/routes/chat.routes");
const predictRoutes = require("./src/routes/predict.routes");
const profileRoutes = require("./src/routes/profile.routes");
const seasonalRoutes = require("./src/routes/seasonal.routes");
const healthRoutes = require("./src/routes/health.routes");
const hospitalRoutes = require("./src/routes/hospital.routes");


// ✅ Import WhatsApp (DO NOT initialize again)
require("./src/whatsapp/whatsapp");

dotenv.config();
const app = express();

// 🔐 Middleware
app.disable("x-powered-by");
app.use(cors());
app.use(express.json({ limit: "1mb" }));

// 📦 Routes
app.use("/api/predict", predictRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/seasonal-alert", seasonalRoutes);
app.use("/api/health" ,healthRoutes)
app.use("/api/hospitals", hospitalRoutes);

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