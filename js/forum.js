document.addEventListener('DOMContentLoaded', () => {
    const API_URL = window.CONFIG.API_BASE;
    const container = document.querySelector('.forum-categories');

    // Only run if we are on the forum page and container exists
    if (!container) return;

    // Fetch Categories
    async function loadForumIndex() {
        try {
            const response = await fetch(`${API_URL}/categories`);
            if (!response.ok) throw new Error('Error en la respuesta de la red');
            const categories = await response.json();

            renderCategories(categories);
        } catch (error) {
            console.error('Error fetching forum data:', error);
            container.innerHTML = `
                <div style="text-align: center; padding: 3rem 1rem; color: #d4af37; background: rgba(0, 0, 0, 0.4); border: 1px solid rgba(212, 175, 55, 0.3); border-radius: 8px; margin: 2rem 0;">
                    <i class="fa-solid fa-triangle-exclamation" style="font-size: 2.5rem; color: #f5c542; margin-bottom: 1rem; display: block;"></i>
                    <h3 style="font-family: 'Cinzel', serif; font-size: 1.3rem; margin-bottom: 0.5rem;">No se pudieron cargar las categorías</h3>
                    <p style="color: #aaa; font-size: 0.95rem;">Comprueba tu conexión o inténtalo nuevamente en unos instantes.</p>
                </div>
            `;
        }
    }

    function renderCategories(categories) {
        container.innerHTML = ''; // Clear static/skeleton content
        const escape = window.escapeHTML || ((s) => s ? String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;') : '');

        // Let's create a generic "Principales" group wrapper for all db categories
        const groupDiv = document.createElement('div');
        groupDiv.className = 'category-group';

        const headerHtml = `
            <div class="category-header">
                <h2>CATEGORÍAS DE OrphionMC</h2>
                <i class="fa fa-chevron-down"></i>
            </div>
        `;

        let itemsHtml = '';

        categories.forEach(cat => {
            const cleanId = encodeURIComponent(cat.id);
            const cleanName = escape(cat.name);
            const cleanDesc = escape(cat.description || 'Sin descripción');
            const threadCount = typeof cat.thread_count === 'number' ? cat.thread_count : 0;

            itemsHtml += `
                <div class="forum-item">
                    <div class="forum-icon"><i class="fa fa-scroll"></i></div>
                    <div class="forum-info">
                        <h3><a href="view_category.html?id=${cleanId}">${cleanName}</a></h3>
                        <p>${cleanDesc}</p>
                    </div>
                    <div class="forum-stats">
                        <span>${threadCount}</span> Temas
                    </div>
                    <div class="forum-last-post">
                        --
                    </div>
                </div>
            `;
        });

        groupDiv.innerHTML = headerHtml + itemsHtml;
        container.appendChild(groupDiv);
    }

    // Initialize
    loadForumIndex();
});
