const path = require('path');
const fs = require('fs');
const { makeManifest } = require('../scripts/generate-manifest');
const loadTree = require('../index');

describe('manifest-checksum mode', () => {
  const basePath = path.join(__dirname, 'fixtures');
  let manifest;

  beforeAll(() => {
    manifest = makeManifest(basePath);
  });

  it('carrega arquivos apenas se checksum válido', () => {
    const tree = loadTree(basePath, { mode: 'manifest-checksum', manifest });
    expect(tree).toHaveProperty('fixturesFn');
    expect(typeof tree.fixturesFn).toBe('function');
  });

  it('falha se checksum inválido', () => {
    // corrupt manifest
    const badManifest = JSON.parse(JSON.stringify(manifest));
    const file = Object.keys(badManifest.files)[0];
    badManifest.files[file] = 'deadbeef';
    expect(() => loadTree(basePath, { mode: 'manifest-checksum', manifest: badManifest })).toThrow(/Checksum inválido/);
  });
});
