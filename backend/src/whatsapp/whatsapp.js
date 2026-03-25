const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { getAIReply } = require('../controllers/chat.controller');

// 🧠 Message Queue
const messageQueue = [];
let isProcessing = false;

// 🔒 Prevent multiple initializations
let isClientStarted = false;

// 🚀 Create WhatsApp Client
const client = new Client({
    authStrategy: new LocalAuth({
        clientId: "health-bot"
    }),
    puppeteer: {
        headless: true,
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-gpu"
        ],
        timeout: 60000
    }
});

// 🔥 Prevent max listener warnings
client.setMaxListeners(20);

// 🔁 SAFE INITIALIZATION
const startClient = async () => {
    if (isClientStarted) {
        console.log("⚠️ WhatsApp already running");
        return;
    }

    try {
        isClientStarted = true;
        console.log("🚀 Initializing WhatsApp...");
        await client.initialize();
    } catch (err) {
        console.error("❌ Init error:", err.message);
        isClientStarted = false;
    }
};

// 📱 QR CODE
client.on('qr', qr => {
    console.log("📱 Scan QR Code:");
    qrcode.generate(qr, { small: true });
});

// ✅ READY
client.on('ready', () => {
    console.log("✅ WhatsApp Bot Ready");
});

// ❌ AUTH FAILURE
client.on('auth_failure', msg => {
    console.error("❌ Auth failure:", msg);
});

// 🔄 STATE CHANGE (DEBUG)
client.on('change_state', state => {
    console.log("🔄 State:", state);
});

// ❌ DISCONNECTED (NO AUTO RESTART — SAFE)
client.on('disconnected', reason => {
    console.log("❌ Disconnected:", reason);
    console.log("⚠️ Please restart server manually");
});

// 🧠 PROCESS QUEUE
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
            await msg.reply("⚠️ Error processing request.");
        } catch {}
    }

    isProcessing = false;

    setTimeout(processQueue, 300);
}

// 📩 MESSAGE HANDLER
client.on('message', async msg => {
    try {
        if (!msg.body) return;

        // ❌ Ignore group chats
        if (msg.from.includes("@g.us")) return;

        // ❌ Ignore status messages
        if (msg.from === "status@broadcast") return;

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

// 🚀 START CLIENT
startClient();

module.exports = client;