const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/', userController.guardarUsuario);
router.get('/', userController.obtenerUsuarios);

module.exports = router;
