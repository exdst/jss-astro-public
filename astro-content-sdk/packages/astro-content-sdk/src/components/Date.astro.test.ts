import { describe, test, expect } from 'vitest';
import { renderAstroComponent } from '../tests/astro-helpers';
import Date from './Date.astro';
import EmptyFieldEditingComponent from '../tests/test-components/EmptyFieldEditingComponent.astro';
import { EMPTY_DATE_FIELD_VALUE } from '@sitecore-content-sdk/content/layout';

describe('<DateField />', () => {
  test('should return null if no value', async () => {
    const field = {};

    const rendered = await renderAstroComponent(Date, {
      props: { field: field },
    });

    expect(rendered.innerHTML).to.equal('');
  });

  test('should render value', async () => {
    const field = {
      value: '23-11-2001',
    };

    const rendered = await renderAstroComponent(Date, {
      props: { field: field },
    });

    expect(rendered.innerHTML).equal('23-11-2001');
  });

  test('should render value using render prop function', async () => {
    const renderDate = (date: Date | null) => `<p>${date ? date.toDateString() : ''}</p>`;
    const field = {
      value: '11-23-2001',
    };

    const rendered = await renderAstroComponent(Date, {
      props: { field: field, render: renderDate },
    });

    expect(rendered.innerHTML).equal('<p>Fri Nov 23 2001</p>');
  });

  test('should render value with provided tag', async () => {
    const field = {
      value: '11-23-2001',
    };

    const rendered = await renderAstroComponent(Date, {
      props: { field: field, tag: 'h3' },
    });

    expect(rendered.innerHTML).equal('<h3>11-23-2001</h3>');
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
      fieldType: 'date',
      rawValue: 'Test1',
    };

    test('should render field metadata component when metadata property is present', async () => {
      const field = {
        value: '23-11-2001',
        metadata: testMetadata,
      };

      const rendered = await renderAstroComponent(Date, {
        props: { field: field },
      });

      expect(rendered.innerHTML).to.equal(
        [
          `<code type="text/sitecore" chrometype="field" class="scpm" kind="open">${JSON.stringify(
            testMetadata
          )}</code>`,
          '23-11-2001',
          '<code type="text/sitecore" chrometype="field" class="scpm" kind="close"></code>',
        ].join('')
      );
    });

    describe('empty value', () => {
      describe('Should render default component', () => {
        test('field value is empty string', async () => {
          const field = {
            value: '',
            metadata: testMetadata,
          };

          const rendered = await renderAstroComponent(Date, {
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

        test('field value is default empty date value', async () => {
          const field = {
            value: EMPTY_DATE_FIELD_VALUE,
            metadata: testMetadata,
          };

          const rendered = await renderAstroComponent(Date, {
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
      });

      describe('Should render custom component', () => {
        test('field value is empty string', async () => {
          const field = {
            value: '',
            metadata: testMetadata,
          };

          const rendered = await renderAstroComponent(Date, {
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

        test('field value is defaule empty date value', async () => {
          const field = {
            value: EMPTY_DATE_FIELD_VALUE,
            metadata: testMetadata,
          };

          const rendered = await renderAstroComponent(Date, {
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
      });
    });

    test('should render nothing when field value is empty, when editing is explicitly disabled ', async () => {
      const field = {
        value: '',
        metadata: testMetadata,
      };

      const rendered = await renderAstroComponent(Date, {
        props: { field: field, editable: false },
      });

      expect(rendered.innerHTML).to.equal('');
    });
  });
});
