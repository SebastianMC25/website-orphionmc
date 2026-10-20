import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { BBModelLoader } from 'three-blockbench';

// POLYFILL: three-blockbench 0.1.0 expects clip.userData to be initialized on THREE.AnimationClip
if (!THREE.AnimationClip.prototype.hasOwnProperty('userData')) {
    Object.defineProperty(THREE.AnimationClip.prototype, 'userData', {
        get() {
            if (!this._userData) this._userData = {};
            return this._userData;
        },
        set(value) {
            this._userData = value;
        },
        configurable: true,
        enumerable: true
    });
}

// DOM Elements
const canvasWrapper = document.getElementById('canvas-wrapper');
const canvas = document.getElementById('model-canvas');
const loadingOverlay = document.getElementById('model-loading');
const loadingText = document.getElementById('loading-text');
const animSelect = document.getElementById('anim-select');
const playPauseBtn = document.getElementById('play-pause-btn');
const playPauseIcon = document.getElementById('play-pause-icon');
const resetCamBtn = document.getElementById('reset-cam-btn');
const autoRotateBtn = document.getElementById('auto-rotate-btn');
const animStatus = document.getElementById('anim-status');

// Animation Friendly Labels
const ANIMATION_LABELS = {
    'idle': '⚡ Reposo Divino (idle)',
    'idle_stand': '⚡ Postura Erguida (idle_stand)',
    'idle_sit': '🪑 Sentado en el Trono (idle_sit)',
    'walk': '🚶 Caminar Majestuoso (walk)',
    'zap': '⚡ Rayo Directo (zap)',
    'toss_bolt': '🔱 Lanzamiento de Relámpago (toss_bolt)',
    'summon_lightning': '🌩️ Invocación de Tormenta (summon_lightning)',
    'rebuke': '💥 Golpe Masivo Rebuke (rebuke)',
    'knock': '🌪️ Golpe de Empuje Colosal (knock)',
    'shockwave': '🛡️ Onda de Choque Eléctrica (shockwave)',
    'storm_quake': '🌀 Terremoto de Tormenta (storm_quake)',
    'summon': '✨ Invocación Divina (summon)',
    'fly_idle': '🦅 Vuelo Suspendido (fly_idle)',
    'fly_walk': '💨 Desplazamiento Aéreo (fly_walk)',
    'death': '💀 Derrota y Cataclismo (death)'
};

// State
let scene, camera, renderer, controls;
let currentModel = null;
let mixer = null;
let currentAction = null;
let isPlaying = true;
let isAutoRotating = false;
let clock = new THREE.Clock();

function init() {
    if (!canvas || !canvasWrapper) return;

    // 1. Scene
    scene = new THREE.Scene();

    // 2. Camera - Scaled for Zeus (~8.8 units tall)
    const width = canvasWrapper.clientWidth || 600;
    const height = canvasWrapper.clientHeight || 520;
    camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 500);
    camera.position.set(0, 5.5, 14.5);

    // 3. Renderer
    renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // 4. Lighting
    setupLighting();

    // 5. OrbitControls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 4.2, 0); // Focus on chest level
    controls.minDistance = 5;
    controls.maxDistance = 35;
    controls.maxPolarAngle = Math.PI / 2 + 0.1;
    controls.autoRotate = false;
    controls.autoRotateSpeed = 1.2;

    // 6. Ground Pedestal
    setupFloor();

    // 7. Load Blockbench Model
    loadZeusModel();

    // 8. Event Listeners
    setupEvents();

    // 9. Render Loop
    animate();
}

function setupLighting() {
    // Ambient light - warm tone
    const ambientLight = new THREE.AmbientLight(0xfff8ee, 1.6);
    scene.add(ambientLight);

    // Key Light - Divine Golden
    const keyLight = new THREE.DirectionalLight(0xffe599, 2.5);
    keyLight.position.set(10, 15, 12);
    keyLight.castShadow = true;
    scene.add(keyLight);

    // Rim Light - Cyan Mythic Lightning (back-left)
    const rimLight = new THREE.DirectionalLight(0x38bdf8, 2.2);
    rimLight.position.set(-12, 12, -10);
    scene.add(rimLight);

    // Fill Light - Soft purple / Olympus aura
    const fillLight = new THREE.DirectionalLight(0xc084fc, 1.0);
    fillLight.position.set(0, -5, 10);
    scene.add(fillLight);
}

function setupFloor() {
    // Divine pedestal circle scaled for Zeus
    const pedestalGeo = new THREE.CylinderGeometry(4.2, 4.6, 0.4, 32);
    const pedestalMat = new THREE.MeshStandardMaterial({
        color: 0x161522,
        roughness: 0.7,
        metalness: 0.3
    });
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.y = -0.2;
    pedestal.receiveShadow = true;
    scene.add(pedestal);

    // Golden ring border
    const ringGeo = new THREE.RingGeometry(4.15, 4.3, 48);
    const ringMat = new THREE.MeshBasicMaterial({
        color: 0xf5c542,
        side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.01;
    scene.add(ring);
}

async function loadZeusModel() {
    try {
        if (loadingText) loadingText.textContent = 'CARGANDO ZEUS.BBMODEL...';

        const loader = new BBModelLoader();
        const modelUrl = '../assets/models/mso_zeus.bbmodel';

        const model = await loader.loadAsync(modelUrl);
        currentModel = model;

        // Add to scene
        scene.add(model.scene);
        model.scene.position.set(0, 0, 0);

        // Enable shadow casting and nearest-neighbor texture filtering
        model.scene.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                if (child.material) {
                    if (child.material.map) {
                        child.material.map.magFilter = THREE.NearestFilter;
                        child.material.map.minFilter = THREE.NearestMipmapNearestFilter;
                        child.material.map.needsUpdate = true;
                    }
                }
            }
        });

        // Setup Animation Mixer
        mixer = model.createMixer();

        // Populate Animation Selector
        populateAnimations(model);

        // Hide Loading Overlay
        if (loadingOverlay) {
            loadingOverlay.style.opacity = '0';
            setTimeout(() => {
                loadingOverlay.style.display = 'none';
            }, 350);
        }

        console.log('✅ Zeus 3D Model Loaded Successfully!', model);
    } catch (err) {
        console.error('❌ Error cargando el modelo de Zeus:', err);
        if (loadingText) {
            loadingText.innerHTML = `ERROR CARGANDO EL MODELO 3D<br><span style="font-size:0.75rem;color:#fca5a5;text-transform:none;">${err?.message || err}</span>`;
            loadingText.style.color = '#ef4444';
        }
    }
}

function populateAnimations(model) {
    if (!animSelect) return;
    animSelect.innerHTML = '';

    const animList = model.animations || [];
    if (animList.length === 0) {
        const opt = document.createElement('option');
        opt.textContent = 'Sin animaciones';
        animSelect.appendChild(opt);
        return;
    }

    // Populate options
    animList.forEach((anim) => {
        const opt = document.createElement('option');
        opt.value = anim.name;
        opt.textContent = ANIMATION_LABELS[anim.name] || `⚡ ${anim.name}`;
        animSelect.appendChild(opt);
    });

    // Default: prioritize 'idle' or 'idle_stand' or the first
    const preferred = ['idle', 'idle_stand', 'walk'].find(name =>
        animList.some(a => a.name === name)
    );
    const startAnim = preferred || animList[0].name;
    animSelect.value = startAnim;

    playAnimation(startAnim);
}

export function playAnimation(animName, loop = true) {
    if (!currentModel || !mixer) return;

    try {
        const nextAction = currentModel.createAction(mixer, animName);
        if (!nextAction) return;

        if (loop) {
            nextAction.setLoop(THREE.LoopRepeat, Infinity);
        }

        if (currentAction && currentAction !== nextAction) {
            nextAction.reset();
            nextAction.crossFadeFrom(currentAction, 0.35, true);
            nextAction.play();
        } else {
            nextAction.reset();
            nextAction.play();
        }

        currentAction = nextAction;
        isPlaying = true;

        if (playPauseIcon) playPauseIcon.className = 'fa fa-pause';
        if (animSelect) animSelect.value = animName;
        if (animStatus) animStatus.textContent = `Reproduciendo: ${animName}`;
    } catch (e) {
        console.warn(`No se pudo reproducir animación ${animName}:`, e);
    }
}

// Make accessible globally so HTML ability buttons can trigger animations
window.playZeusAnimation = (name) => {
    playAnimation(name);
    // Smoothly scroll or focus viewer if on mobile
    if (window.innerWidth <= 1024 && canvasWrapper) {
        canvasWrapper.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
};

function setupEvents() {
    // Dropdown change
    if (animSelect) {
        animSelect.addEventListener('change', (e) => {
            playAnimation(e.target.value);
        });
    }

    // Play / Pause
    if (playPauseBtn) {
        playPauseBtn.addEventListener('click', () => {
            if (!currentAction) return;
            if (isPlaying) {
                currentAction.paused = true;
                isPlaying = false;
                if (playPauseIcon) playPauseIcon.className = 'fa fa-play';
                if (animStatus) animStatus.textContent = 'Pausado';
            } else {
                currentAction.paused = false;
                isPlaying = true;
                if (playPauseIcon) playPauseIcon.className = 'fa fa-pause';
                if (animStatus) animStatus.textContent = `Reproduciendo: ${animSelect.value}`;
            }
        });
    }

    // Reset Camera
    if (resetCamBtn) {
        resetCamBtn.addEventListener('click', () => {
            controls.reset();
            camera.position.set(0, 5.5, 14.5);
            controls.target.set(0, 4.2, 0);
        });
    }

    // Auto Rotate
    if (autoRotateBtn) {
        autoRotateBtn.addEventListener('click', () => {
            isAutoRotating = !isAutoRotating;
            controls.autoRotate = isAutoRotating;
            autoRotateBtn.style.background = isAutoRotating ? 'var(--gold)' : '';
            autoRotateBtn.style.color = isAutoRotating ? '#000' : '';
        });
    }

    // Window Resize
    window.addEventListener('resize', onWindowResize);
}

function onWindowResize() {
    if (!camera || !renderer || !canvasWrapper) return;
    const width = canvasWrapper.clientWidth;
    const height = canvasWrapper.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
}

function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    if (mixer && isPlaying) {
        mixer.update(delta);
    }

    if (controls) {
        controls.update();
    }

    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
}

// Start on DOM ready
document.addEventListener('DOMContentLoaded', init);
