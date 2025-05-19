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
    formRegistro.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Obtener los valores del formulario
      const inputs = this.querySelectorAll('input:not([type="checkbox"])');
      const nombre = inputs[0].value;
      const email = inputs[1].value;
      const password = inputs[2].value;
      const confirmPassword = inputs[3].value;
      
      // Validación simple
      if (password !== confirmPassword) {
        alert('Las contraseñas no coinciden');
        return;
      }
      
      // Guardar cliente en array de clientes y en la base de datos
      let clientes = JSON.parse(localStorage.getItem('clientes')) || [];
      // Evitar duplicados por email
      if (!clientes.some(c => c.email === email)) {
        clientes.push({ nombre, email, password, rol: 'cliente' });
        localStorage.setItem('clientes', JSON.stringify(clientes));
        // Guardar en la base de datos
        fetch('https://pagina-web-wm0x.onrender.com/api/usuarios', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nombre, email, password, rol: 'cliente' })
        }).then(async res => {
          if (!res.ok) {
            const data = await res.json();
            alert(data.error || 'Error al registrar el cliente en la base de datos');
          }
        }).catch(() => {
          alert('Error de conexión con el servidor.');
        });
      }
      
      // Aquí podrías agregar código para guardar el usuario
      // Por ahora, solo mostramos un mensaje y lo redirigimos
      alert(`¡Registro exitoso! Bienvenido/a ${nombre} a FoodApp`);
      
      // Redirigir al login o a la página principal
      document.getElementById('registro-cliente').style.display = 'none';
      document.getElementById('register-btn').style.display = 'block';
      
      // Limpiar formulario
      inputs.forEach(input => {
        input.value = '';
      });
      
      // Limpiar el checkbox
      const checkbox = this.querySelector('input[type="checkbox"]');
      if (checkbox) {
        checkbox.checked = false;
      }
      
      // Limpiar el select también
      const select = this.querySelector('select');
      if (select) {
        select.selectedIndex = 0;
      }
    });
  }
});