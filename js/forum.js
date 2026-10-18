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
            // Optionally show error to user, or just leave static content as fallback
            // container.innerHTML = '<p style="text-align:center; color: #ff5555;">Error al cargar el foro. Asegúrate de que el servidor (Backend) esté corriendo.</p>';
        }
    }

    function renderCategories(categories) {
        container.innerHTML = ''; // Clear static/skeleton content

        // Group categories by "Group" if we had groups, but for now flat list or strictly mapped 
        // Logic: The current HTML has "Category Groups". 
        // Our SQL schema has flat categories.
        // We will wrap them all in one "General" group or try to map them.
        // For simplicity towards user request: Let's create one group for now or split them if we add a 'group_name' to DB.
        // Updated plan: Ensure DB has data grouping or just render them flat like mapped.

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
            itemsHtml += `
                <div class="forum-item">
                    <div class="forum-icon"><i class="fa fa-scroll"></i></div>
                    <div class="forum-info">
                        <h3><a href="view_category.html?id=${cat.id}">${cat.name}</a></h3>
                        <p>${cat.description || 'Sin descripción'}</p>
                    </div>
                    <div class="forum-stats">
                        <span>${cat.thread_count}</span> Temas
                    </div>
                    <div class="forum-last-post">
                        <!-- Placeholder for last post logic -->
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
