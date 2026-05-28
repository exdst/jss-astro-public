import { describe, test, expect } from 'vitest';
import { renderAstroComponent } from '../tests/astro-helpers';
import WithFieldMetadata from './WithFieldMetadata.astro';
import TestComponentWithField from '../tests/test-components/TestComponentWithField.astro';

describe('WithFieldMetadata', () => {
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

  test('should return component if field is empty', async () => {
    const props = {
      editable: true,
    };

    const testComponent = (await renderAstroComponent(TestComponentWithField, { props: props }))
      .innerHTML;

    const rendered = await renderAstroComponent(WithFieldMetadata, {
      props: props,
      slots: {
        default: testComponent,
      },
    });

    expect(rendered.innerHTML).to.equal('<div><h1></h1><h2>foo</h2><p>bar</p></div>');
  });

  test('should render unwrapped component if metadata field is not provided', async () => {
    const props = {
      field: {
        value: 'test',
      },
      editable: true,
    };

    const testComponent = (await renderAstroComponent(TestComponentWithField, { props: props }))
      .innerHTML;

    const rendered = await renderAstroComponent(WithFieldMetadata, {
      props: props,
      slots: {
        default: testComponent,
      },
    });

    expect(rendered.innerHTML).to.equal('<div><h1>test</h1><h2>foo</h2><p>bar</p></div>');
  });

  test('should render unwrapped component if metadata is provided but field is not editable', async () => {
    const props = {
      field: {
        value: 'test',
        metadata: testMetadata,
      },
      editable: false,
    };

    const testComponent = (await renderAstroComponent(TestComponentWithField, { props: props }))
      .innerHTML;

    const rendered = await renderAstroComponent(WithFieldMetadata, {
      props: props,
      slots: {
        default: testComponent,
      },
    });

    expect(rendered.innerHTML).to.equal('<div><h1>test</h1><h2>foo</h2><p>bar</p></div>');
  });

  test('should wrap field with provided metadata', async () => {
    const props = {
      field: {
        value: 'car',
        metadata: testMetadata,
      },
      editable: true,
    };

    const testComponent = (await renderAstroComponent(TestComponentWithField, { props: props }))
      .innerHTML;

    const rendered = await renderAstroComponent(WithFieldMetadata, {
      props: props,
      slots: {
        default: testComponent,
      },
    });

    expect(rendered.innerHTML).to.equal(
      [
        `<code type="text/sitecore" chrometype="field" class="scpm" kind="open">${JSON.stringify(
          testMetadata
        )}</code>`,
        '<div>',
        '<h1>car</h1>',
        '<h2>foo</h2>',
        '<p>bar</p>',
        '</div>',
        '<code type="text/sitecore" chrometype="field" class="scpm" kind="close"></code>',
      ].join('')
    );
  });
});
