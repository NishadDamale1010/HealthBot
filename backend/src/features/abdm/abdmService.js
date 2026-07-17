/**
 * @file abdmService.js
 * @description Mock implementation of India's Ayushman Bharat Digital Mission (ABDM) V3 APIs.
 *              This service simulates the key ABDM flows — OTP generation, OTP verification,
 *              ABHA (Ayushman Bharat Health Account) creation, and patient discovery — so the
 *              HealthBot can be developed and demoed without a live ABDM sandbox.
 *
 *              In production, each function would be replaced with actual HTTPS calls to
 *              the ABDM V3 Gateway (https://healthidsbx.abdm.gov.in/api/v3/).
 *
 * @see https://sandbox.abdm.gov.in/docs/
 */

const crypto = require("crypto");

/**
 * Generates a mock OTP for the given mobile number.
 * Maps to ABDM V3 API: POST /v3/registration/aadhaar/generateOtp
 *
 * @param {string} mobile - 10-digit Indian mobile number.
 * @returns {Promise<object>} Mock response containing a transaction ID.
 */
async function generateOTP(mobile) {
    // Validate mobile format
    if (!mobile || !/^[6-9]\d{9}$/.test(mobile)) {
        return {
            success: false,
            error: "INVALID_MOBILE",
            message: "Please provide a valid 10-digit Indian mobile number."
        };
    }

    // Simulate network latency
    await _simulateLatency(200);

    const txnId = crypto.randomUUID();

    return {
        success: true,
        txnId,
        message: `OTP sent successfully to ******${mobile.slice(-4)}`,
        otpExpiresIn: 300, // 5 minutes (seconds)
        _mock: true,
        _hint: "Use OTP '123456' to verify in mock mode."
    };
}

/**
 * Verifies the OTP against a transaction ID.
 * Maps to ABDM V3 API: POST /v3/registration/aadhaar/verifyOtp
 *
 * @param {string} txnId  - Transaction ID returned by generateOTP.
 * @param {string} otp    - 6-digit OTP entered by the user.
 * @returns {Promise<object>} Mock response with verification token.
 */
async function verifyOTP(txnId, otp) {
    if (!txnId) {
        return { success: false, error: "MISSING_TXN_ID", message: "Transaction ID is required." };
    }
    if (!otp || otp.length !== 6) {
        return { success: false, error: "INVALID_OTP", message: "OTP must be 6 digits." };
    }

    await _simulateLatency(150);

    // In mock mode, accept '123456' as the valid OTP
    if (otp !== "123456") {
        return {
            success: false,
            error: "OTP_MISMATCH",
            message: "Invalid OTP. Please try again."
        };
    }

    return {
        success: true,
        txnId,
        token: `mock-auth-token-${crypto.randomBytes(16).toString("hex")}`,
        message: "OTP verified successfully.",
        _mock: true
    };
}

/**
 * Creates an ABHA (Ayushman Bharat Health Account) number for the user.
 * Maps to ABDM V3 API: POST /v3/registration/aadhaar/createHealthIdByAdhaar
 *
 * @param {object} data - Patient data for ABHA creation.
 * @param {string} data.name      - Full name of the patient.
 * @param {string} data.yearOfBirth - Year of birth (e.g., "1990").
 * @param {string} data.gender    - "M", "F", or "O".
 * @param {string} data.mobile    - 10-digit mobile number.
 * @param {string} data.txnId     - Transaction ID from OTP verification.
 * @returns {Promise<object>} Mock response with ABHA number and address.
 */
async function createABHA(data) {
    const { name, yearOfBirth, gender, mobile, txnId } = data || {};

    if (!name || !yearOfBirth || !gender || !mobile || !txnId) {
        return {
            success: false,
            error: "MISSING_FIELDS",
            message: "All fields (name, yearOfBirth, gender, mobile, txnId) are required."
        };
    }

    await _simulateLatency(300);

    // Generate a realistic-looking 14-digit ABHA number
    const abhaNumber = _generateMockABHA();
    const abhaAddress = `${name.toLowerCase().replace(/\s+/g, ".")}@abdm`;

    return {
        success: true,
        healthIdNumber: abhaNumber,       // 14-digit ABHA number
        healthId: abhaAddress,             // ABHA address (user@abdm)
        name,
        yearOfBirth,
        gender,
        mobile: `******${mobile.slice(-4)}`,
        status: "ACTIVE",
        createdAt: new Date().toISOString(),
        message: "ABHA created successfully.",
        _mock: true
    };
}

/**
 * Discovers a patient's health records across linked Health Information Providers (HIPs).
 * Maps to ABDM V3 API: POST /v3/hip/patient-discover
 *
 * @param {string} requestId - Unique request identifier for tracking.
 * @param {object} patient   - Patient identification info.
 * @param {string} patient.healthId - ABHA address of the patient.
 * @param {string} patient.name     - Patient name.
 * @param {string} [patient.yearOfBirth] - Year of birth.
 * @returns {Promise<object>} Mock discovery response with matched records.
 */
async function discoverPatient(requestId, patient) {
    if (!requestId || !patient || !patient.healthId) {
        return {
            success: false,
            error: "MISSING_PARAMS",
            message: "requestId and patient.healthId are required."
        };
    }

    await _simulateLatency(250);

    return {
        success: true,
        requestId,
        patient: {
            referenceNumber: `REF-${crypto.randomBytes(4).toString("hex").toUpperCase()}`,
            display: patient.name || "Patient",
            matchedBy: ["HEALTH_ID"],
            careContexts: [
                {
                    referenceNumber: "CC-OPD-2026-001",
                    display: "OPD Visit — General Checkup (Jan 2026)"
                },
                {
                    referenceNumber: "CC-LAB-2026-002",
                    display: "Lab Report — Blood Test (Mar 2026)"
                },
                {
                    referenceNumber: "CC-PRES-2026-003",
                    display: "Prescription — Seasonal Flu (Jul 2026)"
                }
            ]
        },
        message: "Patient discovered with 3 care contexts.",
        _mock: true
    };
}

// ──────────────────────────────── Helpers ────────────────────────────────

/** Simulate network latency for realistic demo behavior. */
function _simulateLatency(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/** Generate a mock 14-digit ABHA number (format: XX-XXXX-XXXX-XXXX). */
function _generateMockABHA() {
    const digits = () => Math.floor(1000 + Math.random() * 9000);
    return `91-${digits()}-${digits()}-${digits()}`;
}

module.exports = {
    generateOTP,
    verifyOTP,
    createABHA,
    discoverPatient
};
