import { describe, test, expect } from 'vitest';
import { renderAstroComponent } from '../tests/astro-helpers';
import MissingComponent from './MissingComponent.astro';

describe('<MissingComponent>', () => {
  test('should accept and display custom error', async () => {
    const errorMsg = 'Oops, I errored again';
    const props = {
      rendering: {
        componentName: 'test',
      },
      errorOverride: errorMsg,
    };

    const result = await renderAstroComponent(MissingComponent, {
      props: props,
    });

    expect(result.querySelector('div p')?.textContent).to.contain(errorMsg);
  });
});
