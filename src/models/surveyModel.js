const crypto = require("crypto");
const db = require("../db");

// Crear una nueva encuesta
async function crearEncuesta({ owner_id, title, description, status, color }) {
  const query = `
    INSERT INTO surveys (owner_id, title, description, status, color)
    VALUES ($1, $2, $3, COALESCE($4, 'Activo'), $5)
    RETURNING survey_id, owner_id, title, description, status, color, created_at
  `;
  const values = [
    owner_id,
    title,
    description || null,
    status || null,
    color || null,
  ];
  const result = await db.query(query, values);
  return result.rows[0];
}

// Obtener encuestas, opcionalmente filtradas por owner_id
async function obtenerEncuestas({ owner_id } = {}) {
  let query = `
    SELECT survey_id, owner_id, title, description, status, color, created_at
    FROM surveys
  `;
  const values = [];
  if (owner_id) {
    query += " WHERE owner_id = $1";
    values.push(owner_id);
  }
  query += " ORDER BY created_at DESC";
  const result = await db.query(query, values);
  return result.rows;
}

// Obtener una encuesta por su ID
async function obtenerEncuestaPorId(survey_id) {
  const query = `
    SELECT survey_id, owner_id, title, description, status, color, created_at
    FROM surveys
    WHERE survey_id = $1
    LIMIT 1
  `;
  const result = await db.query(query, [survey_id]);
  return result.rows[0] || null;
}

// Actualizar una encuesta existente
async function actualizarEncuesta(
  survey_id,
  { title, description, status, color }
) {
  const query = `
    UPDATE surveys
    SET title = COALESCE($2, title),
        description = COALESCE($3, description),
        status = COALESCE($4, status),
        color = COALESCE($5, color)
    WHERE survey_id = $1
    RETURNING survey_id, owner_id, title, description, status, color, created_at
  `;
  const values = [
    survey_id,
    title || null,
    description || null || "",
    status || null,
    color || null,
  ];
  const result = await db.query(query, values);
  return result.rows[0] || null;
}

// Eliminar una encuesta por su ID
async function eliminarEncuesta(survey_id) {
  const query = `
    DELETE FROM surveys WHERE survey_id = $1
    RETURNING survey_id
  `;
  const result = await db.query(query, [survey_id]);
  return result.rowCount > 0;
}

module.exports = {
  crearEncuesta,
  obtenerEncuestas,
  obtenerEncuestaPorId,
  actualizarEncuesta,
  eliminarEncuesta,
};
