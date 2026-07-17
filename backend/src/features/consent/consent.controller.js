/**
 * @file consent.controller.js
 * @description Express handlers for the Consent Manager module.
 *              Implements grant, revoke, and status-check flows per
 *              DPDP Act compliance requirements.
 *
 *              Every action creates an immutable log entry — consents are
 *              never deleted or updated in-place.
 */

const ConsentLog = require("./consent.model");

/**
 * POST /api/consent/grant
 * Records a new consent grant for a specific data-processing purpose.
 *
 * @param {object} req.body - { purpose: "health_data_storage" }
 * @param {object} req.user - Populated by auth middleware (contains .id)
 */
exports.grantConsent = async (req, res) => {
    try {
        const { purpose } = req.body;

        if (!purpose) {
            return res.status(400).json({ message: "Purpose is required." });
        }

        const consentLog = await ConsentLog.create({
            userId: req.user.id,
            purpose,
            status: "GRANTED",
            ipAddress: req.ip || req.connection?.remoteAddress || "unknown",
            userAgent: req.headers["user-agent"] || "unknown"
        });

        return res.status(201).json({
            message: `Consent granted for: ${purpose}`,
            consent: {
                id: consentLog._id,
                purpose: consentLog.purpose,
                status: consentLog.status,
                timestamp: consentLog.timestamp
            }
        });
    } catch (err) {
        // Handle Mongoose validation errors (e.g., invalid purpose enum)
        if (err.name === "ValidationError") {
            return res.status(400).json({
                message: "Invalid purpose. Allowed values: health_data_storage, ai_symptom_analysis, share_with_doctor, government_scheme_check, research_anonymized, abdm_health_records, whatsapp_notifications."
            });
        }
        console.error("Consent grant error:", err.message);
        return res.status(500).json({ message: "Internal server error." });
    }
};

/**
 * POST /api/consent/revoke
 * Records a consent revocation for a specific data-processing purpose.
 *
 * @param {object} req.body - { purpose: "health_data_storage" }
 * @param {object} req.user - Populated by auth middleware (contains .id)
 */
exports.revokeConsent = async (req, res) => {
    try {
        const { purpose } = req.body;

        if (!purpose) {
            return res.status(400).json({ message: "Purpose is required." });
        }

        // Check if there's an active consent to revoke
        const latestConsent = await ConsentLog.findOne({
            userId: req.user.id,
            purpose
        }).sort({ timestamp: -1 }).lean();

        if (!latestConsent || latestConsent.status === "REVOKED") {
            return res.status(400).json({
                message: `No active consent found for purpose: ${purpose}. Nothing to revoke.`
            });
        }

        // Create a new REVOKED log entry (immutable audit trail)
        const consentLog = await ConsentLog.create({
            userId: req.user.id,
            purpose,
            status: "REVOKED",
            ipAddress: req.ip || req.connection?.remoteAddress || "unknown",
            userAgent: req.headers["user-agent"] || "unknown"
        });

        return res.status(200).json({
            message: `Consent revoked for: ${purpose}`,
            consent: {
                id: consentLog._id,
                purpose: consentLog.purpose,
                status: consentLog.status,
                timestamp: consentLog.timestamp
            }
        });
    } catch (err) {
        if (err.name === "ValidationError") {
            return res.status(400).json({ message: "Invalid purpose value." });
        }
        console.error("Consent revoke error:", err.message);
        return res.status(500).json({ message: "Internal server error." });
    }
};

/**
 * GET /api/consent/status
 * Returns the current consent status for all purposes (or a specific one).
 *
 * @param {string} [req.query.purpose] - Optional filter by purpose.
 * @param {object} req.user - Populated by auth middleware (contains .id)
 */
exports.getConsentStatus = async (req, res) => {
    try {
        const { purpose } = req.query;
        const userId = req.user.id;

        // If a specific purpose is requested, return just that
        if (purpose) {
            const latest = await ConsentLog.findOne({ userId, purpose })
                .sort({ timestamp: -1 })
                .lean();

            return res.status(200).json({
                purpose,
                status: latest ? latest.status : "NOT_SET",
                lastUpdated: latest ? latest.timestamp : null
            });
        }

        // Otherwise, return the latest status for ALL purposes
        const allPurposes = [
            "health_data_storage",
            "ai_symptom_analysis",
            "share_with_doctor",
            "government_scheme_check",
            "research_anonymized",
            "abdm_health_records",
            "whatsapp_notifications"
        ];

        const statuses = await Promise.all(
            allPurposes.map(async (p) => {
                const latest = await ConsentLog.findOne({ userId, purpose: p })
                    .sort({ timestamp: -1 })
                    .lean();
                return {
                    purpose: p,
                    status: latest ? latest.status : "NOT_SET",
                    lastUpdated: latest ? latest.timestamp : null
                };
            })
        );

        return res.status(200).json({ consents: statuses });
    } catch (err) {
        console.error("Consent status error:", err.message);
        return res.status(500).json({ message: "Internal server error." });
    }
};
