const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');

const desktopDir = 'C:\\Users\\seba_\\OneDrive\\Escritorio\\Modelos_Bestiario_OrphionMC';
const bpBase = 'C:\\3 Servidor Survival RPG 1.21.11\\plugins\\ModelEngine\\blueprints';
const CIPHER_KEY_HEX = 'e5a8f4c28b9d3e1a774205f69c3a1b4d8e2f6c9a0b1d3e5f7a9c2e4b6d8f0a2c';

function packFile(rawJson, outputPath) {
    const doc = JSON.parse(rawJson);
    delete doc.variable_placeholders;
    delete doc.model_core;
    delete doc.bone_option;
    delete doc.variant;
    delete doc.animations;

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
    if (Array.isArray(doc.outliner)) doc.outliner = doc.outliner.map(cleanNode).filter(Boolean);
    if (Array.isArray(doc.groups)) doc.groups = doc.groups.map(cleanNode).filter(Boolean);

    const payload = Buffer.from(JSON.stringify(doc), 'utf8');
    const key = Buffer.from(CIPHER_KEY_HEX, 'hex');
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    const encrypted = Buffer.concat([cipher.update(payload), cipher.final()]);
    const tag = cipher.getAuthTag();

    const finalBin = Buffer.concat([iv, tag, encrypted]);
    fs.writeFileSync(outputPath, finalBin);
}

// 1. Añadir Dinosaurios
const dinoDir = path.join(bpBase, 'Dinosaurios');
const dinoDest = path.join(desktopDir, '5_REINO_PREHISTORICO');
const webModelsDir = path.join(desktopDir, 'MODELOS_ENCRIPTADOS_WEB');
fs.mkdirSync(dinoDest, { recursive: true });

let dinoCount = 0;
if (fs.existsSync(dinoDir)) {
    const files = fs.readdirSync(dinoDir).filter(f => f.endsWith('.bbmodel'));
    for (const f of files) {
        const src = path.join(dinoDir, f);
        fs.copyFileSync(src, path.join(dinoDest, f));
        dinoCount++;

        const binName = f.replace('.bbmodel', '.bin');
        try {
            packFile(fs.readFileSync(src, 'utf8'), path.join(webModelsDir, binName));
        } catch (e) {}
    }
}
console.log('Copiados', dinoCount, 'dinosaurios .bbmodel a 5_REINO_PREHISTORICO/');

// 2. Añadir Océano
const oceanoDir = path.join(bpBase, 'oceano');
const oceanoDest = path.join(desktopDir, '6_PROFUNDIDADES_MARINAS');
fs.mkdirSync(oceanoDest, { recursive: true });

let oceanCount = 0;
if (fs.existsSync(oceanoDir)) {
    const files = fs.readdirSync(oceanoDir).filter(f => f.endsWith('.bbmodel'));
    for (const f of files) {
        const src = path.join(oceanoDir, f);
        fs.copyFileSync(src, path.join(oceanoDest, f));
        oceanCount++;

        const binName = f.replace('.bbmodel', '.bin');
        try {
            packFile(fs.readFileSync(src, 'utf8'), path.join(webModelsDir, binName));
        } catch (e) {}
    }
}
console.log('Copiados', oceanCount, 'criaturas marinas .bbmodel a 6_PROFUNDIDADES_MARINAS/');

// 3. Actualizar README
const readmeContent = `# Bóveda Privada de Modelos 3D - OrphionMC

Repositorio privado oficial con todos los modelos 3D originales (.bbmodel) del servidor OrphionMC RPG.

## 📁 Estructura del Repositorio
- **\`1_PANTEON_DEL_OLIMPO/\`**: Zeus, Poseidón, Plutón, Kronos, Anubis, Cerbero, Medusa, Loki, Buda.
- **\`2_COLOSOS_Y_BESTIAS/\`**: Hydra, Bufo, Cíclope, Aloc Mech, Nyctalus, Minotauro, Dragón.
- **\`3_SENORES_SEPULCRALES/\`**: Rey No Muerto, Azazel, General Demonio, Rey Ent, Rey Goblin.
- **\`4_EVENTOS_Y_MUNDO/\`**: Fenrir, Frankie, Yeti, Santa Claus.
- **\`5_REINO_PREHISTORICO/\`**: T-Rex, Allosaurus, Brachiosaurus, Carnotaurus, Stegosaurus, Triceratops, Velociraptors, etc. (${dinoCount} modelos).
- **\`6_PROFUNDIDADES_MARINAS/\`**: Megalodón, Calamar Gigante, Orcas, Tiburones Martillo, Mantarrayas, etc. (${oceanCount} modelos).
- **\`MODELOS_ENCRIPTADOS_WEB/\`**: Archivos \`.bin\` encriptados con AES-256-GCM listos para el visor 3D de la web.

## 🔒 Seguridad
- Este repositorio es **PRIVADO** y contiene los modelos originales de Blockbench.
- En la web pública de OrphionMC **SOLO** se publican los archivos compilados \`.bin\` de la carpeta \`MODELOS_ENCRIPTADOS_WEB/\`.
- Blockbench y ModelEngine no pueden abrir los archivos \`.bin\`, protegiendo tu trabajo contra robos.
`;
fs.writeFileSync(path.join(desktopDir, 'LEEME_INSTRUCCIONES_GITHUB_PRIVADO.md'), readmeContent);

// 4. Git commit y push al repositorio privado
console.log('\nSubiendo todos los modelos a https://github.com/SebastianMC25/mobs.git...');
process.chdir(desktopDir);

try {
    execSync('git add -A', { stdio: 'inherit' });
    execSync('git commit -m "feat: initial commit with all bestiary models (Olimpo, Colosos, Sepulcrales, Eventos, Dinos, Oceano)"', { stdio: 'inherit' });
    execSync('git push -u origin main --force', { stdio: 'inherit' });
    console.log('\n🚀 ¡TODOS LOS MODELOS FUERON SUBIDOS CON ÉXITO A https://github.com/SebastianMC25/mobs.git !');
} catch (err) {
    console.error('Error durante git push:', err.message);
}
