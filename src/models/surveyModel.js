const crypto = require('crypto');
const db = require('../db');

function generarTokenPublico() {
  return crypto.randomBytes(12).toString('hex'); // 24 chars
}

async function crearEncuesta({ owner_id, title, description, status }) {
  const public_token = generarTokenPublico();
  const query = `
    INSERT INTO surveys (owner_id, title, description, public_token, status)
    VALUES ($1, $2, $3, $4, COALESCE($5, 'Activo'))
    RETURNING survey_id, owner_id, title, description, public_token, status, created_at
  `;
  const values = [owner_id, title, description || null, public_token, status || null];
  const result = await db.query(query, values);
  return result.rows[0];
}

async function obtenerEncuestas({ owner_id } = {}) {
  let query = `
    SELECT survey_id, owner_id, title, description, public_token, status, created_at
    FROM surveys
  `;
  const values = [];
  if (owner_id) {
    query += ' WHERE owner_id = $1';
    values.push(owner_id);
  }
  query += ' ORDER BY created_at DESC';
  const result = await db.query(query, values);
  return result.rows;
}

async function obtenerEncuestaPorId(survey_id) {
  const query = `
    SELECT survey_id, owner_id, title, description, public_token, status, created_at
    FROM surveys
    WHERE survey_id = $1
    LIMIT 1
  `;
  const result = await db.query(query, [survey_id]);
  return result.rows[0] || null;
}

async function obtenerEncuestaPorToken(public_token) {
  const query = `
    SELECT survey_id, owner_id, title, description, public_token, status, created_at
    FROM surveys
    WHERE public_token = $1
    LIMIT 1
  `;
  const result = await db.query(query, [public_token]);
  return result.rows[0] || null;
}

async function actualizarEncuesta(survey_id, { title, description, status }) {
  const query = `
    UPDATE surveys
    SET title = COALESCE($2, title),
        description = COALESCE($3, description),
        status = COALESCE($4, status)
    WHERE survey_id = $1
    RETURNING survey_id, owner_id, title, description, public_token, status, created_at
  `;
  const values = [survey_id, title || null, description || null, status || null];
  const result = await db.query(query, values);
  return result.rows[0] || null;
}

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
  obtenerEncuestaPorToken,
  actualizarEncuesta,
  eliminarEncuesta,
};

