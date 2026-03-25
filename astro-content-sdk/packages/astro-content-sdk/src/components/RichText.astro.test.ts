import { describe, test, expect } from 'vitest';
import { renderAstroComponent } from '../tests/astro-helpers';
import RichText from './RichText.astro';
import EmptyFieldEditingComponent from '../tests/test-components/EmptyFieldEditingComponent.astro';

describe('<RichText />', () => {
  test('should render nothing with missing field', async () => {
    const field = null!;

    const rendered = (
      await renderAstroComponent(RichText, {
        props: { field: field },
      })
    ).querySelectorAll('div');

    expect(rendered).to.have.length(0);
  });

  test('should render nothing with empty value', async () => {
    const field = {
      value: '',
    };

    const rendered = (
      await renderAstroComponent(RichText, {
        props: { field: field },
      })
    ).querySelectorAll('div');

    expect(rendered).to.have.length(0);
  });

  test('should render nothing with missing value', async () => {
    const field = {};
    const rendered = (
      await renderAstroComponent(RichText, {
        props: { field: field },
      })
    ).querySelectorAll('div');
    expect(rendered).to.have.length(0);
  });

  test('should render value with editing explicitly disabled', async () => {
    const field = {
      value: 'value',
    };
    const rendered = (
      await renderAstroComponent(RichText, {
        props: { field: field, editable: false },
      })
    ).querySelectorAll('div');

    expect(rendered).to.have.length(1);
    expect(rendered[0].innerHTML).to.contain('value');
  });

  test('should render value with with just a value', async () => {
    const field = {
      value: 'value',
    };
    const rendered = (
      await renderAstroComponent(RichText, {
        props: { field: field },
      })
    ).querySelectorAll('div');

    expect(rendered).to.have.length(1);
    expect(rendered[0].innerHTML).to.contain('value');
  });

  test('should render embedded html as-is', async () => {
    const field = {
      value: '<input type="text">some crazy stuff<script code="whaaaat">uh oh</script>',
    };
    const rendered = (
      await renderAstroComponent(RichText, {
        props: { field: field },
      })
    ).querySelectorAll('div');

    expect(rendered).to.have.length(1);
    expect(rendered[0].innerHTML).to.contain(field.value);
  });

  test('should render tag with a tag provided', async () => {
    const field = {
      value: 'value',
    };
    const rendered = (
      await renderAstroComponent(RichText, {
        props: { field: field, tag: 'p' },
      })
    ).querySelectorAll('p');

    expect(rendered).to.have.length(1);
    expect(rendered[0].innerHTML).to.contain('value');
  });

  test('should render other attributes with other props provided', async () => {
    const field = {
      value: 'value',
    };
    const rendered = (
      await renderAstroComponent(RichText, {
        props: { field: field, tag: 'h1', class: 'cssClass', id: 'lorem' },
      })
    ).querySelectorAll('h1');
    expect(rendered).to.have.length(1);
    expect(rendered[0].outerHTML).to.contain('<h1 class="cssClass" id="lorem">');
    expect(rendered[0].outerHTML).to.contain('value');
  });

  describe('edit mode', () => {
    const testMetadata = {
      contextItem: {
        id: '{09A07660-6834-476C-B93B-584248D3003B}',
        language: 'en',
        revision: 'a0b36ce0a7db49418edf90eb9621e145',
        version: 1,
      },
      fieldId: '{414061F4-FBB1-4591-BC37-BFFA67F745EB}',
      fieldType: 'single-line',
      rawValue: 'Test1',
    };

    test('should render field metadata component when metadata property is present', async () => {
      const field = {
        value: 'value',
        metadata: testMetadata,
      };

      const rendered = await renderAstroComponent(RichText, {
        props: { field: field },
      });

      expect(rendered.innerHTML).to.equal(
        [
          `<code type="text/sitecore" chrometype="field" class="scpm" kind="open">${JSON.stringify(
            testMetadata
          )}</code>`,
          '<div>value</div>',
          '<code type="text/sitecore" chrometype="field" class="scpm" kind="close"></code>',
        ].join('')
      );
    });

    test('should render default empty field component when field value is empty', async () => {
      const field = {
        value: '',
        metadata: testMetadata,
      };

      const rendered = await renderAstroComponent(RichText, {
        props: { field: field },
      });

      expect(rendered.innerHTML).to.equal(
        [
          `<code type="text/sitecore" chrometype="field" class="scpm" kind="open">${JSON.stringify(
            testMetadata
          )}</code>`,
          '<span>[No text in field]</span>',
          '<code type="text/sitecore" chrometype="field" class="scpm" kind="close"></code>',
        ].join('')
      );
    });

    test('should render custom empty field component when provided, when field value is empty', async () => {
      const field = {
        value: '',
        metadata: testMetadata,
      };

      const rendered = await renderAstroComponent(RichText, {
        props: {
          field: field,
          emptyFieldEditingComponent: EmptyFieldEditingComponent,
        },
      });

      expect(rendered.innerHTML).to.equal(
        [
          `<code type="text/sitecore" chrometype="field" class="scpm" kind="open">${JSON.stringify(
            testMetadata
          )}</code>`,
          '<span class="empty-field-value-placeholder">Custom Empty field value</span>',
          '<code type="text/sitecore" chrometype="field" class="scpm" kind="close"></code>',
        ].join('')
      );
    });

    test('should render nothing when field value is empty, when editing is explicitly disabled ', async () => {
      const field = {
        value: '',
        metadata: testMetadata,
      };

      const rendered = await renderAstroComponent(RichText, {
        props: { field: field, editable: false },
      });

      expect(rendered.innerHTML).to.equal('');
    });
  });
});
