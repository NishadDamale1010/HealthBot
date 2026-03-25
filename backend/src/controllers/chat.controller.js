const axios = require("axios");
const { predictDisease } = require("../utils/symptoms");
const { getGeneralAdvice } = require("../utils/medicalKnowledge");

// 🧠 In-memory user context
const userMemory = {};
const MAX_HISTORY = 6;

// 🚨 Emergency keywords
const emergencyKeywords = [
  "chest pain",
  "breathing problem",
  "unconscious",
  "severe bleeding"
];

// 🤖 GROQ AI CALL
async function groqAI(messages) {
  if (!process.env.GROQ_API_KEY) return null;

  try {
    const res = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama3-8b-8192",
        messages,
        temperature: 0.5,
        max_tokens: 500
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        timeout: 10000
      }
    );

    return res.data?.choices?.[0]?.message?.content || null;
  } catch (err) {
    console.error("❌ Groq Error:", err.response?.data || err.message);
    return null;
  }
}

// 🧠 LOCAL RESPONSE BUILDER (🔥 NEW)
function buildLocalResponse(prediction) {
  if (!prediction || prediction.disease === "Unknown") {
    return null;
  }

  const advice = getGeneralAdvice(prediction.disease);

  if (!advice || advice.length === 0) return null;

  return `🩺 Possible Condition: ${prediction.disease}

📋 Precautions:
${advice.map(a => `• ${a}`).join("\n")}

⚠️ If symptoms persist, consult a doctor.`;
}

// 🧠 MAIN AI LOGIC
async function getAIReply(message, userId = "default") {
  if (!userMemory[userId]) {
    userMemory[userId] = [];
  }

  const lowerMsg = message.toLowerCase();

  // 🚨 Emergency detection
  if (emergencyKeywords.some(k => lowerMsg.includes(k))) {
    return "🚨 This may be a medical emergency. Please contact a doctor or nearest hospital immediately.";
  }

  // 🧬 Disease prediction
  const prediction = predictDisease(message);

  // 💾 Save message
  userMemory[userId].push({ role: "user", content: message });

  const history = userMemory[userId].slice(-MAX_HISTORY);

  // 🧠 SYSTEM PROMPT
  const systemPrompt = {
    role: "system",
    content: `
You are a safe health assistant.
- Do NOT give prescriptions.
- Provide only awareness and precautions.
- Always recommend consulting a doctor.
- Keep answers simple.
`
  };

  // 🧾 Smart prompt
  const userPrompt =
    prediction.disease !== "Unknown"
      ? `User symptoms: ${message}.
Possible condition: ${prediction.disease}.
Explain causes and precautions simply.`
      : message;

  // 🤖 Try AI first
  const replyFromAI = await groqAI([
    systemPrompt,
    ...history,
    { role: "user", content: userPrompt }
  ]);

  let reply = replyFromAI;

  // 🔄 FALLBACK → LOCAL INTELLIGENCE
  if (!reply) {
    const localReply = buildLocalResponse(prediction);

    reply =
      localReply ||
      "I couldn't fully understand. Please describe your symptoms clearly.";
  }

  // 💾 Save response
  userMemory[userId].push({ role: "assistant", content: reply });

  // ✂️ Limit memory
  if (userMemory[userId].length > 20) {
    userMemory[userId] = userMemory[userId].slice(-10);
  }

  return `${reply}\n\n⚠️ This is not medical advice.`;
}

// 🌐 API CONTROLLER
exports.chatWithAI = async (req, res) => {
  try {
    const message = req.body?.message;
    const userId = req.body?.userId || "default";

    if (!message || typeof message !== "string") {
      return res.status(400).json({ message: "Valid message required" });
    }

    const reply = await getAIReply(message.trim(), userId);
    const prediction = predictDisease(message);

    return res.json({
      reply,
      prediction,
      timestamp: new Date()
    });

  } catch (error) {
    console.error("chatWithAI error:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports.getAIReply = getAIReply;