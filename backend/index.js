require('dotenv').config(); // cargar variables .env
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
app.use(cors());
app.use(express.json());

// Crear pool de conexiones
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Obtener libros paginados desde la base de datos
app.get('/api/libros', async (req, res) => {
  const page = parseInt(req.query.page) || 0;
  const size = parseInt(req.query.size) || 10;
  const offset = page * size;

  try {
    // Obtener libros paginados
    const [rows] = await pool.query(
      `SELECT isbn, name, estatus FROM libros LIMIT ? OFFSET ?`,
      [size, offset]
    );

    // Obtener total de registros
    const [totalResult] = await pool.query(`SELECT COUNT(*) as total FROM libros`);
    const total = totalResult[0].total;

    res.json({
      content: rows,
      total
    });
  } catch (error) {
    console.error('Error al obtener libros:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Insertar libro nuevo
app.post('/api/libros', async (req, res) => {
  const { isbn, name, estatus, id_categoria } = req.body;
  console.log(req.body);

  if (!isbn || !name) {
    return res.status(400).json({ error: 'isbn y name son obligatorios' });
  }

  try {
    // Verificar si ya existe el ISBN
    const [existing] = await pool.query(
      'SELECT * FROM libros WHERE isbn = ?',
      [isbn]
    );

    if (existing.length > 0) {
      return res.status(409).json({ error: 'El ISBN ya existe' });
    }

    // Insertar si no existe
    const [result] = await pool.query(
      `INSERT INTO libros (isbn, name, estatus, id_categoria)
       VALUES (?, ?, ?, ?)`,
      [isbn, name, estatus, id_categoria]
    );

    res.status(201).json({ message: 'Libro insertado', insertId: result.insertId });
  } catch (error) {
    console.error('Error al insertar libro:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

app.put('/api/libros/:isbn', async (req, res) => {
  const { isbn } = req.params;
  const { name, estatus, id_categoria } = req.body;

  if (!name || !estatus) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  try {
    const [result] = await pool.query(
      `UPDATE libros SET name = ?, estatus = ?, id_categoria = ? WHERE isbn = ?`,
      [name, estatus, id_categoria || null, isbn]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Libro no encontrado' });
    }

    res.json({ message: 'Libro actualizado' });
  } catch (error) {
    console.error('Error al actualizar libro:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

app.listen(3000, () => {
  console.log('Servidor Express en http://localhost:3000');
});