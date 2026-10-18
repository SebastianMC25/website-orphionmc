document.addEventListener('DOMContentLoaded', async () => {
    const listEl = document.getElementById('recent-threads-list');
    if (!listEl) return;

    try {
        const response = await fetch(`${window.CONFIG.API_BASE}/threads/recent`);
        const threads = await response.json();

        if (threads.length === 0) {
            listEl.innerHTML = '<p style="text-align: center; color: #888;">No hay posteos recientes.</p>';
            return;
        }

        listEl.innerHTML = threads.map(t => {
            const date = new Date(t.created_at);
            const timeAgo = formatTimeAgo(date);
            const avatar = t.avatar_url || `https://mc-heads.net/avatar/${t.username}/40`;

            return `
                <div class="recent-thread">
                    <div class="avatar" style="background: #333 url('${avatar}') center/cover;"></div>
                    <div class="thread-info">
                        <a href="view_thread.html?id=${t.id}">${t.title}</a>
                        <div class="thread-meta">Por ${t.username} • ${timeAgo}</div>
                    </div>
                </div>
            `;
        }).join('');

    } catch (error) {
        console.error("Error loading recent posts:", error);
        listEl.innerHTML = '<p style="text-align: center; color: #cc4444;">Error al cargar.</p>';
    }
});

function formatTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " años";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " meses";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " días";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " horas";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " min";
    return "ahora";
}
