import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// DOM Elements
const canvasWrapper = document.getElementById('canvas-wrapper');
const canvas = document.getElementById('model-canvas');
const loadingOverlay = document.getElementById('model-loading');
const loadingText = document.getElementById('loading-text');
const resetCamBtn = document.getElementById('reset-cam-btn');
const autoRotateBtn = document.getElementById('auto-rotate-btn');

// State
let scene, camera, renderer, controls;
let modelCenter = new THREE.Vector3(0, 70, 0);
let defaultCamPos = new THREE.Vector3(0, 80, 220);

function init() {
    if (!canvas || !canvasWrapper) return;

    // 1. Scene
    scene = new THREE.Scene();

    // 2. Camera
    const width = canvasWrapper.clientWidth || 600;
    const height = canvasWrapper.clientHeight || 520;
    camera = new THREE.PerspectiveCamera(40, width / height, 0.5, 5000);
    camera.position.copy(defaultCamPos);

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
    controls.target.copy(modelCenter);
    controls.minDistance = 30;
    controls.maxDistance = 600;
    controls.maxPolarAngle = Math.PI / 2 + 0.15;
    controls.autoRotate = true; // Rotación automática suave de vitrina
    controls.autoRotateSpeed = 1.2;

    // 6. Cargar y construir el modelo
    loadZeusModel();

    // 7. Eventos
    setupEvents();

    // 8. Loop de Render
    animate();
}

function setupLighting() {
    // Luz ambiental suave
    const ambientLight = new THREE.AmbientLight(0xfff8ee, 1.8);
    scene.add(ambientLight);

    // Luz principal dorada (frontal derecha)
    const keyLight = new THREE.DirectionalLight(0xffe599, 2.5);
    keyLight.position.set(120, 200, 160);
    keyLight.castShadow = true;
    scene.add(keyLight);

    // Luz de contorno cian mítica de rayo (trasera izquierda)
    const rimLight = new THREE.DirectionalLight(0x38bdf8, 2.2);
    rimLight.position.set(-150, 150, -120);
    scene.add(rimLight);

    // Luz de relleno púrpura divina
    const fillLight = new THREE.DirectionalLight(0xc084fc, 1.2);
    fillLight.position.set(0, -50, 120);
    scene.add(fillLight);
}

function setupFloor(center, size) {
    const radius = Math.max(size.x, size.z) * 0.85;
    const pedestalGeo = new THREE.CylinderGeometry(radius, radius * 1.08, 3, 48);
    const pedestalMat = new THREE.MeshStandardMaterial({
        color: 0x161522,
        roughness: 0.7,
        metalness: 0.3
    });
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.set(center.x, -1.5, center.z);
    pedestal.receiveShadow = true;
    scene.add(pedestal);

    // Anillo dorado exterior
    const ringGeo = new THREE.RingGeometry(radius * 0.98, radius * 1.02, 64);
    const ringMat = new THREE.MeshBasicMaterial({
        color: 0xf5c542,
        side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(center.x, 0.05, center.z);
    scene.add(ring);
}

async function loadTextures(bb) {
    const loader = new THREE.TextureLoader();
    const textures = [];

    for (const tex of bb.textures || []) {
        const src = tex.source || tex.path || tex.relative_path;
        if (!src) {
            textures.push(null);
            continue;
        }
        try {
            const texture = await loader.loadAsync(src);
            texture.flipY = false;
            texture.colorSpace = THREE.SRGBColorSpace;
            texture.magFilter = THREE.NearestFilter;
            texture.minFilter = THREE.NearestFilter;
            texture.generateMipmaps = false;

            textures.push({
                map: texture,
                uvW: Number(tex.uv_width) || Number(tex.resolution?.width) || Number(tex.width) || texture.image?.width || 256,
                uvH: Number(tex.uv_height) || Number(tex.resolution?.height) || Number(tex.height) || texture.image?.height || 256
            });
        } catch (e) {
            console.warn('Advertencia cargando textura:', e);
            textures.push(null);
        }
    }
    return textures;
}

function buildCubeMesh(element, textures, originAbs) {
    if (!element.from || !element.to) return null;

    const inflate = Number(element.inflate || 0);
    const from = new THREE.Vector3(element.from[0], element.from[1], element.from[2]);
    const to = new THREE.Vector3(element.to[0], element.to[1], element.to[2]);

    const min = new THREE.Vector3(
        Math.min(from.x, to.x) - inflate,
        Math.min(from.y, to.y) - inflate,
        Math.min(from.z, to.z) - inflate
    );
    const max = new THREE.Vector3(
        Math.max(from.x, to.x) + inflate,
        Math.max(from.y, to.y) + inflate,
        Math.max(from.z, to.z) + inflate
    );
    const size = new THREE.Vector3().subVectors(max, min);

    const eps = 0.001;
    const dx = Math.max(Math.abs(size.x), eps);
    const dy = Math.max(Math.abs(size.y), eps);
    const dz = Math.max(Math.abs(size.z), eps);

    const geometry = new THREE.BoxGeometry(dx, dy, dz);
    const center = new THREE.Vector3().addVectors(min, max).multiplyScalar(0.5);
    const offset = new THREE.Vector3().subVectors(center, new THREE.Vector3(originAbs[0], originAbs[1], originAbs[2]));

    const faceNames = ['east', 'west', 'up', 'down', 'south', 'north'];
    const orderedFaces = [...faceNames];

    if ((to.x - from.x) < 0) [orderedFaces[0], orderedFaces[1]] = [orderedFaces[1], orderedFaces[0]];
    if ((to.y - from.y) < 0) [orderedFaces[2], orderedFaces[3]] = [orderedFaces[3], orderedFaces[2]];
    if ((to.z - from.z) < 0) [orderedFaces[4], orderedFaces[5]] = [orderedFaces[5], orderedFaces[4]];

    const faces = element.faces || {};
    const materials = orderedFaces.map(faceKey => {
        const faceData = faces[faceKey] || {};
        const texIdx = typeof faceData.texture === 'number' ? faceData.texture : 0;
        const texObj = textures[texIdx] || textures[0];

        return new THREE.MeshStandardMaterial({
            map: texObj ? texObj.map : null,
            transparent: false,
            alphaTest: 0.5,
            depthWrite: true,
            roughness: 0.7,
            metalness: 0.1
        });
    });

    const mesh = new THREE.Mesh(geometry, materials);
    mesh.position.copy(offset);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    // Mapeo UV de caras de Blockbench a Three.js BoxGeometry
    const uvAttr = geometry.getAttribute('uv');
    orderedFaces.forEach((faceKey, faceIndex) => {
        const faceData = faces[faceKey];
        if (!faceData || !Array.isArray(faceData.uv)) return;

        const [u1, v1, u2, v2] = faceData.uv;
        const texObj = textures[typeof faceData.texture === 'number' ? faceData.texture : 0] || textures[0];
        const uvW = (texObj && texObj.uvW) || 256;
        const uvH = (texObj && texObj.uvH) || 256;

        const left = u1 / uvW;
        const right = u2 / uvW;
        const top = 1 - (v1 / uvH);
        const bottom = 1 - (v2 / uvH);

        const corners = {
            TL: [left, top],
            TR: [right, top],
            BR: [right, bottom],
            BL: [left, bottom]
        };

        const rot = ((faceData.rotation || 0) % 360 + 360) % 360;
        const steps = rot % 90 === 0 ? rot / 90 : 0;
        const cornerOrder = ['TL', 'TR', 'BR', 'BL'];
        const rotateCorner = (c, s) => cornerOrder[(cornerOrder.indexOf(c) + s) % 4];

        // Orden de vértices de BoxGeometry en Three.js: [TL, TR, BL, BR]
        const targetCorners = ['TL', 'TR', 'BL', 'BR'].map(c => corners[rotateCorner(c, steps)]);
        const baseIdx = faceIndex * 8;
        for (let p = 0; p < 4; p++) {
            uvAttr.array[baseIdx + p * 2 + 0] = targetCorners[p][0];
            uvAttr.array[baseIdx + p * 2 + 1] = targetCorners[p][1];
        }
    });
    uvAttr.needsUpdate = true;

    return mesh;
}

function buildModel(bb, textures) {
    const root = new THREE.Group();
    root.name = '__MODEL_ROOT__';

    const elementMap = new Map();
    (bb.elements || []).forEach(el => elementMap.set(el.uuid, el));

    const isHitbox = name => (name || '').toLowerCase() === 'hitbox' || (name || '').toLowerCase() === 'hitbox cube';

    function createCubeGroup(el) {
        const group = new THREE.Group();
        group.name = el.name || el.uuid || 'element';
        const origin = Array.isArray(el.origin) ? el.origin : [0, 0, 0];
        group.userData.originAbs = origin;

        if (!isHitbox(el.name)) {
            const mesh = buildCubeMesh(el, textures, origin);
            if (mesh) group.add(mesh);
        }

        if (el.rotation && Array.isArray(el.rotation)) {
            group.rotation.set(
                THREE.MathUtils.degToRad(el.rotation[0] || 0),
                THREE.MathUtils.degToRad(el.rotation[1] || 0),
                THREE.MathUtils.degToRad(el.rotation[2] || 0),
                'ZYX'
            );
        }
        return group;
    }

    const cubeGroupMap = new Map();
    (bb.elements || []).forEach(el => cubeGroupMap.set(el.uuid, createCubeGroup(el)));

    function processNode(node, parentGroup, parentOrigin = new THREE.Vector3(0, 0, 0)) {
        if (typeof node === 'string') {
            const el = elementMap.get(node);
            if (!el || isHitbox(el.name)) return;
            const cubeGroup = cubeGroupMap.get(el.uuid);
            if (!cubeGroup) return;

            const originAbs = new THREE.Vector3(...(cubeGroup.userData.originAbs || [0, 0, 0]));
            const pos = new THREE.Vector3().subVectors(originAbs, parentOrigin);
            cubeGroup.position.copy(pos);
            parentGroup.add(cubeGroup);
            return;
        }

        if (node && typeof node === 'object') {
            if (isHitbox(node.name)) return;
            const boneGroup = new THREE.Group();
            boneGroup.name = node.name || 'bone';

            const origin = new THREE.Vector3(...(Array.isArray(node.origin) ? node.origin : [0, 0, 0]));
            const pos = new THREE.Vector3().subVectors(origin, parentOrigin);
            boneGroup.position.copy(pos);

            if (node.rotation && Array.isArray(node.rotation)) {
                boneGroup.rotation.set(
                    THREE.MathUtils.degToRad(node.rotation[0] || 0),
                    THREE.MathUtils.degToRad(node.rotation[1] || 0),
                    THREE.MathUtils.degToRad(node.rotation[2] || 0),
                    'ZYX'
                );
            }

            if (Array.isArray(node.children)) {
                node.children.forEach(child => processNode(child, boneGroup, origin));
            }
            parentGroup.add(boneGroup);
        }
    }

    const outliner = Array.isArray(bb.outliner) && bb.outliner.length > 0 ? bb.outliner : (bb.elements || []).map(e => e.uuid);
    outliner.forEach(node => processNode(node, root, new THREE.Vector3(0, 0, 0)));

    return root;
}

async function loadZeusModel() {
    try {
        if (loadingText) loadingText.textContent = 'CARGANDO RENDER 3D...';

        const modelUrl = '../assets/models/mso_zeus.bbmodel';
        const response = await fetch(modelUrl);
        if (!response.ok) throw new Error(`HTTP ${response.status} cargando el archivo del modelo`);
        const doc = await response.json();

        // Cargar texturas embebidas
        const textures = await loadTextures(doc);

        // Construir jerarquía 3D idéntica a MythicCraft BBViewer
        const modelRoot = buildModel(doc, textures);
        scene.add(modelRoot);

        // Calcular caja delimitadora y encuadre de cámara
        const box = new THREE.Box3().setFromObject(modelRoot);
        const size = new THREE.Vector3();
        const center = new THREE.Vector3();
        box.getSize(size);
        box.getCenter(center);

        modelCenter.copy(center);

        // Colocar pedestal bajo sus pies
        setupFloor(center, size);

        // Posicionar cámara a distancia ideal
        const maxDim = Math.max(size.x, size.y, size.z);
        const camDistance = maxDim * 1.55;
        defaultCamPos.set(center.x, center.y + maxDim * 0.15, center.z + camDistance);
        camera.position.copy(defaultCamPos);
        controls.target.copy(center);
        camera.near = 1;
        camera.far = camDistance * 10;
        camera.updateProjectionMatrix();
        controls.update();

        // Ocultar overlay de carga
        if (loadingOverlay) {
            loadingOverlay.style.opacity = '0';
            setTimeout(() => {
                loadingOverlay.style.display = 'none';
            }, 300);
        }

        console.log('✅ Zeus 3D Render Cargado con éxito estilo MythicCraft!', modelRoot);
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
            camera.position.copy(defaultCamPos);
            controls.target.copy(modelCenter);
            controls.update();
        });
    }

    // Auto Rotate
    if (autoRotateBtn) {
        autoRotateBtn.style.background = 'var(--gold)';
        autoRotateBtn.style.color = '#000';

        autoRotateBtn.addEventListener('click', () => {
            controls.autoRotate = !controls.autoRotate;
            autoRotateBtn.style.background = controls.autoRotate ? 'var(--gold)' : '';
            autoRotateBtn.style.color = controls.autoRotate ? '#000' : '';
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
