const express = require("express");
const router = express.Router();
const { predict, predictFromImage, predictEnhanced } = require("../controllers/predict.controller");
const authMiddleware = require("../middleware/auth.middleware");

router.post("/", authMiddleware, predict);
router.post("/enhanced", authMiddleware, predictEnhanced);
router.post("/image", predictFromImage);

module.exports = router;
