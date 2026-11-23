/**
 * hero-scrub.js - Scroll-driven cinematic camera scrub for index.html hero section
 * Converts page scroll into video playback time at 60fps
 */
(function () {
    const video = document.getElementById('hero-scrub-video');
    const hero = document.getElementById('hero');
    const heroContent = hero ? hero.querySelector('.hero-content') : null;
    if (!video || !hero) return;

    // Check potential video paths (user's hero cinematic or scene1)
    const videoSources = [
        'assets/videos/hero_cinematic.mp4',
        'assets/world/scene1_olympus.mp4'
    ];

    let isVideoReady = false;
    let targetProgress = 0;
    let currentProgress = 0;
    let isTicking = false;

    function initVideo() {
        video.addEventListener('loadedmetadata', function () {
            isVideoReady = true;
            video.classList.add('has-video');
            updateScrub();
        });

        video.addEventListener('canplay', function () {
            isVideoReady = true;
            video.classList.add('has-video');
        });

        video.addEventListener('error', function () {
            // If hero_cinematic not found yet, try scene1_olympus
            if (video.src.includes('hero_cinematic') && videoSources[1]) {
                video.src = videoSources[1];
            } else {
                // Keep poster fallback silently
                isVideoReady = false;
            }
        });

        // Try to load first available source
        video.src = videoSources[0];

        // If video already has metadata cached/loaded
        if (video.readyState >= 1) {
            isVideoReady = true;
            video.classList.add('has-video');
            updateScrub();
        }
    }

    function onScroll() {
        const y = window.scrollY || window.pageYOffset;
        const heroHeight = hero.offsetHeight || window.innerHeight;
        // Scrub completes as you scroll through hero and past #about
        const scrollRange = heroHeight * 1.7;
        targetProgress = Math.min(1, Math.max(0, y / scrollRange));

        // Parallax fade for hero title and buttons
        if (heroContent) {
            const textOpacity = Math.max(0, 1 - (y / (heroHeight * 0.65)));
            const textY = -(y / heroHeight) * 80;
            heroContent.style.opacity = textOpacity.toFixed(3);
            heroContent.style.transform = `translateY(${textY.toFixed(1)}px)`;
            heroContent.style.pointerEvents = textOpacity < 0.1 ? 'none' : 'auto';
        }

        if (!isTicking) {
            isTicking = true;
            requestAnimationFrame(renderLoop);
        }
    }

    function renderLoop() {
        // Smooth lerp interpolation for silky 60fps seek
        currentProgress += (targetProgress - currentProgress) * 0.22;
        if (Math.abs(targetProgress - currentProgress) < 0.001) {
            currentProgress = targetProgress;
        }

        if (isVideoReady && video.duration > 0 && !video.seeking) {
            const targetTime = currentProgress * video.duration;
            const diff = Math.abs(video.currentTime - targetTime);
            if (diff > 0.03) {
                try {
                    if ('fastSeek' in video) {
                        video.fastSeek(targetTime);
                    } else {
                        video.currentTime = targetTime;
                    }
                } catch (e) {}
            }
        }

        if (Math.abs(targetProgress - currentProgress) > 0.001) {
            requestAnimationFrame(renderLoop);
        } else {
            isTicking = false;
        }
    }

    function updateScrub() {
        onScroll();
    }

    initVideo();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
})();
