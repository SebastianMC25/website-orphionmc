const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Clave criptográfica fija para el empaquetado del Bestiario
const CIPHER_KEY_HEX = 'e5a8f4c28b9d3e1a774205f69c3a1b4d8e2f6c9a0b1d3e5f7a9c2e4b6d8f0a2c';

function packModel(inputPath, outputPath) {
    console.log(`📦 Empaquetando y encriptando: ${inputPath} -> ${outputPath}`);
    const raw = fs.readFileSync(inputPath, 'utf8');
    const doc = JSON.parse(raw);

    // 1. Eliminar completamente metadatos propietarios de Blockbench
    delete doc.variable_placeholders;
    delete doc.model_core;
    delete doc.bone_option;
    delete doc.variant;
    delete doc.animations;

    // 2. Limpiar elementos: solo datos geométricos esenciales
    if (Array.isArray(doc.elements)) {
        doc.elements = doc.elements.map(el => {
            const clean = {
                from: el.from,
                to: el.to,
                origin: el.origin,
                faces: el.faces,
                uuid: el.uuid
            };
            if (el.rotation) clean.rotation = el.rotation;
            if (el.inflate) clean.inflate = el.inflate;
            if (el.invert) clean.invert = el.invert;
            return clean;
        });
    }

    // 3. Limpiar outliner: solo estructura de nombres y orígenes
    function cleanNode(node) {
        if (typeof node === 'string') return node;
        if (!node || typeof node !== 'object') return null;
        const clean = {
            name: node.name,
            origin: node.origin,
            uuid: node.uuid
        };
        if (node.rotation) clean.rotation = node.rotation;
        if (Array.isArray(node.children)) {
            clean.children = node.children.map(cleanNode).filter(Boolean);
        }
        return clean;
    }
    if (Array.isArray(doc.outliner)) {
        doc.outliner = doc.outliner.map(cleanNode).filter(Boolean);
    }
    if (Array.isArray(doc.groups)) {
        doc.groups = doc.groups.map(cleanNode).filter(Boolean);
    }

    const payload = Buffer.from(JSON.stringify(doc), 'utf8');

    // 4. Encriptación AES-256-GCM
    const key = Buffer.from(CIPHER_KEY_HEX, 'hex');
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    const encrypted = Buffer.concat([cipher.update(payload), cipher.final()]);
    const tag = cipher.getAuthTag();

    // Formato binario seguro: [12 bytes IV] + [16 bytes Tag] + [Cuerpo encriptado]
    const finalBin = Buffer.concat([iv, tag, encrypted]);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, finalBin);
    console.log(`✅ Archivo binario protegido generado (${(finalBin.length / 1024).toFixed(1)} KB)`);
}

// Empaquetar Zeus
const zeusInput = path.resolve(__dirname, '../assets/models/mso_zeus.bbmodel');
const zeusOutput = path.resolve(__dirname, '../assets/models/zeus.bin');

if (fs.existsSync(zeusInput)) {
    packModel(zeusInput, zeusOutput);
} else {
    console.error('No se encontró mso_zeus.bbmodel en', zeusInput);
}

module.exports = { packModel, CIPHER_KEY_HEX };
