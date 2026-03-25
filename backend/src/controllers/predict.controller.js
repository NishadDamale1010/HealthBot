const { predictDisease } = require("../utils/symptoms");

exports.predict = (req, res) => {
    const { symptoms } = req.body;
    if (typeof symptoms !== "string" || !symptoms.trim()) {
        return res.status(400).json({ message: "symptoms is required" });
    }

    const result = predictDisease(symptoms);

    return res.json(result);
};