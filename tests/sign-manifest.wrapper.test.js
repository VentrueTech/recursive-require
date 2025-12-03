const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawnSync } = require('child_process');

describe('scripts/sign-manifest wrapper', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rr-test-'));
  const fakeOpenSsl = path.join(tmpDir, 'openssl');
  const keyPath = path.join(tmpDir, 'key.pem');
  const manifestPath = path.join(tmpDir, 'manifest.json');
  const outSig = path.join(tmpDir, 'manifest.sig');

  beforeAll(() => {
    // create fake openssl script that copies -in to -out
    const code = `#!/usr/bin/env node
const fs=require('fs');
const argv=process.argv.slice(2);
const inIdx=argv.indexOf('-in');
const outIdx=argv.indexOf('-out');
if(inIdx>=0 && outIdx>=0){
  try{ fs.copyFileSync(argv[inIdx+1], argv[outIdx+1]); }catch(e){}
}
process.exit(0);
`;
    fs.writeFileSync(fakeOpenSsl, code, { mode: 0o755 });
  });

  afterAll(() => {
    try { fs.unlinkSync(fakeOpenSsl); } catch (e) {}
    try { fs.unlinkSync(keyPath); } catch (e) {}
    try { fs.unlinkSync(manifestPath); } catch (e) {}
    try { fs.unlinkSync(outSig); } catch (e) {}
    try { fs.rmdirSync(tmpDir); } catch (e) {}
  });

  it('succeeds when key and manifest exist and openssl returns 0', () => {
    fs.writeFileSync(keyPath, 'priv');
    fs.writeFileSync(manifestPath, JSON.stringify({ files: {} }));
    const script = path.join(__dirname, '..', 'scripts', 'sign-manifest.js');
    const env = { ...process.env, PATH: `${tmpDir}${path.delimiter}${process.env.PATH}` };
    const res = spawnSync(process.execPath, [script, keyPath, manifestPath, outSig], { env, encoding: 'utf8' });
    expect(res.status).toBe(0);
    expect(fs.existsSync(outSig)).toBe(true);
  });

  it('fails when private key is missing', () => {
    // ensure key missing
    try { fs.unlinkSync(keyPath); } catch (e) {}
    fs.writeFileSync(manifestPath, JSON.stringify({ files: {} }));
    const script = path.join(__dirname, '..', 'scripts', 'sign-manifest.js');
    const res = spawnSync(process.execPath, [script, keyPath, manifestPath, outSig], { encoding: 'utf8' });
    expect(res.status).not.toBe(0);
    expect(res.stderr).toMatch(/Private key not found/);
  });

  it('fails when manifest is missing', () => {
    fs.writeFileSync(keyPath, 'priv');
    try { fs.unlinkSync(manifestPath); } catch (e) {}
    const script = path.join(__dirname, '..', 'scripts', 'sign-manifest.js');
    const res = spawnSync(process.execPath, [script, keyPath, manifestPath, outSig], { encoding: 'utf8' });
    expect(res.status).not.toBe(0);
    expect(res.stderr).toMatch(/Manifest not found/);
  });
});
