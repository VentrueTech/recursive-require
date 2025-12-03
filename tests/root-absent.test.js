const fs = require('fs');
const path = require('path');
const os = require('os');
const loadTree = require('../index');

describe('rootName absent branch', () => {
  it('returns empty object when basePath contains no .js files', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'rr-empty-'));
    try {
      const tree = loadTree(tmp);
      expect(tree).toEqual({});
    } finally {
      try { fs.rmdirSync(tmp); } catch (e) {}
    }
  });
});
