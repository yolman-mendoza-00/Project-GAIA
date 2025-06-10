const bcrypt = require('bcrypt');

const authRepository = require('../repository/auth.repository');

const registrar = async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password)
        return res.status(400).json({ error: 'Todos los campos son obligatorios.' });

    const usuarioExistente = await authRepository.findUserByEmail(email);
    if (usuarioExistente)
        return res.status(409).json({ error: 'El correo electrónico ya está registrado.' });

    const hashedPassword = await bcrypt.hash(password, 10);
    await authRepository.createUser(username, email, hashedPassword);

    res.status(201).json({ message: 'Usuario registrado con éxito.' });
};

const login = async (req, res) => {
    const { email, password } = req.body;

    const usuario = await authRepository.findUserByEmail(email);
    if (!usuario)
        return res.status(401).json({ error: 'Correo no registrado.' });

    const coincide = await bcrypt.compare(password, usuario.contraseña);
    if (!coincide)
        return res.status(401).json({ error: 'Contraseña incorrecta.' });

    res.status(200).json({
        message: 'Inicio de sesión exitoso.',
        user: {
            id: usuario.id_usuario,
            nombre: usuario.nombre,
            correo: usuario.correo,
            foto: usuario.foto
        }
    });
};

async function actualizarUsuario(req, res) {
    const { id } = req.params; // /usuarios/:id
    const { nombre, correo, contraseña, foto } = req.body; // 'foto' en base64

    if (!nombre && !correo && !contraseña && !foto) {
        return res.status(400).json({ error: "Nada que actualizar" });
    }

    try {
        let contraseñaHash;

        if (contraseña) {
            contraseñaHash = await bcrypt.hash(contraseña, 10);
        }

        const usuarioAct = await authRepository.actualizarUsuario(id, {
            nombre,
            correo,
            contraseñaHash,
            fotoBase64: foto
        });

        // Cambiar 'id_usuario' a 'id' en la respuesta
        const { id_usuario, ...resto } = usuarioAct;

        res.json({
            mensaje: "Usuario actualizado",
            usuario: { id: id_usuario, ...resto }
        });
        
    } catch (err) {
        console.error("Error al actualizar usuario:", err.message);
        res.status(500).json({ error: err.message || "Error interno" });
    }
}

const eliminarUsuario = async (req, res) => {
    const { id } = req.params;

    try {
        await authRepository.eliminarUsuario(id);
        res.json({ mensaje: "Usuario eliminado correctamente" });
    } catch (err) {
        console.error("Error al eliminar usuario:", err.message);
        res.status(500).json({ error: "No se pudo eliminar el usuario" });
    }
};


module.exports = {
    registrar,
    login,
    actualizarUsuario,
    eliminarUsuario
};
