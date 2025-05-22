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
document.getElementById('form-registro').addEventListener('submit', async function(e) {
  e.preventDefault();

  const inputs = this.querySelectorAll('input, select');
  const nombre = inputs[0].value.trim();
  const email = inputs[1].value.trim();
  const password = inputs[2].value.trim();
  const confirmPassword = inputs[3].value.trim();
  const rol = 'cliente';

  if (password !== confirmPassword) {
    mostrarNotificacion('Las contraseñas no coinciden.', 'error');
    return;
  }

  try {
    const res = await fetch('https://pagina-web-wm0x.onrender.com/api/usuarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, email, password, rol })
    });
    const data = await res.json();
    if (res.ok) {
      mostrarNotificacion('Registro exitoso. Ahora puedes iniciar sesión.', 'exito');
      this.reset();
    } else {
      mostrarNotificacion(data.error || 'Error al registrar usuario.', 'error');
    }
  } catch (err) {
    mostrarNotificacion('Error de conexión con el servidor.', 'error');
  }
});

// Login validando todos los roles
// --- MODIFICADO: permite login de admins y restaurantes creados desde configuración ---
document.getElementById('login-form').addEventListener('submit', async function(e) {
  e.preventDefault();

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  const errorDiv = document.getElementById('login-error');

  try {
    const res = await fetch('https://pagina-web-wm0x.onrender.com/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: username, password })
    });
    const data = await res.json();
    if (res.ok) {
      // Guardar rol para mantener sesión (puedes usar localStorage o sessionStorage solo para el rol)
      localStorage.setItem('rol', data.rol);
      localStorage.setItem('userRole', data.rol === 'restaurante' ? 'restaurant' : data.rol);
      // Redirigir según rol
      switch (data.rol) {
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
    } else {
      errorDiv.textContent = data.error || 'Usuario o contraseña incorrectos.';
    }
  } catch (err) {
    errorDiv.textContent = 'Error de conexión con el servidor.';
  }
});

// --- OLVIDÉ MI CONTRASEÑA ---
document.getElementById('forgot-password-link').onclick = function(e) {
  e.preventDefault();
  document.getElementById('forgot-password-modal').style.display = 'flex';
  document.getElementById('forgot-msg').textContent = '';
  document.getElementById('forgot-form').reset();
};
document.getElementById('close-forgot-modal').onclick = function() {
  document.getElementById('forgot-password-modal').style.display = 'none';
};
document.getElementById('forgot-password-modal').onclick = function(e) {
  if (e.target === this) this.style.display = 'none';
};
document.getElementById('forgot-form').onsubmit = async function(ev) {
  ev.preventDefault();
  const email = document.getElementById('forgot-email').value.trim();
  const msg = document.getElementById('forgot-msg');
  try {
    const res = await fetch('https://pagina-web-wm0x.onrender.com/api/recuperar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    if (res.ok) {
      msg.style.color = '#388e3c';
      msg.innerHTML = 'Se ha enviado un enlace de recuperación a tu correo (simulado). <br><a href="reset.html?email='+encodeURIComponent(email)+'" target="_blank" style="color:#ff5722;text-decoration:underline;">Cambiar contraseña</a>';
    } else {
      msg.style.color = '#e53935';
      msg.textContent = data.error || 'No se encontró ninguna cuenta con ese correo.';
    }
  } catch (err) {
    msg.style.color = '#e53935';
    msg.textContent = 'Error de conexión con el servidor.';
  }
};