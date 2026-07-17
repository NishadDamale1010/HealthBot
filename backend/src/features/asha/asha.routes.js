/**
 * @file asha.routes.js
 * @description Express router for ASHA (Accredited Social Health Activist) worker endpoints.
 *              All routes are protected by JWT auth + RBAC (ASHA_WORKER role only).
 *              Mounted at /api/asha in server.js.
 *
 * Routes:
 *   GET  /guidelines            → Maternal & infant health guidelines
 *   GET  /vaccination-schedule  → National Immunization Schedule (NIS)
 *   POST /scheme-eligibility    → Government health scheme eligibility checker
 */

const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth.middleware");
const rbac = require("../../middleware/rbac.middleware");
const ashaController = require("./asha.controller");

// All ASHA routes require authentication + ASHA_WORKER role
router.use(auth);
router.use(rbac(["ASHA_WORKER"]));

router.get("/guidelines", ashaController.getGuidelines);
router.get("/vaccination-schedule", ashaController.getVaccinationSchedule);
router.post("/scheme-eligibility", ashaController.checkSchemeEligibility);

module.exports = router;
