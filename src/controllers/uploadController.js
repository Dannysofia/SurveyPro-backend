const fs = require('fs');
const path = require('path');
const multer = require('multer');

const UPLOAD_ROOT = path.join(__dirname, '..', 'uploads');
const LOGO_DIR = path.join(UPLOAD_ROOT, 'logos');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

ensureDir(LOGO_DIR);

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, LOGO_DIR);
  },
  filename: function (_req, file, cb) {
    const ext = path.extname(file.originalname) || '';
    const base = Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
    cb(null, base + ext.toLowerCase());
  },
});

function fileFilter(_req, file, cb) {
  if (file.mimetype && file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes'));
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});

const subirLogoMiddleware = upload.single('logo');

function responderLogo(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: 'Archivo no recibido' });
  }
  const filename = req.file.filename;
  const relative = path.posix.join('logos', filename);
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  const url = `${baseUrl}/uploads/${relative}`;
  return res.status(201).json({
    url,
    filename,
    size: req.file.size,
    mime: req.file.mimetype,
  });
}

// Error handler específico para Multer en este router
function manejarErrorUploads(err, _req, res, _next) {
  if (err) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: 'El archivo supera el límite de 2MB' });
    }
    return res.status(400).json({ error: err.message || 'Error al subir archivo' });
  }
}

module.exports = {
  subirLogoMiddleware,
  responderLogo,
  manejarErrorUploads,
};

