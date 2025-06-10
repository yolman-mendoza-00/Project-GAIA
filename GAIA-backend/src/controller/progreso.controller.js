const progresoRepository = require('../repository/progreso.repository');

async function actualizarProgreso(req, res) {
    const { id } = req.params;
    const { fecha } = req.body;

    try {
        const usuarioActualizado = await progresoRepository.actualizarProgresoUsuario(id, fecha);
        
        if (usuarioActualizado) {
        res.status(200).json({
            mensaje: "Progreso actualizado.",
            usuario: usuarioActualizado,
        });
        } else {
        res.status(200).json({
            mensaje: "El usuario no cumplió con los 16 retos en la semana.",
        });
        }
    } catch (error) {
        console.error("Error en controlador:", error);
        res.status(500).json({ error: "Error al actualizar progreso del usuario" });
    }
}


async function obtenerProgresoUsuario(req, res) {
    const idUsuario = req.params.id;

    try {
        const usuario = await progresoRepository.obtenerProgresoPorId(idUsuario);

        if (!usuario) {
        return res.status(404).json({ error: "Usuario no encontrado" });
        }

        res.json({ progreso: usuario.progreso });
    } catch (error) {
        console.error("Error al obtener progreso del usuario:", error);
        res.status(500).json({ error: "Error al obtener progreso" });
    }
}

module.exports = {
    actualizarProgreso,
    obtenerProgresoUsuario
};