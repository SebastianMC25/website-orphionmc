# 🏛️ OrphionMC - MMORPG Web

Sitio web estático moderno para el servidor MMORPG de Minecraft inspirado en la mitología griega **OrphionMC**. Optimizado para ser alojado directamente en **GitHub Pages** sin necesidad de bases de datos ni backend adicional.

---

## ✨ Características

- ⚡ **100% Estático y Rápido**: Carga instantánea, sin servidores backend ni dependencias complejas.
- 🎨 **Diseño RPG Mitológico**: Tipografías Cinzel y MedievalSharp, acentos dorados, efectos de partículas míticas y estética inmersiva.
- 🎬 **Animaciones Fluidas**: Integración con **GSAP** y **ScrollTrigger** para transiciones visuales y efectos de parallax.
- 🎮 **Estado en Vivo del Servidor**: Conexión directa con la API pública de `mcsrvstat.us` para mostrar jugadores conectados en tiempo real.
- 📋 **Copiar IP con un Clic**: Botón interactivo para copiar la dirección IP (`play.orphionmc.net`) al portapapeles.
- 📱 **Totalmente Responsive**: Menú móvil lateral adaptado a teléfonos, tablets y pantallas de escritorio.
- 🚀 **Despliegue Automático en GitHub Pages**: Incluye workflow de GitHub Actions (`.github/workflows/deploy.yml`) para despliegue continuo con cada `git push`.
- 🔍 **Optimización SEO y PWA**: `sitemap.xml`, `robots.txt`, `manifest.json` y `sw.js` (Service Worker) para experiencia offline y caché eficiente.

---

## 📁 Estructura del Proyecto

```
web/
├── index.html              # Página principal (Landing Page MMORPG)
├── 404.html                # Página de error 404 personalizada
├── 403.html                # Página de acceso restringido 403
├── clear-cache.html        # Herramienta para limpiar Service Worker y caché
├── CNAME                   # Dominio personalizado (orphionmc.net)
├── robots.txt              # Reglas para motores de búsqueda (SEO)
├── sitemap.xml             # Mapa del sitio (SEO)
├── manifest.json           # Manifiesto de Progressive Web App (PWA)
├── sw.js                   # Service Worker para caché estática
│
├── css/
│   └── custom.css          # Estilos y animaciones completas
│
├── js/
│   ├── main.js             # Lógica de navegación, animaciones GSAP y partículas
│   └── server-status.js    # Consulta en vivo de jugadores y estado del servidor
│
├── legal/
│   └── terms.html          # Términos de Servicio y normas de la comunidad
│
├── assets/
│   └── images/             # Logotipos, fondos, pósters e iconos
│
└── .github/
    └── workflows/
        └── deploy.yml      # Workflow de GitHub Actions para GitHub Pages
```

---

## 🚀 Cómo Subir y Publicar en GitHub

### 1. Inicializar y subir al repositorio de GitHub

Si aún no has vinculado tu repositorio en GitHub:

```bash
# 1. Comprobar el estado de los archivos
git status

# 2. Agregar todos los archivos
git add .

# 3. Crear el commit
git commit -m "feat: transformar en sitio web estático para GitHub Pages"

# 4. Asignar la rama principal
git branch -M main

# 5. Conectar con tu repositorio remoto de GitHub (reemplaza con tu URL)
git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git

# 6. Subir los cambios
git push -u origin main
```

### 2. Activar GitHub Pages

1. Ve a tu repositorio en **GitHub**.
2. Dirígete a **Settings** > **Pages** (en el menú lateral izquierdo).
3. En **Build and deployment**:
   - **Source**: Selecciona **GitHub Actions** (se desplegará automáticamente usando el archivo `.github/workflows/deploy.yml` que ya está configurado).
   - *Alternativa*: Puedes seleccionar **Deploy from a branch**, elegir `main` y `/ (root)`, luego guardar.
4. En pocos segundos tu sitio web estará disponible en:
   - `https://TU_USUARIO.github.io/TU_REPOSITORIO/` (o en tu dominio personalizado si configuras `orphionmc.net`).

---

## 💻 Vista Previa Local

Para probar la página web en tu máquina local antes de subirla:

```bash
# Usando npx serve
npx serve .

# O usando Python (si tienes Python instalado)
python -m http.server 8080
```

Luego abre tu navegador en `http://localhost:3000` o `http://localhost:8080`.

---

## ⚖️ Licencia y Créditos

- **OrphionMC Team** - Diseño y Desarrollo Web.
- Todos los derechos reservados. No afiliado con Mojang AB ni Microsoft.
