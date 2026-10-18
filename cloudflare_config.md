# Configuración Recomendada de Cloudflare para OrphionMC

Para maximizar la protección de la propiedad intelectual y evitar ataques, se recomienda la siguiente configuración en el panel de Cloudflare:

## 1. DNS & Proxy
- Asegurarse de que todos los registros (`OrphionMC.net`, `foro`, `api`, `play`) tengan el icono de la nube en naranja (**Proxied**).

## 2. Firewall / WAF Rules
- **Bot Fight Mode**: Activar "Bot Fight Mode" para bloquear bots conocidos.
- **JS Challenge**: Crear una regla personalizada para que el tráfico sospechoso (ej. ASNs de centros de datos como AWS/DigitalOcean que no sean de búsqueda) pase por un desafío de JavaScript (JS Challenge).
- **Rate Limiting**: Configurar reglas específicas para `/api/auth/*` para limitar envíos de formularios.

## 3. Scrape Shield
- **Email Address Obfuscation**: Activado.
- **Server-side Excludes**: Activado (permite ocultar contenido sensible usando etiquetas `<!-- sse -->`).
- **Hotlink Protection**: Activado para evitar que otros sitios usen tus imágenes/assets.

## 4. Speed & Optimization
- **Rocket Loader**: Puede mejorar la carga de JS, pero verificar compatibilidad con el código ofuscado.
- **Auto Minify**: Se recomienda dejarlo desactivado en Cloudflare ya que ya realizamos la minificación en nuestro proceso de build.

## 5. SSL/TLS
- **Mode**: "Full (Strict)" para garantizar que el tráfico entre Cloudflare y tu servidor esté cifrado.
- **HSTS**: Activar en Cloudflare para forzar HTTPS a nivel de red.
