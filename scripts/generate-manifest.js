// Gera manifest.json com checksums SHA-256 dos arquivos .js sob basePath
// Opcionalmente assina o manifest usando chave privada Ed25519 (openssl)

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function sha256FileSync(filePath) {
  const data = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(data).digest('hex');
}

function walkJsFiles(basePath) {
  const files = [];
  function walk(dir) {
    fs.readdirSync(dir).forEach((file) => {
      const full = path.join(dir, file);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) return walk(full);
      if (stat.isFile() && file.endsWith('.js')) {
        files.push(full);
      }
    });
  }
  walk(basePath);
  return files;
}

function makeManifest(basePath) {
  basePath = path.resolve(basePath);
  const jsFiles = walkJsFiles(basePath);
  const manifest = {
    version: 1,
    hashAlgo: 'sha256',
    generatedAt: new Date().toISOString(),
    files: {}
  };
  jsFiles.forEach((file) => {
    const rel = path.relative(basePath, file).split(path.sep).join('/');
    manifest.files[rel] = sha256FileSync(file);
  });
  return manifest;
}

// CLI usage: node generate-manifest.js <basePath> [manifestPath]
if (require.main === module) {
  const basePath = process.argv[2] || '.';
  const manifestPath = process.argv[3] || 'manifest.json';
  const manifest = makeManifest(basePath);
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`Manifest gerado: ${manifestPath}`);
}

module.exports = { makeManifest };
