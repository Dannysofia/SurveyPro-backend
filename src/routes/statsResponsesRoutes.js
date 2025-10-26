// statsRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { dailyResponses } = require('../controllers/statsResponsesController');

router.use(authMiddleware);
router.get('/daily-responses', dailyResponses);

module.exports = router;