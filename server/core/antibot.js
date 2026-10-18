const crypto = require('crypto');

/**
 * Middleware para protección anti-bot avanzada en OrphionMC.
 */
const antiBotMiddleware = {
    /**
     * Genera un token efímero vinculado a la sesión para validar formularios.
     */
    initSession: (req, res) => {
        const token = crypto.randomBytes(16).toString('hex');
        const now = Date.now();

        req.session.antiBot = {
            token: token,
            createdAt: now,
            used: false
        };

        res.json({ token });
    },

    /**
     * Valida la petición contra comportamientos típicos de bots.
     */
    verify: (req, res, next) => {
        const { antibot_token, website_field } = req.body;
        const sessionData = req.session.antiBot;

        // 1. Verificar Honeypot (Campo trampa)
        // El campo 'website_field' debe estar vacío. Si un bot lo llena, es bloqueado.
        if (website_field && website_field.trim() !== "") {
            console.warn(`[Anti-Bot] Bloqueado por Honeypot: ${req.ip}`);
            return res.status(403).json({ error: "Comportamiento sospechoso detectado (Bot)" });
        }

        // 2. Verificar existencia del Token
        if (!sessionData || !antibot_token || sessionData.token !== antibot_token) {
            return res.status(403).json({ error: "Token de seguridad inválido o expirado" });
        }

        // 3. Verificar si el token ya fue usado (re-usabilidad)
        if (sessionData.used) {
            return res.status(403).json({ error: "Este formulario ya ha sido procesado" });
        }

        // 4. Verificar Tiempo de Envío (Time-to-Submit)
        // Un humano tarda al menos 2.5 segundos en enviar un formulario de login/registro.
        const timeDiff = Date.now() - sessionData.createdAt;
        if (timeDiff < 2500) {
            console.warn(`[Anti-Bot] Envío demasiado rápido (${timeDiff}ms): ${req.ip}`);
            return res.status(403).json({ error: "Estás enviando el formulario demasiado rápido. ¿Eres un humano?" });
        }

        // 5. Expiración de Token (15 minutos de gracia)
        if (timeDiff > 15 * 60 * 1000) {
            return res.status(403).json({ error: "La sesión del formulario ha expirado. Recarga la página." });
        }

        // Marcar como usado
        req.session.antiBot.used = true;
        next();
    }
};

module.exports = antiBotMiddleware;
