// server.js - Backend sencillo para FoodApp con Express y SQLite

const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
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

// Recuperar contraseña (simulado)
app.post('/api/recuperar', (req, res) => {
  const { email } = req.body;
  db.get('SELECT * FROM usuarios WHERE email = ?', [email], (err, user) => {
    if (err || !user) return res.status(400).json({ error: 'No existe ese usuario' });
    // Aquí deberías enviar un email real con un token, pero solo simulamos
    res.json({ mensaje: 'Enlace de recuperación enviado (simulado)' });
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

app.listen(PORT, () => {
  console.log('Servidor backend escuchando en http://localhost:' + PORT);
});
