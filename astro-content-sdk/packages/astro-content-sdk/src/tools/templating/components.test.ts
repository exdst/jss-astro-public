/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import sinon from 'sinon';
import { getComponentList } from './components';
import { ComponentFile } from '@sitecore-content-sdk/content/tools';
import path from 'path';

describe('components', () => {
  const sandbox = sinon.createSandbox();
  beforeEach(() => {
    sandbox.restore();
  });

  describe('getComponentList', () => {
    afterEach(() => {
      sandbox.restore();
    });

    it('should return results when one of "paths" is a glob pattern', () => {
      const items = [
        {
          importPath: 'src/tests/test-components/map-components/Qux',
          filePath: path.normalize('src/tests/test-components/map-components/Qux.astro'),
          componentName: 'Qux',
          moduleName: 'Qux',
        },
        {
          importPath: 'src/tests/test-components/map-components/Foo',
          filePath: path.normalize('src/tests/test-components/map-components/Foo.astro'),
          componentName: 'Foo',
          moduleName: 'Foo',
        },
        {
          importPath: 'src/tests/test-components/map-components/Baz',
          filePath: path.normalize('src/tests/test-components/map-components/Baz.astro'),
          componentName: 'Baz',
          moduleName: 'Baz',
        },
        {
          importPath: 'src/tests/test-components/map-components/Bar',
          filePath: path.normalize('src/tests/test-components/map-components/Bar.astro'),
          componentName: 'Bar',
          moduleName: 'Bar',
        },
      ] as ComponentFile[];

      const result = getComponentList(
        ['src/tests/test-components/map-components/*.astro'],
        ['**/*.test.*'],
        false
      );
      expect(result).to.deep.equal(items);
    });

    it('should return results with all folded paths when path is a non-glob path', () => {
      const items = [
        {
          importPath: 'src/tests/test-components/map-components/Qux',
          filePath: path.normalize('src/tests/test-components/map-components/Qux.astro'),
          componentName: 'Qux',
          moduleName: 'Qux',
        },
        {
          importPath: 'src/tests/test-components/map-components/Foo',
          filePath: path.normalize('src/tests/test-components/map-components/Foo.astro'),
          componentName: 'Foo',
          moduleName: 'Foo',
        },
        {
          importPath: 'src/tests/test-components/map-components/Baz',
          filePath: path.normalize('src/tests/test-components/map-components/Baz.astro'),
          componentName: 'Baz',
          moduleName: 'Baz',
        },
        {
          importPath: 'src/tests/test-components/map-components/Bar',
          filePath: path.normalize('src/tests/test-components/map-components/Bar.astro'),
          componentName: 'Bar',
          moduleName: 'Bar',
        },
        {
          importPath: 'src/tests/test-components/map-components/folded/Folded',
          filePath: path.normalize('src/tests/test-components/map-components/folded/Folded.astro'),
          componentName: 'Folded',
          moduleName: 'Folded',
        },
      ] as ComponentFile[];

      const result = getComponentList(
        ['src/tests/test-components/map-components'],
        ['**/*.test.*'],
        false
      );
      expect(result).to.deep.equal(items);
    });

    it('should filter out results that are not components', () => {
      const items = [
        {
          importPath: 'src/tests/test-components/map-components/Qux',
          filePath: path.normalize('src/tests/test-components/map-components/Qux.astro'),
          componentName: 'Qux',
          moduleName: 'Qux',
        },
        {
          importPath: 'src/tests/test-components/map-components/Foo',
          filePath: path.normalize('src/tests/test-components/map-components/Foo.astro'),
          componentName: 'Foo',
          moduleName: 'Foo',
        },
        {
          importPath: 'src/tests/test-components/map-components/Baz',
          filePath: path.normalize('src/tests/test-components/map-components/Baz.astro'),
          componentName: 'Baz',
          moduleName: 'Baz',
        },
        {
          importPath: 'src/tests/test-components/map-components/Bar',
          filePath: path.normalize('src/tests/test-components/map-components/Bar.astro'),
          componentName: 'Bar',
          moduleName: 'Bar',
        },
        {
          importPath: 'src/tests/test-components/map-components/folded/Folded',
          filePath: path.normalize('src/tests/test-components/map-components/folded/Folded.astro'),
          componentName: 'Folded',
          moduleName: 'Folded',
        },
      ] as ComponentFile[];

      const result = getComponentList(['src/tests/test-components/map-components/**/*']);
      expect(result).to.deep.equal(items);
    });

    it('should return result when "paths" contain exact paths to Astro components', () => {
      const items = [
        {
          importPath: 'src/tests/test-components/map-components/Foo',
          filePath: path.normalize('src/tests/test-components/map-components/Foo.astro'),
          componentName: 'Foo',
          moduleName: 'Foo',
        },
        {
          importPath: 'src/tests/test-components/map-components/Bar',
          filePath: path.normalize('src/tests/test-components/map-components/Bar.astro'),
          componentName: 'Bar',
          moduleName: 'Bar',
        },
        {
          importPath: 'src/tests/test-components/map-components/Baz',
          filePath: path.normalize('src/tests/test-components/map-components/Baz.astro'),
          componentName: 'Baz',
          moduleName: 'Baz',
        },
        {
          importPath: 'src/tests/test-components/map-components/Qux',
          filePath: path.normalize('src/tests/test-components/map-components/Qux.astro'),
          componentName: 'Qux',
          moduleName: 'Qux',
        },
      ];

      const result = getComponentList([
        'src/tests/test-components/map-components/Foo.astro',
        'src/tests/test-components/map-components/Bar.astro',
        'src/tests/test-components/map-components/Baz.astro',
        'src/tests/test-components/map-components/Qux.astro',
      ]);
      expect(result).to.deep.equal(items);
    });

    it('should return filtered results when "exclude" contains a glob pattern', () => {
      const exclude = ['**/test-components/map-components/**'];
      expect(getComponentList(['src/tests/test-components/map-components/*.astro'], exclude)).to.be
        .empty;
    });

    it('should return variants in results when includeVariants is true', () => {
      sandbox.stub(console, 'debug');

      const items = [
        {
          importPath: 'src/tests/test-components/map-components/Qux',
          filePath: path.normalize('src/tests/test-components/map-components/Qux.astro'),
          componentName: 'Qux',
          moduleName: 'Qux',
        },
        // variant component
        {
          importPath: 'src/tests/test-components/map-components/Hero.variant',
          filePath: path.normalize('src/tests/test-components/map-components/Hero.variant.astro'),
          componentName: 'Hero.variant',
          moduleName: 'Herovariant',
        },
        {
          importPath: 'src/tests/test-components/map-components/Foo',
          filePath: path.normalize('src/tests/test-components/map-components/Foo.astro'),
          componentName: 'Foo',
          moduleName: 'Foo',
        },
        {
          importPath: 'src/tests/test-components/map-components/Baz',
          filePath: path.normalize('src/tests/test-components/map-components/Baz.astro'),
          componentName: 'Baz',
          moduleName: 'Baz',
        },
        {
          importPath: 'src/tests/test-components/map-components/Bar',
          filePath: path.normalize('src/tests/test-components/map-components/Bar.astro'),
          componentName: 'Bar',
          moduleName: 'Bar',
        },
        {
          importPath: 'src/tests/test-components/map-components/folded/Folded',
          filePath: path.normalize('src/tests/test-components/map-components/folded/Folded.astro'),
          componentName: 'Folded',
          moduleName: 'Folded',
        },
      ] as ComponentFile[];

      const result = getComponentList(
        ['src/tests/test-components/map-components'],
        ['**/*.test.*'],
        true
      );
      expect(result).to.deep.equal(items);
    });

    it('should return filtered results when "exclude" contains an exact path', () => {
      const exclude = ['src/tests/test-components/map-components/Foo.astro'];
      getComponentList(['src/tests/test-components/map-components/*.astro'], exclude);
    });

    it('should return correct result in unix file systems', () => {
      const stubbedPaths = [
        'src/tests/test-components/map-components/Foo.astro',
        'src/tests/test-components/map-components/Bar.astro',
        'src/tests/test-components/map-components/Baz.astro',
        'src/tests/test-components/map-components/Qux.astro',
      ];
      const expected = [
        {
          importPath: 'src/tests/test-components/map-components/Foo',
          filePath: 'src/tests/test-components/map-components/Foo.astro',
          componentName: 'Foo',
          moduleName: 'Foo',
        },
        {
          importPath: 'src/tests/test-components/map-components/Bar',
          filePath: 'src/tests/test-components/map-components/Bar.astro',
          componentName: 'Bar',
          moduleName: 'Bar',
        },
        {
          importPath: 'src/tests/test-components/map-components/Baz',
          filePath: 'src/tests/test-components/map-components/Baz.astro',
          componentName: 'Baz',
          moduleName: 'Baz',
        },
        {
          importPath: 'src/tests/test-components/map-components/Qux',
          filePath: 'src/tests/test-components/map-components/Qux.astro',
          componentName: 'Qux',
          moduleName: 'Qux',
        },
      ];

      const globSyncStub = sandbox.stub(require('glob'), 'sync').returns(stubbedPaths);

      const result = getComponentList(['src/tests/test-components/map-components/*.astro']);
      expect(result).to.deep.equal(expected);

      globSyncStub.restore();
    });

    it('should return correct result in windows file systems', () => {
      const stubbedPaths = [
        'src\\tests\\test-components\\map-components\\Foo.astro',
        'src\\tests\\test-components\\map-components\\Bar.astro',
        'src\\tests\\test-components\\map-components\\Baz.astro',
        'src\\tests\\test-components\\map-components\\Qux.astro',
      ];
      const expected = [
        {
          importPath: 'src/tests/test-components/map-components/Foo',
          filePath: 'src\\tests\\test-components\\map-components\\Foo.astro',
          componentName: 'Foo',
          moduleName: 'Foo',
        },
        {
          importPath: 'src/tests/test-components/map-components/Bar',
          filePath: 'src\\tests\\test-components\\map-components\\Bar.astro',
          componentName: 'Bar',
          moduleName: 'Bar',
        },
        {
          importPath: 'src/tests/test-components/map-components/Baz',
          filePath: 'src\\tests\\test-components\\map-components\\Baz.astro',
          componentName: 'Baz',
          moduleName: 'Baz',
        },
        {
          importPath: 'src/tests/test-components/map-components/Qux',
          filePath: 'src\\tests\\test-components\\map-components\\Qux.astro',
          componentName: 'Qux',
          moduleName: 'Qux',
        },
      ];

      const globSyncStub = sandbox.stub(require('glob'), 'sync').returns(stubbedPaths);

      const result = getComponentList(['src/tests/test-components/map-components/*.astro']);
      expect(result).to.deep.equal(expected);

      globSyncStub.restore();
    });
  });
});
