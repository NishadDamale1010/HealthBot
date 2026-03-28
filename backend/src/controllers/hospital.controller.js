const axios = require("axios");

exports.getNearbyHospitals = async (req, res) => {
    try {
        let { lat, lon } = req.query;

        console.log("Incoming coords:", lat, lon);

        // ✅ Validate input
        lat = parseFloat(lat);
        lon = parseFloat(lon);

        if (isNaN(lat) || isNaN(lon)) {
            return res.status(400).json({ error: "Invalid lat/lon" });
        }

        // ✅ Overpass query (IMPROVED)
        const query = `
        [out:json][timeout:25];
        (
          node["amenity"="hospital"](around:5000,${lat},${lon});
          way["amenity"="hospital"](around:5000,${lat},${lon});
          relation["amenity"="hospital"](around:5000,${lat},${lon});
        );
        out center;
        `;

        const response = await axios.post(
            "https://overpass-api.de/api/interpreter",
            query,
            {
                headers: {
                    "Content-Type": "text/plain",
                },
                timeout: 20000, // ✅ prevent hanging
            }
        );

        console.log("✅ Overpass success");

        res.json(response.data);
    } catch (err) {
        console.error("❌ BACKEND ERROR:", err.message);

        // ✅ Fallback data (VERY IMPORTANT)
        res.status(200).json({
            elements: [
                {
                    lat: 19.076,
                    lon: 72.8777,
                    tags: { name: "City Care Hospital" },
                },
                {
                    lat: 19.08,
                    lon: 72.88,
                    tags: { name: "Apollo Clinic" },
                },
                {
                    lat: 19.07,
                    lon: 72.875,
                    tags: { name: "Lifeline Hospital" },
                },
            ],
            fallback: true,
        });
    }
};