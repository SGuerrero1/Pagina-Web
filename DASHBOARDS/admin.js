document.addEventListener('DOMContentLoaded', function() {
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

  // Mostrar cantidad de platos en la tarjeta
  const platosCantidadSpan = document.getElementById('platos-disponibles');
  if (platosCantidadSpan) {
    const platos = JSON.parse(localStorage.getItem('platos')) || [];
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
      [{ nombre: 'Admin', email: 'admin', rol: 'admin' }],
      admins.map(a => ({ nombre: a.nombre, email: a.email, rol: 'admin' })),
      clientes.map(c => ({ nombre: c.nombre, email: c.email, rol: 'cliente' })),
      restaurantes.map(r => ({ nombre: r.nombre, email: r.email, rol: 'restaurante' }))
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
              <th style="padding:10px 8px;text-align:left;">Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${usuarios.map((u, idx) => {
              const ubic = ubicaciones.find(ub=>ub.email===u.email);
              return `<tr data-idx=\"${idx}\">
                <td style=\"padding:8px 8px;\">${u.nombre}</td>
                <td style=\"padding:8px 8px;\">${u.email}</td>
                <td style=\"padding:8px 8px;\">${u.rol}</td>
                <td style=\"padding:8px 8px;\">
                  ${u.rol === 'cliente' ? `<button class=\"editar-cliente\" style=\"margin-right:6px;background:#ff9800;color:#fff;border:none;padding:5px 10px;border-radius:5px;cursor:pointer;\">Editar</button>
                  <button class=\"eliminar-cliente\" style=\"margin-right:6px;background:#e53935;color:#fff;border:none;padding:5px 10px;border-radius:5px;cursor:pointer;\">Eliminar</button>
                  ${ubic ? `<button class=\"ver-ubicacion\" style=\"background:#388e3c;color:#fff;border:none;padding:5px 10px;border-radius:5px;cursor:pointer;\">Ver Ubicación</button>` : ''}` : ''}
                </td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
    modal.querySelector('#close-estadisticas-modal').onclick = () => modal.remove();
    modal.onclick = function(e) { if (e.target === modal) modal.remove(); };

    // Acciones de los botones SOLO para clientes
    modal.querySelectorAll('.editar-cliente').forEach(btn => {
      btn.onclick = function() {
        const idx = this.closest('tr').dataset.idx;
        editarCliente(idx);
      };
    });
    modal.querySelectorAll('.eliminar-cliente').forEach(btn => {
      btn.onclick = function() {
        const idx = this.closest('tr').dataset.idx;
        eliminarCliente(idx);
      };
    });
    modal.querySelectorAll('.ver-ubicacion').forEach(btn => {
      btn.onclick = function() {
        const idx = this.closest('tr').dataset.idx;
        verUbicacionCliente(idx);
      };
    });
  }

  function editarCliente(idx) {
    let clientes = JSON.parse(localStorage.getItem('clientes')) || [];
    const c = clientes[idx - (1 + (JSON.parse(localStorage.getItem('admins'))||[]).length)]; // idx offset: admin + admins
    if (!c) return;
    const nuevoNombre = prompt('Editar nombre del cliente:', c.nombre);
    if (nuevoNombre !== null && nuevoNombre.trim() !== '') {
      c.nombre = nuevoNombre.trim();
    }
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
    clientes[idx - (1 + (JSON.parse(localStorage.getItem('admins'))||[]).length)] = c;
    localStorage.setItem('clientes', JSON.stringify(clientes));
    mostrarModalEstadisticas();
  }

  function eliminarCliente(idx) {
    let clientes = JSON.parse(localStorage.getItem('clientes')) || [];
    const admins = JSON.parse(localStorage.getItem('admins')) || [];
    const realIdx = idx - (1 + admins.length); // idx offset: admin + admins
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
  }

  function verUbicacionCliente(idx) {
    let clientes = JSON.parse(localStorage.getItem('clientes')) || [];
    const admins = JSON.parse(localStorage.getItem('admins')) || [];
    const c = clientes[idx - (1 + admins.length)];
    if (!c) return;
    const ubic = localStorage.getItem('ubicacionCliente_' + c.email);
    if (!ubic) {
      alert('Este cliente no ha enviado ubicación.');
      return;
    }
    const { lat, lon } = JSON.parse(ubic);
    // Mostrar modal con links a Google Maps y Waze
    let modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = 0;
    modal.style.left = 0;
    modal.style.width = '100vw';
    modal.style.height = '100vh';
    modal.style.background = 'rgba(0,0,0,0.4)';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.zIndex = 20000;
    modal.innerHTML = `
      <div style="background:#fff;padding:32px 24px 24px 24px;border-radius:16px;min-width:320px;max-width:95vw;max-height:90vh;overflow:auto;position:relative;box-shadow:0 8px 32px rgba(0,0,0,0.18);">
        <h2 style='margin-bottom:18px;text-align:center;'>Ubicación del Cliente</h2>
        <button id='close-ubicacion-modal' style='position:absolute;top:12px;right:12px;font-size:22px;background:none;border:none;cursor:pointer;'>&times;</button>
        <div style='margin-bottom:12px;'>
          <b>Lat:</b> ${lat}, <b>Lon:</b> ${lon}
        </div>
        <a href="https://www.google.com/maps?q=${lat},${lon}" target="_blank" style="color:#2257ff;text-decoration:underline;font-size:1.08em;margin-right:18px;">Ver en Google Maps</a>
        <a href="https://waze.com/ul?ll=${lat},${lon}&navigate=yes" target="_blank" style="color:#43a047;text-decoration:underline;font-size:1.08em;">Ver en Waze</a>
      </div>
    `;
    document.body.appendChild(modal);
    document.getElementById('close-ubicacion-modal').onclick = () => modal.remove();
    modal.onclick = function(e) { if (e.target === modal) modal.remove(); };
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
    let admins = JSON.parse(localStorage.getItem('admins')) || [];
    let restaurantes = JSON.parse(localStorage.getItem('restaurantes')) || [];
    let perfil = JSON.parse(localStorage.getItem('superadmin'));
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
              ${admins.map((a, i) => `<li style='margin:6px 0;'>${a.nombre} <span style='color:#888;'>(${a.email})</span> <button class='eliminar-admin' data-idx='${i}' style='background:#e53935;color:#fff;border:none;padding:3px 12px;border-radius:7px;cursor:pointer;font-size:0.98em;transition:background 0.2s;'>Eliminar</button></li>`).join('')}
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
    modal.querySelector('#form-nuevo-admin').onsubmit = function(ev) {
      ev.preventDefault();
      const [nombre, email, password] = Array.from(this.querySelectorAll('input')).map(i=>i.value.trim());
      if (!nombre || !email || !password) return;
      admins.push({nombre, email, password, rol:'admin'});
      localStorage.setItem('admins', JSON.stringify(admins));
      mostrarModalConfiguracion();
    };
    // Crear restaurante
    modal.querySelector('#form-nuevo-rest').onsubmit = function(ev) {
      ev.preventDefault();
      const [nombre, email, password] = Array.from(this.querySelectorAll('input')).map(i=>i.value.trim());
      if (!nombre || !email || !password) return;
      restaurantes.push({nombre, email, password, rol:'restaurante'});
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
    // Guardar perfil
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
    // Obtener pedidos de localStorage
    let pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
    modal.innerHTML = `
      <div style="background:#fff;padding:32px 24px 24px 24px;border-radius:16px;min-width:340px;max-width:98vw;max-height:92vh;overflow:auto;position:relative;box-shadow:0 8px 32px rgba(0,0,0,0.18);">
        <h2 style='margin-bottom:18px;text-align:center;'>Pedidos de Clientes</h2>
        <button id='close-pedidos-modal-admin' style='position:absolute;top:12px;right:12px;font-size:22px;background:none;border:none;cursor:pointer;'>&times;</button>
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
          <tbody>
            ${pedidos.length === 0 ? `<tr><td colspan='5' style='color:#888;text-align:center;padding:18px;'>No hay pedidos realizados.</td></tr>` : pedidos.map((p, idx) => `
              <tr data-idx='${idx}'>
                <td style='padding:8px 8px;'>${p.cliente || '-'}</td>
                <td style='padding:8px 8px;'>${p.platos.map(pl=>`${pl.nombre} <span style='color:#ff5722;'>x${pl.cantidad}</span>`).join(', ')}</td>
                <td style='padding:8px 8px;'>$${p.total}</td>
                <td style='padding:8px 8px;'>${p.estado || 'Pendiente'}</td>
                <td style='padding:8px 8px;'>
                  ${p.estado === 'Pendiente' ? `
                    <button class='aceptar-pedido' style='background:#388e3c;color:#fff;border:none;padding:5px 10px;border-radius:5px;cursor:pointer;margin-right:6px;'>Aceptar</button>
                    <button class='rechazar-pedido' style='background:#e53935;color:#fff;border:none;padding:5px 10px;border-radius:5px;cursor:pointer;'>Rechazar</button>
                  ` : `<span style='color:#888;'>Sin acciones</span>`}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
    modal.querySelector('#close-pedidos-modal-admin').onclick = () => modal.remove();
    modal.onclick = function(e) { if (e.target === modal) modal.remove(); };
    // Acciones aceptar/rechazar
    modal.querySelectorAll('.aceptar-pedido').forEach(btn => {
      btn.onclick = function() {
        const idx = this.closest('tr').dataset.idx;
        pedidos[idx].estado = 'Aceptado';
        localStorage.setItem('pedidos', JSON.stringify(pedidos));
        mostrarModalPedidosAdmin();
      };
    });
    modal.querySelectorAll('.rechazar-pedido').forEach(btn => {
      btn.onclick = function() {
        const idx = this.closest('tr').dataset.idx;
        pedidos[idx].estado = 'Rechazado';
        localStorage.setItem('pedidos', JSON.stringify(pedidos));
        mostrarModalPedidosAdmin();
      };
    });
  }
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
