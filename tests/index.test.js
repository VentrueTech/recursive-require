const { sum } = require('../index');
const result = require('../index')(__dirname + '/fixtures');

describe('recursive-require', () => {
    it('should load modules recursively from a directory', () => {
        expect(result).toBeDefined();
        expect(typeof result).toBe('object');
    });

    it('should organize files by subdirectory names', () => {
        expect(result['subdir']).toBeDefined();
    });

    it('should strip file extensions from property names', () => {
        const keys = Object.keys(result);
        keys.forEach(key => {
            Object.keys(result[key]).forEach(file => {
                expect(file).not.toMatch(/\.\w+$/);
            });
        });
    });

    it('should merge multiple files from the same directory', () => {
        expect(Object.keys(result).length).toBeGreaterThan(0);
    });

    it('should require and load valid modules', () => {
        Object.values(result).forEach(dir => {
            Object.values(dir).forEach(module => {
                expect(module).toBeDefined();
            });
        });
    });

    it ('should handle files in the root directory', () => {
        expect(result).toHaveProperty('fixturesFn');
        expect(typeof result.fixturesFn).toBe('function');
    });

    it('should handle nested directory structures', () => {
        expect(result).toHaveProperty('subdir');
        expect(result.subdir).toHaveProperty('subdirFn');
        expect(typeof result.subdir.subdirFn).toBe('function');
    });
});
