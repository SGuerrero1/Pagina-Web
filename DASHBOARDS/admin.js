document.addEventListener('DOMContentLoaded', function() {
  // --- DASHBOARD: DATOS EN VIVO DESDE LA BASE DE DATOS ---
  // Usuarios activos
  fetch('https://pagina-web-wm0x.onrender.com/api/usuarios/activos')
    .then(r => r.json())
    .then(data => {
      const span = document.getElementById('usuarios-activos');
      if (span && data.total !== undefined) span.textContent = data.total;
    });
  // Platos disponibles
  fetch('https://pagina-web-wm0x.onrender.com/api/platos/disponibles')
    .then(r => r.json())
    .then(data => {
      const span = document.getElementById('platos-disponibles');
      if (span && data.total !== undefined) span.textContent = data.total;
    });
  // Pedidos de hoy
  fetch('https://pagina-web-wm0x.onrender.com/api/pedidos/hoy')
    .then(r => r.json())
    .then(data => {
      const span = document.getElementById('pedidos-hoy');
      if (span && data.total !== undefined) span.textContent = data.total;
    });
  // Últimos usuarios registrados
  fetch('https://pagina-web-wm0x.onrender.com/api/usuarios/ultimos')
    .then(r => r.json())
    .then(usuarios => {
      const tbody = document.querySelector('#tabla-ultimos-usuarios tbody');
      if (tbody) {
        tbody.innerHTML = usuarios.map(u => `<tr><td>${u.nombre}</td><td>${u.email}</td><td>${u.id}</td></tr>`).join('');
      }
    });
  // Restaurantes recientes
  fetch('https://pagina-web-wm0x.onrender.com/api/restaurantes/recientes')
    .then(r => r.json())
    .then(rests => {
      const tbody = document.querySelector('#tabla-restaurantes-recientes tbody');
      if (tbody) {
        tbody.innerHTML = rests.map(r => `<tr><td>${r.nombre}</td><td>-</td><td>${r.calificacion ?? '-'}</td></tr>`).join('');
      }
    });

  // Mostrar cantidad de usuarios en la tarjeta
  function actualizarContadorUsuarios() {
    const usuariosCard = document.querySelector('.dashboard-cards .card-info h3');
    const usuariosCantidad = document.querySelector('.dashboard-cards .card-info p');
    let cantidad = 1; // Admin siempre existe
    let clientes = JSON.parse(localStorage.getItem('clientes')) || [];
    let admins = JSON.parse(localStorage.getItem('admins')) || [];
    let restaurantes = JSON.parse(localStorage.getItem('restaurantes')) || [];
    cantidad += clientes.length + admins.length + restaurantes.length;
    if (usuariosCard && usuariosCard.textContent.includes('Usuarios')) {
      usuariosCantidad.textContent = cantidad + (cantidad === 1 ? ' usuario activo' : ' usuarios activos');
    }
  }
  actualizarContadorUsuarios();

  // Mostrar cantidad de platos en la tarjeta (solo los no ocultos)
  const platosCantidadSpan = document.getElementById('platos-disponibles');
  if (platosCantidadSpan) {
    const platos = (JSON.parse(localStorage.getItem('platos')) || []).filter(p => !p.oculto);
    platosCantidadSpan.textContent = platos.length;
  }

  // --- MODAL DE USUARIOS REGISTRADOS ---
  const usuariosMenu = document.querySelector('.menu li a i.fas.fa-users')?.parentElement;
  if (usuariosMenu) {
    usuariosMenu.addEventListener('click', function(e) {
      e.preventDefault();
      mostrarModalUsuarios();
    });
  }

  function mostrarModalUsuarios() {
    // Crear modal
    let modal = document.getElementById('usuarios-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'usuarios-modal';
      modal.style.position = 'fixed';
      modal.style.top = 0;
      modal.style.left = 0;
      modal.style.width = '100vw';
      modal.style.height = '100vh';
      modal.style.background = 'rgba(0,0,0,0.4)';
      modal.style.display = 'flex';
      modal.style.alignItems = 'center';
      modal.style.justifyContent = 'center';
      modal.style.zIndex = 10000;
      document.body.appendChild(modal);
    }
    // Obtener usuarios
    let usuarios = [
      { nombre: 'Admin', email: 'admin', rol: 'admin' }
    ];
    let admins = JSON.parse(localStorage.getItem('admins')) || [];
    let clientes = JSON.parse(localStorage.getItem('clientes')) || [];
    let restaurantes = JSON.parse(localStorage.getItem('restaurantes')) || [];
    usuarios = usuarios.concat(
      admins.map(a => ({ nombre: a.nombre, email: a.email, rol: 'admin' })),
      clientes.map(c => ({ nombre: c.nombre, email: c.email, rol: 'cliente' })),
      restaurantes.map(r => ({ nombre: r.nombre, email: r.email, rol: 'restaurante' }))
    );
    // Modal HTML
    modal.innerHTML = `
      <div style="background:#fff;padding:32px 24px 24px 24px;border-radius:16px;min-width:340px;max-width:98vw;max-height:92vh;overflow:auto;position:relative;box-shadow:0 8px 32px rgba(0,0,0,0.18);">
        <h2 style="margin-bottom:18px;text-align:center;">Usuarios Registrados</h2>
        <button id="close-usuarios-modal" style="position:absolute;top:12px;right:12px;font-size:22px;background:none;border:none;cursor:pointer;">&times;</button>
        <table style="width:100%;border-collapse:collapse;">
          <thead>
            <tr style="background:#fff7f0;">
              <th style="padding:10px 8px;text-align:left;">Nombre</th>
              <th style="padding:10px 8px;text-align:left;">Correo</th>
              <th style="padding:10px 8px;text-align:left;">Rol</th>
            </tr>
          </thead>
          <tbody>
            ${usuarios.map(u => `
              <tr>
                <td style="padding:8px 8px;">${u.nombre}</td>
                <td style="padding:8px 8px;">${u.email}</td>
                <td style="padding:8px 8px;">${u.rol}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
    modal.querySelector('#close-usuarios-modal').onclick = () => modal.remove();
    modal.onclick = function(e) { if (e.target === modal) modal.remove(); };
  }

  // --- ACTUALIZACIÓN PROGRESIVA DE USUARIOS ---
  window.addEventListener('storage', function(e) {
    if (["clientes", "admins", "restaurantes"].includes(e.key)) {
      actualizarContadorUsuarios();
      // Si el modal de usuarios está abierto, refrescarlo
      if (document.getElementById('usuarios-modal')) {
        mostrarModalUsuarios();
      }
    }
  });

  // Si se agregan usuarios desde este mismo tab, también refrescar
  const originalSetItem = localStorage.setItem;
  localStorage.setItem = function(key, value) {
    originalSetItem.apply(this, arguments);
    if (["clientes", "admins", "restaurantes"].includes(key)) {
      actualizarContadorUsuarios();
      if (document.getElementById('usuarios-modal')) {
        mostrarModalUsuarios();
      }
    }
  };

  // --- MODAL DE PLATOS DISPONIBLES ---
  const platosMenu = document.querySelector('.menu li a i.fas.fa-hamburger')?.parentElement;
  if (platosMenu) {
    platosMenu.addEventListener('click', function(e) {
      e.preventDefault();
      mostrarModalPlatos();
    });
  }

  function mostrarModalPlatos() {
    let modal = document.getElementById('platos-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'platos-modal';
      modal.style.position = 'fixed';
      modal.style.top = 0;
      modal.style.left = 0;
      modal.style.width = '100vw';
      modal.style.height = '100vh';
      modal.style.background = 'rgba(0,0,0,0.4)';
      modal.style.display = 'flex';
      modal.style.alignItems = 'center';
      modal.style.justifyContent = 'center';
      modal.style.zIndex = 10000;
      document.body.appendChild(modal);
    }
    let platos = JSON.parse(localStorage.getItem('platos')) || [];
    modal.innerHTML = `
      <div style="background:#fff;padding:32px 24px 24px 24px;border-radius:16px;min-width:340px;max-width:98vw;max-height:92vh;overflow:auto;position:relative;box-shadow:0 8px 32px rgba(0,0,0,0.18);">
        <h2 style="margin-bottom:18px;text-align:center;">Platos Disponibles</h2>
        <button id="close-platos-modal" style="position:absolute;top:12px;right:12px;font-size:22px;background:none;border:none;cursor:pointer;">&times;</button>
        <table style="width:100%;border-collapse:collapse;">
          <thead>
            <tr style="background:#fff7f0;">
              <th style="padding:10px 8px;text-align:left;">Nombre</th>
              <th style="padding:10px 8px;text-align:left;">Precio</th>
              <th style="padding:10px 8px;text-align:left;">Estado</th>
              <th style="padding:10px 8px;text-align:left;">Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${platos.map((p, idx) => `
              <tr data-idx="${idx}">
                <td style="padding:8px 8px;">${p.nombre}</td>
                <td style="padding:8px 8px;">${p.precio}</td>
                <td style="padding:8px 8px;">${p.oculto ? '<span style=\'color:#888\'>Oculto</span>' : 'Visible'}</td>
                <td style="padding:8px 8px;">
                  <button class="editar-plato" style="margin-right:6px;background:#ff9800;color:#fff;border:none;padding:5px 10px;border-radius:5px;cursor:pointer;">Editar</button>
                  <button class="eliminar-plato" style="margin-right:6px;background:#e53935;color:#fff;border:none;padding:5px 10px;border-radius:5px;cursor:pointer;">Eliminar</button>
                  <button class="ocultar-plato" style="background:#607d8b;color:#fff;border:none;padding:5px 10px;border-radius:5px;cursor:pointer;">${p.oculto ? 'Mostrar' : 'Ocultar'}</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
    modal.querySelector('#close-platos-modal').onclick = () => modal.remove();
    modal.onclick = function(e) { if (e.target === modal) modal.remove(); };

    // Acciones de los botones
    modal.querySelectorAll('.editar-plato').forEach(btn => {
      btn.onclick = function() {
        const idx = this.closest('tr').dataset.idx;
        editarPlato(idx);
      };
    });
    modal.querySelectorAll('.eliminar-plato').forEach(btn => {
      btn.onclick = function() {
        const idx = this.closest('tr').dataset.idx;
        eliminarPlato(idx);
      };
    });
    modal.querySelectorAll('.ocultar-plato').forEach(btn => {
      btn.onclick = function() {
        const idx = this.closest('tr').dataset.idx;
        ocultarPlato(idx);
      };
    });
  }

  function editarPlato(idx) {
    let platos = JSON.parse(localStorage.getItem('platos')) || [];
    const plato = platos[idx];
    const nuevoNombre = prompt('Editar nombre del plato:', plato.nombre);
    if (nuevoNombre !== null && nuevoNombre.trim() !== '') {
      plato.nombre = nuevoNombre.trim();
    }
    const nuevoPrecio = prompt('Editar precio del plato:', plato.precio);
    if (nuevoPrecio !== null && nuevoPrecio.trim() !== '') {
      plato.precio = nuevoPrecio.trim();
    }
    localStorage.setItem('platos', JSON.stringify(platos));
    mostrarModalPlatos();
  }

  function eliminarPlato(idx) {
    let platos = JSON.parse(localStorage.getItem('platos')) || [];
    if (confirm('¿Seguro que deseas eliminar este plato?')) {
      platos.splice(idx, 1);
      localStorage.setItem('platos', JSON.stringify(platos));
      mostrarModalPlatos();
    }
  }

  function ocultarPlato(idx) {
    let platos = JSON.parse(localStorage.getItem('platos')) || [];
    platos[idx].oculto = !platos[idx].oculto;
    localStorage.setItem('platos', JSON.stringify(platos));
    mostrarModalPlatos();
  }

  // --- MODAL DE ESTADÍSTICAS DE CLIENTES ---
  const estadisticasMenu = document.querySelector('.menu li a i.fas.fa-chart-bar')?.parentElement;
  if (estadisticasMenu) {
    estadisticasMenu.addEventListener('click', function(e) {
      e.preventDefault();
      mostrarModalEstadisticas();
    });
  }

  function mostrarModalEstadisticas() {
    let modal = document.getElementById('estadisticas-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'estadisticas-modal';
      modal.style.position = 'fixed';
      modal.style.top = 0;
      modal.style.left = 0;
      modal.style.width = '100vw';
      modal.style.height = '100vh';
      modal.style.background = 'rgba(0,0,0,0.4)';
      modal.style.display = 'flex';
      modal.style.alignItems = 'center';
      modal.style.justifyContent = 'center';
      modal.style.zIndex = 10000;
      document.body.appendChild(modal);
    }
    // Obtener todos los usuarios registrados
    let clientes = JSON.parse(localStorage.getItem('clientes')) || [];
    let admins = JSON.parse(localStorage.getItem('admins')) || [];
    let restaurantes = JSON.parse(localStorage.getItem('restaurantes')) || [];
    let usuarios = [];
    usuarios = usuarios.concat(
      [{ nombre: 'Admin', email: 'admin', rol: 'admin', password: 'admin' }],
      admins.map(a => ({ nombre: a.nombre, email: a.email, rol: 'admin', password: a.password })),
      clientes.map(c => ({ nombre: c.nombre, email: c.email, rol: 'cliente', password: c.password })),
      restaurantes.map(r => ({ nombre: r.nombre, email: r.email, rol: 'restaurante', password: r.password }))
    );
    // Obtener ubicaciones de cada cliente
    let ubicaciones = [];
    clientes.forEach(c => {
      const userKey = c.email;
      const ubic = localStorage.getItem('ubicacionCliente_' + userKey);
      if (ubic) ubicaciones.push({ email: c.email, nombre: c.nombre, ubicacion: JSON.parse(ubic) });
    });
    modal.innerHTML = `
      <div style="background:#fff;padding:32px 24px 24px 24px;border-radius:16px;min-width:340px;max-width:98vw;max-height:92vh;overflow:auto;position:relative;box-shadow:0 8px 32px rgba(0,0,0,0.18);">
        <h2 style="margin-bottom:18px;text-align:center;">Estadísticas de Usuarios</h2>
        <button id="close-estadisticas-modal" style="position:absolute;top:12px;right:12px;font-size:22px;background:none;border:none;cursor:pointer;">&times;</button>
        <div style="margin-bottom:18px;font-size:1.1em;">Usuarios registrados: <b>${usuarios.length}</b></div>
        <table style="width:100%;border-collapse:collapse;">
          <thead>
            <tr style="background:#fff7f0;">
              <th style="padding:10px 8px;text-align:left;">Nombre</th>
              <th style="padding:10px 8px;text-align:left;">Correo</th>
              <th style="padding:10px 8px;text-align:left;">Rol</th>
              <th style="padding:10px 8px;text-align:left;">Contraseña</th>
              <th style="padding:10px 8px;text-align:left;">Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${usuarios.map((u, idx) => {
              const ubic = ubicaciones.find(ub=>ub.email===u.email);
              return `<tr data-idx="${idx}">
                <td style="padding:8px 8px;">${u.nombre}</td>
                <td style="padding:8px 8px;">${u.email}</td>
                <td style="padding:8px 8px;">${u.rol}</td>
                <td style="padding:8px 8px;">
                  <input type='password' value='${u.password || ''}' class='input-password' style='width:110px;padding:3px 6px;border-radius:5px;border:1px solid #ccc;' readonly>
                  <button class='ver-pass' style='margin-left:4px;background:#607d8b;color:#fff;border:none;padding:2px 8px;border-radius:5px;cursor:pointer;font-size:0.98em;'>👁️</button>
                  <button class='editar-pass' style='margin-left:4px;background:#ff9800;color:#fff;border:none;padding:2px 8px;border-radius:5px;cursor:pointer;font-size:0.98em;'>Editar</button>
                </td>
                <td style="padding:8px 8px;">
                  ${u.rol === 'cliente' ? `<button class="editar-cliente" style="margin-right:6px;background:#ff9800;color:#fff;border:none;padding:5px 10px;border-radius:5px;cursor:pointer;">Editar</button>
                  <button class="eliminar-cliente" style="margin-right:6px;background:#e53935;color:#fff;border:none;padding:5px 10px;border-radius:5px;cursor:pointer;">Eliminar</button>
                  ${ubic ? `<button class="ver-ubicacion" style="background:#388e3c;color:#fff;border:none;padding:5px 10px;border-radius:5px;cursor:pointer;">Ver Ubicación</button>` : ''}` : ''}
                </td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
    modal.querySelector('#close-estadisticas-modal').onclick = () => modal.remove();
    modal.onclick = function(e) { if (e.target === modal) modal.remove(); };

    // Acciones de los botones
    modal.querySelectorAll('.editar-cliente').forEach(btn => {
      btn.onclick = function(e) {
        e.stopPropagation();
        const idx = parseInt(this.closest('tr').dataset.idx);
        let admins = JSON.parse(localStorage.getItem('admins')) || [];
        let clientes = JSON.parse(localStorage.getItem('clientes')) || [];
        let restaurantes = JSON.parse(localStorage.getItem('restaurantes')) || [];
        // Admin fijo no editable
        if (idx === 0) return alert('No se puede editar el Admin fijo.');
        if (idx > 0 && idx <= admins.length) {
          // Editar admin
          const a = admins[idx-1];
          const nuevoNombre = prompt('Editar nombre del admin:', a.nombre);
          if (nuevoNombre !== null && nuevoNombre.trim() !== '') a.nombre = nuevoNombre.trim();
          const nuevoEmail = prompt('Editar correo del admin:', a.email);
          if (nuevoEmail !== null && nuevoEmail.trim() !== '') a.email = nuevoEmail.trim();
          localStorage.setItem('admins', JSON.stringify(admins));
          mostrarModalEstadisticas();
          return;
        }
        if (idx > admins.length && idx <= admins.length + clientes.length) {
          // Editar cliente
          const realIdx = idx - 1 - admins.length;
          const c = clientes[realIdx];
          if (!c) return;
          const nuevoNombre = prompt('Editar nombre del cliente:', c.nombre);
          if (nuevoNombre !== null && nuevoNombre.trim() !== '') c.nombre = nuevoNombre.trim();
          const nuevoEmail = prompt('Editar correo del cliente:', c.email);
          if (nuevoEmail !== null && nuevoEmail.trim() !== '') {
            // Si cambia el email, también cambiar la key de ubicación si existe
            const oldEmail = c.email;
            c.email = nuevoEmail.trim();
            const ubicKey = 'ubicacionCliente_' + oldEmail;
            if (localStorage.getItem(ubicKey)) {
              localStorage.setItem('ubicacionCliente_' + c.email, localStorage.getItem(ubicKey));
              localStorage.removeItem(ubicKey);
            }
          }
          clientes[realIdx] = c;
          localStorage.setItem('clientes', JSON.stringify(clientes));
          mostrarModalEstadisticas();
          return;
        }
        // Editar restaurante
        const restIdx = idx - 1 - admins.length - clientes.length;
        if (restIdx >= 0 && restIdx < restaurantes.length) {
          const r = restaurantes[restIdx];
          const nuevoNombre = prompt('Editar nombre del restaurante:', r.nombre);
          if (nuevoNombre !== null && nuevoNombre.trim() !== '') r.nombre = nuevoNombre.trim();
          const nuevoEmail = prompt('Editar correo del restaurante:', r.email);
          if (nuevoEmail !== null && nuevoEmail.trim() !== '') r.email = nuevoEmail.trim();
          restaurantes[restIdx] = r;
          localStorage.setItem('restaurantes', JSON.stringify(restaurantes));
          mostrarModalEstadisticas();
        }
      };
    });
    modal.querySelectorAll('.eliminar-cliente').forEach(btn => {
      btn.onclick = function(e) {
        e.stopPropagation();
        const idx = parseInt(this.closest('tr').dataset.idx);
        let admins = JSON.parse(localStorage.getItem('admins')) || [];
        let clientes = JSON.parse(localStorage.getItem('clientes')) || [];
        let restaurantes = JSON.parse(localStorage.getItem('restaurantes')) || [];
        // Admin fijo no eliminable
        if (idx === 0) return alert('No se puede eliminar el Admin fijo.');
        if (idx > 0 && idx <= admins.length) {
          // Eliminar admin
          if (confirm('¿Seguro que deseas eliminar este admin?')) {
            admins.splice(idx-1, 1);
            localStorage.setItem('admins', JSON.stringify(admins));
            mostrarModalEstadisticas();
          }
          return;
        }
        if (idx > admins.length && idx <= admins.length + clientes.length) {
          // Eliminar cliente
          const realIdx = idx - 1 - admins.length;
          if (realIdx < 0 || realIdx >= clientes.length) return;
          if (confirm('¿Seguro que deseas eliminar este cliente?')) {
            // Eliminar ubicaciones asociadas
            const cliente = clientes[realIdx];
            if (cliente) {
              localStorage.removeItem('ubicacionCliente_' + cliente.email);
            }
            clientes.splice(realIdx, 1);
            localStorage.setItem('clientes', JSON.stringify(clientes));
            mostrarModalEstadisticas();
          }
          return;
        }
        // Eliminar restaurante
        const restIdx = idx - 1 - admins.length - clientes.length;
        if (restIdx >= 0 && restIdx < restaurantes.length) {
          if (confirm('¿Seguro que deseas eliminar este restaurante?')) {
            restaurantes.splice(restIdx, 1);
            localStorage.setItem('restaurantes', JSON.stringify(restaurantes));
            mostrarModalEstadisticas();
          }
        }
      };
    });
    modal.querySelectorAll('.ver-ubicacion').forEach(btn => {
      btn.onclick = function(e) {
        e.stopPropagation();
        const idx = parseInt(this.closest('tr').dataset.idx);
        let admins = JSON.parse(localStorage.getItem('admins')) || [];
        let clientes = JSON.parse(localStorage.getItem('clientes')) || [];
        if (idx > admins.length && idx <= admins.length + clientes.length) {
          verUbicacionCliente(idx);
        }
      };
    });
    // Mostrar/ocultar contraseña
    modal.querySelectorAll('.ver-pass').forEach(btn => {
      btn.onclick = function() {
        const input = this.parentElement.querySelector('.input-password');
        if (input.type === 'password') {
          input.type = 'text';
          this.textContent = '🙈';
        } else {
          input.type = 'password';
          this.textContent = '👁️';
        }
      };
    });
    // Editar contraseña
    modal.querySelectorAll('.editar-pass').forEach(btn => {
      btn.onclick = function() {
        const tr = this.closest('tr');
        const idx = tr.dataset.idx;
        const input = tr.querySelector('.input-password');
        input.readOnly = false;
        input.type = 'text';
        input.focus();
        input.style.background = '#fffbe7';
        this.textContent = 'Guardar';
        this.onclick = function() {
          const nuevaPass = input.value.trim();
          if (!nuevaPass) { alert('La contraseña no puede estar vacía.'); return; }
          // Actualizar en localStorage según tipo
          let admins = JSON.parse(localStorage.getItem('admins')) || [];
          let clientes = JSON.parse(localStorage.getItem('clientes')) || [];
          let restaurantes = JSON.parse(localStorage.getItem('restaurantes')) || [];
          if (idx == 0) {
            // Admin fijo
            // No se puede cambiar en localStorage, solo en memoria
            alert('No se puede cambiar la contraseña del Admin fijo.');
          } else if (idx <= admins.length) {
            admins[idx-1].password = nuevaPass;
            localStorage.setItem('admins', JSON.stringify(admins));
          } else if (idx <= admins.length + clientes.length) {
            clientes[idx-1-admins.length].password = nuevaPass;
            localStorage.setItem('clientes', JSON.stringify(clientes));
          } else {
            restaurantes[idx-1-admins.length-clientes.length].password = nuevaPass;
            localStorage.setItem('restaurantes', JSON.stringify(restaurantes));
          }
          input.readOnly = true;
          input.type = 'password';
          input.style.background = '';
          this.textContent = 'Editar';
          mostrarModalEstadisticas();
        };
      };
    });
  }

  // --- MODAL DE CONFIGURACIÓN ---
  const configMenu = document.querySelector('.menu li a i.fas.fa-cog')?.parentElement;
  if (configMenu) {
    configMenu.addEventListener('click', function(e) {
      e.preventDefault();
      mostrarModalConfiguracion();
    });
  }

  function mostrarModalConfiguracion() {
    let modal = document.getElementById('config-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'config-modal';
      modal.style.position = 'fixed';
      modal.style.top = 0;
      modal.style.left = 0;
      modal.style.width = '100vw';
      modal.style.height = '100vh';
      modal.style.background = 'rgba(0,0,0,0.4)';
      modal.style.display = 'flex';
      modal.style.alignItems = 'center';
      modal.style.justifyContent = 'center';
      modal.style.zIndex = 10000;
      document.body.appendChild(modal);
    }
    let superadmin = { email: 'superadmin', password: 'superadmin123', rol: 'superadmin', nombre: 'SuperAdmin', telefono: '', img: '' };
    if (!localStorage.getItem('superadmin')) {
      localStorage.setItem('superadmin', JSON.stringify(superadmin));
    }
    let perfil = JSON.parse(localStorage.getItem('superadmin'));
    let admins = JSON.parse(localStorage.getItem('admins')) || [];
    let restaurantes = JSON.parse(localStorage.getItem('restaurantes')) || [];
    modal.innerHTML = `
      <div style="background:#fff;padding:36px 28px 28px 28px;border-radius:22px;min-width:350px;max-width:98vw;max-height:92vh;overflow:auto;position:relative;box-shadow:0 10px 40px rgba(34,87,255,0.13);font-family:'Segoe UI',Arial,sans-serif;">
        <button id="close-config-modal" style="position:absolute;top:18px;right:18px;font-size:26px;background:none;border:none;cursor:pointer;color:#ff5722;transition:color 0.2s;">&times;</button>
        <h2 style="margin-bottom:24px;text-align:center;font-size:2em;color:#ff5722;letter-spacing:1px;">Configuración</h2>
        <div style="display:grid;gap:28px;">
          <div style="background:#f7f7f7;border-radius:14px;padding:22px 18px;box-shadow:0 2px 8px rgba(0,0,0,0.04);">
            <b style='color:#ff5722;'>1. Crear usuario de administrador</b>
            <form id="form-nuevo-admin" style="margin-top:10px;display:flex;gap:10px;flex-wrap:wrap;align-items:center;">
              <input type="text" placeholder="Nombre" required style="flex:1;min-width:120px;padding:8px 12px;border-radius:8px;border:1px solid #ddd;">
              <input type="email" placeholder="Correo" required style="flex:1;min-width:120px;padding:8px 12px;border-radius:8px;border:1px solid #ddd;">
              <input type="password" placeholder="Contraseña" required style="flex:1;min-width:120px;padding:8px 12px;border-radius:8px;border:1px solid #ddd;">
              <button type="submit" style="background:#388e3c;color:#fff;border:none;padding:8px 18px;border-radius:8px;font-weight:500;transition:background 0.2s;">Crear</button>
            </form>
          </div>
          <div style="background:#f7f7f7;border-radius:14px;padding:22px 18px;box-shadow:0 2px 8px rgba(0,0,0,0.04);">
            <b style='color:#ff5722;'>2. Crear usuario de restaurante</b>
            <form id="form-nuevo-rest" style="margin-top:10px;display:flex;gap:10px;flex-wrap:wrap;align-items:center;">
              <input type="text" placeholder="Nombre" required style="flex:1;min-width:120px;padding:8px 12px;border-radius:8px;border:1px solid #ddd;">
              <input type="email" placeholder="Correo" required style="flex:1;min-width:120px;padding:8px 12px;border-radius:8px;border:1px solid #ddd;">
              <input type="password" placeholder="Contraseña" required style="flex:1;min-width:120px;padding:8px 12px;border-radius:8px;border:1px solid #ddd;">
              <button type="submit" style="background:#388e3c;color:#fff;border:none;padding:8px 18px;border-radius:8px;font-weight:500;transition:background 0.2s;">Crear</button>
            </form>
          </div>
          <div style="background:#f7f7f7;border-radius:14px;padding:22px 18px;box-shadow:0 2px 8px rgba(0,0,0,0.04);">
            <b style='color:#ff5722;'>3. Eliminar usuario de administrador</b>
            <ul style="padding-left:18px;margin:10px 0 0 0;">
              <li><b>SuperAdmin</b> <span style='color:#bbb;'>(no se puede eliminar)</span></li>
              ${admins.length === 0 ? '<li style="color:#888;">No hay administradores registrados</li>' : admins.map((a, i) => `<li style='margin:6px 0;'>${a.nombre} <span style='color:#888;'>(${a.email})</span> <button class='eliminar-admin' data-idx='${i}' style='background:#e53935;color:#fff;border:none;padding:3px 12px;border-radius:7px;cursor:pointer;font-size:0.98em;transition:background 0.2s;'>Eliminar</button></li>`).join('')}
            </ul>
          </div>
          <div style="background:#f7f7f7;border-radius:14px;padding:22px 18px;box-shadow:0 2px 8px rgba(0,0,0,0.04);">
            <b style='color:#ff5722;'>4. Eliminar usuario de restaurante</b>
            <ul style="padding-left:18px;margin:10px 0 0 0;">
              ${restaurantes.length === 0 ? '<li style="color:#888;">No hay restaurantes registrados</li>' : restaurantes.map((r, i) => `<li style='margin:6px 0;'>${r.nombre} <span style='color:#888;'>(${r.email})</span> <button class='eliminar-rest' data-idx='${i}' style='background:#e53935;color:#fff;border:none;padding:3px 12px;border-radius:7px;cursor:pointer;font-size:0.98em;transition:background 0.2s;'>Eliminar</button></li>`).join('')}
            </ul>
          </div>
          <div style="background:#f7f7f7;border-radius:14px;padding:22px 18px;box-shadow:0 2px 8px rgba(0,0,0,0.04);">
            <b style='color:#ff5722;'>5. Perfil</b>
            <form id="form-perfil" style="margin-top:10px;display:grid;gap:10px;">
              <input type="text" id="perfil-nombre" value="${perfil.nombre}" placeholder="Nombre" required style="padding:10px 12px;border-radius:8px;border:1px solid #ddd;">
              <input type="email" id="perfil-email" value="${perfil.email}" placeholder="Correo" required style="padding:10px 12px;border-radius:8px;border:1px solid #ddd;">
              <input type="password" id="perfil-password" value="${perfil.password}" placeholder="Contraseña" required style="padding:10px 12px;border-radius:8px;border:1px solid #ddd;">
              <input type="text" id="perfil-telefono" value="${perfil.telefono || ''}" placeholder="Teléfono" style="padding:10px 12px;border-radius:8px;border:1px solid #ddd;">
              <input type="text" id="perfil-img" value="${perfil.img || ''}" placeholder="URL Imagen de Perfil" style="padding:10px 12px;border-radius:8px;border:1px solid #ddd;">
              <button type="submit" style="background:#ff5722;color:#fff;border:none;padding:10px 0;border-radius:8px;font-weight:600;font-size:1.08em;transition:background 0.2s;">Guardar Cambios</button>
            </form>
            <div style="text-align:center;margin-top:10px;">
              <img src="${perfil.img || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(perfil.nombre) + '&background=ff5722&color=fff&size=128'}" alt="Perfil" style="width:72px;height:72px;border-radius:50%;object-fit:cover;box-shadow:0 2px 8px rgba(255,87,34,0.13);">
            </div>
          </div>
        </div>
      </div>
    `;
    modal.querySelector('#close-config-modal').onclick = () => modal.remove();
    modal.onclick = function(e) { if (e.target === modal) modal.remove(); };
    // Crear admin
    modal.querySelector('#form-nuevo-admin').onsubmit = async function(ev) {
      ev.preventDefault();
      const [nombre, email, password] = Array.from(this.querySelectorAll('input')).map(i=>i.value.trim());
      if (!nombre || !email || !password) return;
      // Guardar en base de datos
      try {
        const res = await fetch('https://pagina-web-wm0x.onrender.com/api/usuarios', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nombre, email, password, rol: 'admin' })
        });
        if (!res.ok) {
          const data = await res.json();
          alert(data.error || 'Error al registrar admin en la base de datos');
          return;
        }
      } catch (err) {
        alert('Error de conexión con el servidor.');
        return;
      }
      admins.push({ nombre, email, password });
      localStorage.setItem('admins', JSON.stringify(admins));
      mostrarModalConfiguracion();
    };
    // Crear restaurante
    modal.querySelector('#form-nuevo-rest').onsubmit = async function(ev) {
      ev.preventDefault();
      const [nombre, email, password] = Array.from(this.querySelectorAll('input')).map(i=>i.value.trim());
      if (!nombre || !email || !password) return;
      // Guardar en base de datos
      try {
        const res = await fetch('https://pagina-web-wm0x.onrender.com/api/usuarios', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nombre, email, password, rol: 'restaurante' })
        });
        if (!res.ok) {
          const data = await res.json();
          alert(data.error || 'Error al registrar restaurante en la base de datos');
          return;
        }
      } catch (err) {
        alert('Error de conexión con el servidor.');
        return;
      }
      restaurantes.push({ nombre, email, password });
      localStorage.setItem('restaurantes', JSON.stringify(restaurantes));
      mostrarModalConfiguracion();
    };
    // Eliminar admin
    modal.querySelectorAll('.eliminar-admin').forEach(btn => {
      btn.onclick = function() {
        const idx = this.dataset.idx;
        admins.splice(idx, 1);
        localStorage.setItem('admins', JSON.stringify(admins));
        mostrarModalConfiguracion();
      };
    });
    // Eliminar restaurante
    modal.querySelectorAll('.eliminar-rest').forEach(btn => {
      btn.onclick = function() {
        const idx = this.dataset.idx;
        restaurantes.splice(idx, 1);
        localStorage.setItem('restaurantes', JSON.stringify(restaurantes));
        mostrarModalConfiguracion();
      };
    });
    // Guardar perfil (solo local)
    modal.querySelector('#form-perfil').onsubmit = function(ev) {
      ev.preventDefault();
      perfil.nombre = modal.querySelector('#perfil-nombre').value.trim();
      perfil.email = modal.querySelector('#perfil-email').value.trim();
      perfil.password = modal.querySelector('#perfil-password').value.trim();
      perfil.telefono = modal.querySelector('#perfil-telefono').value.trim();
      perfil.img = modal.querySelector('#perfil-img').value.trim();
      localStorage.setItem('superadmin', JSON.stringify(perfil));
      mostrarModalConfiguracion();
    };
  }

  // --- BOTÓN Y MODAL DE PEDIDOS ---
  const verPedidosBtn = document.getElementById('ver-pedidos-admin');
  if (verPedidosBtn) {
    verPedidosBtn.addEventListener('click', function() {
      mostrarModalPedidosAdmin();
    });
  }

  function mostrarModalPedidosAdmin() {
    let modal = document.getElementById('pedidos-modal-admin');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'pedidos-modal-admin';
      modal.style.position = 'fixed';
      modal.style.top = 0;
      modal.style.left = 0;
      modal.style.width = '100vw';
      modal.style.height = '100vh';
      modal.style.background = 'rgba(0,0,0,0.4)';
      modal.style.display = 'flex';
      modal.style.alignItems = 'center';
      modal.style.justifyContent = 'center';
      modal.style.zIndex = 10000;
      document.body.appendChild(modal);
    }
    let pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
    // Filtro por fecha
    let fechaHoy = new Date();
    let yyyy = fechaHoy.getFullYear();
    let mm = String(fechaHoy.getMonth() + 1).padStart(2, '0');
    let dd = String(fechaHoy.getDate()).padStart(2, '0');
    let fechaDefault = `${yyyy}-${mm}-${dd}`;
    modal.innerHTML = `
      <div style="background:#fff;padding:32px 24px 24px 24px;border-radius:16px;min-width:340px;max-width:98vw;max-height:92vh;overflow:auto;position:relative;box-shadow:0 8px 32px rgba(0,0,0,0.18);">
        <h2 style='margin-bottom:18px;text-align:center;'>Pedidos de Clientes</h2>
        <button id='close-pedidos-modal-admin' style='position:absolute;top:12px;right:12px;font-size:22px;background:none;border:none;cursor:pointer;'>&times;</button>
        <div style='margin-bottom:12px;display:flex;align-items:center;gap:18px;'>
          <label style='font-weight:500;'>Filtrar por día: <input type='date' id='filtro-fecha-pedidos' value='${fechaDefault}' style='padding:4px 8px;border-radius:6px;border:1px solid #ccc;'></label>
          <span id='cantidad-filtrada-pedidos' style='color:#ff5722;font-weight:500;'></span>
        </div>
        <table style='width:100%;border-collapse:collapse;'>
          <thead>
            <tr style='background:#f7f7f7;'>
              <th style='padding:10px 8px;text-align:left;'>Cliente</th>
              <th style='padding:10px 8px;text-align:left;'>Platos</th>
              <th style='padding:10px 8px;text-align:left;'>Total</th>
              <th style='padding:10px 8px;text-align:left;'>Estado</th>
              <th style='padding:10px 8px;text-align:left;'>Acciones</th>
            </tr>
          </thead>
          <tbody id='tbody-pedidos-admin'></tbody>
        </table>
      </div>
    `;
    modal.querySelector('#close-pedidos-modal-admin').onclick = () => modal.remove();
    modal.onclick = function(e) { if (e.target === modal) modal.remove(); };

    // Función para renderizar pedidos filtrados
    function renderPedidosFiltrados(fechaStr) {
      let pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
      let filtrados = pedidos;
      if (fechaStr) {
        filtrados = pedidos.filter(p => {
          if (!p.fecha) return false;
          let fechaPedido = new Date(p.fecha);
          let yyyy = fechaPedido.getFullYear();
          let mm = String(fechaPedido.getMonth() + 1).padStart(2, '0');
          let dd = String(fechaPedido.getDate()).padStart(2, '0');
          let fechaPedidoStr = `${yyyy}-${mm}-${dd}`;
          return fechaPedidoStr === fechaStr;
        });
      }
      const tbody = modal.querySelector('#tbody-pedidos-admin');
      tbody.innerHTML = filtrados.length === 0 ? `<tr><td colspan='5' style='color:#888;text-align:center;padding:18px;'>No hay pedidos para este día.</td></tr>` : filtrados.map((p, idx) => `
        <tr data-idx='${idx}'>
          <td style='padding:8px 8px;'>${p.cliente || '-'}</td>
          <td style='padding:8px 8px;'>${p.platos.map(pl=>`${pl.nombre} <span style='color:#ff5722;'>x${pl.cantidad}</span>`).join(', ')}</td>
          <td style='padding:8px 8px;'>$${p.total}</td>
          <td style='padding:8px 8px;'>${p.estado || 'Pendiente'}</td>
          <td style='padding:8px 8px;'>
            ${p.estado === 'Pendiente' ? `
              <button class='aceptar-pedido' data-idx='${p.id || idx}' style='background:#388e3c;color:#fff;border:none;padding:5px 10px;border-radius:5px;cursor:pointer;margin-right:6px;'>Aceptar</button>
              <button class='rechazar-pedido' data-idx='${p.id || idx}' style='background:#e53935;color:#fff;border:none;padding:5px 10px;border-radius:5px;cursor:pointer;'>Rechazar</button>
            ` : `<span style='color:#888;'>Sin acciones</span>`}
          </td>
        </tr>
      `).join('');
      // Mostrar cantidad filtrada
      modal.querySelector('#cantidad-filtrada-pedidos').textContent = `Pedidos en este día: ${filtrados.length}`;
      // Acciones aceptar/rechazar
      tbody.querySelectorAll('.aceptar-pedido').forEach(btn => {
        btn.onclick = function() {
          const idx = this.closest('tr').dataset.idx;
          let pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
          let pedido = filtrados[idx];
          if (pedido) pedido.estado = 'Aceptado';
          // Actualizar en pedidos globales
          let globalIdx = pedidos.findIndex(p => p.fecha === pedido.fecha && p.cliente === pedido.cliente && p.total === pedido.total);
          if (globalIdx !== -1) pedidos[globalIdx].estado = 'Aceptado';
          localStorage.setItem('pedidos', JSON.stringify(pedidos));
          renderPedidosFiltrados(fechaStr);
        };
      });
      tbody.querySelectorAll('.rechazar-pedido').forEach(btn => {
        btn.onclick = function() {
          const idx = this.closest('tr').dataset.idx;
          let pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
          let pedido = filtrados[idx];
          if (pedido) pedido.estado = 'Rechazado';
          let globalIdx = pedidos.findIndex(p => p.fecha === pedido.fecha && p.cliente === pedido.cliente && p.total === pedido.total);
          if (globalIdx !== -1) pedidos[globalIdx].estado = 'Rechazado';
          localStorage.setItem('pedidos', JSON.stringify(pedidos));
          renderPedidosFiltrados(fechaStr);
        };
      });
    }

    // Inicializar con la fecha de hoy
    renderPedidosFiltrados(fechaDefault);
    // Cambiar filtro de fecha
    modal.querySelector('#filtro-fecha-pedidos').onchange = function() {
      renderPedidosFiltrados(this.value);
    };
  }

  // --- ÚLTIMOS USUARIOS REGISTRADOS ---
  function mostrarUltimosUsuarios() {
    const tbody = document.querySelector('#tabla-ultimos-usuarios tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    const clientes = JSON.parse(localStorage.getItem('clientes')) || [];
    // Filtrar solo los creados hoy
    const hoy = new Date();
    hoy.setHours(0,0,0,0);
    const usuariosHoy = clientes.filter(c => {
      if (!c.fechaRegistro) return false;
      const fecha = new Date(c.fechaRegistro);
      fecha.setHours(0,0,0,0);
      return fecha.getTime() === hoy.getTime();
    });
    if (usuariosHoy.length === 0) {
      tbody.innerHTML = '<tr><td colspan="3" style="color:#888;text-align:center;">No hay usuarios registrados hoy.</td></tr>';
      return;
    }
    usuariosHoy.forEach(u => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${u.nombre}</td><td>${u.email}</td><td>${u.fechaRegistro ? new Date(u.fechaRegistro).toLocaleDateString() : ''}</td>`;
      tbody.appendChild(tr);
    });
  }
  // Llamar al cargar la página y cada vez que cambian los usuarios
  mostrarUltimosUsuarios();
  window.addEventListener('storage', function(e) {
    if (["clientes"].includes(e.key)) mostrarUltimosUsuarios();
  });
  const originalSetItemUsuarios = localStorage.setItem;
  localStorage.setItem = function(key, value) {
    originalSetItemUsuarios.apply(this, arguments);
    if (["clientes"].includes(key)) mostrarUltimosUsuarios();
  };
});
// --- CONTADOR DE USUARIOS PROGRESIVO ---
function actualizarContadorUsuarios() {
  const usuariosCantidad = document.querySelector('.dashboard-cards .card-info p');
  if (!usuariosCantidad) return;
  let cantidad = 1; // Admin siempre existe
  let clientes = JSON.parse(localStorage.getItem('clientes')) || [];
  let admins = JSON.parse(localStorage.getItem('admins')) || [];
  let restaurantes = JSON.parse(localStorage.getItem('restaurantes')) || [];
  cantidad += clientes.length + admins.length + restaurantes.length;
  usuariosCantidad.textContent = cantidad + (cantidad === 1 ? ' usuario activo' : ' usuarios activos');
}

// Llamar al cargar la página
actualizarContadorUsuarios();

// Escuchar cambios en localStorage desde otras pestañas
window.addEventListener('storage', function(e) {
  if (["clientes","admins","restaurantes"].includes(e.key)) {
    actualizarContadorUsuarios();
  }
});

// Detectar cambios locales en setItem
(function() {
  const originalSetItem = localStorage.setItem;
  localStorage.setItem = function(key, value) {
    originalSetItem.apply(this, arguments);
    if (["clientes","admins","restaurantes"].includes(key)) {
      actualizarContadorUsuarios();
    }
  };
})();

// Al registrar un nuevo cliente, guardar la fecha de registro si no existe
(function() {
  const originalSetItem = localStorage.setItem;
  localStorage.setItem = function(key, value) {
    if (key === 'clientes') {
      try {
        let arr = JSON.parse(value);
        let changed = false;
        if (Array.isArray(arr)) {
          arr.forEach(c => {
            if (!c.fechaRegistro) {
              c.fechaRegistro = new Date().toISOString();
              changed = true;
            }
          });
          if (changed) value = JSON.stringify(arr);
        }
      } catch {}
    }
    return originalSetItem.apply(this, arguments);
  };
})();
