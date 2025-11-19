const surveyModel = require('../models/surveyModel');
const questionModel = require('../models/questionModel');
const optionModel = require('../models/optionModel');

// ENCUESTAS

// Crear una nueva encuesta
async function crearEncuesta(req, res) {
  try {
    const owner_id = req.user.id;
    const { title, description, status, color } = req.body;
    if (!owner_id || !title) {
      return res.status(400).json({ error: 'owner_id y title son obligatorios' });
    }
    if (status && !['Activo', 'Cerrado'].includes(status)) {
      return res.status(400).json({ error: "status debe ser 'Activo' o 'Cerrado'" });
    }
    const encuesta = await surveyModel.crearEncuesta({ owner_id, title: String(title).trim(), description, status, color });
    return res.status(201).json(encuesta);
  } catch (error) {
    console.error('Error al crear encuesta:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

// Listar encuestas del usuario autenticado
async function listarEncuestas(req, res) {
  try {
    const owner_id = req.user.id;
    const encuestas = await surveyModel.obtenerEncuestas({ owner_id });
    return res.status(200).json(encuestas);
  } catch (error) {
    console.error('Error al listar encuestas:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

// Obtener una encuesta por su ID
async function obtenerEncuesta(req, res) {
  try {
    const { survey_id } = req.params;
    const encuesta = await surveyModel.obtenerEncuestaPorId(survey_id);
    if (!encuesta) return res.status(404).json({ error: 'Encuesta no encontrada' });
    return res.status(200).json(encuesta);
  } catch (error) {
    console.error('Error al obtener encuesta:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

// Actualizar una encuesta existente
async function actualizarEncuesta(req, res) {
  try {
    const { survey_id } = req.params;
    //const owner_id = req.user.id;
    const { title, description, status, color } = req.body;
    if (status && !['Activo', 'Cerrado'].includes(status)) {
      return res.status(400).json({ error: "status debe ser 'Activo' o 'Cerrado'" });
    }
    const encuesta = await surveyModel.actualizarEncuesta(survey_id, { title, description, status, color });
    if (!encuesta) return res.status(404).json({ error: 'Encuesta no encontrada' });
    return res.status(200).json(encuesta);
  } catch (error) {
    console.error('Error al actualizar encuesta:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

// Eliminar una encuesta por su ID
async function eliminarEncuesta(req, res) {
  try {
    const { survey_id } = req.params;
    const ok = await surveyModel.eliminarEncuesta(survey_id);
    if (!ok) return res.status(404).json({ error: 'Encuesta no encontrada' });
    return res.status(204).send();
  } catch (error) {
    console.error('Error al eliminar encuesta:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

// PREGUNTAS

// Crear una nueva pregunta en una encuesta
async function crearPregunta(req, res) {
  try {
    const { survey_id } = req.params;
    const { type_id, question_text, is_required, position } = req.body;
    if (!type_id || !question_text || typeof position !== 'number') {
      return res.status(400).json({ error: 'type_id, question_text y position son obligatorios' });
    }
    const pregunta = await questionModel.crearPregunta({ survey_id, type_id, question_text, is_required, position });
    return res.status(201).json(pregunta);
  } catch (error) {
    console.error('Error al crear pregunta:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

// Listar todas las preguntas de una encuesta
async function listarPreguntas(req, res) {
  try {
    const { survey_id } = req.params;
    const preguntas = await questionModel.obtenerPreguntasDeEncuesta(survey_id);
    return res.status(200).json(preguntas);
  } catch (error) {
    console.error('Error al listar preguntas:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

// Actualizar una pregunta existente
async function actualizarPregunta(req, res) {
  try {
    const { question_id } = req.params;
    const { type_id, question_text, is_required, position } = req.body;
    const pregunta = await questionModel.actualizarPregunta(question_id, { type_id, question_text, is_required, position });
    if (!pregunta) return res.status(404).json({ error: 'Pregunta no encontrada' });
    return res.status(200).json(pregunta);
  } catch (error) {
    console.error('Error al actualizar pregunta:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

// Eliminar una pregunta por su ID
async function eliminarPregunta(req, res) {
  try {
    const { question_id } = req.params;
    const ok = await questionModel.eliminarPregunta(question_id);
    if (!ok) return res.status(404).json({ error: 'Pregunta no encontrada' });
    return res.status(204).send();
  } catch (error) {
    console.error('Error al eliminar pregunta:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

// OPCIONES

// Crear una nueva opción para una pregunta
async function crearOpcion(req, res) {
  try {
    const { question_id } = req.params;
    const { option_label, position } = req.body;
    if (!option_label || typeof position !== 'number') {
      return res.status(400).json({ error: 'option_label y position son obligatorios' });
    }
    const opcion = await optionModel.crearOpcion({ question_id, option_label, position });
    return res.status(201).json(opcion);
  } catch (error) {
    console.error('Error al crear opción:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

// Listar todas las opciones de una pregunta
async function listarOpciones(req, res) {
  try {
    const { question_id } = req.params;
    const opciones = await optionModel.obtenerOpciones(question_id);
    return res.status(200).json(opciones);
  } catch (error) {
    console.error('Error al listar opciones:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

// Actualizar una opción existente
async function actualizarOpcion(req, res) {
  try {
    const { option_id } = req.params;
    const { option_label, position } = req.body;
    const opcion = await optionModel.actualizarOpcion(option_id, { option_label, position });
    if (!opcion) return res.status(404).json({ error: 'Opción no encontrada' });
    return res.status(200).json(opcion);
  } catch (error) {
    console.error('Error al actualizar opción:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

// Eliminar una opción por su ID
async function eliminarOpcion(req, res) {
  try {
    const { option_id } = req.params;
    const ok = await optionModel.eliminarOpcion(option_id);
    if (!ok) return res.status(404).json({ error: 'Opción no encontrada' });
    return res.status(204).send();
  } catch (error) {
    console.error('Error al eliminar opción:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

// DETALLE COMPLETO

async function obtenerEncuestaConPreguntas(req, res) {
  try {
    const { survey_id } = req.params;
    const encuesta = await surveyModel.obtenerEncuestaPorId(survey_id);
    if (!encuesta) return res.status(404).json({ error: 'Encuesta no encontrada' });
    const preguntas = await questionModel.obtenerPreguntasDeEncuesta(survey_id);
    // Cargar opciones para cada pregunta (cerradas)
    const preguntasConOpciones = await Promise.all(
      preguntas.map(async (p) => {
        const opciones = await optionModel.obtenerOpciones(p.question_id);
        return { ...p, options: opciones };
      })
    );
    return res.status(200).json({ ...encuesta, questions: preguntasConOpciones });
  } catch (error) {
    console.error('Error al obtener detalle de encuesta:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

module.exports = {
  crearEncuesta,
  listarEncuestas,
  obtenerEncuesta,
  actualizarEncuesta,
  eliminarEncuesta,
  crearPregunta,
  listarPreguntas,
  actualizarPregunta,
  eliminarPregunta,
  crearOpcion,
  listarOpciones,
  actualizarOpcion,
  eliminarOpcion,
  obtenerEncuestaConPreguntas,
};

