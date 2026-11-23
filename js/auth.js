const API_URL = window.CONFIG ? window.CONFIG.API_BASE : 'http://localhost:3000/api';

/**
 * Universal authenticated fetch helper
 * Automáticamente adjunta headers JSON, credenciales y token Bearer si existe
 */
window.authFetch = function(url, options = {}) {
    options = options || {};
    options.headers = options.headers || {};
    if (!options.headers['Accept']) {
        options.headers['Accept'] = 'application/json';
    }
    const token = localStorage.getItem('auth_token');
    if (token && !options.headers['Authorization']) {
        options.headers['Authorization'] = `Bearer ${token}`;
    }
    options.credentials = 'include';
    return fetch(url, options);
};

// Anti-Bot Token globally stored
let currentAntiBotToken = null;

async function initAntiBot() {
    try {
        const res = await fetch(`${API_URL}/auth/init`, { credentials: 'include' });
        const data = await res.json();
        currentAntiBotToken = data.token;

        // Update hidden inputs if they exist
        const tokenInputs = document.querySelectorAll('#antibot_token');
        tokenInputs.forEach(input => input.value = data.token);
    } catch (e) {
        console.error("Anti-bot initialization failed", e);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const errorBox = document.getElementById('error-box');

    // 0. Detect post-login redirect from Discord OAuth
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('discord_login') === '1' && urlParams.get('uname')) {
        const discordUser = {
            id: parseInt(urlParams.get('uid'), 10),
            username: urlParams.get('uname'),
            role: urlParams.get('urole') || 'user'
        };
        const authToken = urlParams.get('token');
        if (authToken) {
            localStorage.setItem('auth_token', authToken);
        }
        localStorage.setItem('user', JSON.stringify(discordUser));
        updateNavbarAuth(discordUser);

        // Clean query params from URL without refreshing
        urlParams.delete('discord_login');
        urlParams.delete('token');
        urlParams.delete('uid');
        urlParams.delete('uname');
        urlParams.delete('urole');
        const cleanQuery = urlParams.toString();
        const cleanUrl = window.location.pathname + (cleanQuery ? '?' + cleanQuery : '');
        window.history.replaceState({}, document.title, cleanUrl);
    }

    // Check session on load
    checkSession();

    // Set dynamic Discord OAuth link based on active domain/API
    const discordBtn = document.getElementById('btn-discord-login');
    if (discordBtn) {
        discordBtn.href = `${API_URL}/auth/discord`;
    }

    function showError(msg) {
        if (errorBox) {
            errorBox.textContent = msg;
            errorBox.style.display = 'block';
        } else {
            alert(msg);
        }
    }
});

window.checkAuth = async function() {
    let user = null;
    try {
        const stored = localStorage.getItem('user');
        if (stored) user = JSON.parse(stored);
    } catch (e) {}

    try {
        const res = await fetch(`${API_URL}/me`, { credentials: 'include' });
        if (res.ok) {
            user = await res.json();
            localStorage.setItem('user', JSON.stringify(user));
            return user;
        }
    } catch (e) {}

    return user;
};

async function checkSession() {
    try {
        const res = await fetch(`${API_URL}/me`, { credentials: 'include' });
        if (res.ok) {
            const user = await res.json();
            localStorage.setItem('user', JSON.stringify(user));
            updateNavbarAuth(user);
        } else {
            const stored = localStorage.getItem('user');
            if (stored) {
                try {
                    updateNavbarAuth(JSON.parse(stored));
                } catch(e) {
                    localStorage.removeItem('user');
                    updateNavbarAuth(null);
                }
            } else {
                updateNavbarAuth(null);
            }
        }
    } catch (e) {
        console.error("Error al verificar sesión", e);
        const stored = localStorage.getItem('user');
        if (stored) {
            try {
                updateNavbarAuth(JSON.parse(stored));
            } catch(err) {
                updateNavbarAuth(null);
            }
        } else {
            updateNavbarAuth(null);
        }
    }
}

function updateNavbarAuth(user) {
    const navUl = document.querySelector('.nav-links');
    if (!navUl) return;

    // Remove existing login/logout/user items to prevent duplicates
    const staleItems = navUl.querySelectorAll('#nav-login, #nav-user, #nav-logout, #nav-staff');
    staleItems.forEach(item => item.remove());
    navUl.querySelectorAll('li a[href*="staff_dashboard"]').forEach(a => a.closest('li')?.remove());

    if (user) {
        // Dynamic Role Badge
        const normalizedRole = (user.role || 'user').toLowerCase();
        let roleBadge = '';
        if (normalizedRole && normalizedRole !== 'user') {
            const roleLabels = { 'admin': 'ADMIN', 'moderator': 'MOD', 'staff': 'STAFF' };
            roleBadge = `<span class="badge badge-${normalizedRole}" style="margin-left:8px; font-size:0.6rem; vertical-align:middle;">${roleLabels[normalizedRole] || normalizedRole.toUpperCase()}</span>`;
        }

        // Show panel link to all administrative staff ranks (admin, staff, moderator)
        const staffRoles = ['admin', 'staff', 'moderator'];
        if (staffRoles.includes(normalizedRole)) {
            if (!navUl.querySelector('#nav-staff') && !navUl.querySelector('a[href*="staff_dashboard"]')) {
                const liStaff = document.createElement('li');
                liStaff.id = 'nav-staff';
                liStaff.innerHTML = `<a href="staff_dashboard.html" style="color:var(--gold);"><i class="fa fa-shield-halved"></i> Panel</a>`;
                navUl.appendChild(liStaff);
            }
        }

        const safeUsername = window.escapeHTML ? window.escapeHTML(user.username) : user.username;
        const profileHref = (user && user.id) ? `profile.html?id=${encodeURIComponent(user.id)}` : 'profile.html';
        const li = document.createElement('li');
        li.id = 'nav-user';
        li.innerHTML = `<a href="${profileHref}"><i class="fa fa-user"></i> ${safeUsername}${roleBadge}</a>`;

        const liLogout = document.createElement('li');
        liLogout.id = 'nav-logout';
        liLogout.innerHTML = `<a href="#" style="color: #ff5555;"><i class="fa fa-sign-out-alt"></i> Salir</a>`;

        liLogout.addEventListener('click', async (e) => {
            e.preventDefault();
            await fetch(`${API_URL}/auth/logout`, { method: 'POST', credentials: 'include' });
            localStorage.removeItem('user');
            localStorage.removeItem('auth_token');
            window.location.reload();
        });

        navUl.appendChild(li);
        navUl.appendChild(liLogout);
    } else {
        // Not logged in
        const liLogin = document.createElement('li');
        liLogin.id = 'nav-login';
        liLogin.innerHTML = `<a href="login.html"><i class="fa fa-sign-in-alt"></i> Ingresar</a>`;
        navUl.appendChild(liLogin);
    }
}
