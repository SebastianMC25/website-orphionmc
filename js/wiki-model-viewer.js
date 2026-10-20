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
let defaultCamPos = new THREE.Vector3(30, 80, -220);

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
        powerPreference: 'high-performance',
        preserveDrawingBuffer: true
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
    controls.autoRotate = true; // Rotación de vitrina
    controls.autoRotateSpeed = 1.2;

    // 6. Cargar y construir el modelo
    loadMobModel();

    // 7. Eventos
    setupEvents();

    // 8. Loop de Render
    animate();
}

function setupLighting() {
    // Luz ambiental suave
    const ambientLight = new THREE.AmbientLight(0xfff8ee, 1.8);
    scene.add(ambientLight);

    // Luz principal dorada (frontal derecha de la vista)
    const keyLight = new THREE.DirectionalLight(0xffe599, 2.5);
    keyLight.position.set(120, 200, -160);
    keyLight.castShadow = true;
    scene.add(keyLight);

    // Luz de contorno cian mítica de rayo (trasera izquierda)
    const rimLight = new THREE.DirectionalLight(0x38bdf8, 2.2);
    rimLight.position.set(-150, 150, 120);
    scene.add(rimLight);

    // Luz de relleno púrpura divina
    const fillLight = new THREE.DirectionalLight(0xc084fc, 1.2);
    fillLight.position.set(0, -50, -120);
    scene.add(fillLight);
}

function setupFloor(center, size, floorY = 0) {
    // Radio proporcionado al ancho y huella real del mob (evita pedestales gigantes en colas largas)
    const radius = Math.max(size.x * 0.85, Math.min(size.z * 0.65, size.x * 1.45), 25);
    const pedestalGeo = new THREE.CylinderGeometry(radius, radius * 1.08, 3, 48);
    const pedestalMat = new THREE.MeshStandardMaterial({
        color: 0x161522,
        roughness: 0.7,
        metalness: 0.3
    });
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.set(center.x, floorY - 1.5, center.z);
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
    ring.position.set(center.x, floorY + 0.05, center.z);
    scene.add(ring);
}

async function loadTextures(bb) {
    const loader = new THREE.TextureLoader();
    const textures = [];

    const defaultW = Number(bb.resolution?.width) || 256;
    const defaultH = Number(bb.resolution?.height) || 256;

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

            // Priorizar uv_width real de la textura, luego resolución del proyecto bbmodel, luego ancho físico
            let uvW = Number(tex.uv_width) || Number(bb.resolution?.width) || Number(tex.width) || defaultW;
            let uvH = Number(tex.uv_height) || Number(bb.resolution?.height) || Number(tex.height) || defaultH;

            // Salvaguarda para modelos Bedrock HD (textura 256px mapeada en cuadrícula de 16x16)
            if (bb.resolution?.width === 16 && uvW > 32) {
                uvW = 16;
            }
            if (bb.resolution?.height === 16 && uvH > 32) {
                uvH = 16;
            }

            textures.push({
                map: texture,
                uvW,
                uvH
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
    const a = new THREE.Vector3(element.from[0], element.from[1], element.from[2]);
    const s = new THREE.Vector3(element.to[0], element.to[1], element.to[2]);

    const u = Math.sign(s.x - a.x) || 1;
    const f = Math.sign(s.y - a.y) || 1;
    const p = Math.sign(s.z - a.z) || 1;

    const min = new THREE.Vector3(
        Math.min(a.x, s.x) - inflate,
        Math.min(a.y, s.y) - inflate,
        Math.min(a.z, s.z) - inflate
    );
    const max = new THREE.Vector3(
        Math.max(a.x, s.x) + inflate,
        Math.max(a.y, s.y) + inflate,
        Math.max(a.z, s.z) + inflate
    );
    const size = new THREE.Vector3().subVectors(max, min);

    const eps = 0.001;
    const dx = Math.max(Math.abs(size.x), eps);
    const dy = Math.max(Math.abs(size.y), eps);
    const dz = Math.max(Math.abs(size.z), eps);
    const isFlat = Math.abs(size.x) < eps || Math.abs(size.y) < eps || Math.abs(size.z) < eps;

    const geometry = new THREE.BoxGeometry(dx, dy, dz);
    const center = new THREE.Vector3().addVectors(min, max).multiplyScalar(0.5);
    const offset = new THREE.Vector3().subVectors(center, new THREE.Vector3(originAbs[0], originAbs[1], originAbs[2]));

    const R = ['east', 'west', 'up', 'down', 'south', 'north'];
    const L = [...R];
    const swap = (arr, i1, i2) => {
        const tmp = arr[i1];
        arr[i1] = arr[i2];
        arr[i2] = tmp;
    };
    if (u < 0) swap(L, 0, 1);
    if (f < 0) swap(L, 2, 3);
    if (p < 0) swap(L, 4, 5);

    const invert = !!element.invert;
    const faces = element.faces || {};

    const materials = L.map(faceKey => {
        const faceData = faces[faceKey] || {};
        const texIdx = typeof faceData.texture === 'number' ? faceData.texture : 0;
        const texObj = textures[texIdx] || textures[0];

        const extraProps = isFlat ? {
            transparent: true,
            alphaTest: 0.05,
            depthWrite: false,
            side: THREE.DoubleSide
        } : {
            transparent: false,
            alphaTest: 0.5,
            depthWrite: true,
            side: invert ? THREE.BackSide : THREE.FrontSide
        };

        return new THREE.MeshStandardMaterial({
            map: texObj ? texObj.map : null,
            roughness: 0.7,
            metalness: 0.1,
            ...extraProps
        });
    });

    const mesh = new THREE.Mesh(geometry, materials);
    mesh.position.copy(offset);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    if (invert && !isFlat) {
        const idx = geometry.getIndex();
        if (idx) {
            const arr = idx.array;
            for (let j = 0; j < arr.length; j += 3) {
                const tmp = arr[j + 1];
                arr[j + 1] = arr[j + 2];
                arr[j + 2] = tmp;
            }
            idx.needsUpdate = true;
        }
        const normals = geometry.getAttribute('normal');
        if (normals) {
            for (let j = 0; j < normals.array.length; j++) normals.array[j] *= -1;
            normals.needsUpdate = true;
        }
    }

    // Mapeo UV exacto de MythicCraft BBViewer
    const uvAttr = geometry.getAttribute('uv');
    const cornerOrder = ['TL', 'TR', 'BR', 'BL'];
    const rotateCorner = (c, s) => cornerOrder[(cornerOrder.indexOf(c) + s) % 4];

    L.forEach((faceKey, faceIndex) => {
        const faceData = faces[faceKey];
        if (!faceData || !Array.isArray(faceData.uv)) return;

        const [u1, v1, u2, v2] = faceData.uv;
        const texObj = textures[typeof faceData.texture === 'number' ? faceData.texture : 0] || textures[0];
        const uvW = (texObj && texObj.uvW) || 256;
        const uvH = (texObj && texObj.uvH) || 256;

        const Ae = u1 / uvW;
        const Pe = u2 / uvW;
        const ze = v1 / uvH;
        const xt = v2 / uvH;

        const corners = {
            TL: [Ae, ze],
            TR: [Pe, ze],
            BR: [Pe, xt],
            BL: [Ae, xt]
        };

        const rot = ((faceData.rotation || 0) % 360 + 360) % 360;
        const steps = rot % 90 === 0 ? rot / 90 : 0;
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

function prepareOutliner(bb) {
    if (!bb || typeof bb !== 'object') return bb;
    const groupMap = new Map();
    for (const g of bb.groups || []) {
        if (g && typeof g === 'object' && typeof g.uuid === 'string') {
            groupMap.set(g.uuid, g);
        }
    }
    if (!groupMap.size || !Array.isArray(bb.outliner)) return bb;

    function mergeNode(node) {
        if (typeof node === 'string') return node;
        if (!node || typeof node !== 'object') return null;
        const matched = typeof node.uuid === 'string' ? groupMap.get(node.uuid) || {} : {};
        const children = Array.isArray(node.children) ? node.children : Array.isArray(matched.children) ? matched.children : [];
        const merged = { ...matched, ...node };
        merged.children = children.map(mergeNode).filter(Boolean);
        return merged;
    }

    const mergedOutliner = bb.outliner.map(mergeNode).filter(Boolean);
    return { ...bb, outliner: mergedOutliner };
}

function buildModel(rawDoc, textures) {
    const bb = prepareOutliner(rawDoc);
    const root = new THREE.Group();
    root.name = '__MODEL_ROOT__';

    const elementMap = new Map();
    (bb.elements || []).forEach(el => elementMap.set(el.uuid, el));

    const isHitbox = name => {
        const s = (name || '').toLowerCase();
        return s === 'hitbox' ||
               s === 'hitbox cube' ||
               s.includes('hitbox') ||
               s.startsWith('ob_') ||
               s.includes('_hit') ||
               s.endsWith('_target') ||
               s === 'spike' ||
               s.startsWith('attack') ||
               s.includes('_vfx') ||
               s.includes('raser') ||
               s.startsWith('g_bite');
    };

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
            group.rotation.order = 'ZYX';
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
                boneGroup.rotation.order = 'ZYX';
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

// Clave criptográfica del Bestiario para protección de modelos 3D
const CIPHER_KEY_HEX = 'e5a8f4c28b9d3e1a774205f69c3a1b4d8e2f6c9a0b1d3e5f7a9c2e4b6d8f0a2c';

async function fetchEncryptedModel(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status} cargando el archivo del modelo`);
    const buffer = await response.arrayBuffer();

    const u8 = new Uint8Array(buffer);
    const iv = u8.slice(0, 12);
    const tag = u8.slice(12, 28);
    const data = u8.slice(28);

    const cipherWithTag = new Uint8Array(data.length + tag.length);
    cipherWithTag.set(data, 0);
    cipherWithTag.set(tag, data.length);

    const keyBytes = new Uint8Array(CIPHER_KEY_HEX.match(/.{1,2}/g).map(b => parseInt(b, 16)));
    const cryptoKey = await window.crypto.subtle.importKey(
        'raw',
        keyBytes,
        { name: 'AES-GCM' },
        false,
        ['decrypt']
    );

    const decrypted = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: iv },
        cryptoKey,
        cipherWithTag
    );

    const text = new TextDecoder().decode(decrypted);
    return JSON.parse(text);
}

async function loadMobModel() {
    const urlParams = new URLSearchParams(window.location.search);
    const modelKey = document.body.dataset.model || urlParams.get('model') || 'zeus';
    const modelName = document.body.dataset.modelName || modelKey.toUpperCase();

    try {
        if (loadingText) loadingText.textContent = `CARGANDO RENDER 3D DE ${modelName}...`;

        const modelUrl = `../assets/models/${modelKey}.bin?v=31`;
        const doc = await fetchEncryptedModel(modelUrl);

        // Cargar texturas embebidas con resolución real
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

        // Colocar pedestal bajo sus pies exactamente
        const floorY = isFinite(box.min.y) ? box.min.y : 0;
        setupFloor(center, size, floorY);

        // Posicionar cámara al frente del mob (los mobs Bedrock miran hacia -Z)
        // Dimensión visual efectiva proporcional (para que bípedos y cuadrúpedos llenen el viewport como Zeus)
        const effectiveDim = Math.max(size.y * 1.25, size.x * 1.1, size.z * 0.72, 25);
        const camDistance = effectiveDim * 1.6;
        defaultCamPos.set(center.x + effectiveDim * 0.38, center.y + effectiveDim * 0.15, center.z - camDistance);
        camera.position.copy(defaultCamPos);
        controls.target.copy(center);
        camera.near = 1;
        camera.far = Math.max(camDistance * 10, 5000);
        camera.updateProjectionMatrix();
        controls.update();

        // Ocultar overlay de carga
        if (loadingOverlay) {
            loadingOverlay.style.opacity = '0';
            setTimeout(() => {
                loadingOverlay.style.display = 'none';
            }, 300);
        }

        console.log(`✅ ${modelName} 3D Render cargado con éxito estilo MythicCraft!`, modelRoot);
    } catch (err) {
        console.error(`❌ Error cargando render 3D de ${modelName}:`, err);
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

// Auto-recarga cuando se activa una nueva versión de caché
if ('serviceWorker' in navigator) {
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
            refreshing = true;
            window.location.reload();
        }
    });
}
