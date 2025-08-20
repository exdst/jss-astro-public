/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import sinon from 'sinon';
import { getComponentList } from './components';
import { ComponentFile } from '@sitecore-content-sdk/core/tools';

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
          path: 'src/test-data/components/Qux',
          componentName: 'Qux',
          moduleName: 'Qux',
        },
        {
          path: 'src/test-data/components/Foo',
          componentName: 'Foo',
          moduleName: 'Foo',
        },
        {
          path: 'src/test-data/components/Baz',
          componentName: 'Baz',
          moduleName: 'Baz',
        },
        {
          path: 'src/test-data/components/Bar',
          componentName: 'Bar',
          moduleName: 'Bar',
        },
      ] as ComponentFile[];

      const result = getComponentList(['src/test-data/components/*.astro']);
      expect(result).to.deep.equal(items);
    });

    it('should return results with all folded paths when path is a non-glob path', () => {
      const items = [
        {
          path: 'src/test-data/components/Qux',
          componentName: 'Qux',
          moduleName: 'Qux',
        },
        {
          path: 'src/test-data/components/Foo',
          componentName: 'Foo',
          moduleName: 'Foo',
        },
        {
          path: 'src/test-data/components/Baz',
          componentName: 'Baz',
          moduleName: 'Baz',
        },
        {
          path: 'src/test-data/components/Bar',
          componentName: 'Bar',
          moduleName: 'Bar',
        },
        {
          path: 'src/test-data/components/folded/Folded',
          componentName: 'Folded',
          moduleName: 'Folded',
        },
      ] as ComponentFile[];

      const result = getComponentList(['src/test-data/components']);
      expect(result).to.deep.equal(items);
    });

    it('should filter out results that are not components', () => {
      const items = [
        {
          path: 'src/test-data/components/Qux',
          componentName: 'Qux',
          moduleName: 'Qux',
        },
        {
          path: 'src/test-data/components/Foo',
          componentName: 'Foo',
          moduleName: 'Foo',
        },
        {
          path: 'src/test-data/components/Baz',
          componentName: 'Baz',
          moduleName: 'Baz',
        },
        {
          path: 'src/test-data/components/Bar',
          componentName: 'Bar',
          moduleName: 'Bar',
        },
        {
          path: 'src/test-data/components/folded/Folded',
          componentName: 'Folded',
          moduleName: 'Folded',
        },
      ] as ComponentFile[];

      const result = getComponentList(['src/test-data/components/**/*']);
      expect(result).to.deep.equal(items);
    });

    it('should return result when "paths" contain exact paths to Astro components', () => {
      const items = [
        {
          path: 'src/test-data/components/Foo',
          componentName: 'Foo',
          moduleName: 'Foo',
        },
        {
          path: 'src/test-data/components/Bar',
          componentName: 'Bar',
          moduleName: 'Bar',
        },
        {
          path: 'src/test-data/components/Baz',
          componentName: 'Baz',
          moduleName: 'Baz',
        },
        {
          path: 'src/test-data/components/Qux',
          componentName: 'Qux',
          moduleName: 'Qux',
        },
      ];

      const result = getComponentList([
        'src/test-data/components/Foo.astro',
        'src/test-data/components/Bar.astro',
        'src/test-data/components/Baz.astro',
        'src/test-data/components/Qux.astro',
      ]);
      expect(result).to.deep.equal(items);
    });

    it('should return filtered results when "exclude" contains a glob pattern', () => {
      const exclude = ['**/components/**'];
      expect(getComponentList(['src/test-data/components/*.astro'], exclude)).to
        .be.empty;
    });

    it('should return filtered results when "exclude" contains an exact path', () => {
      const exclude = ['src/test-data/components/Foo.astro'];
      getComponentList(['src/test-data/components/*.astro'], exclude);
    });

    it('should return correct result in unix file systems', () => {
      const stubbedPaths = [
        'src/test-data/components/Foo.astro',
        'src/test-data/components/Bar.astro',
        'src/test-data/components/Baz.astro',
        'src/test-data/components/Qux.astro',
      ];
      const expected = [
        {
          path: 'src/test-data/components/Foo',
          componentName: 'Foo',
          moduleName: 'Foo',
        },
        {
          path: 'src/test-data/components/Bar',
          componentName: 'Bar',
          moduleName: 'Bar',
        },
        {
          path: 'src/test-data/components/Baz',
          componentName: 'Baz',
          moduleName: 'Baz',
        },
        {
          path: 'src/test-data/components/Qux',
          componentName: 'Qux',
          moduleName: 'Qux',
        },
      ];

      const globSyncStub = sandbox
        .stub(require('glob'), 'sync')
        .returns(stubbedPaths);

      const result = getComponentList(['src/test-data/components/*.astro']);
      expect(result).to.deep.equal(expected);

      globSyncStub.restore();
    });

    it('should return correct result in windows file systems', () => {
      const stubbedPaths = [
        'src\\test-data\\components\\Foo.astro',
        'src\\test-data\\components\\Bar.astro',
        'src\\test-data\\components\\Baz.astro',
        'src\\test-data\\components\\Qux.astro',
      ];
      const expected = [
        {
          path: 'src/test-data/components/Foo',
          componentName: 'Foo',
          moduleName: 'Foo',
        },
        {
          path: 'src/test-data/components/Bar',
          componentName: 'Bar',
          moduleName: 'Bar',
        },
        {
          path: 'src/test-data/components/Baz',
          componentName: 'Baz',
          moduleName: 'Baz',
        },
        {
          path: 'src/test-data/components/Qux',
          componentName: 'Qux',
          moduleName: 'Qux',
        },
      ];

      const globSyncStub = sandbox
        .stub(require('glob'), 'sync')
        .returns(stubbedPaths);

      const result = getComponentList(['src/test-data/components/*.astro']);
      expect(result).to.deep.equal(expected);

      globSyncStub.restore();
    });
  });
});
