const axios = require("axios");
const { predictDisease } = require("../utils/symptoms");
const { detectLanguage, translateText } = require("../utils/translator");
const mongoose = require("mongoose");

const User = require("../models/user");
const ChatMessage = require("../models/chatMessage");

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

  // If a user identity is provided, try to fetch their health profile.
  // - For web chat: identityId is a JWT user id (Mongo ObjectId string)
  // - For WhatsApp: identityId is `msg.from` which can be linked to a user
  let userDoc = null;
  let dbUserId = null;
  if (userId && userId !== "default") {
    try {
      const select = "age gender existingMedicalConditions allergies medications";
      if (mongoose.Types.ObjectId.isValid(userId)) {
        userDoc = await User.findById(userId).select(select).lean();
        dbUserId = userDoc?._id || userId;
      } else {
        userDoc = await User.findOne({ whatsappId: userId }).select(select).lean();
        dbUserId = userDoc?._id || null;
      }
    } catch (err) {
      // Never fail chat due to profile lookup issues.
      userDoc = null;
      dbUserId = null;
    }
  }

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
    return {
      reply: `${msg}\n\n⚠️ This is not medical advice.`,
      prediction: {
        disease: "Unknown",
        risk: "High",
        confidence: "0.00",
        symptomsDetected: [],
      },
    };
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
  let prediction = null;
  try {
    prediction = predictDisease(symptoms.join(" ") || msgEn);
  } catch {
    prediction = null;
  }

  const predictions = prediction
    ? [
        {
          disease: prediction.disease,
          score: Number(prediction.confidence) || 0,
          risk: prediction.risk,
        },
      ]
    : [{ disease: "Unknown", score: 0, risk: "Low" }];

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

  const profileLines = [];
  if (userDoc) {
    if (userDoc.age !== undefined && userDoc.age !== null) {
      profileLines.push(`Age: ${userDoc.age}`);
    }
    if (userDoc.gender) {
      profileLines.push(`Gender: ${userDoc.gender}`);
    }
    if (Array.isArray(userDoc.existingMedicalConditions) && userDoc.existingMedicalConditions.length) {
      profileLines.push(
        `Existing medical conditions: ${userDoc.existingMedicalConditions.join(", ")}`
      );
    }
    if (Array.isArray(userDoc.allergies) && userDoc.allergies.length) {
      profileLines.push(`Allergies: ${userDoc.allergies.join(", ")}`);
    }
    if (Array.isArray(userDoc.medications) && userDoc.medications.length) {
      profileLines.push(`Medications (if provided): ${userDoc.medications.join(", ")}`);
    }
  }

  const profileText = profileLines.length ? profileLines.join("\n") : "Not provided.";

  const prompt = `
Patient profile (may be incomplete):
${profileText}

User symptoms: ${symptoms.join(", ") || msgEn}

Possible conditions:
${diseaseText}

Severity: ${severity}

Response structure (plain text):
Most likely condition:
Other possible causes:
Precautions:
When to seek urgent care:
Note:

Rules:
- Use simple, clear language.
- Do NOT claim diagnosis.
- Do NOT prescribe medications or dosages.
- If allergies are provided, include a safety caution about allergy triggers.
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
    const top = predictions[0]?.disease || "Unknown";
    const others = predictions.slice(1).map(p => p.disease).filter(Boolean);

    const profileSafetyLines = [];
    if (userDoc) {
      if (userDoc.age !== undefined && userDoc.age !== null) {
        profileSafetyLines.push(`- Age: ${userDoc.age}`);
      }
      if (userDoc.gender) {
        profileSafetyLines.push(`- Gender: ${userDoc.gender}`);
      }
      if (
        Array.isArray(userDoc.existingMedicalConditions) &&
        userDoc.existingMedicalConditions.length
      ) {
        profileSafetyLines.push(
          `- Existing conditions: ${userDoc.existingMedicalConditions.join(", ")}`
        );
      }
      if (Array.isArray(userDoc.allergies) && userDoc.allergies.length) {
        profileSafetyLines.push(
          `- Allergies: avoid allergy triggers (${userDoc.allergies.join(", ")})`
        );
      }
    }

    const profileSafetyText = profileSafetyLines.length
      ? `\n\nProfile context (safety notes):\n${profileSafetyLines.join("\n")}`
      : "";

    reply = `Most likely condition: ${top}
Other possible causes: ${
  others.length ? others.join(", ") : "Not enough information"
}
Precautions:
- Stay hydrated
- Rest
- Monitor symptoms
When to seek urgent care:
- If symptoms worsen, become severe, or emergency signs appear${profileSafetyText}`;
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

  const finalReply = `${reply}\n\n⚠️ This is not medical advice.`;

  // Persist chat history for authenticated users (and WhatsApp-linked users).
  if (dbUserId) {
    try {
      await ChatMessage.create({
        user: dbUserId,
        role: "user",
        content: message,
        lang: lang || "en",
      });
      await ChatMessage.create({
        user: dbUserId,
        role: "assistant",
        content: finalReply,
        lang: lang || "en",
      });
    } catch (err) {
      // History is optional; never break chat due to persistence errors.
    }
  }

  return {
    reply: finalReply,
    prediction:
      prediction || {
        disease: "Unknown",
        risk: "Low",
        confidence: "0.00",
        symptomsDetected: [],
      },
  };
}
// 🌐 API
exports.chatWithAI = async (req, res) => {
  try {
    const { message, lang } = req.body;

    if (!message) {
      return res.status(400).json({ message: "Message required" });
    }

    const userId = req.user?.id || "default";
    const { reply, prediction } = await getAIReply(message, userId, lang);

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