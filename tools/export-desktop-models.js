const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const desktopDir = 'C:\\Users\\seba_\\OneDrive\\Escritorio\\Modelos_Bestiario_OrphionMC';
const bpBase = 'C:\\3 Servidor Survival RPG 1.21.11\\plugins\\ModelEngine\\blueprints';
const CIPHER_KEY_HEX = 'e5a8f4c28b9d3e1a774205f69c3a1b4d8e2f6c9a0b1d3e5f7a9c2e4b6d8f0a2c';

const modelDefinitions = [
    // 1. PANTEÓN DEL OLIMPO
    { category: '1_PANTEON_DEL_OLIMPO', id: 'zeus', name: 'Zeus', file: 'mso_zeus\\mso_zeus.bbmodel' },
    { category: '1_PANTEON_DEL_OLIMPO', id: 'poseidon', name: 'Poseidon', file: 'mso_poseidon\\mso_poseidon.bbmodel' },
    { category: '1_PANTEON_DEL_OLIMPO', id: 'pluto', name: 'Pluton', file: 'plutobbmodels\\pluto.bbmodel' },
    { category: '1_PANTEON_DEL_OLIMPO', id: 'kronos', name: 'Kronos', file: 'mso_kronos\\mso_kronos.bbmodel' },
    { category: '1_PANTEON_DEL_OLIMPO', id: 'anubis', name: 'Anubis', file: 'lr_anubis.bbmodel' },
    { category: '1_PANTEON_DEL_OLIMPO', id: 'cerberus', name: 'Cerbero', file: 'cerberus.bbmodel' },
    { category: '1_PANTEON_DEL_OLIMPO', id: 'medusa', name: 'Medusa', file: 'medusa.bbmodel' },
    { category: '1_PANTEON_DEL_OLIMPO', id: 'loki', name: 'Loki', file: 'loki.bbmodel' },
    { category: '1_PANTEON_DEL_OLIMPO', id: 'buda', name: 'Buda', file: 'gatling_bodhisattva\\gatling_bodhisattva.bbmodel' },

    // 2. COLOSOS & BESTIAS
    { category: '2_COLOSOS_Y_BESTIAS', id: 'hydra', name: 'Hydra', file: 'hydrabbmodels\\hydra.bbmodel' },
    { category: '2_COLOSOS_Y_BESTIAS', id: 'bufo', name: 'Bufo', file: 'bufo_bufo.bbmodel' },
    { category: '2_COLOSOS_Y_BESTIAS', id: 'cyclops', name: 'Ciclope', file: 'tc_cyclops.bbmodel' },
    { category: '2_COLOSOS_Y_BESTIAS', id: 'aloc', name: 'Aloc_Mech', file: 'aloc_the_demonic_mech.bbmodel' },
    { category: '2_COLOSOS_Y_BESTIAS', id: 'nyctalus', name: 'Nyctalus', file: 'nyctalus\\nyctalus.bbmodel' },
    { category: '2_COLOSOS_Y_BESTIAS', id: 'minotaur', name: 'Minotauro', file: 'minotaur.bbmodel' },
    { category: '2_COLOSOS_Y_BESTIAS', id: 'dragon', name: 'Dragon', file: 'nocsy_dragon.bbmodel' },

    // 3. SEÑORES SEPULCRALES
    { category: '3_SENORES_SEPULCRALES', id: 'undead_king', name: 'Rey_No_Muerto', file: 'undead_king.bbmodel' },
    { category: '3_SENORES_SEPULCRALES', id: 'azazel', name: 'Azazel_Nigromante', file: 'azazel.bbmodel' },
    { category: '3_SENORES_SEPULCRALES', id: 'demon_general', name: 'General_Demonio', file: 'mso_demon_general.bbmodel' },
    { category: '3_SENORES_SEPULCRALES', id: 'ent_king', name: 'Rey_Ent', file: 'ent_king.bbmodel' },
    { category: '3_SENORES_SEPULCRALES', id: 'goblin_king', name: 'Rey_Goblin', file: 'goblinking.bbmodel' },

    // 4. EVENTOS & MUNDO
    { category: '4_EVENTOS_Y_MUNDO', id: 'fenrir', name: 'Fenrir', file: 'fenrir.bbmodel' },
    { category: '4_EVENTOS_Y_MUNDO', id: 'frankie', name: 'Frankie', file: 'bl_frankie.bbmodel' },
    { category: '4_EVENTOS_Y_MUNDO', id: 'yeti', name: 'Yeti', file: 'Yeti.bbmodel' },
    { category: '4_EVENTOS_Y_MUNDO', id: 'santa', name: 'Santa', file: 'Santacim.bbmodel' }
];

console.log('Creando estructura en el Escritorio:', desktopDir);
fs.mkdirSync(desktopDir, { recursive: true });
const webModelsDir = path.join(desktopDir, 'MODELOS_ENCRIPTADOS_WEB');
fs.mkdirSync(webModelsDir, { recursive: true });

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

let copiedCount = 0;
let compiledCount = 0;

for (const m of modelDefinitions) {
    const src = path.join(bpBase, m.file);
    if (fs.existsSync(src)) {
        const catDir = path.join(desktopDir, m.category);
        fs.mkdirSync(catDir, { recursive: true });
        const destBbmodel = path.join(catDir, path.basename(src));
        fs.copyFileSync(src, destBbmodel);
        copiedCount++;

        // Compilar a .bin
        const binDest = path.join(webModelsDir, m.id + '.bin');
        try {
            const content = fs.readFileSync(src, 'utf8');
            packFile(content, binDest);
            compiledCount++;
            console.log('[OK]', m.name, '->', m.category + '/' + path.basename(src), '+', m.id + '.bin');
        } catch (e) {
            console.warn('[WARN] Error compilando', m.name, ':', e.message);
        }
    } else {
        console.warn('[MISSING] No se encontró:', src);
    }
}

// Copiar también los .bin generados a la carpeta web/assets/models/
const localWebAssets = path.resolve(__dirname, '../assets/models');
fs.mkdirSync(localWebAssets, { recursive: true });
const binFiles = fs.readdirSync(webModelsDir);
for (const bf of binFiles) {
    fs.copyFileSync(path.join(webModelsDir, bf), path.join(localWebAssets, bf));
}
console.log('Copiados', binFiles.length, 'archivos .bin a assets/models/ de la web.');

// Crear script .bat y README para el usuario en el Escritorio
const batContent = `@echo off
title Compilador de Modelos OrphionMC Web
echo ====================================================
echo  COMPILADOR AUTOMATICO DE MODELOS BBMODEL A .BIN
echo ====================================================
echo.
node compilar_modelos.js
echo.
echo Presiona cualquier tecla para salir...
pause >nul
`;
fs.writeFileSync(path.join(desktopDir, 'compilar_modelos.bat'), batContent);

// Copiar script de compilación para que el usuario pueda compilar cuando añada más
fs.copyFileSync(path.resolve(__dirname, 'pack-model.js'), path.join(desktopDir, 'compilar_modelos.js'));

const readmeContent = `# Bóveda de Modelos 3D - OrphionMC (GitHub Privado)

Esta carpeta contiene todos los modelos 3D originales extraídos del servidor para las categorías del Bestiario.

## 📁 Estructura
- **\`1_PANTEON_DEL_OLIMPO/\`**: Zeus, Poseidón, Plutón, Kronos, Anubis, Cerbero, Medusa, Loki, Buda.
- **\`2_COLOSOS_Y_BESTIAS/\`**: Hydra, Bufo, Cíclope, Aloc Mech, Nyctalus, Minotauro, Dragón.
- **\`3_SENORES_SEPULCRALES/\`**: Rey No Muerto, Azazel, General Demonio, Rey Ent, Rey Goblin.
- **\`4_EVENTOS_Y_MUNDO/\`**: Fenrir, Frankie, Yeti, Santa Claus.
- **\`MODELOS_ENCRIPTADOS_WEB/\`**: Archivos \`.bin\` encriptados con AES-256-GCM listos para el visor 3D de la web.

## 🔒 ¿Cómo subirlos a tu GitHub Privado?
1. Crea un repositorio **PRIVADO** en GitHub (por ejemplo \`orphionmc-models-vault\`).
2. Sube el contenido de estas carpetas originales (\`.bbmodel\`) allí. Solo tú tendrás acceso.
3. **NUNCA** subas archivos \`.bbmodel\` a tu repositorio público de la web.
4. Para la web, usa únicamente los archivos de la carpeta **\`MODELOS_ENCRIPTADOS_WEB/\`** (\`.bin\`). Blockbench no puede abrir los \`.bin\`, evitando que te roben tus modelos.
`;
fs.writeFileSync(path.join(desktopDir, 'LEEME_INSTRUCCIONES_GITHUB_PRIVADO.md'), readmeContent);

console.log('\n🎉 PROCESO COMPLETADO CON ÉXITO:');
console.log(' - ' + copiedCount + ' archivos .bbmodel originales organizados en el Escritorio.');
console.log(' - ' + compiledCount + ' archivos .bin encriptados para la web.');
console.log(' - Carpeta lista en: ' + desktopDir);
