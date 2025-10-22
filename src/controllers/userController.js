const bcrypt = require('bcryptjs');
const userModel = require('../models/userModel');

async function guardarUsuario(req, res) {
  try {
    let { nombre, apellido, correo, password } = req.body;

    if (!nombre || !correo || !password) {
      return res.status(400).json({ error: 'nombre, correo y password son obligatorios' });
    }

    correo = String(correo).trim().toLowerCase();

    const existeUsuario = await userModel.obtenerUsuarioPorCorreo(correo);
    if (existeUsuario) {
      return res.status(400).json({ error: 'El correo ya está registrado' });
    }

    // Encriptar contraseña
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const nuevoUsuario = await userModel.insertarUsuario(nombre, apellido, correo, passwordHash);

    // Responder solo datos públicos
    return res.status(201).json({
      message: 'Usuario creado correctamente',
      user: nuevoUsuario,
    });
  } catch (error) {
    console.error('Error al guardar el usuario:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

module.exports = {
  guardarUsuario
};