const dayjs = require('dayjs')
const ahora = dayjs();
const retosRepository = require('../repository/retos.repository');

const obtenerRetosDiarios = async (req, res) => {
    const id_usuario = parseInt(req.query.usuario);
    const hoy = ahora.format("YYYY-MM-DD"); //new Date().toLocaleDateString('es-CO');

    if (!id_usuario)
        return res.status(400).json({ error: 'Falta el ID del usuario.' });

    try {
        const retos = await retosRepository.getRetosDiarios(id_usuario, hoy);
        res.status(200).json({ retos });
    } catch (err) {
        console.error('Error al obtener retos diarios:', err);
        res.status(500).json({ error: 'Error al obtener los retos diarios.' });
    }
};

const asignarRetos = async (req, res) => {
    const { usuario } = req.body;
    const id_usuario = parseInt(usuario);
    const hoy = ahora.format("YYYY-MM-DD");

    if (!id_usuario)
        return res.status(400).json({ error: 'Falta el ID del usuario.' });

    try {
        const yaAsignado = await retosRepository.checkRetosAsignados(id_usuario, hoy);
        if (yaAsignado)
            return res.status(409).json({ error: 'Ya hay retos asignados para hoy.' });

        const retos = await retosRepository.asignarRetosAleatorios(id_usuario, hoy);
        res.status(201).json({ retos });

    } catch (err) {
        console.error('Error al asignar retos diarios:', err);
        res.status(500).json({ error: 'Error al asignar los retos diarios.' });
    }
};

const guardarRetos = async (req, res) => {
    const { registros } = req.body;

    try {
        await retosRepository.guardarRetosCompletados(registros);
        res.status(200).json({ message: "Registros guardados correctamente." });
    } catch (err) {
        console.error("Error al guardar retos:", err);
        res.status(500).json("Error al guardar retos.");
    }
};

const retosRealizados = async (req, res) => {
    const { usuario, fecha } = req.query;

    if (!usuario || !fecha)
        return res.status(400).json({ error: 'Se requiere id de usuario y fecha.' });

    try {
        const retos = await retosRepository.getRetosRealizados(usuario, fecha);
        res.status(200).json({ retos_realizados: retos });
    } catch (error) {
        console.error('Error al buscar retos realizados:', error);
        res.status(500).json({ error: 'Error en el servidor.' });
    }
};

const crearRetoPersonalizado = async (req, res) => {
    const { descripcion, id_usuario } = req.body;

    if (!descripcion) {
        return res.status(400).json({ error: 'Falta la descripción para crear el reto.' });
    }

    try {
        const resultado = await retosRepository.crearRetoPersonalizadoRepo(descripcion, id_usuario);
        res.status(201).json({ message: 'Reto creado y asignado para hoy.', id_reto: resultado.id_reto });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear el reto personalizado.' });
    }
};

async function actualizarProgreso(req, res) {
    const { id } = req.params;
    const { fecha } = req.body;

    try {
        const usuarioActualizado = await retosRepository.actualizarProgresoUsuario(id, fecha);
        
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
        const usuario = await retosRepository.obtenerProgresoPorId(idUsuario);

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
    obtenerRetosDiarios,
    asignarRetos,
    guardarRetos,
    retosRealizados,
    crearRetoPersonalizado,
    actualizarProgreso,
    obtenerProgresoUsuario
};
