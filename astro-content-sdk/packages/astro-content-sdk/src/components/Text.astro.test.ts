import { describe, test, expect } from 'vitest';
import { renderAstroComponent } from '../tests/astro-helpers';
import Text, { TextField } from './Text.astro';
import EmptyFieldEditingComponent from '../tests/test-components/EmptyFieldEditingComponent.astro';

describe('<Text />', () => {
  test('should render nothing with missing field', async () => {
    const field: TextField = null!;
    const rendered = await renderAstroComponent(Text, {
      props: { field: field },
    });
    expect(rendered.innerHTML).to.equal('');
  });

  test('should render nothing with missing field', async () => {
    const field = {
      value: '',
    };
    const rendered = await renderAstroComponent(Text, {
      props: { field: field },
    });
    expect(rendered.innerHTML).to.equal('');
  });

  test('should render nothing with missing value', async () => {
    const field = {};
    const rendered = await renderAstroComponent(Text, {
      props: { field: field },
    });
    expect(rendered.innerHTML).to.equal('');
  });

  test('should render value with editing explicitly disabled', async () => {
    const field = {
      value: 'value',
    };
    const rendered = (
      await renderAstroComponent(Text, {
        props: { field: field, tag: 'span', editable: false },
      })
    ).querySelector('span');

    expect(rendered?.innerHTML).to.contain('value');
  });

  test('should encode values with editing explicitly disabled', async () => {
    const field = {
      value: 'value < >',
    };
    const rendered = (
      await renderAstroComponent(Text, {
        props: { field: field, tag: 'span', editable: false },
      })
    ).querySelector('span');
    expect(rendered?.innerHTML).to.contain('&lt; &gt;');
  });

  test('should render value with just a value', async () => {
    const field = {
      value: 'value',
    };
    const rendered = (
      await renderAstroComponent(Text, {
        props: { field: field, tag: 'span' },
      })
    ).querySelector('span');
    expect(rendered?.innerHTML).to.contain('value');
  });

  test('should render value without tag', async () => {
    const field = {
      value: 'value',
    };
    const rendered = await renderAstroComponent(Text, {
      props: { field: field },
    });
    expect(rendered.innerHTML).to.equal('value');
  });

  test('should render number value', async () => {
    const field = {
      value: 1.23,
    };
    const rendered = await renderAstroComponent(Text, {
      props: { field: field },
    });
    expect(rendered.innerHTML).to.equal('1.23');
  });

  test('should render zero number value', async () => {
    const field = {
      value: 0,
    };
    const rendered = await renderAstroComponent(Text, {
      props: { field: field },
    });
    expect(rendered?.innerHTML).to.equal('0');
  });

  test('should render negative number value', async () => {
    const field = {
      value: -1.23,
    };
    const rendered = await renderAstroComponent(Text, {
      props: { field: field },
    });
    expect(rendered?.innerHTML).to.equal('-1.23');
  });

  test('should render value without tag', async () => {
    const field = {
      value: 'value',
    };
    const rendered = await renderAstroComponent(Text, {
      props: { field: field },
    });
    expect(rendered?.innerHTML).to.contain('value');
  });

  test('should render value with just a value that contains line breaks', async () => {
    const field = {
      value: 'xxx\n\naa\nbbb\ndd',
    };
    const rendered = (
      await renderAstroComponent(Text, {
        props: { field: field, tag: 'span' },
      })
    ).querySelector('span');
    expect(rendered?.innerHTML).to.contain('xxx<br><br>aa<br>bbb<br>dd');
  });

  test('should render value with just a value that contains only one line break', async () => {
    const field = {
      value: '\n',
    };
    const rendered = (
      await renderAstroComponent(Text, {
        props: { field: field, tag: 'span' },
      })
    ).querySelector('span');
    expect(rendered?.outerHTML).to.contain('<span><br></span>');
  });

  test('should render embedded html as-is when encoding is disabled', async () => {
    const field = {
      value: '<input type="text">some crazy stuff<script code="whaaaat">uh oh</script>',
    };
    const rendered = (
      await renderAstroComponent(Text, {
        props: { field: field, encode: false },
      })
    ).querySelector('span');
    expect(rendered?.innerHTML).to.contain(field.value);
  });

  test('should render tag with a tag provided', async () => {
    const field = {
      value: 'value',
    };
    const rendered = (
      await renderAstroComponent(Text, {
        props: { field: field, tag: 'h1' },
      })
    ).querySelector('h1');
    expect(rendered?.innerHTML).to.contain('value');
  });

  test('should render other attributes with other props provided', async () => {
    const field = {
      value: 'value',
    };
    const rendered = (
      await renderAstroComponent(Text, {
        props: { field: field, tag: 'h1', class: 'cssClass', id: 'lorem' },
      })
    ).querySelector('h1');
    expect(rendered?.outerHTML).to.contain('<h1 class="cssClass" id="lorem">');
    expect(rendered?.outerHTML).to.contain('value');
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

      const rendered = await renderAstroComponent(Text, {
        props: { field: field },
      });

      expect(rendered.innerHTML).to.equal(
        [
          `<code type="text/sitecore" chrometype="field" class="scpm" kind="open">${JSON.stringify(
            testMetadata
          )}</code>`,
          '<span>value</span>',
          '<code type="text/sitecore" chrometype="field" class="scpm" kind="close"></code>',
        ].join('')
      );
    });

    test('should render default empty field component when field value is empty in edit mode metadata', async () => {
      const field = {
        value: '',
        metadata: testMetadata,
      };

      const rendered = await renderAstroComponent(Text, {
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

    test('should render custom empty field component when provided, when field value is empty in edit mode metadata', async () => {
      const field = {
        value: '',
        metadata: testMetadata,
      };

      const rendered = await renderAstroComponent(Text, {
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

    test('should render nothing when field value is empty, when editing is explicitly disabled in edit mode metadata ', async () => {
      const field = {
        value: '',
        metadata: testMetadata,
      };

      const rendered = await renderAstroComponent(Text, {
        props: { field: field, editable: false },
      });

      expect(rendered.innerHTML).to.equal('');
    });
  });
});
