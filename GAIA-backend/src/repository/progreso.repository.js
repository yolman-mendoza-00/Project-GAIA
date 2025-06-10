const pool = require('../utils/db');

async function actualizarProgresoUsuario(idUsuario, fechaActual) {
    try {
        const fecha = dayjs(fechaActual).subtract(1, 'week');
        const inicioSemana = fecha.day(1).format("YYYY-MM-DD");
        const finSemana = fecha.day(7).format("YYYY-MM-DD");
        
        const countQuery = `
            SELECT COUNT(*) AS total
            FROM usuarios_retos
            WHERE id_usuario = $1
            AND fecha_reto BETWEEN $2 AND $3
        `;

        const countResult = await pool.query(countQuery, [idUsuario, inicioSemana, finSemana]);
        const total = parseInt(countResult.rows[0].total, 10);

        if (total >= 16) {
            const updateQuery = `
                UPDATE usuarios
                SET progreso = LEAST(progreso + 2, 100)
                WHERE id_usuario = $1
                RETURNING id_usuario, progreso
            `;
            const updateResult = await pool.query(updateQuery, [idUsuario]);
            return updateResult.rows[0];
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error al actualizar progreso del usuario:", error);
        throw error;
    }
}

async function obtenerProgresoPorId(idUsuario) {
    const result = await pool.query(
        "SELECT progreso FROM usuarios WHERE id_usuario = $1",
        [idUsuario]
    );
    return result.rows[0]; 
}

module.exports = {
    actualizarProgresoUsuario,
    obtenerProgresoPorId
};