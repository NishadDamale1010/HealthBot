const express = require("express");
const router = express.Router();
const {
    saveHealthData,
    getHealthHistory,
    downloadReport
} = require("../controllers/health.controller");

const authMiddleware = require("../middleware/auth.middleware");

// Save history
router.post("/save", authMiddleware, saveHealthData);

// Get history
router.get("/history", authMiddleware, getHealthHistory);

// Download PDF
router.get("/report", authMiddleware, downloadReport);

module.exports = router;