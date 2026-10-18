# OrphionMC: Guía de Protección Avanzada & Cloudflare WAF

Esta guía detalla la configuración recomendada para proteger OrphionMC contra ataques de denegación de servicio (DDoS), scrapers, bots y abuso.

## 1. Configuración de Cloudflare (WAF)

Para una protección premium, se deben implementar las siguientes reglas en el panel de Cloudflare:

### Regla de Firewall: Bloqueo de Bots
- **Acción**: Managed Challenge (Interactivo)
- **Expresión**: `(cf.client.bot) or (not cf.client.bot and cf.threat_score > 10)`
- **Propósito**: Filtra bots conocidos y tráfico sospechoso antes de que toque el servidor.

### Regla de Tasa (Rate Limiting)
- **Endpoint**: `api.OrphionMC.net/*`
- **Límite**: 50 peticiones por minuto por IP.
- **Acción**: Bloquear por 1 hora.

## 2. Protección Anti-Scraping (Honeypots)
Ya hemos implementado `antibot.js` en el servidor. 
> [!TIP]
> **Honeypot Invisible**: Asegúrate de que el campo `website_field` en los archivos HTML esté oculto mediante CSS (`display: none;`) y no por atributos `hidden`, para que los bots lo detecten como un campo real y lo llenen, activando el bloqueo.

## 3. Seguridad de IP (Real IP)
El servidor está configurado con `app.set('trust proxy', 1);`. 
**IMPORTANTE**: Debes configurar Nginx para que pase la cabecera `CF-Connecting-IP` al backend de Node, de lo contrario, el rate limiting bloqueará accidentalmente a Cloudflare en lugar de al atacante.

## 4. Backups Diarios
Se ha creado el archivo `server/backup.js`.
Se recomienda programar una tarea cron (Linux) o Task Scheduler (Windows):
```bash
# Ejemplo Cron (ejecución diaria a las 3 AM)
0 3 * * * node /ruta/al/proyecto/server/backup.js
```
