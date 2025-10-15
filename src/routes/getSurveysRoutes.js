const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const getSurveysController = require('../controllers/getSurveysController');

router.use(authMiddleware);

router.get('/recent', getSurveysController.listRecentSurveys);
router.get('/summary', getSurveysController.getHomeSummary);

module.exports = router;