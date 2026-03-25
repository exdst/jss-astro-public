import { describe, test, expect } from 'vitest';
import { renderAstroComponent } from '../tests/astro-helpers';
import ErrorComponent from './ErrorComponent.astro';

describe('ErrorComponent', () => {
  test('should render message prop with correct CSS class', async () => {
    const message = 'Test error message';

    const rendered = await renderAstroComponent(ErrorComponent, {
      props: { message: message },
    });

    expect(
      rendered.querySelector('.sc-content-sdk-placeholder-error')?.textContent?.trim()
    ).to.equal(message);
  });

  test('should render children when provided without message', async () => {
    const content = 'Child error content';

    const rendered = await renderAstroComponent(ErrorComponent, {
      slots: {
        default: `<span>${content}</span>`,
      },
    });

    expect(rendered.querySelector('.sc-content-sdk-placeholder-error')?.textContent).to.equal(
      content
    );
  });
});
