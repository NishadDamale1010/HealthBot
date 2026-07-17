/**
 * @file consent.model.js
 * @description Mongoose schema for Consent Logs, ensuring DPDP Act (Digital Personal
 *              Data Protection Act, 2023) compliance for HealthBot.
 *
 *              Every consent grant/revocation is stored as an immutable log entry,
 *              creating a full audit trail. This aligns with DPDP requirements for
 *              demonstrable consent records.
 *
 * @see https://www.meity.gov.in/data-protection-framework
 */

const mongoose = require("mongoose");

const consentSchema = new mongoose.Schema({
    /** Reference to the user granting/revoking consent */
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },

    /**
     * Purpose of data processing — must be specific and clearly stated per DPDP.
     * Examples: "health_data_storage", "ai_symptom_analysis", "share_with_doctor",
     *           "government_scheme_check", "research_anonymized"
     */
    purpose: {
        type: String,
        required: true,
        trim: true,
        enum: [
            "health_data_storage",
            "ai_symptom_analysis",
            "share_with_doctor",
            "government_scheme_check",
            "research_anonymized",
            "abdm_health_records",
            "whatsapp_notifications"
        ]
    },

    /** Current consent status */
    status: {
        type: String,
        enum: ["GRANTED", "REVOKED"],
        required: true
    },

    /** IP address of the requester at the time of consent action (for audit) */
    ipAddress: {
        type: String,
        default: "unknown"
    },

    /** User-agent string for additional audit context */
    userAgent: {
        type: String,
        default: "unknown"
    },

    /** Timestamp of this consent action (auto-set) */
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    }
}, {
    timestamps: false // We use our own 'timestamp' field for immutable log semantics
});

// Compound index for efficient lookups: "latest consent for user + purpose"
consentSchema.index({ userId: 1, purpose: 1, timestamp: -1 });

module.exports = mongoose.model("ConsentLog", consentSchema);
