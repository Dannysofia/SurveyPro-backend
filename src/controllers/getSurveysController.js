const surveyRepo = require('../models/getSurveysModel');

async function listRecentSurveys(req, res) {
    try {
        const ownerId = req.user.id;
        const limit = parseInt(req.query.limit) || 6;

        const surveys = await surveyRepo.listRecentSurveys({ ownerId, limit });

        return res.status(200).json({
            message: 'Encuestas recientes obtenidas correctamente',
            items: surveys,
        });
    } catch (error) {
        console.error('Error en listRecentSurveys:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
}

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
    listRecentSurveys,
    getHomeSummary,
};