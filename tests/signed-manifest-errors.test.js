const path = require('path');
const { makeManifest } = require('../scripts/generate-manifest');
const loadTree = require('../index');

describe('signed-manifest errors', () => {
  const basePath = path.join(__dirname, 'fixtures');
  const manifest = makeManifest(basePath);

  it('lança se signature ausente', () => {
    expect(() => loadTree(basePath, { mode: 'signed-manifest', manifest, publicKey: 'somepub' })).toThrow(/Assinatura ou chave pública ausente/);
  });

  it('lança se publicKey ausente', () => {
    const signature = Buffer.from('00', 'hex');
    expect(() => loadTree(basePath, { mode: 'signed-manifest', manifest, signature })).toThrow(/Assinatura ou chave pública ausente/);
  });
});
