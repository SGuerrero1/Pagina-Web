document.addEventListener('DOMContentLoaded', function() {
    // --- FORMULARIO PARA AGREGAR PLATO ---
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

    function mostrarModalNuevoPlato() {
        let modal = document.getElementById('nuevo-plato-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'nuevo-plato-modal';
            modal.style.position = 'fixed';
            modal.style.top = '0';
            modal.style.left = '0';
            modal.style.width = '100vw';
            modal.style.height = '100vh';
            modal.style.background = 'rgba(0,0,0,0.4)';
            modal.style.display = 'flex';
            modal.style.alignItems = 'center';
            modal.style.justifyContent = 'center';
            modal.style.zIndex = 10000;
            document.body.appendChild(modal);
        }
        modal.innerHTML = `
            <div style="background:#fff;padding:32px 24px;border-radius:12px;min-width:320px;max-width:95vw;max-height:90vh;overflow:auto;position:relative;">
                <h2 style="margin-bottom:18px;">Agregar Nuevo Plato</h2>
                <button id="close-nuevo-plato-modal" style="position:absolute;top:12px;right:12px;font-size:20px;background:none;border:none;cursor:pointer;">&times;</button>
                <form id="form-nuevo-plato">
                    <div style='margin-bottom:12px;'>
                        <label>Nombre:</label><br>
                        <input type='text' id='plato-nombre' required style='width:100%;padding:8px;border-radius:5px;border:1px solid #ccc;'>
                    </div>
                    <div style='margin-bottom:12px;'>
                        <label>Descripción:</label><br>
                        <textarea id='plato-desc' style='width:100%;padding:8px;border-radius:5px;border:1px solid #ccc;'></textarea>
                    </div>
                    <div style='margin-bottom:12px;'>
                        <label>Precio:</label><br>
                        <input type='text' id='plato-precio' required style='width:100%;padding:8px;border-radius:5px;border:1px solid #ccc;'>
                    </div>
                    <div style='margin-bottom:12px;'>
                        <label>Imagen (URL o subir):</label><br>
                        <input type='file' id='plato-img-file' accept='image/*' style='margin-bottom:6px;'>
                        <input type='text' id='plato-img-url' placeholder='o pega una URL de imagen' style='width:100%;padding:8px;border-radius:5px;border:1px solid #ccc;'>
                    </div>
                    <button type='submit' style='background:#ff5722;color:#fff;border:none;padding:10px 24px;border-radius:6px;font-size:16px;cursor:pointer;'>Agregar Plato</button>
                </form>
            </div>
        `;
        modal.querySelector('#close-nuevo-plato-modal').onclick = () => modal.remove();
        // Manejar submit
        modal.querySelector('#form-nuevo-plato').onsubmit = function(ev) {
            ev.preventDefault();
            const nombre = modal.querySelector('#plato-nombre').value.trim();
            const descripcion = modal.querySelector('#plato-desc').value.trim();
            const precio = modal.querySelector('#plato-precio').value.trim();
            const imgUrl = modal.querySelector('#plato-img-url').value.trim();
            const imgFile = modal.querySelector('#plato-img-file').files[0];
            const MAX_IMG_BASE64 = 2000000; // 2 MB aprox en base64
            if (!nombre || !precio) {
                mostrarNotificacion('Nombre y precio son obligatorios.', 'error');
                return;
            }
            // Leer imagen si se subió
            if (imgFile) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    if (e.target.result.length > MAX_IMG_BASE64) {
                        mostrarNotificacion('La imagen es demasiado grande. Máximo permitido: 2 MB.', 'error');
                        return;
                    }
                    guardarPlato({nombre, descripcion, precio, img: e.target.result});
                    modal.remove();
                };
                reader.readAsDataURL(imgFile);
            } else {
                if (imgUrl.startsWith('data:image') && imgUrl.length > MAX_IMG_BASE64) {
                    mostrarNotificacion('La imagen es demasiado grande. Máximo permitido: 2 MB.', 'error');
                    return;
                }
                guardarPlato({nombre, descripcion, precio, img: imgUrl});
                modal.remove();
            }
        };
    }

    function guardarPlato(plato) {
        // Guardar en backend
        fetch('https://pagina-web-wm0x.onrender.com/api/platos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(plato)
        })
        .then(res => {
            if (!res.ok) throw new Error('Error al guardar en la base de datos');
            return res.json();
        })
        .then(data => {
            mostrarNotificacion('Plato agregado correctamente en la base de datos.', 'exito');
            // Opcional: actualizar localStorage para mantener sincronía local
            let platos = JSON.parse(localStorage.getItem('platos')) || [];
            platos.push(data);
            localStorage.setItem('platos', JSON.stringify(platos));
        })
        .catch(() => {
            mostrarNotificacion('Error al guardar el plato en el backend.', 'error');
        });
    }

    // Enlazar botón de menú "Nuevo Plato"
    const nuevoPlatoBtn = Array.from(document.querySelectorAll('.fa-plus-circle')).map(i => i.closest('a')).find(Boolean);
    if (nuevoPlatoBtn) {
        nuevoPlatoBtn.addEventListener('click', function(e) {
            e.preventDefault();
            mostrarModalNuevoPlato();
        });
    }
    // --- CERRAR SESIÓN: Redirigir a login y limpiar datos de sesión ---
    const logoutBtn = document.getElementById('restaurant-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            // Muestra mensaje visual de cierre de sesión
            const overlay = document.createElement('div');
            overlay.style.position = 'fixed';
            overlay.style.top = 0;
            overlay.style.left = 0;
            overlay.style.width = '100vw';
            overlay.style.height = '100vh';
            overlay.style.background = 'rgba(0,0,0,0.5)';
            overlay.style.display = 'flex';
            overlay.style.alignItems = 'center';
            overlay.style.justifyContent = 'center';
            overlay.style.zIndex = 20000;
            overlay.innerHTML = `<div style="background:#fff;padding:40px 32px;border-radius:14px;box-shadow:0 8px 32px rgba(0,0,0,0.18);font-size:1.3rem;color:#333;display:flex;flex-direction:column;align-items:center;gap:18px;">
                <i class='fas fa-sign-out-alt' style='font-size:2.5rem;color:#ff5722;'></i>
                <span>¡Has cerrado sesión correctamente!</span>
            </div>`;
            document.body.appendChild(overlay);
            // Limpia solo datos de sesión, NO los platos
            localStorage.removeItem('rol');
            localStorage.removeItem('userRole');
            // Redirige después de 1.5 segundos
            setTimeout(() => {
                window.location.href = '../login_page.html';
            }, 1500);
        });
    }
    // --- BOTÓN Y MODAL DE PEDIDOS EN RESTAURANTE ---
    const pedidosMenu = document.querySelector('.menu li a i.fas.fa-clipboard-list')?.parentElement;
    if (pedidosMenu) {
      pedidosMenu.addEventListener('click', function(e) {
        e.preventDefault();
        mostrarModalPedidosRestaurante();
      });
    }

    function mostrarModalPedidosRestaurante() {
      let modal = document.getElementById('pedidos-modal-rest');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'pedidos-modal-rest';
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
          <button id='close-pedidos-modal-rest' style='position:absolute;top:12px;right:12px;font-size:22px;background:none;border:none;cursor:pointer;'>&times;</button>
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
                      <button class='aceptar-pedido' data-idx='${idx}' style='background:#388e3c;color:#fff;border:none;padding:5px 10px;border-radius:5px;cursor:pointer;margin-right:6px;'>Aceptar</button>
                      <button class='rechazar-pedido' data-idx='${idx}' style='background:#e53935;color:#fff;border:none;padding:5px 10px;border-radius:5px;cursor:pointer;'>Rechazar</button>
                    ` : `<span style='color:#888;'>Sin acciones</span>`}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
      modal.querySelector('#close-pedidos-modal-rest').onclick = () => modal.remove();
      modal.onclick = function(e) { if (e.target === modal) modal.remove(); };
      // Acciones aceptar/rechazar para todos los pedidos pendientes
      modal.querySelectorAll('.aceptar-pedido').forEach(btn => {
        btn.onclick = function() {
          const idx = parseInt(this.getAttribute('data-idx'));
          if (!isNaN(idx)) {
            pedidos[idx].estado = 'Aceptado';
            localStorage.setItem('pedidos', JSON.stringify(pedidos));
            mostrarModalPedidosRestaurante();
          }
        };
      });
      modal.querySelectorAll('.rechazar-pedido').forEach(btn => {
        btn.onclick = function() {
          const idx = parseInt(this.getAttribute('data-idx'));
          if (!isNaN(idx)) {
            pedidos[idx].estado = 'Rechazado';
            localStorage.setItem('pedidos', JSON.stringify(pedidos));
            mostrarModalPedidosRestaurante();
          }
        };
      });
    }

    // --- REAL-TIME PEDIDOS UPDATE ---
    function renderPedidosRecientesTable() {
      const tablaPedidos = document.getElementById('tabla-pedidos-recientes')?.querySelector('tbody');
      if (!tablaPedidos) return;
      let pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
      if (!Array.isArray(pedidos) || pedidos.length === 0) {
        tablaPedidos.innerHTML = `<tr><td colspan='6' style='color:#888;text-align:center;padding:18px;'>No hay pedidos realizados.</td></tr>`;
        return;
      }
      tablaPedidos.innerHTML = pedidos.map((p, idx) => `
        <tr>
          <td>#${idx + 1}</td>
          <td>${p.cliente || '-'}</td>
          <td>${Array.isArray(p.platos) ? p.platos.map(pl=>`${pl.nombre} <span style='color:#ff5722;'>x${pl.cantidad}</span>`).join(', ') : '-'}</td>
          <td>$${Number(p.total).toLocaleString('es-CO', {minimumFractionDigits:2, maximumFractionDigits:2})}</td>
          <td><span class="status ${p.estado === 'Pendiente' ? 'pending' : (p.estado === 'Aceptado' ? 'in-progress' : (p.estado === 'Entregado' ? 'ready' : 'rechazado'))}">${p.estado || 'Pendiente'}</span></td>
          <td>
            ${p.estado === 'Pendiente' ? `
              <button class="btn-small aceptar-pedido" data-idx="${idx}">Aceptar</button>
              <button class="btn-small rechazar-pedido" data-idx="${idx}">Rechazar</button>
            ` : p.estado === 'Aceptado' ? `
              <button class="btn-small entregar-pedido" data-idx="${idx}">Pedido Entregado</button>
            ` : '<span style="color:#888;">Sin acciones</span>'}
          </td>
        </tr>
      `).join('');
      // Acciones aceptar/rechazar/entregar
      tablaPedidos.querySelectorAll('.aceptar-pedido').forEach(btn => {
        btn.onclick = function() {
          const idx = btn.getAttribute('data-idx');
          let pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
          if (pedidos[idx]) {
            pedidos[idx].estado = 'Aceptado';
            localStorage.setItem('pedidos', JSON.stringify(pedidos));
          }
        };
      });
      tablaPedidos.querySelectorAll('.rechazar-pedido').forEach(btn => {
        btn.onclick = function() {
          const idx = btn.getAttribute('data-idx');
          let pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
          if (pedidos[idx]) {
            pedidos[idx].estado = 'Rechazado';
            localStorage.setItem('pedidos', JSON.stringify(pedidos));
          }
        };
      });
      tablaPedidos.querySelectorAll('.entregar-pedido').forEach(btn => {
        btn.onclick = function() {
          const idx = btn.getAttribute('data-idx');
          let pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
          if (pedidos[idx]) {
            pedidos[idx].estado = 'Entregado';
            localStorage.setItem('pedidos', JSON.stringify(pedidos));
            // Mostrar encuesta no intrusiva
            mostrarEncuestaSatisfaccion(pedidos[idx]);
            // Sumar ingresos de hoy
            sumarIngresoHoy(pedidos[idx]);
          }
        };
      });
    }

    function refreshPedidosRestauranteView() {
      // If modal is open, refresh it
      const modal = document.getElementById('pedidos-modal-rest');
      if (modal && modal.style.display !== 'none') {
        modal.remove();
        mostrarModalPedidosRestaurante();
      }
      // Update dashboard counters if present
      const pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
      const pendientes = pedidos.filter(p => p.estado === 'Pendiente');
      const pendientesSpan = document.getElementById('pedidos-pendientes');
      if (pendientesSpan) pendientesSpan.textContent = pendientes.length + ' pedidos';
      // Update Pedidos Recientes table in dashboard
      renderPedidosRecientesTable();
    }
    window.addEventListener('storage', function(e) {
      if (e.key === 'pedidos') refreshPedidosRestauranteView();
    });
    (function() {
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = function(key, value) {
        originalSetItem.apply(this, arguments);
        if (key === 'pedidos') refreshPedidosRestauranteView();
      };
    })();
    // On DOMContentLoaded, render Pedidos Recientes from localStorage
    renderPedidosRecientesTable();
    // Sumar ingresos de hoy
    function sumarIngresoHoy(pedido) {
      // Buscar el elemento de ingresos hoy
      const ingresosElem = document.getElementById('ingresos-hoy');
      if (!ingresosElem) return;
      // Obtener el valor actual
      let actual = ingresosElem.textContent.replace(/[^\d.]/g, '');
      let total = parseFloat(actual) || 0;
      let suma = parseFloat(pedido.total) || 0;
      total += suma;
      ingresosElem.textContent = `$${total.toFixed(2)}`;
    }
    // --- MENÚ PLATOS: Mostrar todos los platos del backend ---
    const menuPlatos = document.querySelector('.menu .fa-hamburger')?.closest('a');
    if (menuPlatos) {
        menuPlatos.onclick = async function(e) {
            e.preventDefault();
            let modal = document.getElementById('platos-modal-rest');
            if (!modal) {
                modal = document.createElement('div');
                modal.id = 'platos-modal-rest';
                modal.style.position = 'fixed';
                modal.style.top = '0';
                modal.style.left = '0';
                modal.style.width = '100vw';
                modal.style.height = '100vh';
                modal.style.background = 'rgba(0,0,0,0.4)';
                modal.style.display = 'flex';
                modal.style.alignItems = 'center';
                modal.style.justifyContent = 'center';
                modal.style.zIndex = 10000;
                document.body.appendChild(modal);
            }
            // Obtener platos del backend
            let platos = [];
            try {
                const res = await fetch('https://pagina-web-wm0x.onrender.com/api/platos');
                if (res.ok) {
                    platos = await res.json();
                }
            } catch {}
            modal.innerHTML = `
                <div style="background:#fff;padding:36px 28px 28px 28px;border-radius:22px;min-width:350px;max-width:98vw;max-height:92vh;overflow:auto;position:relative;box-shadow:0 10px 40px rgba(34,87,255,0.13);font-family:'Segoe UI',Arial,sans-serif;">
                    <div style='display:flex;gap:12px;justify-content:flex-end;margin-bottom:12px;'>
                        <button id="close-platos-modal-rest" style="padding:7px 18px;border-radius:8px;border:none;background:#2257ff;color:#fff;font-weight:500;cursor:pointer;">Cerrar</button>
                    </div>
                    <h2 style='margin-bottom:18px;text-align:center;'>Platos Creados</h2>
                    <table style='width:100%;border-collapse:collapse;'>
                        <thead>
                            <tr style='background:#fff7f0;'>
                                <th style='padding:10px 8px;text-align:left;'>Nombre</th>
                                <th style='padding:10px 8px;text-align:left;'>Precio</th>
                                <th style='padding:10px 8px;text-align:left;'>Imagen</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${platos.length === 0 ? `<tr><td colspan='3' style='color:#888;text-align:center;padding:18px;'>No hay platos creados.</td></tr>` : platos.map(p => `
                                <tr>
                                    <td style='padding:8px 8px;'>${p.nombre}</td>
                                    <td style='padding:8px 8px;'>${p.precio}</td>
                                    <td style='padding:8px 8px;'>${p.img ? `<img src='${p.img}' alt='' style='width:48px;height:48px;object-fit:cover;border-radius:6px;'>` : '<span style=\'color:#bbb;\'>Sin imagen</span>'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
            modal.querySelector('#close-platos-modal-rest').onclick = () => modal.remove();
            modal.onclick = function(e) { if (e.target === modal) modal.remove(); };
        };
    }
});