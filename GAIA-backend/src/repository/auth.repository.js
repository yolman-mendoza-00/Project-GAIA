const pool = require('../utils/db');

const findUserByEmail = async (email) => {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM usuarios WHERE correo = $1', [email]);
    client.release();
    return result.rows[0];
};

const createUser = async (username, email, hashedPassword) => {
    const client = await pool.connect();
    await client.query(
        'INSERT INTO usuarios (nombre, correo, contraseña) VALUES ($1, $2, $3)',
        [username, email, hashedPassword]
    );
    client.release();
};

// Sin bcrypt aquí: la contraseña llega ya hasheada
async function actualizarUsuario(idUsuario, { nombre, correo, contraseñaHash, fotoBase64 }) {
    const campos = [];
    const valores = [];
    let idx = 1;

    if (nombre) {
        campos.push(`nombre = $${idx++}`);
        valores.push(nombre);
    }
    if (correo) {
        campos.push(`correo = $${idx++}`);
        valores.push(correo);
    }
    if (contraseñaHash) {
        campos.push(`contraseña = $${idx++}`);
        valores.push(contraseñaHash);
    }
    if (fotoBase64) {
        campos.push(`foto = $${idx++}`);
        valores.push(fotoBase64);
    }

    if (campos.length === 0) {
        throw new Error("No se proporcionó ningún campo para actualizar");
    }

    valores.push(idUsuario); // último parámetro

    const query = `
        UPDATE usuarios
        SET ${campos.join(", ")}
        WHERE id_usuario = $${idx}
        RETURNING id_usuario, nombre, correo, foto
    `;
    const { rows } = await pool.query(query, valores);
    return rows[0];
}

const eliminarUsuario = async (idUsuario) => {
    const client = await pool.connect();
    try {
        await client.query('DELETE FROM usuarios WHERE id_usuario = $1', [idUsuario]);
    } finally {
        client.release();
    }
};


module.exports = {
    findUserByEmail,
    createUser,
    actualizarUsuario,
    eliminarUsuario
};
