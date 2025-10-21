const express = require('express');
const router = express.Router();
const uploadCtrl = require('../controllers/uploadController');

router.post('/logo', uploadCtrl.subirLogoMiddleware, uploadCtrl.responderLogo);

// Manejo de errores de multer (solo rutas de este router)
router.use(uploadCtrl.manejarErrorUploads);

module.exports = router;

