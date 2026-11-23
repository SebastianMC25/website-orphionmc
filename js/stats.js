document.addEventListener('DOMContentLoaded', async () => {
    const API_URL = window.CONFIG.API_BASE;

    // Elements
    const userCountEl = document.getElementById('stat-users');
    const msgCountEl = document.getElementById('stat-msgs');
    const viewCountEl = document.getElementById('stat-views');

    if (!userCountEl && !msgCountEl && !viewCountEl) return;

    try {
        const res = await fetch(`${API_URL}/stats`);
        const stats = await res.json();

        if (userCountEl && stats.user_count !== undefined) {
            userCountEl.textContent = Number(stats.user_count).toLocaleString();
        }
        if (msgCountEl && stats.message_count !== undefined) {
            msgCountEl.textContent = Number(stats.message_count).toLocaleString();
        }
        if (viewCountEl && stats.total_views !== undefined) {
            viewCountEl.textContent = Number(stats.total_views).toLocaleString();
        }

    } catch (e) {
        console.error("Error loading stats:", e);
        if (userCountEl) userCountEl.textContent = "-";
        if (msgCountEl) msgCountEl.textContent = "-";
        if (viewCountEl) viewCountEl.textContent = "-";
    }
});
