const path = require('path');
const loadTree = require('../index');

describe('mode none (legacy)', () => {
  it('carrega sem opções (padrão none)', () => {
    const basePath = path.join(__dirname, 'fixtures');
    const tree = loadTree(basePath);
    expect(tree).toHaveProperty('fixturesFn');
    expect(typeof tree.fixturesFn).toBe('function');
  });

  it('carrega com mode explicitamente none', () => {
    const basePath = path.join(__dirname, 'fixtures');
    const tree = loadTree(basePath, { mode: 'none' });
    expect(tree).toHaveProperty('fixturesFn');
  });
});
