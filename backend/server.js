// server.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const crypto = require("crypto");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");

const { securityHeaders, sanitizeInput } = require("./src/middleware/security");
const { generalLimiter, authLimiter, chatLimiter, predictLimiter } = require("./src/middleware/rateLimiter");


const authRoutes = require("./src/routes/auth.route");
const chatRoutes = require("./src/routes/chat.routes");
const predictRoutes = require("./src/routes/predict.routes");
const profileRoutes = require("./src/routes/profile.routes");
const seasonalRoutes = require("./src/routes/seasonal.routes");
const healthRoutes = require("./src/routes/health.routes");
const hospitalRoutes = require("./src/routes/hospital.routes");
const intelligenceRoutes = require("./src/routes/intelligence.routes");
const ragRoutes = require("./src/routes/rag.routes");
const feedbackRoutes = require("./src/routes/feedback.routes");

// 🏥 SIH Blueprint Feature Routes
const abdmRoutes = require("./src/features/abdm/abdm.routes");
const consentRoutes = require("./src/features/consent/consent.routes");
const ashaRoutes = require("./src/features/asha/asha.routes");

// ✅ Import WhatsApp (DO NOT initialize again)
//require("./src/whatsapp/whatsapp");

dotenv.config();
const app = express();
app.set("trust proxy", 1);

// 🔐 Middleware
app.use(securityHeaders);
app.use(compression());
app.use(morgan("combined"));
app.use(sanitizeInput);
app.use(generalLimiter);
app.disable("x-powered-by");
const allowedOrigin = process.env.FRONTEND_ORIGIN || "*";
app.use(cors({
  origin: allowedOrigin === "*" ? true : allowedOrigin,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  credentials: true,
}));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use((req, res, next) => {
  req.requestId = crypto.randomUUID();
  res.setHeader("X-Request-Id", req.requestId);
  next();
});

// 📦 Routes
app.use("/api/predict", predictLimiter, predictRoutes);
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/chat", chatLimiter, chatRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/seasonal-alert", seasonalRoutes);
app.use("/api/health" ,healthRoutes)
app.use("/api/hospitals", hospitalRoutes);
app.use("/api/intelligence", intelligenceRoutes);
app.use("/api/rag", ragRoutes);
app.use("/api/feedback", feedbackRoutes);

// 🏥 SIH Blueprint Feature Routes
app.use("/api/abdm", abdmRoutes);
app.use("/api/consent", consentRoutes);
app.use("/api/asha", ashaRoutes);

app.get("/healthz", (req, res) => {
  res.status(200).json({
    ok: true,
    uptimeSec: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    requestId: req.requestId,
  });
});

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
  console.error(`Unhandled API error [${req.requestId}]:`, err.message);
  res.status(500).json({ message: "Internal server error", requestId: req.requestId });
});

// 🚀 Start server
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // 🚀 Bind port IMMEDIATELY so Render passes health check
    app.listen(PORT, () => {
      console.log(`🚀 Server running on ${PORT}`);
    });

    // 🗄️ MongoDB (Connect in background)
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_DB;
    if (!mongoUri) {
      console.warn("⚠️ MONGODB_URI not configured");
    } else {
      mongoose.connect(mongoUri).then(() => {
        console.log("✅ MongoDB connected");
      }).catch((err) => {
        console.error("❌ MongoDB connection error:", err.message);
      });
    }
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
}

startServer();
