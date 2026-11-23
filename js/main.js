document.addEventListener("DOMContentLoaded", () => {
    gsap.registerPlugin(ScrollTrigger);

    // ================= MOBILE MENU =================
    const mobileToggle = document.querySelector('.mobile-toggle');
    const navLinksContainer = document.querySelector('.nav-links'); // Using existing UL container class or wrapper?
    // Actually in index.html proper, .nav-links is the UL. We need to toggle the wrapper .nav-center or .nav-links directly.
    // Let's toggle .nav-center or create a mobile class on body/navbar.

    // Better approach: toggle class on navbar or nav-center
    const navbar = document.querySelector('.navbar');

    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            navbar.classList.toggle('mobile-open');
            const icon = mobileToggle.querySelector('i');

            if (navbar.classList.contains('mobile-open')) {
                // Open State
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-xmark');
                document.body.style.overflow = 'hidden'; // Lock scroll
            } else {
                // Closed State
                icon.classList.remove('fa-xmark');
                icon.classList.add('fa-bars');
                document.body.style.overflow = ''; // Restore scroll
            }
        });

        // Dropdown toggle logic (funciona en móvil touch y desktop click)
        const dropdownTrigger = document.querySelector('.dropdown-trigger');
        if (dropdownTrigger) {
            dropdownTrigger.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const parent = dropdownTrigger.closest('.nav-dropdown');
                if (parent) {
                    const isOpen = parent.classList.toggle('mobile-open');
                    parent.classList.toggle('open', isOpen);
                    dropdownTrigger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
                }
            });
        }

        // Cerrar dropdown al tocar fuera de él
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.nav-dropdown')) {
                document.querySelectorAll('.nav-dropdown').forEach(dd => {
                    dd.classList.remove('mobile-open');
                    dd.classList.remove('open');
                });
                const trigger = document.querySelector('.dropdown-trigger');
                if (trigger) trigger.setAttribute('aria-expanded', 'false');
            }
        });

        // Cerrar menú móvil al hacer clic en enlaces normales (no el trigger de wiki)
        document.querySelectorAll('.nav-links a:not(.dropdown-trigger)').forEach(link => {
            link.addEventListener('click', () => {
                if (navbar) navbar.classList.remove('mobile-open');
                if (mobileToggle) {
                    const icon = mobileToggle.querySelector('i');
                    if (icon) {
                        icon.classList.remove('fa-xmark');
                        icon.classList.add('fa-bars');
                    }
                }
                document.body.style.overflow = ''; // Restore scroll
            });
        });
    }

    // ================= TRI TRAVELERS EFFECT (Effect #39) =================
    const initTriTravelers = () => {
        const container = document.getElementById('tri-travelers');
        if (!container) return;

        // Center singularity glow
        const hole = document.createElement('div');
        hole.className = 'tri-hole';
        container.appendChild(hole);

        const count = 45;
        const colors = [
            '#ffffff',
            '#d4af37', // Gold
            '#f5c542', // Warm gold
            '#ffea79', // Pale gold
            '#ffaa33', // Amber
            '#e0e6ed', // Quartz marble
            '#c77dff', // Mythical amethyst
            '#4deeea'  // Celestial blue
        ];

        for (let i = 0; i < count; i++) {
            const tri = document.createElement('div');
            tri.className = 'tri-traveler';

            // Radial distribution around hero center
            const angle = Math.random() * Math.PI * 2;
            const radius = 350 + Math.random() * 650;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;

            const size = 12 + Math.random() * 26;
            const duration = 2.6 + Math.random() * 3.4;
            const delay = Math.random() * 5.0;
            const rot = Math.random() * 360;
            const rotSpeed = (Math.random() > 0.5 ? 1 : -1) * (180 + Math.random() * 540);
            const scale = 0.8 + Math.random() * 1.2;
            const opacity = 0.35 + Math.random() * 0.55;

            tri.style.setProperty('--x', `${x.toFixed(1)}px`);
            tri.style.setProperty('--y', `${y.toFixed(1)}px`);
            tri.style.setProperty('--size', `${size.toFixed(0)}px`);
            tri.style.setProperty('--duration', `${duration.toFixed(2)}s`);
            tri.style.setProperty('--delay', `${delay.toFixed(2)}s`);
            tri.style.setProperty('--rot', `${rot.toFixed(0)}deg`);
            tri.style.setProperty('--rot-speed', `${rotSpeed.toFixed(0)}deg`);
            tri.style.setProperty('--scale', scale.toFixed(2));
            tri.style.setProperty('--opacity', opacity.toFixed(2));
            const color = colors[Math.floor(Math.random() * colors.length)];
            tri.style.setProperty('--color', color);

            container.appendChild(tri);
        }
    };
    initTriTravelers();

    // ================= IP CLIPBOARD COPY =================
    const heroIpBtn = document.querySelector('.hero-ip');
    if (heroIpBtn) {
        heroIpBtn.addEventListener('click', () => {
            const ip = 'play.orphionmc.net';
            const ipText = heroIpBtn.querySelector('.ip-text');
            const icon = heroIpBtn.querySelector('.fa-copy') || heroIpBtn.querySelector('.fa-check');

            navigator.clipboard.writeText(ip).then(() => {
                if (ipText) {
                    const originalText = ipText.textContent;
                    ipText.textContent = '¡IP COPIADA!';
                    ipText.style.color = '#8bc34a';
                    if (icon) {
                        icon.className = 'fa-solid fa-check';
                        icon.style.color = '#8bc34a';
                    }

                    setTimeout(() => {
                        ipText.textContent = originalText;
                        ipText.style.color = '';
                        if (icon) {
                            icon.className = 'fa-regular fa-copy';
                            icon.style.color = '';
                        }
                    }, 2000);
                }
            }).catch(err => {
                console.error('Error al copiar IP:', err);
            });
        });
    }


    // ================= ANIMATIONS =================

    // 1. Hero Content Animation
    // Note: Parallax on .video-bg removed because the cinematic video is fixed and scrubbed by hero-scrub.js;
    // displacing it caused a gap under the fixed navbar.
    gsap.to(".hero-content", {
        scrollTrigger: {
            trigger: ".hero",
            start: "top top",
            end: "bottom top", // Fade out as we scroll down
            scrub: true
        },
        y: -50,
        opacity: 0,
        ease: "none"
    });

    // 2. Section Entry Animations (Fade In Up)
    // Generic Helper
    const animateSection = (selector) => {
        gsap.fromTo(selector,
            { y: 50, opacity: 0 },
            {
                scrollTrigger: {
                    trigger: selector,
                    start: "top 85%",
                    toggleActions: "play none none reverse",
                },
                y: 0,
                opacity: 1,
                duration: 0.8,
                ease: "power2.out"
            }
        );
    };

    // Staggered Animations for Grids (News, Updates list items)
    const animateStagger = (parentSelector, childSelector) => {
        gsap.fromTo(childSelector,
            { y: 30, opacity: 0 },
            {
                scrollTrigger: {
                    trigger: parentSelector,
                    start: "top 80%",
                },
                y: 0,
                opacity: 1,
                duration: 0.6,
                stagger: 0.15, // 150ms delay between each item
                ease: "power2.out"
            }
        );
    };

    // Apply animations
    animateSection(".about-container");
    animateStagger(".news-grid", ".news-card");
    animateStagger(".updates-list", ".update-item");
    animateSection(".footer-videos");

    // ================= DYNAMIC FORUM NEWS LOADER =================
    const loadDynamicNews = async () => {
        const newsGrid = document.querySelector('#news .news-grid');
        if (!newsGrid || !window.CONFIG || !window.CONFIG.API_BASE) return;

        try {
            const res = await fetch(`${window.CONFIG.API_BASE}/categories/1/threads`);
            if (!res.ok) return;
            const threads = await res.json();
            if (!Array.isArray(threads) || threads.length === 0) return;

            const topNews = threads.slice(0, 3);
            const imageMap = {
                'OFICIAL': 'assets/images/news-launch.jpg',
                'EVENTOS': 'assets/images/news-labyrinth.jpg',
                'EVENTO': 'assets/images/news-labyrinth.jpg',
                'RAIDS': 'assets/images/news-skills.jpg',
                'UPDATE': 'assets/images/news-forge.jpg',
                'REGLAS': 'assets/images/news-arena.jpg'
            };
            const defaultImages = [
                'assets/images/news-launch.jpg',
                'assets/images/news-labyrinth.jpg',
                'assets/images/news-skills.jpg',
                'assets/images/news-forge.jpg',
                'assets/images/news-arena.jpg'
            ];

            const escapeFn = window.escapeHTML || ((s) => s ? String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;') : '');

            newsGrid.innerHTML = topNews.map((t, idx) => {
                const dateObj = new Date(t.created_at);
                const dateStr = dateObj.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
                const prefixStr = t.prefix ? ` • ${escapeFn(t.prefix)}` : '';
                const safeTitle = escapeFn(t.title);
                const safeId = encodeURIComponent(t.id);
                const img = imageMap[t.prefix] || defaultImages[idx % defaultImages.length];

                let excerpt = '';
                if (t.content) {
                    excerpt = t.content
                        .replace(/^[#>\*\-\s]+/gm, '')
                        .replace(/\n+/g, ' ')
                        .trim();
                    if (excerpt.length > 130) excerpt = excerpt.substring(0, 127) + '...';
                }

                return `
                    <article class="news-card">
                        <div class="news-image" style="background-image: url('${img}');"></div>
                        <div class="news-info">
                            <span class="news-date">${dateStr}${prefixStr}</span>
                            <h3>${safeTitle}</h3>
                            <p>${escapeFn(excerpt || 'Consulta el anuncio completo y todos los detalles en el foro oficial de OrphionMC.')}</p>
                            <a href="view_thread.html?id=${safeId}" class="news-link">Leer en el Foro <i class="fa fa-arrow-right"></i></a>
                        </div>
                    </article>
                `;
            }).join('');
        } catch (e) {
            console.warn('[News] Fallback a noticias estáticas:', e.message);
        }
    };
    loadDynamicNews();

    // ================= NAVIGATION SCROLLSPY =================
    const navSections = [
        { id: 'hero', element: document.getElementById('hero') },
        { id: 'about', element: document.getElementById('about') },
        { id: 'updates', element: document.getElementById('updates') },
        { id: 'footer', element: document.getElementById('footer') }
    ].filter(s => s.element !== null);

    const sideNavLinks = document.querySelectorAll('.side-nav-item');
    const topNavLinks = document.querySelectorAll('.nav-links a');

    function setActiveSection(activeId) {
        // Update Side Nav
        sideNavLinks.forEach(item => {
            const href = item.getAttribute('href') || '';
            if (href.startsWith('#')) {
                const targetId = href.substring(1);
                if (targetId === activeId) {
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
            } else {
                item.classList.remove('active');
            }
        });

        // Update Top Nav
        topNavLinks.forEach(link => {
            const href = link.getAttribute('href') || '';
            if (href.startsWith('#')) {
                const targetId = href.substring(1);
                if (targetId === activeId || (targetId === '' && activeId === 'hero')) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            }
        });
    }

    const updateActiveNav = () => {
        const scrollY = window.pageYOffset || document.documentElement.scrollTop || window.scrollY || 0;
        const windowHeight = window.innerHeight || 800;
        const documentHeight = document.documentElement.scrollHeight || document.body.scrollHeight;

        // If near bottom of the page, activate footer
        if (scrollY + windowHeight >= documentHeight - 80) {
            setActiveSection('footer');
            return;
        }

        let currentSectionId = 'hero';

        for (let i = 0; i < navSections.length; i++) {
            const sec = navSections[i];
            const rect = sec.element.getBoundingClientRect();
            // Active when section top reaches upper half of viewport
            if (rect.top <= windowHeight * 0.45) {
                currentSectionId = sec.id;
            }
        }

        setActiveSection(currentSectionId);
    };

    // Smooth scroll and immediate active state on click
    sideNavLinks.forEach(item => {
        item.addEventListener('click', (e) => {
            const href = item.getAttribute('href') || '';
            if (href.startsWith('#')) {
                const targetId = href.substring(1);
                const targetElem = document.getElementById(targetId);
                if (targetElem) {
                    e.preventDefault();
                    targetElem.scrollIntoView({ behavior: 'smooth' });
                    setActiveSection(targetId);
                }
            }
        });
    });

    window.addEventListener('scroll', updateActiveNav, { passive: true });
    window.addEventListener('resize', updateActiveNav, { passive: true });
    updateActiveNav();
});

// PWA Service Worker Registration
if ('serviceWorker' in navigator && (window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(reg => {
                console.log('[PWA] Service Worker activo:', reg.scope);
            })
            .catch(err => {
                console.warn('[PWA] Service Worker omitido:', err.message);
            });
    });
}

