const express = require('express');
const router = express.Router();
const questionTypeController = require('../controllers/questionTypeController');

router.get('/', questionTypeController.listarTiposPregunta);

module.exports = router;

