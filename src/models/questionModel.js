const db = require('../db');

async function crearPregunta({ survey_id, type_id, question_text, is_required, help_text, position }) {
  const query = `
    INSERT INTO survey_questions (survey_id, type_id, question_text, is_required, help_text, position)
    VALUES ($1, $2, $3, COALESCE($4, false), $5, $6)
    RETURNING question_id, survey_id, type_id, question_text, is_required, help_text, position
  `;
  const values = [survey_id, type_id, question_text, is_required === true, help_text || null, position];
  const result = await db.query(query, values);
  return result.rows[0];
}

async function obtenerPreguntasDeEncuesta(survey_id) {
  const query = `
    SELECT q.question_id, q.survey_id, q.type_id, t.type_key, t.label as type_label,
           q.question_text, q.is_required, q.help_text, q.position
    FROM survey_questions q
    JOIN question_types t ON t.type_id = q.type_id
    WHERE q.survey_id = $1
    ORDER BY q.position ASC
  `;
  const result = await db.query(query, [survey_id]);
  return result.rows;
}

async function obtenerPreguntaPorId(question_id) {
  const query = `
    SELECT question_id, survey_id, type_id, question_text, is_required, help_text, position
    FROM survey_questions
    WHERE question_id = $1
    LIMIT 1
  `;
  const result = await db.query(query, [question_id]);
  return result.rows[0] || null;
}

async function actualizarPregunta(question_id, { type_id, question_text, is_required, help_text, position }) {
  const query = `
    UPDATE survey_questions
    SET type_id = COALESCE($2, type_id),
        question_text = COALESCE($3, question_text),
        is_required = COALESCE($4, is_required),
        help_text = COALESCE($5, help_text),
        position = COALESCE($6, position)
    WHERE question_id = $1
    RETURNING question_id, survey_id, type_id, question_text, is_required, help_text, position
  `;
  const values = [question_id, type_id || null, question_text || null, typeof is_required === 'boolean' ? is_required : null, help_text || null, position || null];
  const result = await db.query(query, values);
  return result.rows[0] || null;
}

async function eliminarPregunta(question_id) {
  const query = `DELETE FROM survey_questions WHERE question_id = $1`;
  const result = await db.query(query, [question_id]);
  return result.rowCount > 0;
}

module.exports = {
  crearPregunta,
  obtenerPreguntasDeEncuesta,
  obtenerPreguntaPorId,
  actualizarPregunta,
  eliminarPregunta,
};

