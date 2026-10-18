# 🏛️ OrphionMC - MMORPG Web Platform

**OrphionMC** es una plataforma web completa para un servidor MMORPG de Minecraft inspirado en la mitología griega. Este proyecto incluye una página principal, sistema de foro con autenticación, backend API con Node.js/Express, y sistema de subdominios.

---

## 📋 Tabla de Contenidos

- [Características Principales](#-características-principales)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Tecnologías Utilizadas](#-tecnologías-utilizadas)
- [Instalación y Configuración](#-instalación-y-configuración)
- [Sistema de Subdominios](#-sistema-de-subdominios)
- [Configuración del Backend](#-configuración-del-backend)
- [Personalización del Diseño](#-personalización-del-diseño)
- [Sistema de Build y Producción](#-sistema-de-build-y-producción)
- [Seguridad](#-seguridad)
- [Cloudflare y DNS](#-cloudflare-y-dns)
- [Mantenimiento](#-mantenimiento)

---

## ✨ Características Principales

### Frontend
- ✅ **Página principal moderna** con video de fondo y animaciones GSAP
- ✅ **Sistema de foro completo** con categorías, hilos y respuestas
- ✅ **Autenticación de usuarios** (registro, login, sesiones persistentes)
- ✅ **Autenticación con Discord OAuth2**
- ✅ **Panel de administración** para staff
- ✅ **Diseño responsive** optimizado para móviles y tablets
- ✅ **Progressive Web App (PWA)** con manifest.json
- ✅ **Estado del servidor en tiempo real** (muestra jugadores conectados)

### Backend
- ✅ **API RESTful** con Express.js
- ✅ **Base de datos SQLite** para usuarios, foro y sesiones
- ✅ **Sistema de sesiones** con cookies compartidas entre subdominios
- ✅ **Rate limiting** para prevenir abuso
- ✅ **Seguridad avanzada** con Helmet, CSRF protection, y fingerprinting
- ✅ **Sistema de roles** (usuario, moderador, administrador)
- ✅ **Protección anti-bot** con honeypots

---

## 📁 Estructura del Proyecto

```
web/
├── index.html              # Página principal (landing page)
├── forum.html              # Página del foro
├── login.html              # Página de inicio de sesión
├── register.html           # Página de registro
├── profile.html            # Perfil de usuario
├── view_category.html      # Vista de categoría del foro
├── view_thread.html        # Vista de hilo del foro
├── create_thread.html      # Crear nuevo hilo
├── staff_dashboard.html    # Panel de administración
├── 403.html                # Página de error 403
├── clear-cache.html        # Utilidad para limpiar caché
│
├── css/
│   └── custom.css          # Estilos personalizados principales
│
├── js/
│   ├── main.js             # Lógica principal (navegación, animaciones)
│   ├── config.js           # Configuración de API y dominio
│   ├── auth.js             # Sistema de autenticación
│   ├── forum.js            # Lógica del foro
│   ├── server-status.js    # Estado del servidor Minecraft
│   ├── stats.js            # Estadísticas del usuario
│   └── recent_posts.js     # Posts recientes
│
├── assets/
│   └── images/             # Imágenes, iconos, SVGs
│
├── server/                 # Backend Node.js
│   ├── server.js           # Servidor principal con subdominios
│   ├── package.json        # Dependencias del servidor
│   ├── .env.example        # Ejemplo de variables de entorno
│   ├── schema.sql          # Esquema de base de datos
│   ├── database_init.js    # Inicialización de DB
│   ├── backup.js           # Script de backup automático
│   │
│   └── core/               # Módulos del servidor
│       ├── main.js         # Router principal (landing page)
│       ├── forum.js        # Router del foro
│       ├── api.js          # Router de la API
│       ├── db.js           # Conexión a base de datos
│       ├── middleware.js   # Middlewares personalizados
│       ├── security_logic.js # Lógica de seguridad
│       ├── antibot.js      # Protección anti-bot
│       └── discord_auth.js # Autenticación con Discord
│
├── dist/                   # Archivos de producción (generados)
├── build.js                # Script de build para producción
├── manifest.json           # Configuración PWA
├── sw.js                   # Service Worker (actualmente deshabilitado)
├── sitemap.xml             # Mapa del sitio para SEO
├── cloudflare_config.md    # Guía de configuración de Cloudflare
└── security_guide.md       # Guía de seguridad
```

---

## 🛠️ Tecnologías Utilizadas

### Frontend
- **HTML5** - Estructura semántica
- **CSS3** - Estilos personalizados con variables CSS
- **JavaScript (Vanilla)** - Sin frameworks pesados
- **GSAP** - Animaciones suaves y ScrollTrigger
- **Font Awesome** - Iconos
- **Google Fonts** - Tipografías (Cinzel, MedievalSharp, Inter)

### Backend
- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web
- **SQLite3** - Base de datos ligera
- **bcrypt** - Hashing de contraseñas
- **express-session** - Manejo de sesiones
- **connect-sqlite3** - Almacenamiento de sesiones
- **Helmet** - Headers de seguridad
- **express-rate-limit** - Limitación de peticiones
- **axios** - Cliente HTTP
- **dotenv** - Variables de entorno

### Herramientas de Build
- **javascript-obfuscator** - Ofuscación de código JS
- **html-minifier** - Minificación de HTML
- **clean-css** - Minificación de CSS
- **glob** - Búsqueda de archivos

---

## 🚀 Instalación y Configuración

### Requisitos Previos
- **Node.js** v16 o superior
- **npm** (incluido con Node.js)

### Paso 1: Instalar Dependencias

```bash
# Instalar dependencias del frontend (build tools)
npm install

# Instalar dependencias del backend
cd server
npm install
cd ..
```

### Paso 2: Configurar Variables de Entorno

Crea un archivo `.env` en la carpeta `server/` basándote en `.env.example`:

```bash
cd server
cp .env.example .env
```

Edita el archivo `.env` con tus credenciales de Discord:

```env
DISCORD_CLIENT_ID=tu_client_id_aqui
DISCORD_CLIENT_SECRET=tu_client_secret_aqui
DISCORD_REDIRECT_URI=http://api.OrphionMC.local:3000/auth/discord/callback
```

> **Nota**: Para obtener las credenciales de Discord, ve a [Discord Developer Portal](https://discord.com/developers/applications)

### Paso 3: Inicializar la Base de Datos

```bash
cd server
npm run init-db
```

Esto creará la base de datos SQLite con todas las tablas necesarias.

### Paso 4: Ejecutar el Servidor

```bash
# Modo desarrollo (con auto-reload)
npm run dev

# Modo producción
npm start
```

El servidor se ejecutará en el puerto **3000** por defecto.

---

## 🌐 Sistema de Subdominios

El proyecto utiliza un sistema de **subdominios virtuales** que permite servir diferentes partes de la aplicación desde un solo servidor Node.js.

### Subdominios Configurados

| Subdominio | Propósito | Router |
|------------|-----------|--------|
| `play.orphionmc.net` | Página principal (landing page) | `core/main.js` |
| `foro.OrphionMC.net` | Foro y páginas relacionadas | `core/forum.js` |
| `api.OrphionMC.net` | API REST para el frontend | `core/api.js` |

### Cómo Funciona

El archivo `server/server.js` contiene un **dispatcher** que detecta el subdominio o ruta y redirige la petición al router correspondiente:

```javascript
// 1. API Subdomain or Path
if (hostname.startsWith('api.') || requestPath.startsWith('/api')) {
    return apiRouter(req, res, next);
}

// 2. Foro Subdomain or Path
if (hostname.startsWith('foro.') || requestPath.startsWith('/foro')) {
    return forumRouter(req, res, next);
}

// 3. Main Site (play. or IP)
next(); // Pasa al mainRouter
```

### Configuración Local (Desarrollo)

Para probar los subdominios en tu máquina local, necesitas editar el archivo **hosts**:

#### Windows
1. Abre el Bloc de notas como **Administrador**
2. Abre el archivo: `C:\Windows\System32\drivers\etc\hosts`
3. Agrega estas líneas:

```
127.0.0.1    OrphionMC.local
127.0.0.1    play.OrphionMC.local
127.0.0.1    foro.OrphionMC.local
127.0.0.1    api.OrphionMC.local
```

4. Guarda el archivo

#### Linux/Mac
```bash
sudo nano /etc/hosts
```

Agrega las mismas líneas y guarda.

### Acceder a la Aplicación

Después de configurar el archivo hosts y ejecutar el servidor:

- **Página principal**: http://play.OrphionMC.local:3000
- **Foro**: http://foro.OrphionMC.local:3000
- **API**: http://api.OrphionMC.local:3000

### Cambiar el Dominio

Para cambiar el dominio (por ejemplo, de `OrphionMC.local` a `OrphionMC.net` en producción):

1. **Edita `server/server.js`** línea 56:
```javascript
const DOMAIN = process.env.DOMAIN || 'OrphionMC.net'; // Cambiar aquí
```

2. **O usa una variable de entorno**:
```bash
export DOMAIN=OrphionMC.net
npm start
```

### Cambiar el Puerto

Para cambiar el puerto del servidor (por defecto 3000):

**Edita `server/server.js`** línea 13:
```javascript
const PORT = 3000; // Cambiar aquí
```

O usa una variable de entorno:
```bash
export PORT=8080
npm start
```

---

## ⚙️ Configuración del Backend

### Base de Datos

El proyecto usa **SQLite3** con tres bases de datos:

1. **`OrphionMC_forum.db`** - Usuarios, foro, categorías, hilos, posts
2. **`sessions.db`** - Sesiones de usuarios
3. **`sessions.db`** (en raíz) - Sesiones compartidas

#### Esquema Principal

```sql
-- Usuarios
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Categorías del foro
CREATE TABLE categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT
);

-- Hilos del foro
CREATE TABLE threads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER,
    title TEXT NOT NULL,
    author_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_pinned INTEGER DEFAULT 0,
    is_locked INTEGER DEFAULT 0
);

-- Posts del foro
CREATE TABLE posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    thread_id INTEGER,
    author_id INTEGER,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### API Endpoints

#### Autenticación
- `POST /auth/register` - Registrar nuevo usuario
- `POST /auth/login` - Iniciar sesión
- `POST /auth/logout` - Cerrar sesión
- `GET /auth/me` - Obtener usuario actual
- `GET /auth/discord` - Iniciar OAuth con Discord
- `GET /auth/discord/callback` - Callback de Discord

#### Foro
- `GET /categories` - Listar categorías
- `GET /categories/:id/threads` - Hilos de una categoría
- `POST /threads` - Crear nuevo hilo
- `GET /threads/:id` - Obtener hilo y sus posts
- `POST /threads/:id/posts` - Crear post en un hilo
- `DELETE /threads/:id` - Eliminar hilo (staff)
- `DELETE /posts/:id` - Eliminar post (staff)

#### Usuario
- `GET /users/:id` - Perfil de usuario
- `GET /users/:id/stats` - Estadísticas del usuario

### Sesiones y Cookies

Las sesiones se comparten entre subdominios usando la configuración:

```javascript
cookie: {
    domain: '.OrphionMC.net', // El punto permite compartir entre subdominios
    secure: false,           // Cambiar a true en producción con HTTPS
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
}
```

### Configuración de API en el Frontend

El archivo `js/config.js` detecta automáticamente el entorno y configura la URL de la API:

```javascript
const CONFIG = {
    get API_BASE() {
        const host = window.location.hostname;
        
        // Si es localhost o IP, usa /api
        if (host === 'localhost' || isIP) {
            return `${window.location.origin}/api`;
        }
        
        // Si es subdominio, usa api.dominio.com
        const domain = parts.slice(-2).join('.');
        return `${window.location.protocol}//api.${domain}`;
    }
};
```

**Para cambiar la configuración de API**, edita `js/config.js`.

---

## 🎨 Personalización del Diseño

### Colores y Tema

Los colores principales están definidos en `css/custom.css` usando variables CSS:

```css
:root {
    /* Colores principales */
    --gold: #d4af37;
    --gold-light: #f4d03f;
    --gold-dark: #b8941f;
    
    /* Fondos */
    --bg-dark: #0d0d0d;
    --bg-card: rgba(20, 20, 20, 0.9);
    
    /* Texto */
    --text-primary: #ffffff;
    --text-secondary: #b0b0b0;
    
    /* Acentos */
    --accent-blue: #4a90e2;
    --accent-purple: #9b59b6;
}
```

**Para cambiar los colores**, edita estas variables en `css/custom.css`.

### Tipografías

Las fuentes se cargan desde Google Fonts en `index.html`:

```html
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=MedievalSharp&family=Inter:wght@400;600&display=swap" rel="stylesheet">
```

**Para cambiar las fuentes**:
1. Busca nuevas fuentes en [Google Fonts](https://fonts.google.com/)
2. Reemplaza el link en todos los archivos HTML
3. Actualiza las referencias en `css/custom.css`

### Video de Fondo

El video de fondo está en `inicio.mp4`. Para cambiarlo:

1. Reemplaza el archivo `inicio.mp4` con tu nuevo video
2. Asegúrate de que el formato sea **MP4** y esté optimizado para web
3. Recomendación: máximo 1080p, 30fps, bitrate moderado

### Imágenes y Logos

Las imágenes están en `assets/images/`. Para cambiar:

- **Logo/Favicon**: `assets/images/favicon.svg`
- **Iconos PWA**: `assets/images/icon-192.svg` y `icon-512.svg`
- **Imágenes de noticias**: Edita las URLs en `index.html` sección de noticias

### Modificar Secciones de la Página Principal

#### Cambiar el Título Principal

Edita `index.html` línea 127:
```html
<h1 class="hero-title">OrphionMC</h1>
```

#### Cambiar la IP del Servidor

Edita `index.html` línea 132:
```html
<span class="ip-text">play.orphionmc.net</span>
```

#### Modificar Noticias

Las noticias están en `index.html` líneas 186-226. Cada noticia tiene esta estructura:

```html
<article class="news-card">
    <div class="news-image" style="background-image: url('URL_IMAGEN');"></div>
    <div class="news-info">
        <span class="news-date">Fecha</span>
        <h3>Título</h3>
        <p>Descripción</p>
        <a href="#" class="news-link">Leer más <i class="fa fa-arrow-right"></i></a>
    </div>
</article>
```

#### Cambiar Enlaces de Redes Sociales

Edita `index.html` líneas 74-79 (navbar) y 291-296 (footer):

```html
<a href="https://discord.gg/orphionmc" target="_blank">
<a href="https://www.youtube.com/channel/UCxnTxY8q4eg3RpkwvY2btPw" target="_blank">
<a href="https://www.tiktok.com/@OrphionMC_network" target="_blank">
```

---

## 📦 Sistema de Build y Producción

El proyecto incluye un sistema de build que **minifica y ofusca** el código para producción.

### Ejecutar el Build

```bash
node build.js
```

Esto creará una carpeta `dist/` con:
- ✅ **JavaScript ofuscado** (difícil de leer/copiar)
- ✅ **HTML minificado** (sin espacios ni comentarios)
- ✅ **CSS minificado** (optimizado)
- ✅ **Assets copiados** (imágenes, videos, etc.)

### Configuración del Build

El archivo `build.js` tiene opciones de ofuscación configurables:

```javascript
const obfuscated = JavaScriptObfuscator.obfuscate(code, {
    compact: true,                    // Compactar código
    controlFlowFlattening: true,      // Dificultar lectura
    deadCodeInjection: true,          // Código falso
    debugProtection: true,            // Anti-debugging
    disableConsoleOutput: true,       // Deshabilitar console.log
    identifierNamesGenerator: 'hexadecimal', // Nombres en hex
    selfDefending: true,              // Auto-protección
    stringArray: true,                // Ofuscar strings
    transformObjectKeys: true,        // Ofuscar keys de objetos
    unicodeEscapeSequence: true       // Escapar a unicode
});
```

**Para ajustar la ofuscación**, edita estas opciones en `build.js`.

### Archivos Excluidos del Build

Los siguientes archivos/carpetas NO se incluyen en `dist/`:

```javascript
const EXCLUDES = [
    'node_modules',
    'dist',
    'server',
    'build.js',
    'package.json',
    'package-lock.json',
    '.env',
    '.git',
    'sessions.db',
    'OrphionMC_forum.db'
];
```

### Desplegar a Producción

1. **Ejecuta el build**:
```bash
node build.js
```

2. **Sube la carpeta `dist/`** a tu servidor web (Apache, Nginx, etc.)

3. **Configura el backend** en el servidor:
```bash
cd server
npm install --production
npm start
```

4. **Configura un proxy reverso** (Nginx) para manejar subdominios:

```nginx
# Ejemplo de configuración Nginx
server {
    listen 80;
    server_name OrphionMC.net *.OrphionMC.net;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 🔒 Seguridad

El proyecto implementa múltiples capas de seguridad:

### Backend

#### 1. Headers de Seguridad (Helmet)
```javascript
app.use(helmet({
    contentSecurityPolicy: false, // Deshabilitado para desarrollo
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    }
}));
```

#### 2. Rate Limiting
```javascript
const globalLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutos
    max: 200,                  // 200 peticiones por IP
    message: { error: "Demasiadas peticiones..." }
});
```

**Para cambiar los límites**, edita `server/server.js` líneas 43-50.

#### 3. Session Fingerprinting

El servidor valida que la IP y User-Agent no cambien durante una sesión:

```javascript
if (req.session.fingerprint.ua !== currentFingerprint.ua) {
    console.warn(`Session fingerprint mismatch`);
    return req.session.destroy();
}
```

#### 4. Protección Anti-Bot (Honeypot)

Los formularios incluyen un campo invisible que los bots llenan automáticamente:

```html
<input type="text" name="website_field" style="display:none" tabindex="-1">
```

El backend rechaza peticiones si este campo está lleno.

#### 5. Hashing de Contraseñas

Las contraseñas se hashean con **bcrypt** (10 rounds):

```javascript
const bcrypt = require('bcrypt');
const hash = await bcrypt.hash(password, 10);
```

### Frontend

#### 1. Validación de Inputs

Todos los formularios validan datos antes de enviar:

```javascript
if (!username || username.length < 3) {
    alert('El nombre de usuario debe tener al menos 3 caracteres');
    return;
}
```

#### 2. Escape de HTML

El contenido del foro se escapa para prevenir XSS:

```javascript
function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
```

### Recomendaciones Adicionales

Para producción, se recomienda:

1. **Habilitar HTTPS** y cambiar `secure: true` en las cookies
2. **Configurar CSP** (Content Security Policy) en Helmet
3. **Usar variables de entorno** para secretos (no hardcodear)
4. **Implementar 2FA** (ya incluido con Discord OAuth)
5. **Backups automáticos** (script incluido en `server/backup.js`)

---

## ☁️ Cloudflare y DNS

### Configuración de DNS

Para usar subdominios en producción, configura estos registros DNS en Cloudflare:

| Tipo | Nombre | Contenido | Proxy |
|------|--------|-----------|-------|
| A | @ | IP_DEL_SERVIDOR | ✅ Proxied |
| A | play | IP_DEL_SERVIDOR | ✅ Proxied |
| A | foro | IP_DEL_SERVIDOR | ✅ Proxied |
| A | api | IP_DEL_SERVIDOR | ✅ Proxied |

### Configuración Recomendada de Cloudflare

Ver el archivo `cloudflare_config.md` para la configuración completa. Resumen:

#### 1. Firewall / WAF
- ✅ **Bot Fight Mode**: Activado
- ✅ **JS Challenge**: Para tráfico sospechoso
- ✅ **Rate Limiting**: 50 req/min en `/api/*`

#### 2. Scrape Shield
- ✅ **Email Obfuscation**: Activado
- ✅ **Hotlink Protection**: Activado

#### 3. SSL/TLS
- ✅ **Mode**: Full (Strict)
- ✅ **HSTS**: Activado

#### 4. Speed
- ⚠️ **Auto Minify**: Desactivado (ya lo hacemos en build)
- ⚠️ **Rocket Loader**: Verificar compatibilidad

### Obtener IP Real con Cloudflare

Cuando usas Cloudflare, el servidor ve la IP de Cloudflare, no la del usuario. Para obtener la IP real:

**Ya configurado en `server/server.js`**:
```javascript
app.set('trust proxy', 1);
```

Cloudflare envía la IP real en el header `CF-Connecting-IP`.

---

## 🔧 Mantenimiento

### Backups Automáticos

El script `server/backup.js` crea copias de seguridad de las bases de datos.

**Ejecutar manualmente**:
```bash
cd server
node backup.js
```

**Programar backups automáticos**:

#### Windows (Task Scheduler)
1. Abre "Programador de tareas"
2. Crear tarea básica
3. Acción: Iniciar programa
4. Programa: `node`
5. Argumentos: `C:\ruta\al\proyecto\server\backup.js`
6. Frecuencia: Diaria a las 3 AM

#### Linux (Cron)
```bash
crontab -e
```

Agrega:
```
0 3 * * * node /ruta/al/proyecto/server/backup.js
```

### Limpiar Sesiones Expiradas

Las sesiones se limpian automáticamente, pero puedes hacerlo manualmente:

```bash
cd server
sqlite3 sessions.db "DELETE FROM sessions WHERE datetime(expired) < datetime('now');"
```

### Actualizar Dependencias

```bash
# Frontend
npm update

# Backend
cd server
npm update
```

### Monitoreo de Logs

El servidor imprime logs en consola. Para producción, usa un gestor de procesos como **PM2**:

```bash
npm install -g pm2
cd server
pm2 start server.js --name OrphionMC
pm2 logs OrphionMC
```

### Solución de Problemas Comunes

#### El servidor no inicia
- Verifica que el puerto 3000 no esté en uso
- Revisa que las dependencias estén instaladas
- Comprueba los permisos de la base de datos

#### Los subdominios no funcionan
- Verifica el archivo hosts (desarrollo)
- Comprueba la configuración DNS (producción)
- Revisa los logs del servidor

#### Las sesiones no persisten
- Verifica que `sessions.db` tenga permisos de escritura
- Comprueba la configuración de cookies en `server.js`
- Asegúrate de que el dominio esté configurado correctamente

#### Error 403 al acceder
- Revisa el rate limiting (puede estar bloqueando tu IP)
- Comprueba los logs del servidor
- Verifica que no estés llenando el campo honeypot

---

## 📞 Soporte y Contacto

**Creador**: Sebastian  
**Proyecto**: OrphionMC MMORPG Web Platform  
**Año**: 2024

---

## 📄 Licencia

© 2024 OrphionMC RPG. Todos los derechos reservados.

---

## 🎯 Próximos Pasos Recomendados

1. ✅ Configurar Discord OAuth2 (credenciales en `.env`)
2. ✅ Personalizar colores y diseño según tu marca
3. ✅ Crear contenido para el foro (categorías iniciales)
4. ✅ Configurar Cloudflare para protección
5. ✅ Implementar backups automáticos
6. ✅ Optimizar imágenes y videos para web
7. ✅ Configurar HTTPS en producción
8. ✅ Testear en diferentes dispositivos
9. ✅ Configurar Google Analytics (opcional)
10. ✅ Crear sitemap.xml actualizado

---

**¡Buena suerte con tu servidor OrphionMC! 🏛️⚔️**
