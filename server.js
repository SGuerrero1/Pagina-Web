// server.js - Backend sencillo para FoodApp con Express y SQLite

const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
require('dotenv').config();
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Inicializar base de datos SQLite
const db = new sqlite3.Database('./foodapp.db', (err) => {
  if (err) throw err;
  console.log('Conectado a SQLite');
});

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT,
    email TEXT UNIQUE,
    password TEXT,
    rol TEXT
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS platos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT,
    precio REAL,
    oculto INTEGER DEFAULT 0
  )`);
  // Nueva tabla restaurantes
  db.run(`CREATE TABLE IF NOT EXISTS restaurantes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT,
    direccion TEXT,
    calificacion REAL,
    fecha_registro TEXT
  )`);
  // Nueva tabla pedidos
  db.run(`CREATE TABLE IF NOT EXISTS pedidos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER,
    restaurante_id INTEGER,
    fecha TEXT,
    total REAL
  )`);

  // --- USUARIOS POR DEFECTO ---
  // Admin
  db.get('SELECT * FROM usuarios WHERE email = ?', ['admin@foodapp.com'], async (err, row) => {
    if (!row) {
      const hash = await bcrypt.hash('admin123', 10);
      db.run('INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)', ['Administrador', 'admin@foodapp.com', hash, 'admin']);
    }
  });
  // Restaurante
  db.get('SELECT * FROM usuarios WHERE email = ?', ['restaurante@foodapp.com'], async (err, row) => {
    if (!row) {
      const hash = await bcrypt.hash('rest123', 10);
      db.run('INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)', ['Restaurante Demo', 'restaurante@foodapp.com', hash, 'restaurante']);
    }
  });
});

// Configura aquí tus credenciales de correo (reemplaza por variables de entorno en producción)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Registro de usuario
app.post('/api/usuarios', async (req, res) => {
  const { nombre, email, password, rol } = req.body;
  if (!nombre || !email || !password || !rol) return res.status(400).json({ error: 'Faltan datos' });
  const hash = await bcrypt.hash(password, 10);
  db.run('INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)', [nombre, email, hash, rol], function(err) {
    if (err) return res.status(400).json({ error: 'Email ya registrado' });
    res.json({ id: this.lastID, nombre, email, rol });
  });
});

// Login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  db.get('SELECT * FROM usuarios WHERE email = ?', [email], async (err, user) => {
    if (err || !user) return res.status(400).json({ error: 'Usuario o contraseña incorrectos' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: 'Usuario o contraseña incorrectos' });
    res.json({ id: user.id, nombre: user.nombre, email: user.email, rol: user.rol });
  });
});

// Recuperar contraseña (envía correo real)
app.post('/api/recuperar', (req, res) => {
  const { email } = req.body;
  db.get('SELECT * FROM usuarios WHERE email = ?', [email], (err, user) => {
    if (err || !user) return res.status(400).json({ error: 'No existe ese usuario' });
    // Enlace de recuperación (puedes agregar un token seguro si lo deseas)
    const resetUrl = `https://pagina-web-wm0x.onrender.com/reset.html?email=${encodeURIComponent(email)}`;
    const mailOptions = {
      from: `FoodApp <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Recuperación de contraseña - FoodApp',
      html: `<p>Hola ${user.nombre},</p><p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>Si no solicitaste este cambio, ignora este correo.</p>`
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ error: 'No se pudo enviar el correo. Intenta más tarde.' });
      }
      res.json({ mensaje: 'Enlace de recuperación enviado a tu correo.' });
    });
  });
});

// Cambiar contraseña
app.post('/api/cambiar', async (req, res) => {
  const { email, password } = req.body;
  const hash = await bcrypt.hash(password, 10);
  db.run('UPDATE usuarios SET password = ? WHERE email = ?', [hash, email], function(err) {
    if (err || this.changes === 0) return res.status(400).json({ error: 'No se pudo cambiar la contraseña' });
    res.json({ mensaje: 'Contraseña actualizada' });
  });
});

// CRUD de platos
app.get('/api/platos', (req, res) => {
  db.all('SELECT * FROM platos', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Error al obtener platos' });
    res.json(rows);
  });
});
app.post('/api/platos', (req, res) => {
  const { nombre, precio } = req.body;
  db.run('INSERT INTO platos (nombre, precio) VALUES (?, ?)', [nombre, precio], function(err) {
    if (err) return res.status(400).json({ error: 'Error al crear plato' });
    res.json({ id: this.lastID, nombre, precio });
  });
});
app.put('/api/platos/:id', (req, res) => {
  const { nombre, precio, oculto } = req.body;
  db.run('UPDATE platos SET nombre = ?, precio = ?, oculto = ? WHERE id = ?', [nombre, precio, oculto, req.params.id], function(err) {
    if (err || this.changes === 0) return res.status(400).json({ error: 'No se pudo actualizar' });
    res.json({ mensaje: 'Plato actualizado' });
  });
});
app.delete('/api/platos/:id', (req, res) => {
  db.run('DELETE FROM platos WHERE id = ?', [req.params.id], function(err) {
    if (err || this.changes === 0) return res.status(400).json({ error: 'No se pudo eliminar' });
    res.json({ mensaje: 'Plato eliminado' });
  });
});

// ENDPOINTS PARA DASHBOARD ADMIN
// Usuarios activos (cuenta usuarios con rol 'cliente')
app.get('/api/usuarios/activos', (req, res) => {
  db.get('SELECT COUNT(*) as total FROM usuarios WHERE rol = "cliente"', (err, row) => {
    if (err) return res.status(500).json({ error: 'Error al obtener usuarios activos' });
    res.json({ total: row.total });
  });
});
// Platos disponibles (no ocultos)
app.get('/api/platos/disponibles', (req, res) => {
  db.get('SELECT COUNT(*) as total FROM platos WHERE oculto = 0', (err, row) => {
    if (err) return res.status(500).json({ error: 'Error al obtener platos' });
    res.json({ total: row.total });
  });
});
// Pedidos de hoy
app.get('/api/pedidos/hoy', (req, res) => {
  const hoy = new Date().toISOString().slice(0, 10);
  db.get('SELECT COUNT(*) as total FROM pedidos WHERE fecha = ?', [hoy], (err, row) => {
    if (err) return res.status(500).json({ error: 'Error al obtener pedidos' });
    res.json({ total: row.total });
  });
});
// Últimos usuarios registrados (5 más recientes)
app.get('/api/usuarios/ultimos', (req, res) => {
  db.all('SELECT nombre, email, rowid as id FROM usuarios ORDER BY id DESC LIMIT 5', (err, rows) => {
    if (err) return res.status(500).json({ error: 'Error al obtener usuarios' });
    res.json(rows);
  });
});
// Restaurantes recientes (5 más recientes)
app.get('/api/restaurantes/recientes', (req, res) => {
  db.all('SELECT nombre, calificacion, rowid as id FROM restaurantes ORDER BY id DESC LIMIT 5', (err, rows) => {
    if (err) return res.status(500).json({ error: 'Error al obtener restaurantes' });
    res.json(rows);
  });
});

app.listen(PORT, () => {
  console.log('Servidor backend escuchando en ' + (process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`));
});
