const axios = require("axios");
const { predictDisease } = require("../utils/symptoms");
const { detectLanguage, translateText } = require("../utils/translator");
const mongoose = require("mongoose");

const User = require("../models/user");
const ChatMessage = require("../models/chatMessage");
const sessionManager = require('../services/sessionManager');
const emergencyService = require('../services/emergencyService');
const Prediction = require('../models/prediction');

// ─────────────────────────────────────────────
// 🔧 Constants
// ─────────────────────────────────────────────
const MAX_HISTORY = 8;
const MAX_INPUT_LENGTH = 1000;
const CHAT_HISTORY_LOAD = 10;

// ─────────────────────────────────────────────
// 🧠 In-process memory
// ─────────────────────────────────────────────
const userMemory = {};

function initMemory(userId) {
  if (!userMemory[userId]) {
    userMemory[userId] = {
      history: [],
      profile: {},
      stage: "clarify_symptoms", // New starting stage
      lastSymptoms: [],
      lastHealthMessage: null,
      dbHistoryLoaded: false,
      dbHistorySummary: "",
    };
  }
  return userMemory[userId];
}

// ─────────────────────────────────────────────
// 🚨 Emergency
// ─────────────────────────────────────────────
const EMERGENCY_KEYWORDS = ["chest pain", "breathing problem", "unconscious", "severe bleeding"];
const NEGATION_PREFIXES = ["no ", "not ", "without ", "never ", "don't have ", "do not have "];

function isEmergency(text) {
  const lower = text.toLowerCase();
  return EMERGENCY_KEYWORDS.some((keyword) => {
    const idx = lower.indexOf(keyword);
    if (idx === -1) return false;
    const before = lower.slice(Math.max(0, idx - 20), idx);
    return !NEGATION_PREFIXES.some((neg) => before.endsWith(neg));
  });
}

// ─────────────────────────────────────────────
// 🤖 AI Providers
// ─────────────────────────────────────────────
async function openRouterAI(messages) {
  if (!process.env.OPENROUTER_API_KEY) return null;
  try {
    const res = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      { model: "openai/gpt-3.5-turbo", messages, temperature: 0.2, max_tokens: 400 },
      { headers: { Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`, "Content-Type": "application/json" } }
    );
    return res.data?.choices?.[0]?.message?.content || null;
  } catch (err) { console.warn("OpenRouter Error:", err.message); return null; }
}

async function groqAI(messages) {
  if (!process.env.GROQ_API_KEY) return null;
  try {
    const res = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      { model: "llama3-8b-8192", messages, temperature: 0.2, max_tokens: 400 },
      { headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}`, "Content-Type": "application/json" } }
    );
    return res.data?.choices?.[0]?.message?.content || null;
  } catch (err) { console.warn("Groq Error:", err.message); return null; }
}

async function geminiAI(prompt) {
  if (!process.env.GEMINI_API_KEY) return null;
  try {
    const res = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
      { contents: [{ parts: [{ text: prompt }] }] }
    );
    return res.data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
  } catch (err) { console.warn("Gemini Error:", err.message); return null; }
}

async function hfAI(prompt) {
  if (!process.env.HF_API_KEY) return null;
  try {
    const res = await axios.post(
      "https://api-inference.huggingface.co/models/google/flan-t5-large",
      { inputs: prompt },
      { headers: { Authorization: `Bearer ${process.env.HF_API_KEY}` } }
    );
    return res.data?.[0]?.generated_text || null;
  } catch (err) { console.warn("HuggingFace Error:", err.message); return null; }
}

async function smartAI(messages) {
  const flat = messages.map((m) => `${m.role}: ${m.content}`).join("\n");
  const providers = [
    { name: "OpenRouter", fn: () => openRouterAI(messages) },
    { name: "Groq", fn: () => groqAI(messages) },
    { name: "Gemini", fn: () => geminiAI(flat) },
    { name: "HuggingFace", fn: () => hfAI(flat) },
  ];
  for (const p of providers) {
    const reply = await p.fn();
    if (reply) { console.log(`✅ AI: ${p.name}`); return reply; }
    console.warn(`⚠️ ${p.name} failed`);
  }
  return null;
}

// ─────────────────────────────────────────────
// 📜 Load past chat history from DB
// ─────────────────────────────────────────────
async function loadDbChatHistory(dbUserId) {
  if (!dbUserId) return { messages: [], summary: "" };
  try {
    const past = await ChatMessage.find({ user: dbUserId })
      .sort({ createdAt: -1 })
      .limit(CHAT_HISTORY_LOAD)
      .lean();

    if (!past.length) return { messages: [], summary: "" };

    past.reverse();

    const messages = past.map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.content,
    }));

    const lines = past.map(
      (m) => `[${new Date(m.createdAt).toLocaleDateString()}] ${m.role === "assistant" ? "Bot" : "Patient"}: ${m.content}`
    );

    return { messages, summary: lines.join("\n") };
  } catch (err) {
    console.warn("loadDbChatHistory error:", err.message);
    return { messages: [], summary: "" };
  }
}

// ─────────────────────────────────────────────
// 🧠 Helpers
// ─────────────────────────────────────────────
function detectIntent(message) {
  const msg = message.toLowerCase();
  if (["hi", "hello", "hey", "hii", "good morning"].some((g) => msg.includes(g)) && message.length < 20) return "greeting";
  if (["how are you", "what's up", "who are you"].some((c) => msg.includes(c)) && message.length < 30) return "casual";
  return "medical";
}

async function extractSymptoms(message) {
  try {
    const res = await openRouterAI([
      { role: "system", content: "Extract only medical symptoms from the text as a comma-separated list. Return ONLY the symptoms, nothing else." },
      { role: "user", content: message },
    ]);
    if (!res) return [];
    return res.toLowerCase().split(",").map((s) => s.trim()).filter(Boolean);
  } catch { return []; }
}

const SEVERE_WORDS = ["severe", "unbearable", "continuous", "blood", "vomiting", "high fever", "chest pain"];
function detectSeverity(message) {
  return SEVERE_WORDS.some((w) => message.toLowerCase().includes(w)) ? "High" : "Low";
}

function parseAndStripRisk(reply) {
  const riskMatch = reply.match(/\n*\s*Risk:\s*(High|Medium|Low)\s*$/i);
  const parsedRisk = riskMatch ? riskMatch[1].charAt(0).toUpperCase() + riskMatch[1].slice(1).toLowerCase() : null;
  const cleanReply = riskMatch ? reply.slice(0, riskMatch.index).trimEnd() : reply;
  return { cleanReply, parsedRisk };
}

function buildProfileText(userDoc) {
  const lines = [];
  const age = userDoc?.age;
  const gender = userDoc?.gender;
  const conditions = userDoc?.existingMedicalConditions?.join(", ");
  const allergies = userDoc?.allergies?.join(", ");
  const medications = userDoc?.medications?.join(", ");
  if (age) lines.push(`Age: ${age}`);
  if (gender) lines.push(`Gender: ${gender}`);
  if (conditions && conditions.toLowerCase() !== "none") lines.push(`Existing conditions: ${conditions}`);
  if (allergies && allergies.toLowerCase() !== "none") lines.push(`Allergies: ${allergies}`);
  if (medications && medications.toLowerCase() !== "none") lines.push(`Current medications: ${medications}`);
  return lines.length ? lines.join("\n") : "Not provided.";
}

async function resolveUser(userId) {
  if (!userId || userId === "default") return { userDoc: null, dbUserId: null };
  const select = "age gender existingMedicalConditions allergies medications";
  try {
    if (mongoose.Types.ObjectId.isValid(userId)) {
      const userDoc = await User.findById(userId).select(select).lean();
      return { userDoc, dbUserId: userDoc?._id ?? null };
    } else {
      const userDoc = await User.findOne({ whatsappId: userId }).select(select).lean();
      return { userDoc, dbUserId: userDoc?._id ?? null };
    }
  } catch { return { userDoc: null, dbUserId: null }; }
}

async function persistMessages(dbUserId, userMsg, botMsg, lang) {
  if (!dbUserId) return;
  try {
    await ChatMessage.create([
      { user: dbUserId, role: "user", content: userMsg, lang: lang || "en" },
      { user: dbUserId, role: "assistant", content: botMsg, lang: lang || "en" },
    ]);
  } catch (err) { console.warn("ChatMessage save failed:", err.message); }
}

// ─────────────────────────────────────────────
// 🧠 MAIN LOGIC (4-Stage Interview)
// ─────────────────────────────────────────────
async function getAIReply(message, userId = "default", forcedLang = null) {

  if (message.length > MAX_INPUT_LENGTH) {
    return {
      reply: `⚠️ Your message is too long. Please keep it under ${MAX_INPUT_LENGTH} characters.\n\n⚠️ This is not medical advice.`,
      prediction: { disease: "None", risk: "Low", confidence: "0.00", symptomsDetected: [] },
      messageType: "error",
    };
  }

  const intent = detectIntent(message);
  if (intent === "greeting") {
    return {
      reply: "Hi! I'm your Health AI assistant 🤖\nI'll ask you a few questions to understand your symptoms better.\n\nLet's get started. Please describe your main problem in your own words.",
      prediction: { disease: "None", risk: "Low", confidence: "0.00", symptomsDetected: [] },
      messageType: "greeting",
    };
  }
  if (intent === "casual") {
    return {
      reply: "😊 I'm here to help with health-related questions. Tell me what's bothering you.",
      prediction: { disease: "None", risk: "Low", confidence: "0.00", symptomsDetected: [] },
      messageType: "casual",
    };
  }

  const mem = initMemory(userId);
  const { userDoc, dbUserId } = await resolveUser(userId);
  const lang = forcedLang || (await detectLanguage(message));
  const msgEn = lang === "en" ? message : await translateText(message, "en");
  const lower = msgEn.toLowerCase();

  // Emergency Check First
  const emergencyResult = emergencyService.evaluateEmergency(msgEn);
  if (emergencyResult.isEmergency || isEmergency(lower)) {
    const eCat = emergencyResult.category || "Critical Condition";
    const eSev = emergencyResult.severityScore || 90;
    const eInst = emergencyResult.instructions?.join('\n- ') || "Seek immediate medical attention.";
    
    let msg = `⚠️ **EMERGENCY DETECTED: ${eCat}**\n\nWhat you should do immediately:\n- ${eInst}\n\n🚨 Please go to the nearest hospital immediately or CALL 108.`;
    if (lang !== "en") msg = await translateText(msg, lang);
    return {
      reply: `${msg}\n\n⚠️ This is not medical advice.`,
      prediction: { disease: "Emergency", risk: "Critical", confidence: 1.0, symptomsDetected: [] },
      messageType: "emergency",
    };
  }

  if (!mem.dbHistoryLoaded && dbUserId) {
    const { messages: dbMessages, summary: dbSummary } = await loadDbChatHistory(dbUserId);
    mem.history = [...dbMessages.slice(-MAX_HISTORY), ...mem.history].slice(-MAX_HISTORY);
    mem.dbHistorySummary = dbSummary;
    mem.dbHistoryLoaded = true;
  }

  const profileText = buildProfileText(userDoc);
  const symptoms = await extractSymptoms(msgEn);

  // ─────────────────────────────────────────────
  // STAGE 1: CLARIFY SYMPTOMS (Ask related symptoms)
  // ─────────────────────────────────────────────
  if (mem.stage === "clarify_symptoms") {
    mem.lastHealthMessage = msgEn;
    mem.lastSymptoms = symptoms;

    const prompt = `You are a smart, empathetic Health AI assistant. 
Patient profile: ${profileText}
Patient's main problem: "${msgEn}"

Your goal is to identify related symptoms to narrow down possibilities.
Respond EXACTLY in this format:
I'm sorry to hear that. I'll need a bit more information.
❓ Do you also have any of these?
• [Related symptom 1]
• [Related symptom 2]
• [Related symptom 3]
• [Related symptom 4]

(Only ask about symptoms logically related to their complaint. Do not mention diseases.)
Risk: Low`;

    let reply = await smartAI([{ role: "system", content: prompt }]);
    if (!reply) {
      reply = `I'm sorry to hear that. I'll need a bit more information.\n❓ Do you also have any of these?\n• Fever or chills\n• Body ache\n• Nausea or vomiting\n• Fatigue\n\nRisk: Low`;
    }

    const { cleanReply, parsedRisk } = parseAndStripRisk(reply);
    reply = cleanReply;

    if (lang !== "en") reply = await translateText(reply, lang);

    mem.history.push({ role: "user", content: msgEn });
    mem.history.push({ role: "assistant", content: reply });
    mem.stage = "dig_deeper";

    const finalReply = `${reply}`;
    await persistMessages(dbUserId, message, finalReply, lang);

    return {
      reply: finalReply,
      prediction: { disease: "None", risk: parsedRisk || "Low", confidence: "0.00", symptomsDetected: symptoms },
      messageType: "clarify",
    };
  }

  // ─────────────────────────────────────────────
  // STAGE 2: DIG DEEPER (Ask severity, timeline, context)
  // ─────────────────────────────────────────────
  if (mem.stage === "dig_deeper") {
    const combinedSymptoms = [...mem.lastSymptoms, ...symptoms];
    mem.lastSymptoms = [...new Set(combinedSymptoms)]; // merge and deduplicate

    const prompt = `You are a smart Health AI.
Patient's initial complaint: "${mem.lastHealthMessage}"
Patient's response to related symptoms: "${msgEn}"

Your goal is to assess severity, timeline, and risk factors (like travel or exposures).
Respond EXACTLY in this format:
Thanks! A few more questions.
🗓️ When did these symptoms start?
🌡️ [Specific question about severity, e.g., What was the highest fever? / Rate pain 1 to 10]
🛡️ [Context question, e.g., Any recent travel? / Any mosquito bites?]

(Ask exactly 3 numbered or emoji bullet questions).
Risk: Low`;

    let reply = await smartAI([
      ...mem.history.slice(-4),
      { role: "system", content: prompt },
      { role: "user", content: msgEn }
    ]);

    if (!reply) {
      reply = `Thanks! A few more questions.\n🗓️ When did these symptoms start?\n🌡️ How severe are the symptoms on a scale of 1 to 10?\n🛡️ Have you traveled recently or been around anyone sick?\n\nRisk: Low`;
    }

    const { cleanReply, parsedRisk } = parseAndStripRisk(reply);
    reply = cleanReply;

    if (lang !== "en") reply = await translateText(reply, lang);

    mem.history.push({ role: "user", content: msgEn });
    mem.history.push({ role: "assistant", content: reply });
    mem.stage = "prediction";

    const finalReply = `${reply}`;
    await persistMessages(dbUserId, message, finalReply, lang);

    return {
      reply: finalReply,
      prediction: { disease: "None", risk: parsedRisk || "Low", confidence: "0.00", symptomsDetected: mem.lastSymptoms },
      messageType: "deep_dive",
    };
  }

  // ─────────────────────────────────────────────
  // STAGE 3: PREDICTION (Assess & Explain & Advise)
  // ─────────────────────────────────────────────
  if (mem.stage === "prediction") {
    const finalSymptoms = mem.lastSymptoms.length ? mem.lastSymptoms.join(" ") : mem.lastHealthMessage;
    let prediction = null;
    
    try {
        prediction = predictDisease(finalSymptoms + " " + msgEn);
    } catch { prediction = null; }

    const diseaseText = prediction ? `${prediction.disease} (confidence: ${prediction.confidence})` : "Unknown condition";

    const prompt = `You are a highly advanced medical AI. 
Patient's full context:
Initial: "${mem.lastHealthMessage}"
Deep dive answers: "${msgEn}"
Algorithm Prediction: ${diseaseText}

Provide a structured, empathetic summary and advice EXACTLY matching this format (use markdown formatting):

Thank you! Here's what I understood:
• [Symptom 1]
• [Symptom 2]
• [Context detail]
Is this correct?

Based on your symptoms, this could be related to:
• **[Top Condition]** (High possibility - ${prediction ? Math.round(parseFloat(prediction.confidence)*100) : 80}%)
• **[Alternative 1]** (Possible)
• **[Alternative 2]** (Consider)

**Why?**
• [1 sentence explaining why the top condition matches the symptoms/context].
• [1 sentence explaining why it might be the alternative].

**I recommend:**
✅ [Actionable advice 1, e.g., Rest and stay hydrated]
✅ [Actionable advice 2]
⚠️ If symptoms worsen, consult a doctor immediately.

Risk: ${prediction ? (parseFloat(prediction.confidence) > 0.7 ? 'High' : 'Medium') : 'Low'}`;

    let reply = await smartAI([
      ...mem.history.slice(-6),
      { role: "system", content: prompt },
      { role: "user", content: msgEn }
    ]);

    if (!reply) {
      reply = `Thank you! Based on your symptoms, this could be related to:\n• **${prediction?.disease || 'Viral Infection'}** (High possibility)\n\n**I recommend:**\n✅ Rest and stay hydrated\n⚠️ If symptoms worsen, consult a doctor immediately.\n\nRisk: Low`;
    }

    const { cleanReply, parsedRisk } = parseAndStripRisk(reply);
    reply = cleanReply;

    if (lang !== "en") reply = await translateText(reply, lang);

    // Save prediction in DB
    try {
       const dbPred = new Prediction({
           userId: dbUserId !== "default" ? dbUserId : null,
           symptoms: mem.lastSymptoms,
           topDisease: prediction?.disease || "Unknown",
           confidence: prediction?.confidence || 0,
           riskLevel: parsedRisk || "Low",
           matchedSymptoms: prediction?.symptomsDetected || [],
           topFive: prediction?.topFive || []
       });
       await dbPred.save();
    } catch (e) { console.error('Save Prediction err:', e); }

    mem.history.push({ role: "user", content: msgEn });
    mem.history.push({ role: "assistant", content: reply });
    
    // Reset state for next complaint
    mem.stage = "clarify_symptoms";
    mem.lastSymptoms = [];
    mem.lastHealthMessage = null;

    const finalReply = `${reply}\n\n*I am an AI, not a doctor. This is not a diagnosis.*`;
    await persistMessages(dbUserId, message, finalReply, lang);

    const predPrediction = prediction
      ? { ...prediction, risk: parsedRisk || "Low" }
      : { disease: "Unknown", risk: parsedRisk || "Low", confidence: "0.00", symptomsDetected: [] };

    return {
      reply: finalReply,
      prediction: predPrediction,
      messageType: "prediction",
    };
  }

  // Fallback
  return {
    reply: "I'm sorry, I encountered an error understanding your request. Please try again.",
    prediction: { disease: "Unknown", risk: "Low", confidence: "0.00", symptomsDetected: [] },
    messageType: "error"
  };
}

// ─────────────────────────────────────────────
// 🌐 Express route handler
// ─────────────────────────────────────────────
async function chatWithAI(req, res) {
  try {
    const { message, lang, type, answers, context } = req.body;

    let resolvedMessage = message;
    if (type === "analysis" && answers && typeof answers === "object") {
      const parts = [];
      if (answers.symptom) parts.push(`Main symptom: ${answers.symptom}`);
      if (answers.duration) parts.push(`Duration: ${answers.duration}`);
      if (answers.severity) parts.push(`Severity: ${answers.severity}`);
      if (answers.location) parts.push(`Location: ${answers.location}`);
      if (answers.extra && answers.extra.toLowerCase() !== "none") parts.push(`Other symptoms: ${answers.extra}`);
      resolvedMessage = parts.join(". ") || message;
    } else if (type === "followup" && !resolvedMessage && context) {
      resolvedMessage = message;
    }

    if (!resolvedMessage || typeof resolvedMessage !== "string") {
      return res.status(400).json({ message: "Message is required and must be a string." });
    }
    const userId = req.user?.id || "default";
    const { reply, prediction, messageType } = await getAIReply(resolvedMessage.trim(), userId, lang);
    return res.json({ reply, prediction, messageType, timestamp: new Date() });
  } catch (err) {
    console.error("chatWithAI error:", err);
    return res.status(500).json({ message: "Internal server error." });
  }
}

module.exports = { chatWithAI, getAIReply };
