// Usuarios predefinidos admin y restaurante
const usuariosFijos = [
  {
    email: 'admin',
    password: 'admin123',
    rol: 'admin'
  },
  {
    email: 'restaurante',
    password: 'rest123',
    rol: 'restaurante'
  }
];

// Registro solo cliente
document.getElementById('form-registro').addEventListener('submit', function(e) {
  e.preventDefault();

  const inputs = this.querySelectorAll('input, select');
  const nombre = inputs[0].value.trim();
  const email = inputs[1].value.trim();
  const password = inputs[2].value.trim();
  const confirmPassword = inputs[3].value.trim();

  if (password !== confirmPassword) {
    alert('Las contraseñas no coinciden.');
    return;
  }

  const nuevoCliente = {
    nombre,
    email,
    password,
    rol: 'cliente'
  };

  // Guardar en array de clientes (no sobrescribir)
  let clientes = JSON.parse(localStorage.getItem('clientes')) || [];
  if (!clientes.some(c => c.email === email)) {
    clientes.push(nuevoCliente);
    localStorage.setItem('clientes', JSON.stringify(clientes));
  }
  // Guardamos cliente en localStorage bajo clave "clienteRegistrado" (para compatibilidad)
  localStorage.setItem('clienteRegistrado', JSON.stringify(nuevoCliente));
  alert('Registro exitoso. Ahora puedes iniciar sesión.');

  this.reset();
});

// Login validando todos los roles
// --- MODIFICADO: permite login de admins y restaurantes creados desde configuración ---
document.getElementById('login-form').addEventListener('submit', function(e) {
  e.preventDefault();

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  const errorDiv = document.getElementById('login-error');

  // Obtén cliente guardado (si existe)
  const clienteGuardado = JSON.parse(localStorage.getItem('clienteRegistrado'));

  // Buscar usuario en usuarios fijos
  let usuarioEncontrado = usuariosFijos.find(
    u => u.email === username && u.password === password
  );

  // Si no está en fijos, busca en cliente registrado
  if (!usuarioEncontrado && clienteGuardado) {
    if (clienteGuardado.email === username && clienteGuardado.password === password) {
      usuarioEncontrado = clienteGuardado;
    }
  }

  // --- NUEVO: buscar en admins y restaurantes creados desde configuración ---
  if (!usuarioEncontrado) {
    const admins = JSON.parse(localStorage.getItem('admins')) || [];
    const restaurantes = JSON.parse(localStorage.getItem('restaurantes')) || [];
    const adminEncontrado = admins.find(a => a.email === username && a.password === password);
    const restEncontrado = restaurantes.find(r => r.email === username && r.password === password);
    if (adminEncontrado) {
      usuarioEncontrado = { ...adminEncontrado, rol: 'admin' };
    } else if (restEncontrado) {
      usuarioEncontrado = { ...restEncontrado, rol: 'restaurante' };
    }
  }

  if (!usuarioEncontrado) {
    errorDiv.textContent = 'Usuario o contraseña incorrectos.';
    return;
  }

  // Guardar rol para mantener sesión
  localStorage.setItem('rol', usuarioEncontrado.rol);
  localStorage.setItem('userRole', usuarioEncontrado.rol === 'restaurante' ? 'restaurant' : usuarioEncontrado.rol);

  // Redirigir según rol
  switch (usuarioEncontrado.rol) {
    case 'admin':
      window.location.href = 'DASHBOARDS/dashboard_admin.html';
      break;
    case 'restaurante':
      window.location.href = 'DASHBOARDS/dashboard_restaurante.html';
      break;
    case 'cliente':
      window.location.href = 'DASHBOARDS/dashboard_cliente.html';
      break;
    default:
      errorDiv.textContent = 'Rol no válido.';
  }
});