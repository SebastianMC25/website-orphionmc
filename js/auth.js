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
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
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

    // Initialize anti-bot when loading auth pages
    if (document.getElementById('login-form') || document.getElementById('register-form')) {
        initAntiBot();
    }

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

    // LOGIN LOGIC
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            try {
                const website_field = document.getElementById('website_field')?.value || '';
                const antibot_token = document.getElementById('antibot_token')?.value || currentAntiBotToken;

                const res = await fetch(`${API_URL}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password, website_field, antibot_token }),
                    credentials: 'include'
                });

                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Error al iniciar sesión');

                if (data.token) {
                    localStorage.setItem('auth_token', data.token);
                }
                if (data.user) {
                    localStorage.setItem('user', JSON.stringify(data.user));
                }

                // Reload to update navbar via checkSession/server render or plain reload
                window.location.href = 'forum.html';

            } catch (err) {
                showError(err.message);
            }
        });
    }

    // REGISTER LOGIC
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const email = document.getElementById('email')?.value || '';
            const password = document.getElementById('password').value;
            const confirm = document.getElementById('confirm-password').value;

            if (password !== confirm) {
                return showError("Las contraseñas no coinciden");
            }

            try {
                const website_field = document.getElementById('website_field')?.value || '';
                const antibot_token = document.getElementById('antibot_token')?.value || currentAntiBotToken;

                const res = await fetch(`${API_URL}/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, email, password, website_field, antibot_token }),
                    credentials: 'include'
                });

                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Error al registrarse');

                if (data.token) {
                    localStorage.setItem('auth_token', data.token);
                }
                localStorage.setItem('user', JSON.stringify({ id: data.id, username: data.username, role: data.role || 'user' }));

                alert("Cuenta creada y sesión iniciada.");
                window.location.href = 'forum.html';

            } catch (err) {
                showError(err.message);
            }
        });
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

    if (user) {
        // Dynamic Role Badge
        let roleBadge = '';
        if (user.role && user.role !== 'user') {
            const roleLabels = { 'admin': 'ADMIN', 'moderator': 'MOD', 'staff': 'STAFF' };
            roleBadge = `<span class="badge badge-${user.role}" style="margin-left:8px; font-size:0.6rem; vertical-align:middle;">${roleLabels[user.role] || user.role.toUpperCase()}</span>`;
        }

        // Show staff panel link if applicable
        if (['admin', 'staff', 'moderator'].includes(user.role)) {
            const liStaff = document.createElement('li');
            liStaff.id = 'nav-staff';
            liStaff.innerHTML = `<a href="staff_dashboard.html" style="color:var(--gold);"><i class="fa fa-shield-halved"></i> Panel</a>`;
            navUl.appendChild(liStaff);
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
