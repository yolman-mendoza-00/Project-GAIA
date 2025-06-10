const pool = require('../utils/db');
const dayjs = require('dayjs')
const ahora = dayjs();

const getRetosDiarios = async (id_usuario, fecha) => {
    const client = await pool.connect();
    const result = await client.query(
            `SELECT r.id_reto, r.descripcion, c.nombre AS categoria, c.emoji, rdu.completado
            FROM retos_diarios_usuario rdu
            JOIN retos r ON rdu.id_reto = r.id_reto
            JOIN categorias c ON r.id_categoria = c.id_categoria
            WHERE rdu.id_usuario = $1 AND rdu.fecha = $2`,
            [id_usuario, fecha]
    );
    client.release();
    return result.rows;
};

const checkRetosAsignados = async (id_usuario, fecha) => {
    const client = await pool.connect();
    const result = await client.query(
        `SELECT 1 FROM retos_diarios_usuario WHERE id_usuario = $1 AND fecha = $2 LIMIT 1`,
        [id_usuario, fecha]
    );
    client.release();
    return result.rowCount > 0;
};

const asignarRetosAleatorios = async (id_usuario, fecha) => {
    const client = await pool.connect();

    const randomRetos = await client.query(`SELECT id_reto FROM retos WHERE id_usuario IS NULL ORDER BY RANDOM() LIMIT 8`);
    for (const row of randomRetos.rows) {
        await client.query(
            `INSERT INTO retos_diarios_usuario (id_usuario, id_reto, fecha) VALUES ($1, $2, $3)`,
            [id_usuario, row.id_reto, fecha]
        );
    }

    const result = await client.query(
            `SELECT r.id_reto, r.descripcion, c.nombre AS categoria, c.emoji
            FROM retos_diarios_usuario rdu
            JOIN retos r ON rdu.id_reto = r.id_reto
            JOIN categorias c ON r.id_categoria = c.id_categoria
            WHERE rdu.id_usuario = $1 AND rdu.fecha = $2`,
            [id_usuario, fecha]
    );

    client.release();
    return result.rows;
};

const guardarRetosCompletados = async (registros) => {
    const client = await pool.connect();

    for (const registro of registros) {
        const { id_usuario, id_reto, fecha, completado } = registro;

        await client.query(
                `INSERT INTO retos_diarios_usuario (id_usuario, id_reto, fecha, completado)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (id_usuario, id_reto, fecha)
                DO UPDATE SET completado = EXCLUDED.completado`,
                [id_usuario, id_reto, fecha, completado]
        );

        if (completado) {
            await client.query(
                    `INSERT INTO usuarios_retos (id_usuario, id_reto, fecha_reto)
                    VALUES ($1, $2, $3)
                    ON CONFLICT (id_usuario, id_reto, fecha_reto) DO NOTHING`,
                    [id_usuario, id_reto, fecha]
            );
        }
    }

    client.release();
};

const getRetosRealizados = async (usuario, fecha) => {
    const client = await pool.connect();
    const result = await client.query(
            `SELECT r.descripcion, c.emoji
            FROM usuarios_retos ur
            JOIN retos r ON ur.id_reto = r.id_reto
            JOIN categorias c ON r.id_categoria = c.id_categoria
            WHERE ur.id_usuario = $1 AND ur.fecha_reto = $2`,
            [usuario, fecha]
    );
    client.release();
    return result.rows;
};

const crearRetoPersonalizadoRepo = async (descripcion, id_usuario) => {
    const client = await pool.connect();

    try {
        const id_categoria_fija = 6;
        const fecha = ahora.format("YYYY-MM-DD");//new Date().toLocaleDateString('es-CO');

        // Insertar reto personalizado
        const insertReto = await client.query(
            `INSERT INTO retos (descripcion, id_categoria, 
            id_usuario) VALUES ($1, $2, $3) RETURNING id_reto`,
            [descripcion, id_categoria_fija, id_usuario]
        );

        const id_reto = insertReto.rows[0].id_reto;

        // Asignar reto diario
        await client.query(
            `INSERT INTO retos_diarios_usuario 
            (id_usuario, id_reto, fecha, completado) 
            VALUES ($1, $2, $3, false)`,

            [id_usuario, id_reto, fecha]
        );

        return { id_reto };
    } finally {
        client.release();
    }
};

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
    getRetosDiarios,
    checkRetosAsignados,
    asignarRetosAleatorios,
    guardarRetosCompletados,
    getRetosRealizados,
    crearRetoPersonalizadoRepo,
    actualizarProgresoUsuario,
    obtenerProgresoPorId

};
