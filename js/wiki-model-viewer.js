import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { BBModelParser, resolveOptions } from 'three-blockbench';

// DOM Elements
const canvasWrapper = document.getElementById('canvas-wrapper');
const canvas = document.getElementById('model-canvas');
const loadingOverlay = document.getElementById('model-loading');
const loadingText = document.getElementById('loading-text');
const resetCamBtn = document.getElementById('reset-cam-btn');
const autoRotateBtn = document.getElementById('auto-rotate-btn');

// State
let scene, camera, renderer, controls;
let currentModel = null;
let isAutoRotating = true; // Auto-rotate by default for showcase

function init() {
    if (!canvas || !canvasWrapper) return;

    // 1. Scene
    scene = new THREE.Scene();

    // 2. Camera - Scaled for Zeus (height ~8.8 units)
    const width = canvasWrapper.clientWidth || 600;
    const height = canvasWrapper.clientHeight || 520;
    camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 500);
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
    controls.autoRotate = true; // Start slowly spinning
    controls.autoRotateSpeed = 1.2;

    // 6. Ground Pedestal
    setupFloor();

    // 7. Load Pure 3D Model
    loadZeusModel();

    // 8. Event Listeners
    setupEvents();

    // 9. Render Loop
    animate();
}

function setupLighting() {
    // Ambient light - warm tone
    const ambientLight = new THREE.AmbientLight(0xfff8ee, 1.8);
    scene.add(ambientLight);

    // Key Light - Divine Golden (Front-Right)
    const keyLight = new THREE.DirectionalLight(0xffe599, 2.8);
    keyLight.position.set(12, 18, 14);
    keyLight.castShadow = true;
    scene.add(keyLight);

    // Rim Light - Cyan Mythic Lightning (Back-Left)
    const rimLight = new THREE.DirectionalLight(0x38bdf8, 2.5);
    rimLight.position.set(-14, 14, -12);
    scene.add(rimLight);

    // Fill Light - Soft purple Olympus aura
    const fillLight = new THREE.DirectionalLight(0xc084fc, 1.2);
    fillLight.position.set(0, -6, 12);
    scene.add(fillLight);
}

function setupFloor() {
    // Divine pedestal circle
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
        if (loadingText) loadingText.textContent = 'CARGANDO RENDER 3D...';

        const modelUrl = '../assets/models/mso_zeus.bbmodel';
        const response = await fetch(modelUrl);
        if (!response.ok) throw new Error(`HTTP ${response.status} cargando el archivo del modelo`);
        
        const doc = await response.json();

        // 1. Recolectar grupos si faltan
        function collectGroups(nodes, list = []) {
            nodes.forEach(node => {
                if (typeof node === 'object' && node !== null) {
                    list.push(node);
                    if (Array.isArray(node.children)) {
                        collectGroups(node.children, list);
                    }
                }
            });
            return list;
        }

        if (!doc.groups || doc.groups.length === 0) {
            doc.groups = collectGroups(doc.outliner || []);
        }

        // 2. Garantizar tipo cube en todos los elementos
        if (Array.isArray(doc.elements)) {
            doc.elements.forEach(el => {
                if (!el.type) el.type = 'cube';
            });
        }

        // 3. Omitir animaciones (render puro como solicitó el usuario)
        doc.animations = [];

        // 4. Parsear con BBModelParser
        const options = resolveOptions({
            unitScale: 1 / 16,
            loadTextures: true,
            strict: false
        });

        const parser = new BBModelParser(undefined, options);
        const model = await parser.parse(doc, '');
        currentModel = model;

        // Añadir modelo a la escena
        scene.add(model.scene);
        model.scene.position.set(0, 0, 0);

        // Optimizar renderizado de texturas pixel-art RPG
        model.scene.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(mat => {
                            if (mat.map) {
                                mat.map.magFilter = THREE.NearestFilter;
                                mat.map.minFilter = THREE.NearestMipmapNearestFilter;
                                mat.map.needsUpdate = true;
                            }
                        });
                    } else if (child.material.map) {
                        child.material.map.magFilter = THREE.NearestFilter;
                        child.material.map.minFilter = THREE.NearestMipmapNearestFilter;
                        child.material.map.needsUpdate = true;
                    }
                }
            }
        });

        // Ocultar overlay de carga
        if (loadingOverlay) {
            loadingOverlay.style.opacity = '0';
            setTimeout(() => {
                loadingOverlay.style.display = 'none';
            }, 300);
        }

        console.log('✅ Zeus 3D Render Cargado con Éxito!', model);
    } catch (err) {
        console.error('❌ Error cargando render 3D de Zeus:', err);
        if (loadingText) {
            loadingText.innerHTML = `ERROR CARGANDO EL MODELO 3D<br><span style="font-size:0.75rem;color:#fca5a5;text-transform:none;">${err?.message || err}</span>`;
            loadingText.style.color = '#ef4444';
        }
    }
}

function setupEvents() {
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
        // Highlight active initially
        autoRotateBtn.style.background = 'var(--gold)';
        autoRotateBtn.style.color = '#000';

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

    if (controls) {
        controls.update();
    }

    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
}

// Start on DOM ready
document.addEventListener('DOMContentLoaded', init);
