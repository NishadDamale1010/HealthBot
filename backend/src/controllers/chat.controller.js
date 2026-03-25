const axios = require("axios");
const { predictDisease } = require("../utils/symptoms");
const { getGeneralAdvice } = require("../utils/medicalKnowledge");
const { detectLanguage, translateText } = require("../utils/translator");

// 🧠 Memory
const userMemory = {};
const MAX_HISTORY = 6;

// 🚨 Emergency
const emergencyKeywords = [
  "chest pain",
  "breathing problem",
  "unconscious",
  "severe bleeding"
];

// 🤖 GROQ
async function groqAI(messages) {
  if (!process.env.GROQ_API_KEY) return null;

  try {
    const res = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama3-8b-8192",
        messages,
        temperature: 0.3,
        max_tokens: 500
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    return res.data?.choices?.[0]?.message?.content || null;
  } catch (err) {
    console.error("Groq Error:", err.message);
    return null;
  }
}

// 🧠 Extract Symptoms (AI)
async function extractSymptoms(message) {
  const res = await groqAI([
    {
      role: "system",
      content: "Extract only symptoms as comma separated list."
    },
    {
      role: "user",
      content: message
    }
  ]);

  return res?.toLowerCase().split(",").map(s => s.trim()) || [];
}

// 🧠 Severity
function detectSeverity(message) {
  const severeWords = [
    "severe",
    "unbearable",
    "continuous",
    "blood",
    "vomiting",
    "high fever",
    "chest pain"
  ];

  return severeWords.some(w => message.includes(w)) ? "High" : "Low";
}

// 🧠 Follow-up
function getFollowUp(symptoms) {
  if (symptoms.includes("fever")) {
    return "Do you also have chills or body pain?";
  }
  if (symptoms.includes("headache")) {
    return "Is the pain constant or comes and goes?";
  }
  return null;
}

// 🧠 Local fallback
function buildLocalResponse(predictions) {
  if (!predictions || predictions.length === 0) return null;

  return `🩺 Possible Conditions:
${predictions.slice(0, 3).map(p => `• ${p.disease}`).join("\n")}

📋 General Advice:
• Stay hydrated
• Take rest
• Monitor symptoms

⚠️ Consult a doctor if symptoms worsen.`;
}

// 🧠 MAIN LOGIC
async function getAIReply(message, userId = "default", forcedLang = null) {
  if (!userMemory[userId]) userMemory[userId] = [];

  // 🌐 Language detect
  const lang = forcedLang || (await detectLanguage(message));

  // 🔄 Translate
  const msgEn =
    lang === "en" ? message : await translateText(message, "en");

  const lower = msgEn.toLowerCase();

  // 🚨 Emergency
  if (emergencyKeywords.some(k => lower.includes(k))) {
    let msg =
      "🚨 This may be a medical emergency. Please go to nearest hospital immediately.";
    if (lang !== "en") msg = await translateText(msg, lang);
    return msg;
  }

  // 🧠 Extract symptoms (SAFE)
  let symptoms = [];
  try {
    symptoms = await extractSymptoms(msgEn);
  } catch {
    symptoms = msgEn.split(" ");
  }

  if (!Array.isArray(symptoms)) {
    symptoms = msgEn.split(" ");
  }

  // 🧬 Predict diseases (SAFE)
  let predictions = [];
  try {
    predictions = predictDisease(symptoms.join(" "));
  } catch {
    predictions = [];
  }

  if (!Array.isArray(predictions) || predictions.length === 0) {
    predictions = [{ disease: "Unknown", score: 0 }];
  }

  // 🧠 Severity
  const severity = detectSeverity(lower);

  // 💾 Memory
  userMemory[userId].push({ role: "user", content: msgEn });
  const history = userMemory[userId].slice(-MAX_HISTORY);

  // 🧠 SAFE PROMPT (NO CRASH)
  const diseaseText = predictions
    .slice(0, 3)
    .map(p => `${p.disease} (${p.score})`)
    .join("\n");

  const prompt = `
User symptoms: ${symptoms.join(", ") || msgEn}

Possible conditions:
${diseaseText}

Severity: ${severity}

Explain:
- Most likely condition
- Other possibilities
- Precautions
- Keep simple
- No medicines
`;

  // 🤖 AI
  let reply = null;
  try {
    reply = await groqAI([
      { role: "system", content: "You are a safe medical assistant." },
      ...history,
      { role: "user", content: prompt }
    ]);
  } catch (err) {
    console.log("Groq failed, fallback used");
  }

  // 🔄 Fallback
  if (!reply) {
    reply = `🩺 Possible Conditions:
${predictions.map(p => `• ${p.disease}`).join("\n")}

📋 Advice:
• Stay hydrated
• Take rest
• Monitor symptoms

⚠️ Consult a doctor if needed.`;
  }

  // 🤔 Follow-up
  if (symptoms.includes("fever")) {
    reply += "\n\n🤔 Do you also have chills or body pain?";
  }

  // 🌐 Translate back
  if (lang !== "en") {
    reply = await translateText(reply, lang);
  }

  // 💾 Save
  userMemory[userId].push({ role: "assistant", content: reply });

  return `${reply}\n\n⚠️ This is not medical advice.`;
}
// 🌐 API
exports.chatWithAI = async (req, res) => {
  try {
    const { message, userId = "default", lang } = req.body;

    if (!message) {
      return res.status(400).json({ message: "Message required" });
    }

    const reply = await getAIReply(message, userId, lang);
    const prediction = predictDisease(message);

    res.json({
      reply,
      prediction,
      timestamp: new Date()
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports.getAIReply = getAIReply; 