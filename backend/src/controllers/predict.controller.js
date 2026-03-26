const { predictDisease } = require("../utils/symptoms");

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