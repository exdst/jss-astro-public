import { describe, test, expect } from 'vitest';
import { renderAstroComponent } from '../tests/astro-helpers';
import Image, { ImageField } from './Image.astro';
import DefaultEmptyFieldEditingComponentImage from './DefaultEmptyFieldEditingComponentImage.astro';
import EmptyFieldEditingComponent from '../tests/test-components/EmptyFieldEditingComponent.astro';

describe('<Image />', () => {
  describe('with direct image object, no value', async () => {
    const props = {
      field: {
        src: '/assets/img/test0.png',
        width: '8',
        height: '10',
      },
      id: 'some-id',
      style: {
        width: '100%',
      },
      className: 'the-dude-abides',
    };

    const rendered = (
      await renderAstroComponent(Image, {
        props: { ...props },
      })
    ).querySelectorAll('img');

    test('should render <img /> with url', async () => {
      expect(rendered).to.have.length(1);
      expect(rendered[0]?.getAttribute('src')).to.equal(props.field.src);
      expect(rendered[0]?.getAttribute('width')).to.equal(props.field.width);
      expect(rendered[0]?.getAttribute('height')).to.equal(props.field.height);
    });

    test('should render <img /> with non-media props', async () => {
      expect(rendered[0]?.getAttribute('id')).to.equal(props.id);
    });

    test('should render <img /> with style and className props', async () => {
      expect(rendered[0]?.getAttribute('style')).to.eql('width:100%');
      expect(rendered[0]?.getAttribute('class')).to.eql(props.className);
    });
  });

  describe('with responsive image object', async () => {
    const props = {
      field: {
        src: '/assets/img/test0.png',
      },
      srcSet: [{ mw: 100 }, { mw: 300 }],
      sizes: '(min-width: 960px) 300px, 100px',
      id: 'some-id',
      className: 'the-dude-abides',
    };

    const rendered = (
      await renderAstroComponent(Image, {
        props: { ...props },
      })
    ).querySelectorAll('img');

    test('should render <img /> with needed img tags', async () => {
      expect(rendered).to.have.length(1);
      expect(rendered[0]?.getAttribute('src')).to.equal(props.field.src);
      expect(rendered[0]?.getAttribute('srcSet')).to.equal(
        '/assets/img/test0.png?mw=100 100w, /assets/img/test0.png?mw=300 300w'
      );
      expect(rendered[0]?.getAttribute('sizes')).to.equal('(min-width: 960px) 300px, 100px');
    });

    test('should render <img /> with non-media props', async () => {
      expect(rendered[0]?.getAttribute('id')).to.equal(props.id);
    });

    test('should render <img /> with style and className props', async () => {
      expect(rendered[0]?.getAttribute('class')).to.eql(props.className);
    });
  });

  describe('with "value" property value', async () => {
    const props = {
      field: { value: { src: '/assets/img/test0.png', alt: 'my image' } },
      id: 'some-id',
      style: { width: '100%' },
      className: 'the-dude-abides',
    };

    const rendered = (
      await renderAstroComponent(Image, {
        props: { ...props },
      })
    ).querySelectorAll('img');

    test('should render <img /> component with "value" properties', async () => {
      expect(rendered).to.have.length(1);
      expect(rendered[0]?.getAttribute('src')).to.eql(props.field.value.src);
      expect(rendered[0]?.getAttribute('alt')).to.eql(props.field.value.alt);
    });

    test('should render <img /> with non-media props', async () => {
      expect(rendered[0]?.getAttribute('id')).to.equal(props.id);
    });

    test('should render <img /> with style and className props', async () => {
      expect(rendered[0]?.getAttribute('style')).to.eql('width:100%');
      expect(rendered[0]?.getAttribute('class')).to.eql(props.className);
    });
  });

  describe('with "class" and "className" property set', async () => {
    const props = {
      field: { value: { src: '/assets/img/test0.png', alt: 'my image' } },
      editable: false,
      style: { width: '100%' },
      className: 'the-dude',
      class: 'abides',
    };

    const rendered = (
      await renderAstroComponent(Image, {
        props: { ...props },
      })
    ).querySelector('img');

    test('should attach "class" value at the end of class attribute', async () => {
      expect(rendered?.getAttribute('class')).to.eql(`${props.className} ${props.class}`);
    });
  });

  describe('with "mediaUrlPrefix" property', async () => {
    test('should transform url with "value" property value', async () => {
      const props = {
        field: { value: { src: '/~assets/img/test0.png', alt: 'my image' } },
        id: 'some-id',
        style: { width: '100%' },
        className: 'the-dude-abides',
        imageParams: { foo: 'bar' },
        mediaUrlPrefix: /\/([-~]{1})assets\//i,
      };

      let rendered = await renderAstroComponent(Image, {
        props: { ...props },
      });

      expect(rendered.querySelector('img')?.getAttribute('src')).to.equal(
        '/~/jssmedia/img/test0.png?foo=bar'
      );

      const newProps = {
        ...props,
        field: { value: { src: '/-assets/img/test0.png', alt: 'my image' } },
      };

      rendered = await renderAstroComponent(Image, {
        props: { ...newProps },
      });

      expect(rendered.querySelector('img')?.getAttribute('src')).to.equal(
        '/-/jssmedia/img/test0.png?foo=bar'
      );
    });

    test('should transform url with direct image object, no value', async () => {
      const props = {
        field: {
          src: '/~assets/img/test0.png',
          width: 8,
          height: 10,
        },
        id: 'some-id',
        style: {
          width: '100%',
        },
        className: 'the-dude-abides',
        imageParams: { foo: 'bar' },
        mediaUrlPrefix: /\/([-~]{1})assets\//i,
      };

      let rendered = await renderAstroComponent(Image, {
        props: { ...props },
      });

      expect(rendered.querySelector('img')?.getAttribute('src')).to.equal(
        '/~/jssmedia/img/test0.png?foo=bar'
      );

      const newProps = {
        ...props,
        field: {
          src: '/-assets/img/test0.png',
          width: 8,
          height: 10,
        },
      };

      rendered = await renderAstroComponent(Image, {
        props: { ...newProps },
      });

      expect(rendered.querySelector('img')?.getAttribute('src')).to.equal(
        '/-/jssmedia/img/test0.png?foo=bar'
      );
    });

    test('should transform url with responsive image object', async () => {
      const props = {
        field: {
          src: '/~assets/img/test0.png',
        },
        srcSet: [{ mw: 100 }, { mw: 300 }],
        sizes: '(min-width: 960px) 300px, 100px',
        id: 'some-id',
        className: 'the-dude-abides',
        mediaUrlPrefix: /\/([-~]{1})assets\//i,
      };

      let rendered = await renderAstroComponent(Image, {
        props: { ...props },
      });
      expect(rendered.querySelector('img')?.getAttribute('src')).to.equal('/~assets/img/test0.png');
      expect(rendered.querySelector('img')?.getAttribute('srcSet')).to.equal(
        '/~/jssmedia/img/test0.png?mw=100 100w, /~/jssmedia/img/test0.png?mw=300 300w'
      );

      const newProps = {
        ...props,
        field: {
          src: '/-assets/img/test0.png',
          width: 8,
          height: 10,
        },
        imageParams: { foo: 'bar' },
      };

      rendered = await renderAstroComponent(Image, {
        props: { ...newProps },
      });

      expect(rendered.querySelector('img')?.getAttribute('src')).to.equal(
        '/-/jssmedia/img/test0.png?foo=bar'
      );
      expect(rendered.querySelector('img')?.getAttribute('srcSet')).to.equal(
        '/-/jssmedia/img/test0.png?foo=bar&mw=100 100w, /-/jssmedia/img/test0.png?foo=bar&mw=300 300w'
      );
    });
  });

  test('should render no <img /> when media prop is empty', async () => {
    const imgField = '' as ImageField;

    const rendered = await renderAstroComponent(Image, {
      props: { field: imgField },
    });

    expect(rendered.querySelectorAll('img')).to.have.length(0);
  });

  test('should render when field prop is used instead of media prop', async () => {
    const imgField = {
      src: '/assets/img/test0.png',
      width: 8,
      height: 10,
    };

    const rendered = await renderAstroComponent(Image, {
      props: { field: imgField },
    });

    expect(rendered.querySelectorAll('img')).to.have.length(1);
  });

  describe('edit mode', async () => {
    const testMetadata = {
      contextItem: {
        id: '{09A07660-6834-476C-B93B-584248D3003B}',
        language: 'en',
        revision: 'a0b36ce0a7db49418edf90eb9621e145',
        version: 1,
      },
      fieldId: '{414061F4-FBB1-4591-BC37-BFFA67F745EB}',
      fieldType: 'image',
      rawValue: 'Test1',
    };

    test('should render field metadata component when metadata property is present', async () => {
      const imgField = {
        src: '/assets/img/test0.png',
        width: 8,
        height: 10,
        metadata: testMetadata,
      };

      const rendered = await renderAstroComponent(Image, {
        props: { field: imgField },
      });

      expect(rendered.innerHTML).to.equal(
        [
          `<code type="text/sitecore" chrometype="field" class="scpm" kind="open">${JSON.stringify(
            testMetadata
          )}</code>`,
          '<img width="8" height="10" src="/assets/img/test0.png">',
          '<code type="text/sitecore" chrometype="field" class="scpm" kind="close"></code>',
        ].join('')
      );
    });

    test('should render default empty field component for Image when field value src is not present', async () => {
      const imgField = {
        value: { src: undefined },
        metadata: testMetadata,
      };

      const rendered = await renderAstroComponent(Image, {
        props: { field: imgField },
      });

      const defaultEmptyImagePlaceholder = await renderAstroComponent(
        DefaultEmptyFieldEditingComponentImage
      );

      expect(rendered.innerHTML).to.equal(
        [
          `<code type="text/sitecore" chrometype="field" class="scpm" kind="open">${JSON.stringify(
            testMetadata
          )}</code>`,
          defaultEmptyImagePlaceholder.innerHTML,
          '<code type="text/sitecore" chrometype="field" class="scpm" kind="close"></code>',
        ].join('')
      );
    });

    test('should render default empty field component for Image when field src is not present', async () => {
      const imgField = {
        src: undefined,
        metadata: testMetadata,
      };

      const rendered = await renderAstroComponent(Image, {
        props: { field: imgField, className: 'custom-class' },
      });

      const defaultEmptyImagePlaceholder = await renderAstroComponent(
        DefaultEmptyFieldEditingComponentImage,
        {
          props: { className: 'custom-class' },
        }
      );

      expect(rendered.innerHTML).to.equal(
        [
          `<code type="text/sitecore" chrometype="field" class="scpm" kind="open">${JSON.stringify(
            testMetadata
          )}</code>`,
          defaultEmptyImagePlaceholder.innerHTML,
          '<code type="text/sitecore" chrometype="field" class="scpm" kind="close"></code>',
        ].join('')
      );

      expect(rendered.innerHTML).to.contain('custom-class');
      expect(rendered.innerHTML).to.contain('scEmptyImage');
    });

    test('should render custom empty field component when provided, when field value src is not present', async () => {
      const imgField = {
        value: { src: undefined },
        metadata: testMetadata,
      };

      const rendered = await renderAstroComponent(Image, {
        props: {
          field: imgField,
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

    test('should render custom empty field component when provided, when field src is not present', async () => {
      const imgField = {
        src: undefined,
        metadata: testMetadata,
      };

      const rendered = await renderAstroComponent(Image, {
        props: {
          field: imgField,
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

    test('should render nothing when field value src is not present, when editing is explicitly disabled', async () => {
      const imgField = {
        value: { src: undefined },
        metadata: testMetadata,
      };

      const rendered = await renderAstroComponent(Image, {
        props: { field: imgField, editable: false },
      });

      expect(rendered.innerHTML).to.equal('');
    });

    test('should render nothing when field src is not present, when editing is explicitly disabled', async () => {
      const imgField = {
        src: undefined,
        metadata: testMetadata,
      };

      const rendered = await renderAstroComponent(Image, {
        props: { field: imgField, editable: false },
      });

      expect(rendered.innerHTML).to.equal('');
    });
  });
});
