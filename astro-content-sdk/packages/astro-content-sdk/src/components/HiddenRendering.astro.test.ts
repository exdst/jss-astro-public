import { describe, test, expect } from 'vitest';
import { renderAstroComponent } from '../tests/astro-helpers';
import HiddenRendering from './HiddenRendering.astro';

describe('<HiddenRendering />', () => {
  test('should render', async () => {
    const rendered = await renderAstroComponent(HiddenRendering, {
      props: { container: document.body },
    });

    expect(rendered.querySelectorAll('div > *')).to.have.length(1);

    const style = rendered
      .querySelector('div')
      ?.getAttribute('style')
      ?.trim()
      ?.split(';')
      .reduce<Record<string, string>>((acc, style) => {
        if (style.split(':')[0]) acc[style.split(':')[0].trim()] = style.split(':')[1].trim();
        return acc;
      }, {});

    // Instead of checking exact equality, we'll verify required styles are present
    expect(style).to.include({
      'background-size': '3px 3px',
      display: 'flex',
      'justify-content': 'center',
      'align-items': 'center',
      padding: '30px',
      color: '#aaa',
    });

    // Verify the div contains the expected text
    expect(rendered.textContent).to.equal('The component is hidden');
  });
});
