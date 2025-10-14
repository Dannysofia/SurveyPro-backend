const db = require('../db');

async function crearOpcion({ question_id, option_label, position }) {
  const query = `
    INSERT INTO question_options (question_id, option_label, position)
    VALUES ($1, $2, $3)
    RETURNING option_id, question_id, option_label, position
  `;
  const values = [question_id, option_label, position];
  const result = await db.query(query, values);
  return result.rows[0];
}

async function obtenerOpciones(question_id) {
  const query = `
    SELECT option_id, question_id, option_label, position
    FROM question_options
    WHERE question_id = $1
    ORDER BY position ASC
  `;
  const result = await db.query(query, [question_id]);
  return result.rows;
}

async function actualizarOpcion(option_id, { option_label, position }) {
  const query = `
    UPDATE question_options
    SET option_label = COALESCE($2, option_label),
        position = COALESCE($3, position)
    WHERE option_id = $1
    RETURNING option_id, question_id, option_label, position
  `;
  const values = [option_id, option_label || null, position || null];
  const result = await db.query(query, values);
  return result.rows[0] || null;
}

async function eliminarOpcion(option_id) {
  const query = `DELETE FROM question_options WHERE option_id = $1`;
  const result = await db.query(query, [option_id]);
  return result.rowCount > 0;
}

module.exports = {
  crearOpcion,
  obtenerOpciones,
  actualizarOpcion,
  eliminarOpcion,
};

