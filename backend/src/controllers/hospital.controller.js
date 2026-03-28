const axios = require("axios");

exports.getNearbyHospitals = async (req, res) => {
    try {
        const { lat, lon } = req.query;

        console.log("Incoming coords:", lat, lon);

        if (!lat || !lon) {
            return res.status(400).json({ error: "Missing lat/lon" });
        }

        const query = `
      [out:json];
      node["amenity"="hospital"](around:5000,${lat},${lon});
      out;
    `;

        const response = await axios.post(
            "https://overpass-api.de/api/interpreter",
            query,
            {
                headers: {
                    "Content-Type": "text/plain",
                },
            }
        );

        console.log("Overpass response received");

        res.json(response.data);
    } catch (err) {
        console.error("❌ BACKEND ERROR:", err.message);

        res.status(500).json({
            error: "Failed to fetch hospitals",
            details: err.message,
        });
    }
};