const express = require("express");
const optionalAuth = require("../middleware/optionalAuth.middleware");
const {
  simulateProgression,
  riskScore,
  prescriptionSafety,
  emotionCheck,
  labAnalyzer,
  dailyCoach,
  timeline,
} = require("../controllers/intelligence.controller");

const router = express.Router();

router.post("/progression", simulateProgression);
router.post("/risk-score", riskScore);
router.post("/prescription-safety", prescriptionSafety);
router.post("/emotion-check", emotionCheck);
router.post("/lab-analyzer", labAnalyzer);
router.post("/daily-coach", dailyCoach);
router.get("/timeline", optionalAuth, timeline);

module.exports = router;
