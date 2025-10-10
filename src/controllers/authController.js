const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

async function login(req, res) {
    try {
        let { correo, password } = req.body;

        // Validar campos
        if (!correo || !password) {
            return res.status(400).json({ error: 'correo y password son obligatorios' });
        }

        correo = correo.trim().toLowerCase();

        // Buscar usuario por correo
        const usuario = await userModel.obtenerUsuarioPorCorreo(correo);
        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // Comparar contraseñas
        const esValido = await bcrypt.compare(password, usuario.password_hash);
        if (!esValido) {
            return res.status(401).json({ error: 'Contraseña incorrecta' });
        }

        // Crear token JWT
        const token = jwt.sign(
            { id: usuario.id, email: usuario.email, name: usuario.name },
            process.env.JWT_SECRET,
            { expiresIn: '2h' }
        );

        return res.json({
            message: 'Inicio de sesión exitoso',
            user: {
                id: usuario.id,
                name: usuario.name,
                last_name: usuario.last_name,
                email: usuario.email
            },
            token
        });
    } catch (error) {
        console.error('Error en login:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
}

module.exports = { login };