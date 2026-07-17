/**
 * @file abdm.routes.js
 * @description Express router for ABDM (Ayushman Bharat Digital Mission) mock endpoints.
 *              Mounted at /api/abdm in server.js.
 *
 * Routes:
 *   POST /generate-otp   → Send OTP to mobile for ABHA registration
 *   POST /verify-otp     → Verify the OTP
 *   POST /create-abha    → Create an ABHA health account
 *   POST /discover       → Discover patient records across HIPs
 */

const express = require("express");
const router = express.Router();
const abdmController = require("./abdm.controller");

router.post("/generate-otp", abdmController.generateOTP);
router.post("/verify-otp", abdmController.verifyOTP);
router.post("/create-abha", abdmController.createABHA);
router.post("/discover", abdmController.discoverPatient);

module.exports = router;
