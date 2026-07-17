/**
 * @file abdm.controller.js
 * @description Express route handlers for ABDM (Ayushman Bharat Digital Mission) mock APIs.
 *              These controllers delegate to abdmService.js and format HTTP responses.
 */

const abdmService = require("./abdmService");

/**
 * POST /api/abdm/generate-otp
 * Initiates the ABHA registration flow by sending an OTP to the user's mobile.
 *
 * @param {object} req.body - { mobile: "9876543210" }
 */
exports.generateOTP = async (req, res) => {
    try {
        const { mobile } = req.body;
        const result = await abdmService.generateOTP(mobile);

        const statusCode = result.success ? 200 : 400;
        return res.status(statusCode).json(result);
    } catch (err) {
        console.error("ABDM generateOTP error:", err.message);
        return res.status(500).json({ message: "Internal server error." });
    }
};

/**
 * POST /api/abdm/verify-otp
 * Verifies the OTP for an ongoing ABHA registration transaction.
 *
 * @param {object} req.body - { txnId: "uuid", otp: "123456" }
 */
exports.verifyOTP = async (req, res) => {
    try {
        const { txnId, otp } = req.body;
        const result = await abdmService.verifyOTP(txnId, otp);

        const statusCode = result.success ? 200 : 400;
        return res.status(statusCode).json(result);
    } catch (err) {
        console.error("ABDM verifyOTP error:", err.message);
        return res.status(500).json({ message: "Internal server error." });
    }
};

/**
 * POST /api/abdm/create-abha
 * Creates an ABHA health account after successful OTP verification.
 *
 * @param {object} req.body - { name, yearOfBirth, gender, mobile, txnId }
 */
exports.createABHA = async (req, res) => {
    try {
        const result = await abdmService.createABHA(req.body);

        const statusCode = result.success ? 201 : 400;
        return res.status(statusCode).json(result);
    } catch (err) {
        console.error("ABDM createABHA error:", err.message);
        return res.status(500).json({ message: "Internal server error." });
    }
};

/**
 * POST /api/abdm/discover
 * Discovers patient health records across linked Health Information Providers.
 *
 * @param {object} req.body - { requestId, patient: { healthId, name, yearOfBirth } }
 */
exports.discoverPatient = async (req, res) => {
    try {
        const { requestId, patient } = req.body;
        const result = await abdmService.discoverPatient(requestId, patient);

        const statusCode = result.success ? 200 : 400;
        return res.status(statusCode).json(result);
    } catch (err) {
        console.error("ABDM discoverPatient error:", err.message);
        return res.status(500).json({ message: "Internal server error." });
    }
};
