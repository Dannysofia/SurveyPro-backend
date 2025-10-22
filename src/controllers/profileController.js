const userModel = require('../models/userModel');

async function getMyProfile(req, res) {
    try {
        const userId = req.user.id;
        const infoUser = await userModel.obtenerUsuarioPorId(userId);

        if (!infoUser) {
            return res.status(404).json({ error: 'Usuario no encontrado' })
        }

        return res.status(200).json({
            message: 'Perfil obtenido',
            user: {
                name: infoUser.name,
                last_name: infoUser.last_name,
                email: infoUser.email,
                created_at: infoUser.created_at
            }
        });
    } catch (error) {
        console.error('Error en getMyProfile: ', error);
        return res.status(500).json({ error: 'Error interno en el servidor' })
    }
}

async function updateMyProfile(req, res) {
    try {
        const userId = req.user.id;
        let { name, last_name, email } = req.body

        if (!userId) {
            return res.status(401).json({ error: 'Usuario no autorizado'})
        }

        if (!name || !email) {
            return res.status(400).json({ error: 'Nombre y correo son obligatorios' });
        }

        name = String(name).trim();
        last_name = last_name ? String(last_name).trim() : null;
        email = String(email).trim().toLowerCase();

        const existeUsuario = await userModel.obtenerUsuarioPorCorreo(email);
        if (existeUsuario && existeUsuario.id !== userId) {
            return res.status(409).json({ error: 'El correo ya está registrado' });
        }

        const updateUser = await userModel.actualizarUsuario(userId, name, last_name, email);

        if (!updateUser) {
            return res.status(404).json({ error: 'Usuario no actualizado' })
        }
        
        return res.status(200).json({
            message: 'Usuario actualizado correctamente',
            user: updateUser
        });
    } catch (error) {
        console.error('Error en updateMyProfile: ', error);
        return res.status(500).json({ error: 'Error interno del servidor'})
    }
}

module.exports = {
    getMyProfile,
    updateMyProfile
}