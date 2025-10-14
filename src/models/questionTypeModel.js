const db = require('../db');

async function obtenerTiposPregunta() {
  const query = `
    SELECT type_id, type_key, label
    FROM question_types
    ORDER BY label ASC
  `;
  const result = await db.query(query);
  return result.rows;
}

module.exports = {
  obtenerTiposPregunta,
};

