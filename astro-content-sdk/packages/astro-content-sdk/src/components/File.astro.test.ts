import { describe, test, expect } from 'vitest';
import { renderAstroComponent } from '../tests/astro-helpers';
import File, { FileField } from './File.astro';

describe('<File />', () => {
  test('should render nothing with missing field', async () => {
    const field: FileField = null!;
    const rendered = await renderAstroComponent(File, {
      props: { field: field },
    });
    expect(rendered.innerHTML).to.equal('');
  });

  test('should render nothing with missing value', async () => {
    const field = {
      editable: 'lorem',
    };
    const rendered = await renderAstroComponent(File, {
      props: { field: field },
    });
    expect(rendered.innerHTML).to.equal('');
  });

  test('should render with src directly on provided field', async () => {
    const field = {
      src: '/lorem',
      title: 'ipsum',
    };
    const rendered = (
      await renderAstroComponent(File, {
        props: { field: field },
      })
    ).querySelector('a');
    expect(rendered?.outerHTML).to.contain(field.src);
    expect(rendered?.outerHTML).to.contain(field.title);
  });

  test('should render display name if no title', async () => {
    const field = {
      value: {
        src: '/lorem',
        displayName: 'ipsum',
      },
    };
    const rendered = (
      await renderAstroComponent(File, {
        props: { field: field },
      })
    ).querySelector('a');
    expect(rendered?.outerHTML).to.contain(field.value.displayName);
  });

  test('should render other attributes with other props provided', async () => {
    const field = {
      value: {
        src: '/lorem',
        title: 'ipsum',
      },
    };
    const rendered = (
      await renderAstroComponent(File, {
        props: { field: field, id: 'my-file', class: 'my-css' },
      })
    ).querySelector('a');
    expect(rendered?.outerHTML).to.contain('id="my-file"');
    expect(rendered?.outerHTML).to.contain('class="my-css"');
  });
});
