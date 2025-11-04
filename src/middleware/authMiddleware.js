const jwt = require('jsonwebtoken');
const surveyModel = require('../models/surveyModel');

async function authMiddleware(req, res, next) {
    try {
        // Permitir sin Authorization para encuestas públicas activas en rutas específicas
        // GET /encuestas/:id/detalle
        // POST /encuestas/:id/respuestas
        if (req.baseUrl === '/encuestas') {
            let surveyId = null;
            let match = null;
            if (req.method === 'GET') {
                match = req.path.match(/^\/([^\/]+)\/detalle$/);
            } else if (req.method === 'POST') {
                match = req.path.match(/^\/([^\/]+)\/respuestas$/);
            }
            if (match) {
                surveyId = match[1];
            }
            if (surveyId) {
                try {
                    const encuesta = await surveyModel.obtenerEncuestaPorId(surveyId);
                    if (encuesta && encuesta.public_token != null && encuesta.status === 'Activo') {
                        return next();
                    }
                } catch (e) {
                    console.error('Error consultando encuesta en authMiddleware:', e.message);
                    // Si falla la consulta, continúa con validación normal de JWT
                }
            }
        }
        const authHeader = req.header('Authorization');

        if (!authHeader) {
            return res.status(401).json({ error: 'Token no proporcionado' });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Token inválido' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Error en authMiddleware:', error.message);
        return res.status(401).json({ error: 'Token inválido o expirado' });
    }
}

module.exports = authMiddleware;