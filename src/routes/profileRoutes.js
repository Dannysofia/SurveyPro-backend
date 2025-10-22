const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController')
const authMiddleware = require('../middleware/authMiddleware')

router.use(authMiddleware);

router.get('/', profileController.getMyProfile);
router.put('/', profileController.updateMyProfile);

module.exports = router;