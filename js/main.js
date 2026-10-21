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

    // 1. Hero Animation (Parallax)
    gsap.to(".video-bg", {
        scrollTrigger: {
            trigger: ".hero",
            start: "top top",
            end: "bottom top",
            scrub: true
        },
        y: 80, // Smooth parallax on retro poster background
        ease: "none"
    });

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

    // ================= NAVIGATION =================
    const sections = ['hero', 'about', 'news', 'updates', 'footer-wrapper'];
    const navLinks = document.querySelectorAll('.navbar a');
    const sideNavItems = document.querySelectorAll('.side-nav-item');

    const updateActiveNav = () => {
        let current = "";

        sections.forEach(sectionId => {
            const section = document.getElementById(sectionId) || document.getElementById(sectionId.replace('-wrapper', ''));
            if (!section) return;

            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;

            if (scrollY >= (sectionTop - sectionHeight / 3)) {
                current = sectionId.replace('-wrapper', '');
            }
        });

        // Loop through side nav items
        sideNavItems.forEach(item => {
            item.classList.remove('active');
            const href = item.getAttribute('href').substring(1); // remove #

            // Special case for top/home
            if ((href === '' && current === 'hero') || href === current) {
                item.classList.add('active');
            }
        });

        // Loop through top nav items (simplified matching)
        navLinks.forEach(link => {
            const href = link.getAttribute('href').substring(1);
            if (href === current) {
                link.classList.add('active');
            } else if (href === '' && current === 'hero') {
                // Home link logic if needed
            } else {
                link.classList.remove('active');
            }
        });
    };

    window.addEventListener('scroll', updateActiveNav);
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

