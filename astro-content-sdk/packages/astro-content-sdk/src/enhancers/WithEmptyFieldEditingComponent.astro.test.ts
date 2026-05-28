import { describe, test, expect } from 'vitest';
import { renderAstroComponent } from '../tests/astro-helpers';
import WithEmptyFieldEditingComponent from './WithEmptyFieldEditingComponent.astro';
import DefaultEmptyFieldEditingComponentText from '../components/DefaultEmptyFieldEditingComponentText.astro';
import { EMPTY_DATE_FIELD_VALUE } from '@sitecore-content-sdk/content/layout';
import TestComponent from '../tests/test-components/TestComponent.astro';
import EmptyFieldEditingComponent from '../tests/test-components/EmptyFieldEditingComponent.astro';

describe('WithEmptyFieldEditingComponent', () => {
  describe('Metadata', () => {
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

    test('Should render provided default empty value component component if field value is not provided', async () => {
      const props = {
        tag: 'h1',
        field: {
          value: '',
          metadata: testMetadata,
        },
        defaultEmptyFieldEditingComponent: DefaultEmptyFieldEditingComponentText,
      };

      const testComponent = (await renderAstroComponent(TestComponent)).innerHTML;

      const rendered = await renderAstroComponent(WithEmptyFieldEditingComponent, {
        props: props,
        slots: {
          default: testComponent,
        },
      });

      expect(rendered.innerHTML).to.equal('<h1 tag="h1">[No text in field]</h1>');
    });

    test('Should render custom empty value component if provided via props if field value is not provided', async () => {
      const props = {
        field: {
          value: '',
          metadata: testMetadata,
        },
        emptyFieldEditingComponent: EmptyFieldEditingComponent,
        defaultEmptyFieldEditingComponent: DefaultEmptyFieldEditingComponentText,
      };

      const testComponent = (await renderAstroComponent(TestComponent)).innerHTML;

      const rendered = await renderAstroComponent(WithEmptyFieldEditingComponent, {
        props: props,
        slots: {
          default: testComponent,
        },
      });

      const expected = await renderAstroComponent(EmptyFieldEditingComponent);

      expect(rendered.innerHTML).to.equal(expected.innerHTML);
    });

    test('Should render component if field value is provided', async () => {
      const props = {
        field: {
          value: 'field value',
          metadata: testMetadata,
        },
        defaultEmptyFieldEditingComponent: DefaultEmptyFieldEditingComponentText,
      };

      const testComponent = (await renderAstroComponent(TestComponent)).innerHTML;

      const rendered = await renderAstroComponent(WithEmptyFieldEditingComponent, {
        props: props,
        slots: {
          default: testComponent,
        },
      });

      expect(rendered.innerHTML).to.equal('<div><h1>hi</h1><h2>foo</h2><p>bar</p></div>');
    });

    test('Should render component if component is explicitly not editable if value is empty', async () => {
      const props = {
        field: {
          value: '',
          metadata: testMetadata,
        },
        editable: false,
        defaultEmptyFieldEditingComponent: DefaultEmptyFieldEditingComponentText,
      };

      const testComponent = (await renderAstroComponent(TestComponent)).innerHTML;

      const rendered = await renderAstroComponent(WithEmptyFieldEditingComponent, {
        props: props,
        slots: {
          default: testComponent,
        },
      });

      expect(rendered.innerHTML).to.equal('<div><h1>hi</h1><h2>foo</h2><p>bar</p></div>');
    });

    test('Should render component if metadata is not provided', async () => {
      const props = {
        field: {
          value: '',
        },
        defaultEmptyFieldEditingComponent: DefaultEmptyFieldEditingComponentText,
      };

      const testComponent = (await renderAstroComponent(TestComponent)).innerHTML;

      const rendered = await renderAstroComponent(WithEmptyFieldEditingComponent, {
        props: props,
        slots: {
          default: testComponent,
        },
      });

      expect(rendered.innerHTML).to.equal('<div><h1>hi</h1><h2>foo</h2><p>bar</p></div>');
    });

    describe('Date', () => {
      test('Should render component if field value is provided', async () => {
        const props = {
          field: {
            metadata: testMetadata,
            value: '2024-01-01T00:00:00Z',
          },
          defaultEmptyFieldEditingComponent: DefaultEmptyFieldEditingComponentText,
        };

        const testComponent = (await renderAstroComponent(TestComponent)).innerHTML;

        const rendered = await renderAstroComponent(WithEmptyFieldEditingComponent, {
          props: props,
          slots: {
            default: testComponent,
          },
        });

        expect(rendered.innerHTML).to.equal('<div><h1>hi</h1><h2>foo</h2><p>bar</p></div>');
      });

      test('Should render default empty component if field value is empty', async () => {
        const props = {
          field: {
            value: EMPTY_DATE_FIELD_VALUE,
            metadata: testMetadata,
          },
          defaultEmptyFieldEditingComponent: DefaultEmptyFieldEditingComponentText,
        };

        const testComponent = (await renderAstroComponent(TestComponent)).innerHTML;

        const rendered = await renderAstroComponent(WithEmptyFieldEditingComponent, {
          props: props,
          slots: {
            default: testComponent,
          },
        });

        const expected = await renderAstroComponent(DefaultEmptyFieldEditingComponentText);

        expect(rendered.innerHTML).to.equal(expected.innerHTML);
      });

      test('Should render custom empty component if field value is empty', async () => {
        const props = {
          field: {
            value: EMPTY_DATE_FIELD_VALUE,
            metadata: testMetadata,
          },
          emptyFieldEditingComponent: EmptyFieldEditingComponent,
          defaultEmptyFieldEditingComponent: DefaultEmptyFieldEditingComponentText,
        };

        const testComponent = (await renderAstroComponent(TestComponent)).innerHTML;

        const rendered = await renderAstroComponent(WithEmptyFieldEditingComponent, {
          props: props,
          slots: {
            default: testComponent,
          },
        });

        const expected = await renderAstroComponent(EmptyFieldEditingComponent);

        expect(rendered.innerHTML).to.equal(expected.innerHTML);
      });
    });

    describe('Image', () => {
      test('Should render component if field src is provided', async () => {
        const props = {
          field: {
            metadata: testMetadata,
            src: 'img src',
          },
          defaultEmptyFieldEditingComponent: DefaultEmptyFieldEditingComponentText,
        };

        const testComponent = (await renderAstroComponent(TestComponent)).innerHTML;

        const rendered = await renderAstroComponent(WithEmptyFieldEditingComponent, {
          props: props,
          slots: {
            default: testComponent,
          },
        });

        expect(rendered.innerHTML).to.equal('<div><h1>hi</h1><h2>foo</h2><p>bar</p></div>');
      });

      test('Should render component if field value src is provided', async () => {
        const props = {
          field: {
            metadata: testMetadata,
            value: { src: 'img src' },
          },
          defaultEmptyFieldEditingComponent: DefaultEmptyFieldEditingComponentText,
        };

        const testComponent = (await renderAstroComponent(TestComponent)).innerHTML;

        const rendered = await renderAstroComponent(WithEmptyFieldEditingComponent, {
          props: props,
          slots: {
            default: testComponent,
          },
        });

        expect(rendered.innerHTML).to.equal('<div><h1>hi</h1><h2>foo</h2><p>bar</p></div>');
      });

      test('Should render provided default empty value component component if field value src is not provided', async () => {
        const props = {
          field: {
            value: { src: undefined },
            metadata: testMetadata,
          },
          defaultEmptyFieldEditingComponent: DefaultEmptyFieldEditingComponentText,
        };

        const testComponent = (await renderAstroComponent(TestComponent)).innerHTML;

        const rendered = await renderAstroComponent(WithEmptyFieldEditingComponent, {
          props: props,
          slots: {
            default: testComponent,
          },
        });
        const expected = await renderAstroComponent(DefaultEmptyFieldEditingComponentText);

        expect(rendered.innerHTML).to.equal(expected.innerHTML);
      });

      test('Should render custom empty value component if provided via props if field src is not provided', async () => {
        const props = {
          field: {
            src: undefined,
            metadata: testMetadata,
          },
          defaultEmptyFieldEditingComponent: DefaultEmptyFieldEditingComponentText,
          emptyFieldEditingComponent: EmptyFieldEditingComponent,
        };

        const testComponent = (await renderAstroComponent(TestComponent)).innerHTML;

        const rendered = await renderAstroComponent(WithEmptyFieldEditingComponent, {
          props: props,
          slots: {
            default: testComponent,
          },
        });
        const expected = await renderAstroComponent(EmptyFieldEditingComponent);

        expect(rendered.innerHTML).to.equal(expected.innerHTML);
      });
    });

    describe('Link', () => {
      test('Should render component if field href is provided', async () => {
        const props = {
          field: {
            metadata: testMetadata,
            href: 'img src',
          },
          defaultEmptyFieldEditingComponent: DefaultEmptyFieldEditingComponentText,
        };

        const testComponent = (await renderAstroComponent(TestComponent)).innerHTML;

        const rendered = await renderAstroComponent(WithEmptyFieldEditingComponent, {
          props: props,
          slots: {
            default: testComponent,
          },
        });

        expect(rendered.innerHTML).to.equal('<div><h1>hi</h1><h2>foo</h2><p>bar</p></div>');
      });

      test('Should render component if field value href is provided', async () => {
        const props = {
          field: {
            metadata: testMetadata,
            value: { href: 'img src' },
          },
          defaultEmptyFieldEditingComponent: DefaultEmptyFieldEditingComponentText,
        };

        const testComponent = (await renderAstroComponent(TestComponent)).innerHTML;

        const rendered = await renderAstroComponent(WithEmptyFieldEditingComponent, {
          props: props,
          slots: {
            default: testComponent,
          },
        });

        expect(rendered.innerHTML).to.equal('<div><h1>hi</h1><h2>foo</h2><p>bar</p></div>');
      });

      test('Should render provided default empty value component component if field value href is not provided', async () => {
        const props = {
          field: {
            value: { href: undefined },
            metadata: testMetadata,
          },
          defaultEmptyFieldEditingComponent: DefaultEmptyFieldEditingComponentText,
        };

        const testComponent = (await renderAstroComponent(TestComponent)).innerHTML;

        const rendered = await renderAstroComponent(WithEmptyFieldEditingComponent, {
          props: props,
          slots: {
            default: testComponent,
          },
        });
        const expected = await renderAstroComponent(DefaultEmptyFieldEditingComponentText);

        expect(rendered.innerHTML).to.equal(expected.innerHTML);
      });

      test('Should render custom empty value component if provided via props if field href is not provided', async () => {
        const props = {
          field: {
            href: undefined,
            metadata: testMetadata,
          },
          defaultEmptyFieldEditingComponent: DefaultEmptyFieldEditingComponentText,
          emptyFieldEditingComponent: EmptyFieldEditingComponent,
        };

        const testComponent = (await renderAstroComponent(TestComponent)).innerHTML;

        const rendered = await renderAstroComponent(WithEmptyFieldEditingComponent, {
          props: props,
          slots: {
            default: testComponent,
          },
        });
        const expected = await renderAstroComponent(EmptyFieldEditingComponent);

        expect(rendered.innerHTML).to.equal(expected.innerHTML);
      });
    });
  });
});
