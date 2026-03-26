const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const { getAIReply } = require("../controllers/chat.controller");

// 🌡️ Seasonal Alert utils
const { getSeasonalData, formatAlert } = require("../utils/getSeasonalData");

// 🧠 Queue system
const messageQueue = [];
let isProcessing = false;

// 🚀 WhatsApp Client (FIXED CONFIG)
const client = new Client({
    authStrategy: new LocalAuth({
        clientId: "health-bot",
        dataPath: "./.wwebjs_auth" // ✅ ensures session reuse
    }),
    puppeteer: {
        headless: true,
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-gpu",
            "--single-process" // 🔥 prevents multiple browser issue
        ],
        timeout: 60000
    }
});

// ⚠️ Avoid memory warnings
client.setMaxListeners(20);

// 🔒 Prevent multiple initialization
let isInitializing = false;

// 🚀 SAFE START FUNCTION
const startClient = async () => {
    if (isInitializing) {
        console.log("⚠️ WhatsApp already initializing...");
        return;
    }

    // If already authenticated
    if (client.info) {
        console.log("⚠️ WhatsApp already running (session active)");
        return;
    }

    try {
        isInitializing = true;
        console.log("🚀 Starting WhatsApp...");
        await client.initialize();
    } catch (err) {
        console.error("❌ Init error:", err.message);
    } finally {
        isInitializing = false;
    }
};

// 📱 QR Code (only first time)
client.on("qr", qr => {
    console.log("📱 Scan QR (only first time login)");
    qrcode.generate(qr, { small: true });
});

// ✅ AUTHENTICATED
client.on("authenticated", () => {
    console.log("✅ Authenticated successfully");
});

// ✅ READY
client.on("ready", () => {
    console.log("✅ WhatsApp Bot Ready (Session Active)");
});

// ❌ AUTH FAIL
client.on("auth_failure", msg => {
    console.error("❌ Auth failure:", msg);
});

// 🔄 STATE LOG
client.on("change_state", state => {
    console.log("🔄 State:", state);
});

// ❌ DISCONNECT
client.on("disconnected", reason => {
    console.log("❌ Disconnected:", reason);
    console.log("⚠️ Restart server to reconnect");
});

// 🧠 PROCESS QUEUE (ANTI-SPAM)
async function processQueue() {
    if (isProcessing || messageQueue.length === 0) return;

    isProcessing = true;

    const { msg } = messageQueue.shift();

    try {
        const reply = await getAIReply(msg.body, msg.from);
        await msg.reply(reply);
    } catch (err) {
        console.error("❌ Queue error:", err.message);

        try {
            await msg.reply("⚠️ Sorry, something went wrong. Please try again.");
        } catch { }
    }

    isProcessing = false;

    setTimeout(processQueue, 300);
}

// 📩 MESSAGE HANDLER
client.on("message", async msg => {
    try {
        if (!msg.body) return;

        // ❌ Ignore groups
        if (msg.from.includes("@g.us")) return;

        // ❌ Ignore status
        if (msg.from === "status@broadcast") return;

        const text = msg.body.toLowerCase().trim();

        // 🌡️ Seasonal Alert Command
        if (
            text.includes("alert") ||
            text.includes("season") ||
            text.includes("disease")
        ) {
            const data = getSeasonalData(19.07, 72.87); // Mumbai coords
            const reply = formatAlert(data);

            await msg.reply(reply);
            return;
        }

        // 🧠 Default AI Chat
        messageQueue.push({ msg });
        processQueue();

    } catch (err) {
        console.error("❌ Message error:", err.message);
    }
});

// 🛑 GLOBAL ERROR HANDLING
process.on("uncaughtException", err => {
    console.error("💥 Uncaught Exception:", err.message);
});

process.on("unhandledRejection", err => {
    console.error("💥 Unhandled Rejection:", err);
});

// 🚀 START BOT
startClient();

module.exports = client;