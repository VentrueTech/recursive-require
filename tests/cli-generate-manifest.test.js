const { execFileSync } = require('child_process');
const path = require('path');
const fs = require('fs');

describe('scripts/generate-manifest CLI', () => {
  const out = path.join(__dirname, 'tmp-manifest.json');
  afterEach(() => {
    try { fs.unlinkSync(out); } catch (e) {}
  });

  it('gera manifest via CLI', () => {
    const gm = require(path.join(__dirname, '..', 'scripts', 'generate-manifest.js'));
    // execute CLI handler in-process (argv[2]=basePath, argv[3]=out)
    gm.runCli([null, null, path.join(__dirname, 'fixtures'), out]);
    const content = fs.readFileSync(out, 'utf8');
    const manifest = JSON.parse(content);
    expect(manifest).toHaveProperty('files');
    expect(Object.keys(manifest.files).length).toBeGreaterThan(0);
  });
});
