// registro.js - Maneja el formulario de registro
document.addEventListener('DOMContentLoaded', function() {
  // Manejar el clic en el botón de registro
  document.getElementById('register-btn').addEventListener('click', function(e) {
    e.preventDefault();
    const formRegistro = document.getElementById('registro-cliente');
    if (formRegistro.style.display === 'none' || formRegistro.style.display === '') {
      formRegistro.style.display = 'block';
      this.style.display = 'none';
    }
  });

  // Manejar el envío del formulario de registro (si existe)
  const formRegistro = document.getElementById('form-registro');
  if (formRegistro) {
    let enviando = false;
    formRegistro.addEventListener('submit', async function(e) {
      e.preventDefault();
      if (enviando) return;
      enviando = true;
      const submitBtn = this.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;
      // Obtener los valores del formulario
      const inputs = this.querySelectorAll('input:not([type="checkbox"])');
      const nombre = inputs[0].value;
      const email = inputs[1].value;
      const password = inputs[2].value;
      const confirmPassword = inputs[3].value;
      // Validación simple
      if (password !== confirmPassword) {
        mostrarNotificacion('Las contraseñas no coinciden', 'error');
        if (submitBtn) submitBtn.disabled = false;
        enviando = false;
        return;
      }
      // Evitar duplicados por email en local
      try {
        const res = await fetch('https://pagina-web-wm0x.onrender.com/api/usuarios', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nombre, email, password, rol: 'cliente' })
        });
        if (!res.ok) {
          const data = await res.json();
          mostrarNotificacion(data.error || 'Error al registrar el cliente en la base de datos', 'error');
          if (submitBtn) submitBtn.disabled = false;
          enviando = false;
          return;
        }
        mostrarNotificacion(`¡Registro exitoso! Bienvenido/a ${nombre} a FoodApp`, 'exito');
        document.getElementById('registro-cliente').style.display = 'none';
        document.getElementById('register-btn').style.display = 'block';
        // Limpiar formulario
        inputs.forEach(input => { input.value = ''; });
        const checkbox = formRegistro.querySelector('input[type="checkbox"]');
        if (checkbox) checkbox.checked = false;
        const select = formRegistro.querySelector('select');
        if (select) select.selectedIndex = 0;
      } catch {
        mostrarNotificacion('Error de conexión con el servidor.', 'error');
      }
      if (submitBtn) submitBtn.disabled = false;
      enviando = false;
    });
  }
});