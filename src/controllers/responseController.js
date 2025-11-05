const responseModel = require('../models/responseModel');

function traducirError(err) {
  const code = String(err && err.message ? err.message : err);
  switch (code) {
    case 'ENCUESTA_NO_ENCONTRADA':
      return { status: 404, body: { error: 'Encuesta no encontrada' } };
    case 'ENCUESTA_CERRADA':
      return { status: 409, body: { error: 'La encuesta está cerrada' } };
    case 'PREGUNTA_INVALIDA':
      return { status: 400, body: { error: 'Pregunta inválida para esta encuesta' } };
    case 'RESPUESTA_REQUERIDA_FALTA':
      return { status: 400, body: { error: 'Falta responder una pregunta obligatoria' } };
    case 'OPCION_INVALIDA':
      return { status: 400, body: { error: 'Opción inválida para la pregunta' } };
    default:
      return { status: 500, body: { error: 'Error interno del servidor' } };
  }
}

async function enviarRespuestasPorSurveyId(req, res) {
  try {
    const { survey_id } = req.params;
    const { answers } = req.body || {};
    // En rutas autenticadas, usar el id del usuario del JWT
    const submitted_by = (req.user && req.user.id) ? req.user.id : null;
    if (!survey_id) return res.status(400).json({ error: 'survey_id requerido' });
    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ error: 'answers debe ser un arreglo no vacío' });
    }
    const resultado = await responseModel.crearRespuestaPorSurveyId({ survey_id, submitted_by, answers });
    return res.status(201).json({ response_id: resultado.response_id });
  } catch (error) {
    console.error('Error al enviar respuestas (survey_id):', error);
    const t = traducirError(error);
    return res.status(t.status).json(t.body);
  }
}

async function enviarRespuestasPorToken(req, res) {
  try {
    const { token } = req.params;
    const { answers } = req.body || {};
    // En encuestas públicas, forzar submitted_by a null
    const submitted_by = null;
    if (!token) return res.status(400).json({ error: 'token requerido' });
    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ error: 'answers debe ser un arreglo no vacío' });
    }
    const resultado = await responseModel.crearRespuestaPorToken({ token, submitted_by, answers });
    return res.status(201).json({ response_id: resultado.response_id });
  } catch (error) {
    console.error('Error al enviar respuestas (token):', error);
    const t = traducirError(error);
    return res.status(t.status).json(t.body);
  }
}

async function listarRespuestas(req, res) {
  try {
    const { survey_id } = req.params;
    if (!survey_id) return res.status(400).json({ error: 'survey_id requerido' });
    const data = await responseModel.listarRespuestas(survey_id);
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error al listar respuestas:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

async function obtenerEstadisticas(req, res) {
  try {
    const { survey_id } = req.params;
    if (!survey_id) return res.status(400).json({ error: 'survey_id requerido' });
    const data = await responseModel.obtenerEstadisticas(survey_id);
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error al obtener estadísticas de respuestas:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

async function listarRespuestasVista(req, res) {
  try {
    const { survey_id } = req.params;
    if (!survey_id) return res.status(400).json({ error: 'survey_id requerido' });
    const data = await responseModel.listarRespuestasFormateadas(survey_id);
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error al listar respuestas (vista):', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

module.exports = {
  enviarRespuestasPorSurveyId,
  enviarRespuestasPorToken,
  listarRespuestas,
  listarRespuestasVista,
  obtenerEstadisticas,
};
