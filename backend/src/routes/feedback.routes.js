const express = require('express');
const router = express.Router();
const { submitFeedback, getMyFeedback } = require('../controllers/feedback.controller');
const protect = require('../middleware/auth.middleware'); // assuming standard auth middleware exists

router.post('/', protect, submitFeedback);
router.get('/my', protect, getMyFeedback);

module.exports = router;
