const express = require('express');
const router = express.Router();
const surveyController = require('../controllers/surveyController');
const responseController = require('../controllers/responseController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

// Encuestas
router.post('/', surveyController.crearEncuesta);
router.get('/', surveyController.listarEncuestas);
router.get('/:survey_id', surveyController.obtenerEncuesta);
router.put('/:survey_id', surveyController.actualizarEncuesta);
router.delete('/:survey_id', surveyController.eliminarEncuesta);

// Preguntas de encuesta
router.post('/:survey_id/preguntas', surveyController.crearPregunta);
router.get('/:survey_id/preguntas', surveyController.listarPreguntas);

// Detalle completo de encuesta con preguntas y opciones
router.get('/:survey_id/detalle', surveyController.obtenerEncuestaConPreguntas);

// Operaciones por pregunta
router.put('/preguntas/:question_id', surveyController.actualizarPregunta);
router.delete('/preguntas/:question_id', surveyController.eliminarPregunta);

// Opciones de pregunta
router.post('/preguntas/:question_id/opciones', surveyController.crearOpcion);
router.get('/preguntas/:question_id/opciones', surveyController.listarOpciones);
router.put('/opciones/:option_id', surveyController.actualizarOpcion);
router.delete('/opciones/:option_id', surveyController.eliminarOpcion);

// Respuestas
router.post('/:survey_id/respuestas', responseController.enviarRespuestasPorSurveyId);
router.get('/:survey_id/respuestas', responseController.listarRespuestas);
router.get('/:survey_id/respuestas/estadisticas', responseController.obtenerEstadisticas);
router.get('/:survey_id/respuestas/vista', responseController.listarRespuestasVista);

module.exports = router;
