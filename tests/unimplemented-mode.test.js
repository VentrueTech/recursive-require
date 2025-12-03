const path = require('path');
const loadTree = require('../index');

describe('unimplemented validation modes', () => {
  it('lança para modos não implementados', () => {
    const basePath = path.join(__dirname, 'fixtures');
    expect(() => loadTree(basePath, { mode: 'encrypted-manifest' })).toThrow(/não implementado/);
  });
});
