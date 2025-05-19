# FoodApp Backend

Este es un backend sencillo para FoodApp usando Node.js, Express y SQLite.

## Instalación

1. Instala las dependencias:
   ```
   npm install
   ```

2. Ejecuta el servidor:
   ```
   node server.js
   ```

El backend estará disponible en https://pagina-web-wm0x.onrender.com

## Endpoints principales
- POST /api/usuarios — Registro de usuario
- POST /api/login — Login
- POST /api/recuperar — Recuperar contraseña (simulado)
- POST /api/cambiar — Cambiar contraseña
- GET/POST/PUT/DELETE /api/platos — Gestión de platos

## Notas
- El archivo foodapp.db (base de datos) se crea automáticamente y no debe subirse a GitHub.
- No subas datos sensibles ni contraseñas reales.
