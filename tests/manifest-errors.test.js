const path = require('path');
const { makeManifest } = require('../scripts/generate-manifest');
const loadTree = require('../index');

describe('manifest-checksum errors', () => {
  const basePath = path.join(__dirname, 'fixtures');

  it('lança se o manifest estiver ausente', () => {
    expect(() => loadTree(basePath, { mode: 'manifest-checksum' })).toThrow(/Manifest inválido/);
  });

  it('lança se um arquivo não tiver entrada no manifest', () => {
    const manifest = makeManifest(basePath);
    // remove the first entry
    const entries = Object.keys(manifest.files);
    delete manifest.files[entries[0]];
    expect(() => loadTree(basePath, { mode: 'manifest-checksum', manifest })).toThrow(/Checksum ausente no manifest/);
  });
});
