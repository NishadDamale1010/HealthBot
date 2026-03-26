const HealthHistory = require("../models/HealthHistory");
const PDFDocument = require("pdfkit");


// ✅ SAVE HEALTH DATA
exports.saveHealthData = async (req, res) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const { symptoms, response, severity, notes } = req.body;

        if (!symptoms || !response) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const newEntry = new HealthHistory({
            userId,
            symptoms,
            response,
            severity: severity || "Low",
            notes: notes || "AI generated",
        });

        await newEntry.save();

        res.status(201).json({
            message: "Health data saved successfully",
            data: newEntry
        });

    } catch (error) {
        console.error("Save Error:", error);
        res.status(500).json({ error: "Server error while saving health data" });
    }
};


// ✅ GET USER HEALTH HISTORY
exports.getHealthHistory = async (req, res) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const history = await HealthHistory
            .find({ userId })
            .sort({ createdAt: -1 })
            .limit(50); // prevent overload

        res.json(history);

    } catch (error) {
        console.error("Fetch Error:", error);
        res.status(500).json({ error: "Failed to fetch health history" });
    }
};


// ✅ DOWNLOAD PDF REPORT (PREMIUM FORMAT)
exports.downloadReport = async (req, res) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const history = await HealthHistory.find({ userId }).sort({ createdAt: -1 });

        const doc = new PDFDocument({ margin: 40 });

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            "attachment; filename=health_report.pdf"
        );

        doc.pipe(res);

        // 🔷 TITLE
        doc
            .fontSize(22)
            .fillColor("#16a34a")
            .text("HealthBot Report", { align: "center" });

        doc.moveDown();

        // 🔷 USER INFO
        doc
            .fontSize(12)
            .fillColor("black")
            .text(`Generated on: ${new Date().toLocaleString()}`);

        doc.moveDown(2);

        if (history.length === 0) {
            doc.text("No health records found.");
        }

        // 🔷 ENTRIES
        history.forEach((item, index) => {
            doc
                .fontSize(14)
                .fillColor("#2563eb")
                .text(`Entry ${index + 1}`, { underline: true });

            doc.moveDown(0.5);

            doc
                .fontSize(11)
                .fillColor("black")
                .text(`Date: ${new Date(item.createdAt).toLocaleString()}`)
                .text(`Symptoms: ${item.symptoms}`)
                .text(`AI Response: ${item.response}`)
                .text(`Risk Level: ${item.severity}`)
                .text(`Notes: ${item.notes || "N/A"}`);

            doc.moveDown();
            doc.moveTo(40, doc.y).lineTo(550, doc.y).strokeColor("#ccc").stroke();
            doc.moveDown();
        });

        doc.end();

    } catch (error) {
        console.error("PDF Error:", error);
        res.status(500).json({ error: "Failed to generate report" });
    }
};