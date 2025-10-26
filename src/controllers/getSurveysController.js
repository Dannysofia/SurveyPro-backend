const surveyRepo = require('../models/getSurveysModel');

async function getHomeSummary(req, res) {
    try {
        const ownerId = req.user.id;

        const summary = await surveyRepo.getHomeSummary({ ownerId });

        return res.status(200).json({
            message: 'Resumen obtenido correctamente',
            summary
        });
    } catch (error) {
        console.error('Error en getHomeSummary:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
}

module.exports = {
    getHomeSummary
};