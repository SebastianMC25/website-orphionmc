# 🚀 Guía de Vinculación: Foro OrphionMC con Bot-Hosting

Esta guía detalla los pasos para conectar la base de datos MySQL y la API del foro en tu servidor de **Bot-Hosting**.

---

## 1. Obtener los Datos de la Base de Datos en Bot-Hosting

1. Ingresa a tu panel de control de **Bot-Hosting**.
2. Selecciona tu servidor y ve a la pestaña **Databases** (Bases de datos).
3. Haz clic en **Create Database** (si no has creado una aún).
4. El panel te mostrará la información de conexión:
   - **Endpoint / Host**: (Ej: `mysql-cluster.bot-hosting.net` o una IP/subdominio)
   - **Port**: (Generalmente `3306`)
   - **Database Name**: (Ej: `s1234_forum`)
   - **Username**: (Ej: `u1234_abc`)
   - **Password**: Haz clic en el icono del ojo o de candado para ver tu contraseña generada.

---

## 2. Configurar el Archivo de Entorno (`server/.env`)

Crea o edita el archivo `server/.env` (puedes basarte en `server/.env.example`) y coloca los valores de tu base de datos:

```env
# ==========================================
# Configuración del Servidor y Dominio
# ==========================================
PORT=3000
DOMAIN=orphionmc.net
NODE_ENV=production
COOKIE_SECURE=true
SESSION_SECRET=genera_un_texto_largo_y_seguro_aqui

# Si la web estática está en un dominio/host distinto al backend:
COOKIE_CROSS_DOMAIN=true

# ==========================================
# Base de Datos de Bot-Hosting (MySQL / MariaDB)
# ==========================================
DB_TYPE=mysql
DB_HOST=TU_HOST_DE_BOT_HOSTING
DB_PORT=3306
DB_USER=TU_USUARIO_DE_BOT_HOSTING
DB_PASSWORD=TU_CONTRASENA_DE_BOT_HOSTING
DB_NAME=TU_NOMBRE_DE_BASE_DE_DATOS

# ==========================================
# Orígenes permitidos (CORS)
# ==========================================
CORS_ALLOWED_ORIGINS=https://orphionmc.net,https://foro.orphionmc.net
```

---

## 3. Despliegue en Bot-Hosting

1. Sube la carpeta `server/` a los archivos de tu servidor de Bot-Hosting (o el proyecto completo).
2. Asegúrate de que el comando de inicio en la pestaña **Startup** sea:
   ```bash
   node server.js
   ```
3. El servidor ejecutará automáticamente `schema_mysql.sql` al conectarse a MySQL por primera vez, creando todas las tablas e índices necesarios (`users`, `categories`, `threads`, `posts`, etc.) y las categorías iniciales.
4. *(Opcional)* Si prefieres inicializar manualmente la base de datos:
   ```bash
   npm run init-db
   ```

---

## 4. Conectar la Página Web con la API de Bot-Hosting

Si tu página web está alojada en GitHub Pages o Cloudflare y tu API corre en Bot-Hosting:
1. Abre el archivo `js/config.js`.
2. Asigna la URL de tu backend en `CUSTOM_API`:
   ```javascript
   const CONFIG = {
       CUSTOM_API: 'https://tu-api.orphionmc.net', // o 'https://tu-servidor.bot-hosting.net:3000/api'
       ...
   ```
¡Listo! La página web cargará los temas, categorías, usuarios y el sistema de autenticación directamente desde la base de datos de tu Bot-Hosting.
