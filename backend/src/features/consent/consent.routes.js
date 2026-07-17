/**
 * @file consent.routes.js
 * @description Express router for the Consent Manager (DPDP Act compliance).
 *              All routes require authentication.
 *              Mounted at /api/consent in server.js.
 *
 * Routes:
 *   POST /grant   → Record a new consent grant
 *   POST /revoke  → Revoke an existing consent
 *   GET  /status  → Get current consent status (all or by purpose)
 */

const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth.middleware");
const consentController = require("./consent.controller");

// All consent routes require authentication
router.use(auth);

router.post("/grant", consentController.grantConsent);
router.post("/revoke", consentController.revokeConsent);
router.get("/status", consentController.getConsentStatus);

module.exports = router;
