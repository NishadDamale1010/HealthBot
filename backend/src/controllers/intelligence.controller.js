const ChatMessage = require("../models/chatMessage");
const User = require("../models/user");

const HIGH_RISK_KEYWORDS = ["chest pain", "shortness of breath", "not breathing", "fainted", "stroke", "heavy bleeding"];
const STRESS_KEYWORDS = ["stressed", "anxious", "panic", "overwhelmed", "depressed", "hopeless", "can't sleep"];

function toNumber(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

exports.simulateProgression = (req, res) => {
  const symptoms = (req.body?.symptoms || "").toLowerCase();
  const treated = !!req.body?.treated;
  const severe = HIGH_RISK_KEYWORDS.some((k) => symptoms.includes(k));
  const timeline = treated
    ? [
      { day: 1, status: "Symptoms may stabilize with rest/medication." },
      { day: 2, status: "Expected mild improvement if treatment is correct." },
      { day: 4, status: "Most mild conditions show noticeable recovery." },
    ]
    : [
      { day: 1, status: "Symptoms may persist or mildly worsen." },
      { day: 2, status: severe ? "Risk of serious progression is high. Seek urgent care." : "Inflammation/discomfort may increase." },
      { day: 4, status: severe ? "Potential emergency complications possible." : "Recovery may be delayed without treatment." },
    ];

  return res.json({
    treated,
    severe,
    timeline,
    note: "AI simulation only. Not a clinical diagnosis.",
  });
};

exports.riskScore = (req, res) => {
  const age = toNumber(req.body?.age, 30);
  const bmi = toNumber(req.body?.bmi, 24);
  const sleep = toNumber(req.body?.sleepHours, 7);
  const activity = toNumber(req.body?.activityDaysPerWeek, 3);
  const sugarIntake = toNumber(req.body?.sugarLevel, 5); // 1-10

  const diabetes = Math.min(100, Math.max(5, Math.round(age * 0.35 + bmi * 1.8 + sugarIntake * 4 - activity * 2)));
  const heart = Math.min(100, Math.max(5, Math.round(age * 0.45 + bmi * 1.4 + (7 - sleep) * 6 - activity * 2.5)));

  const classify = (v) => (v >= 70 ? "High" : v >= 40 ? "Moderate" : "Low");

  return res.json({
    diabetesRisk: { score: diabetes, level: classify(diabetes) },
    heartRisk: { score: heart, level: classify(heart) },
    note: "Estimated risk score for awareness only.",
  });
};

exports.prescriptionSafety = (req, res) => {
  const medicines = String(req.body?.medicines || "")
    .split(/[,\n]/)
    .map((m) => m.trim().toLowerCase())
    .filter(Boolean);

  const warnings = [];
  if (medicines.includes("ibuprofen") && medicines.includes("diclofenac")) {
    warnings.push("Possible duplicate NSAID use (ibuprofen + diclofenac).");
  }
  if (medicines.includes("paracetamol") && medicines.includes("acetaminophen")) {
    warnings.push("Paracetamol and acetaminophen are the same drug family; check duplicate dosing.");
  }
  if (medicines.length === 0) {
    warnings.push("No medicines detected. OCR integration can be added later.");
  }

  return res.json({
    detectedMedicines: medicines,
    warnings,
    safe: warnings.length === 0,
    note: "Preliminary medication safety check only.",
  });
};

exports.emotionCheck = (req, res) => {
  const message = String(req.body?.message || "").toLowerCase();
  const stressed = STRESS_KEYWORDS.some((k) => message.includes(k));
  return res.json({
    mood: stressed ? "Stressed" : "Stable",
    suggestion: stressed
      ? "You seem stressed. Try a 2-minute breathing exercise: inhale 4s, hold 4s, exhale 6s."
      : "Keep going. Maintain hydration, rest, and routine.",
  });
};

exports.labAnalyzer = (req, res) => {
  const hemoglobin = toNumber(req.body?.hemoglobin, NaN);
  const glucose = toNumber(req.body?.fastingGlucose, NaN);
  const findings = [];
  if (Number.isFinite(hemoglobin) && hemoglobin < 12) findings.push("Hemoglobin appears low; possible anemia risk.");
  if (Number.isFinite(glucose) && glucose > 100) findings.push("Fasting glucose appears elevated.");
  return res.json({
    findings,
    summary: findings.length ? "Some values may need follow-up." : "No clear high-risk markers from provided values.",
    note: "Lab interpretation is informational only.",
  });
};

exports.dailyCoach = (req, res) => {
  const sleep = toNumber(req.body?.sleepHours, 7);
  return res.json({
    tips: [
      sleep < 7 ? "You slept less than 7 hours. Prioritize rest tonight." : "Great sleep consistency. Keep it up.",
      "Drink at least 2L water today.",
      "Take a 20-minute walk after meals.",
    ],
  });
};

exports.timeline = async (req, res) => {
  if (!req.user?.id) return res.json({ events: [], note: "Login for personalized timeline." });
  const user = await User.findById(req.user.id).lean();
  if (!user) return res.json({ events: [] });
  const messages = await ChatMessage.find({ user: user._id }).sort({ createdAt: -1 }).limit(20).lean();
  const events = messages.map((m) => ({
    at: m.createdAt,
    role: m.role,
    text: m.content.slice(0, 120),
  }));
  return res.json({ events });
};
