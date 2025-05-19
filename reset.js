// reset.js - Lógica para cambiar la contraseña

document.getElementById('reset-form').onsubmit = async function(ev) {
  ev.preventDefault();
  const email = document.getElementById('reset-email').value.trim();
  const pass1 = document.getElementById('reset-password').value.trim();
  const pass2 = document.getElementById('reset-password2').value.trim();
  const msg = document.getElementById('reset-msg');
  if (!email || !pass1 || !pass2) {
    msg.style.color = '#e53935';
    msg.textContent = 'Completa todos los campos.';
    return;
  }
  if (pass1 !== pass2) {
    msg.style.color = '#e53935';
    msg.textContent = 'Las contraseñas no coinciden.';
    return;
  }
  // Llamada al backend para cambiar la contraseña
  try {
    const res = await fetch('https://pagina-web-wm0x.onrender.com/api/cambiar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pass1 })
    });
    const data = await res.json();
    if (res.ok) {
      msg.style.color = '#388e3c';
      msg.textContent = 'Contraseña actualizada correctamente. Ahora puedes iniciar sesión.';
      setTimeout(()=>{
        window.location.href = 'index.html';
      }, 1800);
    } else {
      msg.style.color = '#e53935';
      msg.textContent = data.error || 'No se pudo cambiar la contraseña.';
    }
  } catch (err) {
    msg.style.color = '#e53935';
    msg.textContent = 'Error de conexión con el servidor.';
  }
};

document.addEventListener('DOMContentLoaded', function() {
  // Si hay email en la URL, lo pone en el campo y lo bloquea
  const params = new URLSearchParams(window.location.search);
  const email = params.get('email');
  if (email) {
    const input = document.getElementById('reset-email');
    input.value = email;
    input.readOnly = true;
    input.style.background = '#f7f7f7';
  }
});
