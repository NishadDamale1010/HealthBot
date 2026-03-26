const express = require("express");
const router = express.Router();
const { predict } = require("../controllers/predict.controller");
const authMiddleware = require("../middleware/auth.middleware");

router.post("/", authMiddleware, predict);

module.exports = router;