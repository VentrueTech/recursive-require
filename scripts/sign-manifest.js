#!/usr/bin/env node
// Wrapper to sign a manifest using OpenSSL pkeyutl (Ed25519). Usage:
// node scripts/sign-manifest.js <privateKeyPath> <inManifestPath> <outSignaturePath>

const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function usage() {
  console.error('Usage: node scripts/sign-manifest.js <privateKeyPath> <inManifestPath> <outSignaturePath>');
  process.exit(2);
}

if (require.main === module) {
  const argv = process.argv.slice(2);
  if (argv.length < 3) return usage();
  const [keyPath, inPath, outPath] = argv;
  if (!fs.existsSync(keyPath)) {
    console.error('Private key not found:', keyPath);
    process.exit(3);
  }
  if (!fs.existsSync(inPath)) {
    console.error('Manifest not found:', inPath);
    process.exit(4);
  }

  try {
    // Run OpenSSL pkeyutl -sign -inkey keyPath -in inPath -out outPath
    execFileSync('openssl', ['pkeyutl', '-sign', '-inkey', keyPath, '-in', inPath, '-out', outPath], { stdio: 'inherit' });
    console.log('Signature written to', outPath);
  } catch (err) {
    console.error('Error signing manifest:', err.message || err);
    process.exit(1);
  }
}

module.exports = {};
