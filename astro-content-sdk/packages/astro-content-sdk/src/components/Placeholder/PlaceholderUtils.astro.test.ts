/* eslint-disable no-unused-expressions */
import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { ComponentRendering } from '@sitecore-content-sdk/content/layout';
import { ComponentMap } from '../../sharedTypes/component-props';
import { createSandbox } from 'sinon';
import { getComponentForRendering } from './PlaceholderUtils.astro';
import MissingComponent from '../MissingComponent.astro';
import HiddenRendering from '../HiddenRendering.astro';
import TestComponent from '../../tests/test-components/TestComponent.astro';
import CustomMissingComponent from '../../tests/test-components/CustomMissingComponent.astro';
import CustomHiddenRendering from '../../tests/test-components/CustomHiddenRendering.astro';
import { HIDDEN_RENDERING_NAME } from '@sitecore-content-sdk/content';

describe('placeholder-utils', () => {
  const sandbox = createSandbox();
  let consoleWarnStub: ReturnType<typeof sandbox.stub>;

  beforeEach(() => {
    consoleWarnStub = sandbox.stub(console, 'warn');
    sandbox.stub(console, 'error');
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('getComponentForRendering', () => {
    let componentMap: ComponentMap;

    beforeEach(() => {
      componentMap = new Map();
    });

    test('should return null when componentMap is empty', () => {
      const rendering: ComponentRendering = {
        componentName: 'TestComponent',
        uid: 'test-uid',
      };

      const result = getComponentForRendering(rendering, 'test-placeholder');

      expect(result?.component).to.equal(MissingComponent);
      expect(result?.isEmpty).to.be.true;
      expect(consoleWarnStub.calledOnce).to.be.true;
    });

    test('should return null when componentMap is not provided', () => {
      const rendering: ComponentRendering = {
        componentName: 'TestComponent',
        uid: 'test-uid',
      };

      const result = getComponentForRendering(rendering, 'test-placeholder', undefined);

      expect(result?.component).to.equal(MissingComponent);
      expect(result?.isEmpty).to.be.true;
      expect(consoleWarnStub.calledOnce).to.be.true;
    });

    test('should return component directly when it is not a module', () => {
      componentMap.set('TestComponent', TestComponent);

      const rendering: ComponentRendering = {
        componentName: 'TestComponent',
        uid: 'test-uid',
      };

      const result = getComponentForRendering(rendering, 'test-placeholder', componentMap);

      expect(result?.component).to.equal(TestComponent);
    });

    test('should return default missing component when component not found in component map', () => {
      // Add a dummy entry so componentMap is not empty
      componentMap.set('DummyComponent', TestComponent);

      const rendering: ComponentRendering = {
        componentName: 'NonExistentComponent',
        uid: 'test-uid',
      };

      const result = getComponentForRendering(rendering, 'test-placeholder', componentMap);

      expect(result?.component).to.equal(MissingComponent);
      expect(result?.isEmpty).to.be.true;
    });

    test('should return custom missing component when specified and component not found in component map', () => {
      // Add a dummy entry so componentMap is not empty
      componentMap.set('DummyComponent', TestComponent);

      const rendering: ComponentRendering = {
        componentName: 'NonExistentComponent',
        uid: 'test-uid',
      };

      const result = getComponentForRendering(
        rendering,
        'test-placeholder',
        componentMap,
        undefined,
        CustomMissingComponent
      );

      expect(result?.component).to.equal(CustomMissingComponent);
      expect(result?.isEmpty).to.be.true;
    });

    test('should return hiddenRenderingComponent when component is hidden', () => {
      const rendering: ComponentRendering = {
        componentName: HIDDEN_RENDERING_NAME,
        uid: 'test-uid',
      };

      const result = getComponentForRendering(
        rendering,
        'test-placeholder',
        componentMap,
        CustomHiddenRendering
      );

      expect(result?.component).to.equal(CustomHiddenRendering);
      expect(result?.isEmpty).to.be.true;
    });

    test('should return default HiddenRendering when component is hidden and no custom hidden component provided', () => {
      const rendering: ComponentRendering = {
        componentName: HIDDEN_RENDERING_NAME,
        uid: 'test-uid',
      };

      const result = getComponentForRendering(rendering, 'test-placeholder', componentMap);

      expect(result?.component).to.equal(HiddenRendering);
      expect(result?.isEmpty).to.be.true;
    });

    test('should handle rendering without componentName', () => {
      const rendering: ComponentRendering = {
        componentName: '',
        uid: 'test-uid',
      };

      const result = getComponentForRendering(rendering, 'test-placeholder', componentMap);

      expect(result?.isEmpty).to.be.true;
    });
  });
});
