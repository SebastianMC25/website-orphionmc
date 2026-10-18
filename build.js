const fs = require('fs-extra');
const path = require('path');
const JavaScriptObfuscator = require('javascript-obfuscator');
const minify = require('html-minifier').minify;
const CleanCSS = require('clean-css');
const glob = require('glob');

const SRC_DIR = './';
const DIST_DIR = './dist';

// Files/folders to exclude from the build
const EXCLUDES = [
    'node_modules',
    'dist',
    'server',
    'build.js',
    'package.json',
    'package-lock.json',
    '.env',
    '.git',
    'sessions.db',
    'OrphionMC_forum.db'
];

async function build() {
    console.log("🚀 Starting Production Build for OrphionMC...");

    // 1. Clean and Create Dist folder
    if (fs.existsSync(DIST_DIR)) {
        await fs.remove(DIST_DIR);
    }
    await fs.ensureDir(DIST_DIR);

    // 2. Copy static assets (images, videos, etc.)
    const allFiles = glob.sync('**/*', { nodir: true });

    for (const file of allFiles) {
        if (EXCLUDES.some(exclude => file.startsWith(exclude))) continue;

        const ext = path.extname(file).toLowerCase();
        const distPath = path.join(DIST_DIR, file);
        await fs.ensureDir(path.dirname(distPath));

        if (ext === '.js') {
            console.log(`  📦 Obfuscating: ${file}`);
            const code = await fs.readFile(file, 'utf8');
            const obfuscated = JavaScriptObfuscator.obfuscate(code, {
                compact: true,
                controlFlowFlattening: true,
                deadCodeInjection: true,
                debugProtection: true,
                disableConsoleOutput: true,
                identifierNamesGenerator: 'hexadecimal',
                renameGlobals: false, // Keep global functions for HTML event handlers if needed
                selfDefending: true,
                stringArray: true,
                stringArrayThreshold: 0.75,
                transformObjectKeys: true,
                unicodeEscapeSequence: true
            });
            await fs.writeFile(distPath, obfuscated.getObfuscatedCode());
        }
        else if (ext === '.html') {
            console.log(`  📄 Minifying HTML: ${file}`);
            const html = await fs.readFile(file, 'utf8');
            const minified = minify(html, {
                removeAttributeQuotes: true,
                collapseWhitespace: true,
                removeComments: true,
                minifyJS: true,
                minifyCSS: true
            });
            await fs.writeFile(distPath, minified);
        }
        else if (ext === '.css') {
            console.log(`  🎨 Minifying CSS: ${file}`);
            const css = await fs.readFile(file, 'utf8');
            const minified = new CleanCSS({}).minify(css);
            await fs.writeFile(distPath, minified.styles);
        }
        else {
            // Copy as-is
            await fs.copy(file, distPath);
        }
    }

    console.log("\n✅ Build Completed! Production files are in 'dist/' folder.");
}

// Check for dependencies before running
try {
    require.resolve('fs-extra');
    require.resolve('javascript-obfuscator');
    require.resolve('html-minifier');
    require.resolve('clean-css');
    require.resolve('glob');
    build();
} catch (e) {
    console.error("❌ Missing build dependencies. Please install them first:");
    console.log("npm install fs-extra javascript-obfuscator html-minifier clean-css glob --save-dev");
}
