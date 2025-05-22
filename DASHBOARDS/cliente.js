// Carrito de compras para dashboard_cliente

document.addEventListener('DOMContentLoaded', function() {
    // Inicializa el carrito desde localStorage o vacío
    let cart = JSON.parse(localStorage.getItem('cartCliente')) || [];

    // Función para guardar el carrito
    function saveCart() {
        localStorage.setItem('cartCliente', JSON.stringify(cart));
    }

    // Función para mostrar notificación simple
    function showAddedNotification(nombre) {
        const notif = document.createElement('div');
        notif.textContent = `Agregado: ${nombre}`;
        notif.style.position = 'fixed';
        notif.style.bottom = '30px';
        notif.style.right = '30px';
        notif.style.background = '#ff5722';
        notif.style.color = 'white';
        notif.style.padding = '12px 24px';
        notif.style.borderRadius = '8px';
        notif.style.zIndex = 9999;
        notif.style.fontWeight = 'bold';
        document.body.appendChild(notif);
        setTimeout(() => notif.remove(), 1200);
    }

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

    // Si el usuario hace click en el menú "Carrito", muestra el resumen
    const carritoMenu = document.querySelector('.fa-shopping-cart')?.closest('a');
    if (carritoMenu) {
        carritoMenu.addEventListener('click', function(e) {
            e.preventDefault();
            mostrarResumenCarrito();
        });
    }

    function mostrarResumenCarrito() {
        // Crea un modal simple para mostrar el carrito
        let modal = document.getElementById('cart-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'cart-modal';
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
            <div style="background:#fff;padding:32px 24px;border-radius:12px;min-width:320px;max-width:90vw;max-height:80vh;overflow:auto;position:relative;">
                <h2 style="margin-bottom:18px;">Tu Carrito</h2>
                <button id="close-cart-modal" style="position:absolute;top:12px;right:12px;font-size:20px;background:none;border:none;cursor:pointer;">&times;</button>
                ${cart.length === 0 ? '<p>El carrito está vacío.</p>' :
                    `<ul style="list-style:none;padding:0;max-width:350px;">
                        ${cart.map(item => `
                            <li style='display:flex;align-items:center;gap:10px;margin-bottom:12px;'>
                                <img src='${item.img}' alt='' style='width:48px;height:48px;object-fit:cover;border-radius:6px;'>
                                <div style='flex:1;'>
                                    <strong>${item.nombre}</strong><br>
                                    <span>${item.precio} x ${item.cantidad}</span>
                                </div>
                                <button class='remove-item' data-nombre='${item.nombre}' style='background:#ff3e3e;color:#fff;border:none;border-radius:4px;padding:4px 8px;cursor:pointer;'>Quitar</button>
                            </li>
                        `).join('')}
                    </ul>
                    <hr style='margin:18px 0;'>
                    <div style='font-weight:bold;font-size:18px;'>Total: ${calcularTotal()}</div>
                    <button id='finalizar-compra' style='margin-top:18px;background:#ff5722;color:#fff;border:none;padding:10px 24px;border-radius:6px;font-size:16px;cursor:pointer;'>Finalizar Compra</button>`
                }
            </div>
        `;
        // Cerrar modal
        modal.querySelector('#close-cart-modal').onclick = () => modal.remove();
        // Quitar item
        modal.querySelectorAll('.remove-item').forEach(btn => {
            btn.onclick = function() {
                const nombre = btn.getAttribute('data-nombre');
                cart = cart.filter(item => item.nombre !== nombre);
                saveCart();
                mostrarResumenCarrito();
            };
        });
        // Finalizar compra
        const finalizarBtn = modal.querySelector('#finalizar-compra');
        if (finalizarBtn) {
            finalizarBtn.onclick = async function() {
                // --- GUARDAR PEDIDO EN BASE DE DATOS ---
                const cliente = JSON.parse(localStorage.getItem('clienteRegistrado')) || {};
                let usuarioId = null;
                let restauranteId = null;
                try {
                    // Buscar usuario por email
                    const resUser = await fetch('https://pagina-web-wm0x.onrender.com/api/usuarios?email=' + encodeURIComponent(cliente.email));
                    const userData = await resUser.json();
                    usuarioId = userData.id;
                    // Buscar restaurante (asume 1 restaurante demo)
                    const resRest = await fetch('https://pagina-web-wm0x.onrender.com/api/restaurantes');
                    const restList = await resRest.json();
                    restauranteId = restList[0]?.id || 1;
                } catch {}
                // Crear pedido
                const pedido = {
                    usuario_id: usuarioId,
                    restaurante_id: restauranteId,
                    cliente: cliente.nombre || cliente.email || 'Cliente',
                    platos: cart.map(item => ({ nombre: item.nombre, cantidad: item.cantidad })),
                    total: parseFloat(calcularTotal().replace(/[^\d\.]/g, '')),
                    estado: 'Pendiente',
                    fecha: new Date().toISOString()
                };
                try {
                    await fetch('https://pagina-web-wm0x.onrender.com/api/pedidos', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(pedido)
                    });
                    mostrarNotificacion('¡Gracias por tu compra!', 'exito');
                } catch {
                    mostrarNotificacion('No se pudo registrar el pedido en la base de datos.', 'error');
                }
                // --- GUARDAR PEDIDO EN LOCALSTORAGE PARA DASHBOARDS ---
                let pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
                pedidos.push(pedido);
                localStorage.setItem('pedidos', JSON.stringify(pedidos));
                // Disparar evento de storage manualmente para otras pestañas
                window.dispatchEvent(new Event('storage'));
                guardarCompraEnHistorial([...cart], calcularTotal());
                cart = [];
                saveCart();
                modal.remove();
            };
        }
    }

    function calcularTotal() {
        let total = 0;
        cart.forEach(item => {
            // Quita el símbolo $ y puntos para convertir a número
            let num = parseFloat(item.precio.replace(/[^\d,\.]/g, '').replace('.', '').replace(',', '.'));
            total += num * item.cantidad;
        });
        // Devuelve en formato moneda
        return `$${total.toLocaleString('es-CO', {minimumFractionDigits:2, maximumFractionDigits:2})}`;
    }

    // --- PERFIL: Cambiar imagen, nombre y contraseña ---
    const perfilMenu = document.querySelector('.fa-user')?.closest('a');
    if (perfilMenu) {
        perfilMenu.addEventListener('click', function(e) {
            e.preventDefault();
            mostrarPerfilModal();
        });
    }

    function mostrarPerfilModal() {
        let cliente = JSON.parse(localStorage.getItem('clienteRegistrado')) || {};
        let oldModal = document.getElementById('perfil-modal');
        if (oldModal) oldModal.remove(); // Elimina el modal anterior si existe
        let modal = document.createElement('div');
        modal.id = 'perfil-modal';
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
        modal.innerHTML = `
            <div style="background:#fff;padding:32px 24px;border-radius:12px;min-width:320px;max-width:90vw;max-height:80vh;overflow:auto;position:relative;">
                <h2 style="margin-bottom:18px;">Editar Perfil</h2>
                <button id="close-perfil-modal" style="position:absolute;top:12px;right:12px;font-size:20px;background:none;border:none;cursor:pointer;">&times;</button>
                <form id="perfil-form">
                    <div style='display:flex;flex-direction:column;align-items:center;margin-bottom:18px;'>
                        <label for='perfil-img-input' style='cursor:pointer;'>
                            <img id='perfil-img-preview' src='${cliente.img || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(cliente.nombre || 'C') + '&background=ff5722&color=fff&size=128'}' style='width:90px;height:90px;border-radius:50%;object-fit:cover;border:2px solid #ff5722;'>
                        </label>
                        <input type='file' id='perfil-img-input' accept='image/*' style='display:none;'>
                        <small>Cambiar imagen</small>
                    </div>
                    <div style='margin-bottom:12px;'>
                        <label>Nombre:</label><br>
                        <input type='text' id='perfil-nombre' value='${cliente.nombre || ''}' style='width:100%;padding:8px;border-radius:5px;border:1px solid #ccc;'>
                    </div>
                    <div style='margin-bottom:12px;'>
                        <label>Nueva contraseña:</label><br>
                        <input type='password' id='perfil-pass' placeholder='Nueva contraseña' style='width:100%;padding:8px;border-radius:5px;border:1px solid #ccc;'>
                    </div>
                    <div style='margin-bottom:12px;'>
                        <label>Confirmar contraseña:</label><br>
                        <input type='password' id='perfil-pass2' placeholder='Confirmar contraseña' style='width:100%;padding:8px;border-radius:5px;border:1px solid #ccc;'>
                    </div>
                    <div id='perfil-error' style='color:red;margin-bottom:10px;'></div>
                    <button type='submit' style='background:#ff5722;color:#fff;border:none;padding:10px 24px;border-radius:6px;font-size:16px;cursor:pointer;'>Guardar Cambios</button>
                </form>
            </div>
        `;
        // Cerrar modal
        modal.querySelector('#close-perfil-modal').onclick = () => modal.remove();
        // Imagen preview
        const imgInput = modal.querySelector('#perfil-img-input');
        const imgPreview = modal.querySelector('#perfil-img-preview');
        imgInput.onchange = function(e) {
            const file = imgInput.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(ev) {
                    imgPreview.src = ev.target.result;
                };
                reader.readAsDataURL(file);
            }
        };
        // Click en imagen abre input
        imgPreview.onclick = () => imgInput.click();
        // Guardar cambios
        modal.querySelector('#perfil-form').onsubmit = function(ev) {
            ev.preventDefault();
            const nombre = modal.querySelector('#perfil-nombre').value.trim();
            const pass = modal.querySelector('#perfil-pass').value;
            const pass2 = modal.querySelector('#perfil-pass2').value;
            const errorDiv = modal.querySelector('#perfil-error');
            if (pass && pass !== pass2) {
                errorDiv.textContent = 'Las contraseñas no coinciden.';
                return;
            }
            // Actualiza datos
            cliente.nombre = nombre;
            if (imgPreview.src.startsWith('data:image')) {
                cliente.img = imgPreview.src;
            }
            if (pass) {
                cliente.password = pass;
            }
            localStorage.setItem('clienteRegistrado', JSON.stringify(cliente));
            // Actualiza nombre en dashboard
            const userSpan = document.querySelector('.user-info span');
            if (userSpan) userSpan.textContent = nombre;
            const headerTitle = document.querySelector('main header h1');
            if (headerTitle) headerTitle.textContent = `¡Bienvenido, ${nombre}!`;
            // Actualiza imagen de perfil en dashboard
            const userImg = document.querySelector('.user-info img');
            if (userImg && cliente.img) {
                userImg.src = cliente.img;
            }
            modal.remove();
            mostrarNotificacion('Perfil actualizado correctamente.', 'exito');
        };
    }

    // Al cargar, mostrar imagen de perfil si existe
    const userInfo = document.querySelector('.user-info');
    if (userInfo && !userInfo.querySelector('img')) {
        let cliente = JSON.parse(localStorage.getItem('clienteRegistrado')) || {};
        const img = document.createElement('img');
        img.style.width = '36px';
        img.style.height = '36px';
        img.style.borderRadius = '50%';
        img.style.objectFit = 'cover';
        img.style.marginLeft = '8px';
        img.src = cliente.img || ('https://ui-avatars.com/api/?name=' + encodeURIComponent(cliente.nombre || 'C') + '&background=ff5722&color=fff&size=128');
        userInfo.appendChild(img);
    }

    // --- MENÚ: Mostrar platos recomendados (scroll al grid y recarga platos/categorías) ---
    const menuBtn = document.querySelector('.fa-hamburger')?.closest('a');
    if (menuBtn) {
        menuBtn.addEventListener('click', function(e) {
            e.preventDefault();
            // Limpiar filtro y buscador
            platosFiltrados = [];
            paginaActual = 1;
            const buscador = document.getElementById('buscador-platos');
            if (buscador) buscador.value = '';
            // Recargar platos y categorías desde localStorage (incluye los creados en restaurante)
            renderPlatos(1, true);
            renderizarFiltros();
            // Scroll al inicio de platos recomendados SIEMPRE
            setTimeout(() => {
                const grid = document.getElementById('food-grid');
                if (grid) {
                    grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 0);
        });
    }

    // --- GPS: Mostrar ubicación del usuario en un modal con mapa ---
    const gpsBtn = document.querySelector('.fa-map-marker-alt')?.closest('a');
    if (gpsBtn) {
        gpsBtn.addEventListener('click', function(e) {
            e.preventDefault();
            mostrarGPSModal();
        });
    }

    function mostrarGPSModal() {
        let modal = document.getElementById('gps-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'gps-modal';
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
        let lat = null, lon = null;
        modal.innerHTML = `
            <div style="background:#fff;padding:32px 24px;border-radius:12px;min-width:320px;max-width:95vw;max-height:90vh;overflow:auto;position:relative;">
                <h2 style="margin-bottom:18px;">Tu Ubicación Actual</h2>
                <button id="close-gps-modal" style="position:absolute;top:12px;right:12px;font-size:20px;background:none;border:none;cursor:pointer;">&times;</button>
                <div id="gps-map" style="width:350px;height:350px;border-radius:10px;overflow:hidden;background:#eee;display:flex;align-items:center;justify-content:center;">Cargando mapa...</div>
                <div id="gps-error" style="color:red;margin-top:10px;"></div>
                <button id="enviar-ubicacion" style="margin-top:18px;background:#388e3c;color:#fff;border:none;padding:10px 24px;border-radius:6px;font-size:16px;cursor:pointer;display:none;">Enviar Ubicación al Restaurante</button>
                <div id="gps-success" style="color:green;margin-top:10px;"></div>
            </div>
        `;
        modal.querySelector('#close-gps-modal').onclick = () => modal.remove();
        // Obtener ubicación
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(pos) {
                lat = pos.coords.latitude;
                lon = pos.coords.longitude;
                // Mapa estático de OpenStreetMap
                const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lon-0.01}%2C${lat-0.01}%2C${lon+0.01}%2C${lat+0.01}&layer=mapnik&marker=${lat}%2C${lon}`;
                modal.querySelector('#gps-map').innerHTML = `<iframe src='${mapUrl}' width='100%' height='350' style='border:0;border-radius:10px;' loading='lazy'></iframe>`;
                // Mostrar botón de enviar ubicación
                const enviarBtn = modal.querySelector('#enviar-ubicacion');
                enviarBtn.style.display = 'block';
                enviarBtn.onclick = function() {
                    // Simula el envío al restaurante (puedes guardar en localStorage o mostrar mensaje)
                    const cliente = JSON.parse(localStorage.getItem('clienteRegistrado')) || {};
                    const userKey = cliente && cliente.email ? cliente.email : 'anonimo';
                    localStorage.setItem('ubicacionCliente_' + userKey, JSON.stringify({lat, lon, fecha: new Date().toISOString()}));
                    modal.querySelector('#gps-success').textContent = '¡Ubicación enviada al restaurante!';
                    enviarBtn.disabled = true;
                };
            }, function(err) {
                modal.querySelector('#gps-error').textContent = 'No se pudo obtener tu ubicación.';
                modal.querySelector('#gps-map').textContent = '';
            });
        } else {
            modal.querySelector('#gps-error').textContent = 'Tu navegador no soporta geolocalización.';
            modal.querySelector('#gps-map').textContent = '';
        }
    }

    // --- HISTORIAL: Mostrar historial de ubicaciones enviadas y compras ---
    const historialBtn = document.querySelector('.fa-history')?.closest('a');
    if (historialBtn) {
        historialBtn.addEventListener('click', function(e) {
            e.preventDefault();
            mostrarHistorialModal();
        });
    }

    function mostrarHistorialModal() {
        let modal = document.getElementById('historial-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'historial-modal';
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
        // Obtener usuario actual
        const cliente = JSON.parse(localStorage.getItem('clienteRegistrado')) || {};
        const userKey = cliente && cliente.email ? cliente.email : 'anonimo';
        // Historial de ubicaciones (solo la última enviada por este usuario)
        let ubicaciones = [];
        const ubicacionActual = localStorage.getItem('ubicacionCliente_' + userKey);
        if (ubicacionActual) {
            ubicaciones.push(JSON.parse(ubicacionActual));
        }
        // Historial de compras solo de este usuario
        let comprasPorUsuario = JSON.parse(localStorage.getItem('historialCompras_' + userKey)) || [];
        modal.innerHTML = `
            <div style="background:#fff;padding:32px 24px 24px 24px;border-radius:16px;min-width:340px;max-width:98vw;max-height:92vh;overflow:auto;position:relative;box-shadow:0 8px 32px rgba(0,0,0,0.18);">
                <h2 style="margin-bottom:18px;text-align:center;">Historial</h2>
                <button id="close-historial-modal" style="position:absolute;top:12px;right:12px;font-size:22px;background:none;border:none;cursor:pointer;">&times;</button>
                <button id="limpiar-historial" style="position:absolute;top:12px;left:12px;font-size:15px;background:#ff3e3e;color:#fff;border:none;padding:7px 16px;border-radius:7px;cursor:pointer;">Limpiar Historial</button>
                <div style='margin-top:30px;'>
                  <h3 style='margin:0 0 10px 0;color:#ff5722;'>Ubicaciones enviadas</h3>
                  <div style='display:flex;flex-direction:column;gap:16px;'>
                  ${ubicaciones.length === 0 ? '<div style="color:#888;">No has enviado ubicaciones.</div>' :
                    ubicaciones.map(u => `
                      <div style='background:#f7f7f7;border-radius:10px;padding:16px 18px;box-shadow:0 2px 8px rgba(0,0,0,0.06);display:flex;flex-direction:column;gap:6px;'>
                        <div style='font-size:1.05em;'><b>Lat:</b> ${u.lat.toFixed(5)}, <b>Lon:</b> ${u.lon.toFixed(5)}</div>
                        <div style='font-size:0.97em;color:#666;'><i class="fas fa-calendar-alt" style="margin-right:5px;color:#ff9800;"></i>${new Date(u.fecha).toLocaleString()}</div>
                      </div>
                    `).join('')}
                  </div>
                </div>
                <div style='margin-top:32px;'>
                  <h3 style='margin:0 0 10px 0;color:#ff5722;'>Compras realizadas</h3>
                  <div style='display:flex;flex-direction:column;gap:16px;'>
                  ${comprasPorUsuario.length === 0 ? '<div style="color:#888;">No has realizado compras.</div>' :
                    comprasPorUsuario.map(c => `
                      <div style='background:#f7f7f7;border-radius:10px;padding:16px 18px;box-shadow:0 2px 8px rgba(0,0,0,0.06);display:flex;flex-direction:column;gap:7px;'>
                        <div style='font-size:1.08em;'><b>Total:</b> <span style="color:#388e3c;">${c.total}</span></div>
                        <div style='font-size:0.97em;color:#666;'><i class="fas fa-calendar-alt" style="margin-right:5px;color:#ff9800;"></i>${new Date(c.fecha).toLocaleString()}</div>
                        <div style='font-size:0.98em;'><b>Productos:</b> <span style="color:#333;">${c.productos.map(p => `${p.nombre} <span style='color:#ff5722;'>x${p.cantidad}</span>`).join(', ')}</span></div>
                      </div>
                    `).join('')}
                  </div>
                </div>
            </div>
        `;
        modal.querySelector('#close-historial-modal').onclick = () => modal.remove();
        // Limpiar historial
        modal.querySelector('#limpiar-historial').onclick = function() {
            if (confirm('¿Seguro que deseas borrar todo tu historial?')) {
                localStorage.removeItem('historialCompras_' + userKey);
                localStorage.removeItem('ubicacionCliente_' + userKey);
                mostrarHistorialModal();
            }
        };
    }

    // Guardar compra en historial al finalizar compra SOLO para el usuario actual
    function guardarCompraEnHistorial(productos, total) {
        const cliente = JSON.parse(localStorage.getItem('clienteRegistrado')) || {};
        const userKey = cliente && cliente.email ? cliente.email : 'anonimo';
        let compras = JSON.parse(localStorage.getItem('historialCompras_' + userKey)) || [];
        compras.push({ productos, total, fecha: new Date().toISOString() });
        localStorage.setItem('historialCompras_' + userKey, JSON.stringify(compras));
    }

    // --- 1. MENSAJE DE BIENVENIDA PERSONALIZADO SEGÚN HORA ---
    function mensajeBienvenida() {
        const headerTitle = document.querySelector('main header h1');
        let cliente = JSON.parse(localStorage.getItem('clienteRegistrado')) || {};
        let nombre = cliente.nombre || 'Cliente';
        const hora = new Date().getHours();
        let saludo = '¡Bienvenido';
        if (hora >= 6 && hora < 12) saludo = '¡Buenos días';
        else if (hora >= 12 && hora < 20) saludo = '¡Buenas tardes';
        else saludo = '¡Buenas noches';
        if (headerTitle) headerTitle.textContent = `${saludo}, ${nombre}!`;
    }
    mensajeBienvenida();

    // --- 2. SCROLL INFINITO/PAGINACIÓN EN PLATOS ---
    let platosPorPagina = 6;
    let paginaActual = 1;
    let platosFiltrados = [];
    let favoritos = JSON.parse(localStorage.getItem('favoritosCliente')) || [];

    // Nueva función para enlazar los botones de agregar al carrito
    function enlazarBotonesCarrito() {
        document.querySelectorAll('.add-to-cart').forEach(btn => {
            // Evita múltiples listeners
            btn.onclick = null;
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const card = btn.closest('.food-card');
                const nombre = card.querySelector('h3').textContent;
                const precio = card.querySelector('.price').textContent;
                const imgTag = card.querySelector('img');
                const img = imgTag ? imgTag.src : '';

                // Busca si ya está en el carrito
                const idx = cart.findIndex(item => item.nombre === nombre);
                if (idx !== -1) {
                    cart[idx].cantidad += 1;
                } else {
                    cart.push({ nombre, precio, img, cantidad: 1 });
                }
                saveCart();
                showAddedNotification(nombre);
            });
        });
    }

    function renderPlatos(pagina = 1, reset = false) {
        const foodGrid = document.getElementById('food-grid');
        if (!foodGrid) return;
        if (reset) foodGrid.innerHTML = '';
        let platos = platosFiltrados.length ? platosFiltrados : (JSON.parse(localStorage.getItem('platos')) || []);
        if (platos.length === 0) {
            if (reset) foodGrid.innerHTML += '<div style="color:#888;margin:20px 0;">No hay platos disponibles.</div>';
            return;
        }
        let inicio = (pagina - 1) * platosPorPagina;
        let fin = inicio + platosPorPagina;
        let platosPagina = platos.slice(inicio, fin);
        platosPagina.forEach(plato => {
            const card = document.createElement('div');
            card.className = 'food-card';
            let tieneImagen = plato.img && plato.img.trim() !== '';
            card.innerHTML = `
                <div class="food-image">
                    ${tieneImagen ? `<img src="${plato.img}" alt="${plato.nombre}" onerror="this.parentNode.innerHTML='<div style=\'width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#ccc;color:#555;font-weight:bold;font-size:1.1em;\'>Sin imagen</div>'">` : `<div style='width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#ccc;color:#555;font-weight:bold;font-size:1.1em;'>Sin imagen</div>`}
                </div>
                <div class="food-info">
                    <h3>${plato.nombre}</h3>
                    <p>${plato.descripcion || ''}</p>
                    <div class="food-footer">
                        <span class="price">${plato.precio}</span>
                        <button class="add-to-cart feature-link"><i class="fas fa-cart-plus"></i></button>
                        <button class="fav-btn" title="Favorito" style="background:none;border:none;color:${favoritos.includes(plato.nombre)?'#ff5722':'#bbb'};font-size:20px;cursor:pointer;"><i class="fas fa-heart"></i></button>
                    </div>
                </div>
            `;
            foodGrid.appendChild(card);
        });
        enlazarBotonesCarrito(); // <-- Enlazar aquí después de renderizar
        enlazarBotonesFavoritos();
    }

    // --- FILTROS: Lógica para mostrar/ocultar platos según filtros seleccionados ---
    // Se elimina la sección de categorías populares
    function renderizarFiltros() {
        const contenedorFiltros = document.getElementById('filtros-container');
        if (!contenedorFiltros) return;
        contenedorFiltros.innerHTML = '';
        // Solo filtros básicos (sin categorías populares)
        // Checkbox para favoritos
        const labelFav = document.createElement('label');
        labelFav.style.display = 'block';
        labelFav.style.marginBottom = '8px';
        labelFav.innerHTML = `
            <input type="checkbox" class="filtro-favoritos" style="margin-right:8px;">
            Solo favoritos
        `;
        contenedorFiltros.appendChild(labelFav);
        // Checkbox para disponibilidad
        const labelDisp = document.createElement('label');
        labelDisp.style.display = 'block';
        labelDisp.style.marginBottom = '8px';
        labelDisp.innerHTML = `
            <input type="checkbox" class="filtro-disponibles" style="margin-right:8px;">
            Solo disponibles
        `;
        contenedorFiltros.appendChild(labelDisp);
        // Evento para filtrar al cambiar checkbox
        contenedorFiltros.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            cb.onchange = function() {
                aplicarFiltros();
            };
        });
    }

    // --- BUSCADOR DE PLATOS: Buscar solo por nombre exacto creado ---
    const buscador = document.getElementById('buscador-platos');
    if (buscador) {
        buscador.addEventListener('input', function() {
            const query = buscador.value.trim().toLowerCase();
            if (query === '') {
                platosFiltrados = [];
                renderPlatos(1, true);
                return;
            }
            platosFiltrados = (JSON.parse(localStorage.getItem('platos')) || []).filter(plato => plato.nombre && plato.nombre.toLowerCase().includes(query));
            renderPlatos(1, true);
        });
    }

    // --- INICIO: Cargar platos y categorías al iniciar ---
    // Carga inicial de platos y categorías desde localStorage
    renderPlatos(1, true);
    renderizarFiltros();
});