const { predictDisease, predictDiseaseEnhanced } = require("../utils/symptoms");
const mlClient = require('../services/mlClient');

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
    return res.json({
        message: "Image received. Preliminary AI image detection is in beta and should be clinically verified.",
        placeholder: true,
        confidence: null,
    });
};

exports.predictEnhanced = async (req, res) => {
    try {
        const { symptoms } = req.body;
        if (!symptoms) return res.status(400).json({ success: false, message: "Symptoms required" });
        
        let prediction = null;
        if (await mlClient.isAvailable()) {
            prediction = await mlClient.predictFromText(Array.isArray(symptoms) ? symptoms.join(" ") : symptoms);
        }
        
        if (!prediction) {
            const fallback = Array.isArray(symptoms) ? symptoms.join(" ") : symptoms;
            const top5 = predictDiseaseEnhanced(fallback);
            prediction = {
                topDisease: top5[0]?.disease || "Unknown",
                confidence: top5[0]?.confidence || 0,
                topFive: top5,
                riskLevel: top5[0]?.riskLevel || "Low"
            };
        }
        
        res.status(200).json({ success: true, data: prediction });
    } catch (err) {
        console.error("Predict enhanced error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
