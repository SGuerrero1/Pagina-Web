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
    
    window.location.href = 'DASHBOARDS/dashboard_cliente.html';
  } catch (error) {
    console.error('Error en el inicio de sesión con Google:', error);
    mostrarNotificacion('Error al iniciar sesión con Google. Por favor, intente nuevamente.', 'error');
  }
}

window.onload = function() {
  google.accounts.id.initialize({
    client_id: '628469741880-5f4ovr8vh5597o60u6g9bjvkcjuum4uc.apps.googleusercontent.com',
    callback: handleGoogleSignIn
  });

  // Renderizar el botón de Google con el estilo personalizado
  const googleButton = document.getElementById('login-google');
  if (googleButton) {
    const customGoogleButton = google.accounts.id.renderButton(
      googleButton,
      { 
        type: 'icon',
        shape: 'circle',
        theme: 'outline',
        size: 'large'
      }
    );
  }
};
