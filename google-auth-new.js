// Función para manejar la respuesta de Google Sign In
function handleGoogleSignIn(response) {
  try {
    if (!response.credential) {
      throw new Error('No se recibieron las credenciales de Google');
    }

    const credential = response.credential;
    const payload = JSON.parse(atob(credential.split('.')[1]));
    
    if (!payload.name || !payload.email) {
      throw new Error('Información de usuario incompleta');
    }

    const cliente = {
      nombre: payload.name,
      email: payload.email,
      img: payload.picture,
      rol: 'cliente',
      googleId: payload.sub
    };
    
    // Se eliminaron las líneas que almacenaban información en localStorage

    window.location.href = 'DASHBOARDS/dashboard_cliente.html';
  } catch (error) {
    console.error('Error en el inicio de sesión con Google:', error);
    mostrarNotificacion('Error al iniciar sesión con Google. Por favor, intente nuevamente.', 'error');
  }
}

// Configuración de Google Sign In
window.onload = function() {
  // Inicializar Google Sign In
  google.accounts.id.initialize({
    client_id: '628469741880-5f4ovr8vh5597o60u6g9bjvkcjuum4uc.apps.googleusercontent.com',
    callback: handleGoogleSignIn,
    auto_select: false,
    cancel_on_tap_outside: true
  });

  // Configurar el contenedor para el botón de Google
  const googleButton = document.getElementById('login-google');
  if (googleButton) {
    // Limpiar el contenido existente
    googleButton.innerHTML = '';
    
    // Renderizar el botón de Google One Tap
    google.accounts.id.renderButton(
      googleButton,
      { 
        type: 'icon',
        shape: 'circle',
        theme: 'outline',
        size: 'large',
        width: '40',
      }
    );
  }

  // Configurar el botón de Facebook
  const facebookButton = document.getElementById('login-facebook');
  if (facebookButton) {
    facebookButton.onclick = function(e) {
      e.preventDefault();
      mostrarNotificacion('Inicio de sesión con Facebook se implementará próximamente', 'info');
    };
  }
};
