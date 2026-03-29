const { predictDisease } = require("../utils/symptoms");
const axios = require("axios");

exports.predict = (req, res) => {
    const { symptoms } = req.body;

    if (typeof symptoms !== "string" || !symptoms.trim()) {
        return res.status(400).json({ message: "symptoms is required" });
    }

    const results = predictDisease(symptoms);

    return res.json({
        topPrediction: results,
        allPredictions: [results]
    });
};

exports.predictFromImage = async (req, res) => {
    try {
        const { imageBase64, mimeType = "image/jpeg", notes = "" } = req.body;
        const allowedMimeTypes = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);

        if (!imageBase64 || typeof imageBase64 !== "string") {
            return res.status(400).json({ message: "imageBase64 is required" });
        }

        const stripped = imageBase64.includes(",")
            ? imageBase64.split(",")[1]
            : imageBase64;

        if (!stripped || stripped.length < 100) {
            return res.status(400).json({ message: "Invalid image payload" });
        }

        if (!allowedMimeTypes.has((mimeType || "").toLowerCase())) {
            return res.status(400).json({ message: "Unsupported image format. Use JPG, PNG, or WEBP." });
        }

        if (stripped.length > 5_000_000) {
            return res.status(413).json({ message: "Image is too large. Please upload a smaller image." });
        }

        if (!process.env.GEMINI_API_KEY) {
            return res.json({
                analysis:
                    "Image received. AI image analysis is currently unavailable because GEMINI_API_KEY is not configured. Please also describe your symptoms in text for guidance.",
                guidance: [
                    "If this looks like an emergency (severe bleeding, breathing trouble, fainting), seek urgent care immediately.",
                    "For skin/rash/wound concerns, keep the area clean and avoid self-medicating without medical advice.",
                    "Use chat symptom analysis for additional context.",
                ],
                confidence: "low",
                source: "fallback",
            });
        }

        const prompt = `
You are a cautious medical triage assistant.
Analyze this medical image and provide preliminary guidance only.
Do not provide a final diagnosis.
Keep response simple and user-friendly.

Return in plain text with this format exactly:
Observation: [what is visible]
Possible concern: [1 likely concern]
Immediate guidance:
- [bullet 1]
- [bullet 2]
- [bullet 3]
Urgency: [Low/Medium/High]
Disclaimer: [short safety line]
Additional patient note: ${notes || "None"}
`;

        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
                contents: [
                    {
                        parts: [
                            { text: prompt.trim() },
                            {
                                inlineData: {
                                    mimeType,
                                    data: stripped,
                                },
                            },
                        ],
                    },
                ],
                generationConfig: { temperature: 0.2, maxOutputTokens: 350 },
            },
            { timeout: 25000 }
        );

        const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text
            || "I could not confidently analyze this image. Please consult a clinician and share your symptoms in text.";

        const urgencyMatch = text.match(/Urgency:\s*(Low|Medium|High)/i);
        const urgency = urgencyMatch
            ? urgencyMatch[1].charAt(0).toUpperCase() + urgencyMatch[1].slice(1).toLowerCase()
            : "Medium";

        res.json({
            analysis: text,
            confidence: urgency === "Low" ? "medium" : "low",
            urgency,
            source: "gemini-vision",
        });
    } catch (err) {
        res.status(500).json({
            message: "Failed to analyze image",
        });
    }
};
