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

async function obtenerUsuarioPorId(id) {
  const query = `
    SELECT name, last_name, email, created_at
    FROM users
    WHERE id = $1
  `;
  const result = await db.query(query, [id]);
  return result.rows[0] || null;
}

async function actualizarUsuario(id, name, last_name, email) {
  const query = `
    UPDATE users
    SET name = $2, last_name = $3, email = $4
    WHERE id = $1
    RETURNING id, name, last_name, email, created_at
  `;
  const values = [id, name, last_name || null, email];
  const result = await db.query(query, values);
  return result.rows[0];
}

module.exports = {
  obtenerUsuarioPorCorreo,
  insertarUsuario,
  obtenerUsuarioPorId,
  actualizarUsuario
};