const express = require('express');
const router = express.Router();
const { queryRag, getDisease, getMedicine } = require('../controllers/rag.controller');
const protect = require('../middleware/auth.middleware');

router.post('/query', protect, queryRag);
router.get('/disease/:name', protect, getDisease);
router.get('/medicine/:name', protect, getMedicine);

module.exports = router;
