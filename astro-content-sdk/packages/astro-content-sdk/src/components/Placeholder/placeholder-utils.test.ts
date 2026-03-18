/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { expect } from 'chai';
import { createSandbox } from 'sinon';
import { getPlaceholderRenderings, getSXAParams } from './placeholder-utils';
import { ComponentRendering } from '@sitecore-content-sdk/core/layout';

describe('placeholder-utils', () => {
  const sandbox = createSandbox();
  let consoleWarnStub: any;

  beforeEach(() => {
    consoleWarnStub = sandbox.stub(console, 'warn');
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('getPlaceholderRenderings', () => {
    it('should return null if rendering does not have placeholders', () => {
      const rendering: ComponentRendering = {
        componentName: 'TestComponent',
        uid: 'test-uid',
      };

      const result = getPlaceholderRenderings(rendering, 'test-placeholder', false);

      expect(result).to.deep.equal([]);
      expect(consoleWarnStub.calledOnce).to.be.true;
      expect(consoleWarnStub.firstCall.args[0]).to.include('test-placeholder');
    });

    it('should return renderings from placeholder by name', () => {
      const expectedRenderings = [
        {
          componentName: 'Component1',
          uid: 'comp1-uid',
        },
        {
          componentName: 'Component2',
          uid: 'comp2-uid',
        },
      ];

      const rendering: ComponentRendering = {
        componentName: 'TestComponent',
        uid: 'test-uid',
        placeholders: {
          'test-placeholder': expectedRenderings,
          'other-placeholder': [{ componentName: 'OtherComponent', uid: 'other-uid' }],
        },
      };

      const result = getPlaceholderRenderings(rendering, 'test-placeholder', false);

      expect(result).to.deep.equal(expectedRenderings);
      expect(consoleWarnStub.called).to.be.false;
    });

    it('should parse dynamic SXA placeholder names correctly', () => {
      const expectedRenderings = [
        {
          componentName: 'DynamicComponent',
          uid: 'dynamic-uid',
        },
      ];

      const rendering: ComponentRendering = {
        componentName: 'TestComponent',
        uid: 'test-uid',
        placeholders: {
          'container-{*}': expectedRenderings,
          'other-placeholder': [{ componentName: 'OtherComponent', uid: 'other-uid' }],
        },
      };

      // Test non-editing mode - should replace dynamic placeholder
      const result = getPlaceholderRenderings(rendering, 'container-1', false);
      expect(result).to.deep.equal(expectedRenderings);
      expect(rendering.placeholders['container-1']).to.deep.equal(expectedRenderings);
      expect(rendering.placeholders['container-{*}']).to.be.undefined;

      // Reset rendering for editing mode test
      rendering.placeholders = {
        'container-{*}': expectedRenderings,
        'other-placeholder': [{ componentName: 'OtherComponent', uid: 'other-uid' }],
      };

      // Test editing mode - should keep original placeholder name
      const editResult = getPlaceholderRenderings(rendering, 'container-1', true);
      expect(editResult).to.deep.equal(expectedRenderings);
      expect(rendering.placeholders['container-{*}']).to.deep.equal(expectedRenderings);
    });
  });

  describe('getSXAParams', () => {
    it('should return GridParameters and Styles when present', () => {
      const rendering: ComponentRendering = {
        componentName: 'TestComponent',
        uid: 'test-uid',
        params: {
          GridParameters: 'col-lg-6',
          Styles: 'custom-class',
          OtherParam: 'other-value',
        },
      };

      const result = getSXAParams(rendering);

      expect(result).to.deep.equal({
        styles: 'col-lg-6 custom-class',
      });
    });

    it('should return only GridParameters when Styles not present', () => {
      const rendering: ComponentRendering = {
        componentName: 'TestComponent',
        uid: 'test-uid',
        params: {
          GridParameters: 'col-lg-8',
          OtherParam: 'other-value',
        },
      };

      const result = getSXAParams(rendering);

      expect(result).to.deep.equal({
        styles: 'col-lg-8 ',
      });
    });

    it('should return only Styles when GridParameters not present', () => {
      const rendering: ComponentRendering = {
        componentName: 'TestComponent',
        uid: 'test-uid',
        params: {
          Styles: 'custom-styles',
          OtherParam: 'other-value',
        },
      };

      const result = getSXAParams(rendering);

      expect(result).to.deep.equal({
        styles: ' custom-styles',
      });
    });

    it('should return empty styles string when no params', () => {
      const rendering: ComponentRendering = {
        componentName: 'TestComponent',
        uid: 'test-uid',
      };

      const result = getSXAParams(rendering);

      expect(result).to.deep.equal({ styles: '' });
    });
  });
});
