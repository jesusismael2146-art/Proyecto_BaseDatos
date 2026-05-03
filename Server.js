const express = require('express');
const path = require('path');
const { Pool } = require('pg');

const app = express();

// Middleware para que Express pueda leer los datos que vienen del formulario HTML
app.use(express.urlencoded({ extended: true })); 
app.use(express.json());

// 1. Configuración del Pool (Ajustado a tu base de datos final) [cite: 21, 22]
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'observatorio', // Asegúrate que coincida con el nombre en pgAdmin
    password: '12345',         // Tu contraseña real
    port: 5432,
});

app.use(express.static('public'));

// 2. Ruta para ver los hallazgos (Operación READ con JOIN) 
app.get('/bitacora', async (req, res) => {
    try {
        const consulta = `
            SELECT b.id_observacion, b.fecha_observacion, a.nombre_astronomo, 
                   t.nombre_telescopio, c.nombre AS cuerpo_celeste, b.hallazgo
            FROM Bitacora_Observaciones b
            JOIN Astronomos a ON b.id_astronomo = a.id_astronomo
            JOIN Telescopios t ON b.id_telescopio = t.id_telescopio
            JOIN Cuerpos_Celestes c ON b.id_cuerpo = c.id_cuerpo
            ORDER BY b.fecha_observacion DESC;
        `;
        const resultado = await pool.query(consulta);
        res.json(resultado.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error al obtener los datos estelares");
    }
});

// Ruta para insertar (CREATE)
app.post('/guardar-observacion', async (req, res) => {
    const { id_telescopio, id_cuerpo, id_astronomo, hallazgo } = req.body;
    try {
        const consulta = `
            INSERT INTO Bitacora_Observaciones (id_telescopio, id_cuerpo, id_astronomo, hallazgo)
            VALUES ($1, $2, $3, $4) RETURNING *;
        `;
        await pool.query(consulta, [id_telescopio, id_cuerpo, id_astronomo, hallazgo]);
        res.status(200).send("Guardado exitoso"); // Cambiamos esto
    } catch (err) {
        console.error(err);
        res.status(500).send("Error al guardar");
    }
});

app.delete('/eliminar-observacion/:id', async (req, res) => {
    const { id } = req.params; // Obtenemos el ID desde la URL

    try {
        const consulta = 'DELETE FROM Bitacora_Observaciones WHERE id_observacion = $1';
        await pool.query(consulta, [id]); // El "puente" ejecuta el borrado en la BD [cite: 436]
        res.send("Observación eliminada");
    } catch (err) {
        console.error(err);
        res.status(500).send("Error al eliminar el registro");
    }
});

// Ruta para ACTUALIZAR una observación (Operación UPDATE)
app.put('/actualizar-observacion/:id', async (req, res) => {
    const { id } = req.params;
    const { id_astronomo, id_telescopio, id_cuerpo, hallazgo } = req.body;

    try {
        const consulta = `
            UPDATE Bitacora_Observaciones
            SET id_astronomo = $1, id_telescopio = $2, id_cuerpo = $3, hallazgo = $4
            WHERE id_observacion = $5
        `;
        await pool.query(consulta, [id_astronomo, id_telescopio, id_cuerpo, hallazgo, id]);
        res.send("Observación actualizada");
    } catch (err) {
        console.error(err);
        res.status(500).send("Error al actualizar el registro");
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(3000, () => {
    console.log('🚀 Servidor del Observatorio en http://localhost:3000');
});