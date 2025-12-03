#!/usr/bin/env node
// Helper: generate manifest and sign it. Usage:
// node scripts/generate-and-sign.js <basePath> <outManifest> <privateKey> <outSignature>

const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

function usage() {
  console.error('Usage: node scripts/generate-and-sign.js <basePath> <outManifest> <privateKey> <outSignature>');
  process.exit(2);
}

if (require.main === module) {
  const argv = process.argv.slice(2);
  if (argv.length < 4) return usage();
  const [basePath, outManifest, privateKey, outSignature] = argv;

  // 1) Generate manifest (in-process via runCli)
  try {
    const gm = require(path.join(__dirname, 'generate-manifest.js'));
    gm.runCli([null, null, basePath, outManifest]);
  } catch (err) {
    console.error('Error generating manifest:', err && err.message ? err.message : err);
    process.exit(1);
  }

  // 2) Sign manifest using sign-manifest.js wrapper (which uses OpenSSL)
  try {
    const signScript = path.join(__dirname, 'sign-manifest.js');
    const res = spawnSync(process.execPath, [signScript, privateKey, outManifest, outSignature], { stdio: 'inherit' });
    if (res.status !== 0) process.exit(res.status || 1);
  } catch (err) {
    console.error('Error signing manifest:', err && err.message ? err.message : err);
    process.exit(1);
  }

  console.log('Generate and sign completed:', outManifest, outSignature);
}

module.exports = {};
