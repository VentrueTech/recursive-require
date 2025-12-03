const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { makeManifest } = require('../scripts/generate-manifest');
const loadTree = require('../index');

describe('signed-manifest mode', () => {
  const basePath = path.join(__dirname, 'fixtures');
  let manifest, signature, publicKey;

  beforeAll(() => {
    manifest = makeManifest(basePath);
    // Generate Ed25519 key pair for test
    const { publicKey: pub, privateKey: priv } = crypto.generateKeyPairSync('ed25519');
    publicKey = pub.export({ type: 'spki', format: 'pem' });
    const manifestBuffer = Buffer.from(JSON.stringify(manifest));
    signature = crypto.sign(null, manifestBuffer, priv);
  });

  it('carrega arquivos se assinatura válida', () => {
    const tree = loadTree(basePath, {
      mode: 'signed-manifest',
      manifest,
      signature,
      publicKey
    });
    expect(tree).toHaveProperty('fixturesFn');
    expect(typeof tree.fixturesFn).toBe('function');
  });

  it('falha se assinatura inválida', () => {
    const badSignature = Buffer.from(signature);
    badSignature[0] ^= 0xff; // corrupt signature
    expect(() => loadTree(basePath, {
      mode: 'signed-manifest',
      manifest,
      signature: badSignature,
      publicKey
    })).toThrow(/Assinatura do manifest inválida/);
  });
});
