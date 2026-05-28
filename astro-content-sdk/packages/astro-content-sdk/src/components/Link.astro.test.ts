import { describe, test, expect } from 'vitest';
import { renderAstroComponent } from '../tests/astro-helpers';
import Link, { LinkField } from './Link.astro';
import EmptyFieldEditingComponent from '../tests/test-components/EmptyFieldEditingComponent.astro';

describe('<Link />', () => {
  test('should render nothing with missing field', async () => {
    const field = null as unknown as LinkField;
    const rendered = await renderAstroComponent(Link, {
      props: { field: field },
    });
    expect(rendered.innerHTML).to.equal('');
  });

  test('should render nothing with missing value', async () => {
    const field = {};
    const rendered = await renderAstroComponent(Link, {
      props: { field: field },
    });
    expect(rendered.innerHTML).to.equal('');
  });

  test('should render value with editing explicitly disabled', async () => {
    const field = {
      value: {
        href: '/lorem',
        text: 'ipsum',
      },
    };
    const rendered = (
      await renderAstroComponent(Link, {
        props: { field: field, editable: false },
      })
    ).querySelector('a');
    expect(rendered?.outerHTML).to.contain(field.value.href);
    expect(rendered?.outerHTML).to.contain(field.value.text);
  });

  test('should render with href directly on provided field', async () => {
    const field = {
      href: '/lorem',
      text: 'ipsum',
    };
    const rendered = (
      await renderAstroComponent(Link, {
        props: { field: field },
      })
    ).querySelector('a');
    expect(rendered?.outerHTML).to.contain(field.href);
    expect(rendered?.outerHTML).to.contain(field.text);
  });

  test('should not add extra hash when linktype is anchor', async () => {
    const field = {
      linktype: 'anchor',
      href: '#anchor',
      text: 'anchor link',
      anchor: 'anchor',
    };
    const rendered = (
      await renderAstroComponent(Link, {
        props: { field: field },
      })
    ).querySelector('a');
    expect(rendered?.outerHTML).to.contain(`href="${field.href}"`);
    expect(rendered?.text).to.equal(field.text);
  });

  test('should render all value attributes', async () => {
    const field = {
      value: {
        href: '/lorem',
        anchor: 'foo',
        text: 'ipsum',
        class: 'my-link',
        title: 'My Link',
        target: '_blank',
        querystring: 'foo=bar',
      },
    };
    const rendered = (
      await renderAstroComponent(Link, {
        props: { field: field },
      })
    ).querySelector('a');
    expect(rendered?.outerHTML).to.contain(
      `href="${field.value.href}?${field.value.querystring}#${field.value.anchor}"`
    );
    expect(rendered?.outerHTML).to.contain(`class="${field.value.class}"`);
    expect(rendered?.outerHTML).to.contain(`title="${field.value.title}"`);
    expect(rendered?.outerHTML).to.contain(`target="${field.value.target}"`);
  });

  test('should render other attributes with other props provided', async () => {
    const field = {
      value: {
        href: '/lorem',
        text: 'ipsum',
      },
    };
    const rendered = (
      await renderAstroComponent(Link, {
        props: { field: field, id: 'my-link', accessKey: 'a' },
      })
    ).querySelector('a');
    expect(rendered?.outerHTML).to.contain('id="my-link"');
    expect(rendered?.outerHTML).to.contain('accesskey="a"');
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
        href: '/lorem',
        text: 'ipsum',
        metadata: testMetadata,
      };

      const rendered = await renderAstroComponent(Link, {
        props: { field: field },
      });

      expect(rendered.innerHTML).to.equal(
        [
          `<code type="text/sitecore" chrometype="field" class="scpm" kind="open">${JSON.stringify(
            testMetadata
          )}</code>`,
          '<a href="/lorem">ipsum</a>',
          '<code type="text/sitecore" chrometype="field" class="scpm" kind="close"></code>',
        ].join('')
      );
    });

    test('should render default empty field component when field value is not present', async () => {
      const field = {
        value: { href: undefined },
        metadata: testMetadata,
      };

      const rendered = await renderAstroComponent(Link, {
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

    test('should render default empty field component when field value href is not present', async () => {
      const field = {
        href: undefined,
        metadata: testMetadata,
      };

      const rendered = await renderAstroComponent(Link, {
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

    test('should render custom empty field component when provided, when field value is not present', async () => {
      const field = {
        value: { href: undefined },
        metadata: testMetadata,
      };

      const rendered = await renderAstroComponent(Link, {
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

    test('should render custom empty field component when provided, when field value href is not present', async () => {
      const field = {
        href: undefined,
        metadata: testMetadata,
      };

      const rendered = await renderAstroComponent(Link, {
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

    test('should render nothing when field value is not present, when editing is explicitly disabled', async () => {
      const field = {
        value: undefined,
        metadata: testMetadata,
      };

      const rendered = await renderAstroComponent(Link, {
        props: { field: field, editable: false },
      });

      expect(rendered.innerHTML).to.equal('');
    });

    test('should render nothing when field value href is empty, when editing is explicitly disabled', async () => {
      const field = {
        value: { href: undefined },
        metadata: testMetadata,
      };

      const rendered = await renderAstroComponent(Link, {
        props: { field: field, editable: false },
      });

      expect(rendered.innerHTML).to.equal('');
    });
  });
});
