document.addEventListener('DOMContentLoaded', function() {
    // Definir usuarios del sistema
    const users = [
        { username: 'admin', password: 'admin123', role: 'admin' },
        { username: 'cliente', password: 'cliente123', role: 'client' },
        { username: 'restaurante', password: 'restaurante123', role: 'restaurant' }
    ];

    // Elementos del DOM
    const loginForm = document.getElementById('login-form');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const errorMessage = document.getElementById('error-message');
    const loginContainer = document.getElementById('login-container');
    const adminDashboard = document.getElementById('admin-dashboard');
    const clientDashboard = document.getElementById('client-dashboard');
    const restaurantDashboard = document.getElementById('restaurant-dashboard');
    const featureModal = document.getElementById('feature-modal');
    const closeButton = document.querySelector('.close-button');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const featureLinks = document.querySelectorAll('.feature-link');
    
    // Botones de cierre de sesión
    const adminLogout = document.getElementById('admin-logout');
    const clientLogout = document.getElementById('client-logout');
    const restaurantLogout = document.getElementById('restaurant-logout');

    // Función para validar el inicio de sesión
    function validateLogin(username, password) {
        return users.find(user => user.username === username && user.password === password);
    }

    // Función para mostrar el dashboard según el rol
    function showDashboard(role) {
        loginContainer.style.display = 'none';
        adminDashboard.style.display = 'none';
        clientDashboard.style.display = 'none';
        restaurantDashboard.style.display = 'none';
        
        switch(role) {
            case 'admin':
                adminDashboard.style.display = 'flex';
                break;
            case 'client':
                clientDashboard.style.display = 'flex';
                break;
            case 'restaurant':
                restaurantDashboard.style.display = 'flex';
                break;
            default:
                loginContainer.style.display = 'flex';
                break;
        }
        // Guardar sesión en localStorage
        localStorage.setItem('userRole', role);
    }

    // Función para cerrar sesión
    function logout() {
        adminDashboard.style.display = 'none';
        clientDashboard.style.display = 'none';
        restaurantDashboard.style.display = 'none';
        loginContainer.style.display = 'flex';
        usernameInput.value = '';
        passwordInput.value = '';
        errorMessage.textContent = '';
        localStorage.removeItem('userRole');
    }

    // Manejar el envío del formulario de inicio de sesión
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = usernameInput.value.trim();
            const password = passwordInput.value;
            
            const user = validateLogin(username, password);
            
            if (user) {
                showDashboard(user.role);
            } else {
                errorMessage.textContent = 'Usuario o contraseña incorrectos. Por favor, inténtalo de nuevo.';
            }
        });
    }

    // Manejar clicks en características no disponibles
    featureLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            featureModal.style.display = 'flex';
        });
    });

    // Cerrar modal
    function closeModal() {
        featureModal.style.display = 'none';
    }

    if (closeButton) closeButton.addEventListener('click', closeModal);
    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
    
    // Cerrar modal al hacer clic fuera de él
    window.addEventListener('click', function(e) {
        if (e.target === featureModal) {
            closeModal();
        }
    });

    // Manejar cierre de sesión
    if (adminLogout) {
        adminLogout.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
    if (clientLogout) {
        clientLogout.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
    if (restaurantLogout) {
        restaurantLogout.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }

    // Al cargar la página, revisar sesión almacenada
    const storedRole = localStorage.getItem('userRole');
    if (storedRole) {
        showDashboard(storedRole);
    }
});

// En páginas donde exista un botón global de logout
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('userRole');
        window.location.href = 'login.html';
    });
}
document.addEventListener('DOMContentLoaded', () => {
  // Verifica si el rol es cliente
  const rol = localStorage.getItem('rol');
  if (rol === 'cliente') {
    const cliente = JSON.parse(localStorage.getItem('clienteRegistrado'));
    if (cliente && cliente.nombre) {
      const userSpan = document.querySelector('.user-info span');
      userSpan.textContent = cliente.nombre;
    }
  }
});
document.addEventListener('DOMContentLoaded', () => {
  const rol = localStorage.getItem('rol');
  if (rol === 'cliente') {
    const cliente = JSON.parse(localStorage.getItem('clienteRegistrado'));
    if (cliente && cliente.nombre) {
      // Cambiar texto en el span de la esquina superior derecha
      const userSpan = document.querySelector('.user-info span');
      if (userSpan) {
        userSpan.textContent = cliente.nombre;
      }

      // Cambiar texto del h1 principal
      const headerTitle = document.querySelector('main header h1');
      if (headerTitle) {
        headerTitle.textContent = `¡Bienvenido, ${cliente.nombre}!`;
      }
    }
  }
});
const searchInput = document.querySelector('.search-bar input');
const foodCards = document.querySelectorAll('.food-card');
const searchError = document.getElementById('search-error');

searchInput.addEventListener('input', () => {
  const filter = searchInput.value.toLowerCase();
  let found = 0;

  foodCards.forEach(card => {
    const title = card.querySelector('h3').textContent.toLowerCase();
    const desc = card.querySelector('p').textContent.toLowerCase();

    if (title.includes(filter) || desc.includes(filter)) {
      card.style.display = '';
      found++;
    } else {
      card.style.display = 'none';
    }
  });

  // Mostrar mensaje si no hay coincidencias
  if (found === 0) {
    searchError.textContent = 'No se encontraron platos que coincidan con la búsqueda.';
  } else {
    searchError.textContent = '';
  }
});

// --- FILTRAR PLATOS VISIBLES PARA CLIENTES Y RESTAURANTES ---
// Sobrescribe localStorage.getItem para ocultar platos con 'oculto' en cliente y restaurante
(function() {
  const originalGetItem = localStorage.getItem;
  localStorage.getItem = function(key) {
    if (key === 'platos') {
      const raw = originalGetItem.call(this, key);
      try {
        const platos = JSON.parse(raw) || [];
        // Si estamos en dashboard_cliente.html o dashboard_restaurante.html, filtrar ocultos
        if (window.location.pathname.includes('dashboard_cliente.html') || window.location.pathname.includes('dashboard_restaurante.html')) {
          return JSON.stringify(platos.filter(p => !p.oculto));
        }
        return raw;
      } catch {
        return raw;
      }
    }
    return originalGetItem.call(this, key);
  };
})();

function mostrarNotificacion(msg, tipo = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.textContent = msg;
  toast.style.padding = '16px 28px';
  toast.style.borderRadius = '10px';
  toast.style.fontSize = '1.08em';
  toast.style.fontWeight = '500';
  toast.style.boxShadow = '0 4px 18px rgba(0,0,0,0.13)';
  toast.style.color = '#fff';
  toast.style.opacity = '0.97';
  toast.style.transition = 'transform 0.2s, opacity 0.2s';
  toast.style.transform = 'translateY(-10px)';
  if (tipo === 'exito' || tipo === 'success') {
    toast.style.background = 'linear-gradient(90deg,#43e97b 0,#38f9d7 100%)';
  } else if (tipo === 'error') {
    toast.style.background = 'linear-gradient(90deg,#e53935 0,#ff6e40 100%)';
  } else {
    toast.style.background = 'linear-gradient(90deg,#ff9800 0,#ffb347 100%)';
  }
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-30px)';
    setTimeout(() => toast.remove(), 400);
  }, 2200);
}

