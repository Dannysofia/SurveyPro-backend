const db = require('../db');

async function obtenerUsuarioPorCorreo(email) {
  const query = `
    SELECT *
    FROM users
    WHERE lower(email) = lower($1)
    LIMIT 1
  `;
  const result = await db.query(query, [email]);
  return result.rows[0] || null;
}

async function insertarUsuario(name, last_name, email, passwordHash) {
  const query = `
    INSERT INTO users (name, last_name, email, password_hash)
    VALUES ($1, $2, $3, $4)
    RETURNING id, name, last_name, email, created_at
  `;
  const values = [name, last_name || null, email, passwordHash];
  const result = await db.query(query, values);
  return result.rows[0];
}

async function obtenerUsuarios() {
  const query = `
    SELECT id, name, last_name, email, created_at
    FROM users
    ORDER BY created_at DESC
  `;
  const result = await db.query(query);
  return result.rows;
}

module.exports = {
  obtenerUsuarioPorCorreo,
  insertarUsuario,
  obtenerUsuarios,
};