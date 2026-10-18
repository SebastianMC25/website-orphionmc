document.addEventListener('DOMContentLoaded', async () => {
    const API_URL = window.CONFIG.API_BASE;

    // Elements
    const userCountEl = document.getElementById('stat-users');
    const msgCountEl = document.getElementById('stat-msgs');

    if (!userCountEl || !msgCountEl) return; // Only run if elements exist

    try {
        const res = await fetch(`${API_URL}/stats`);
        const stats = await res.json();

        // Animate numbers (simple)
        userCountEl.textContent = stats.user_count.toLocaleString();
        msgCountEl.textContent = stats.message_count.toLocaleString();

    } catch (e) {
        console.error("Error loading stats:", e);
        userCountEl.textContent = "-";
        msgCountEl.textContent = "-";
    }
});
