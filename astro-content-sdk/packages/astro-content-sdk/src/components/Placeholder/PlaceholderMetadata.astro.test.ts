import { describe, test, expect } from 'vitest';
import { renderAstroComponent } from '../../tests/astro-helpers';
import PlaceholderMetadata from './PlaceholderMetadata.astro';

describe('PlaceholderMetadata', () => {
  test('renders rendering code blocks for metadataType rendering', async () => {
    const children = '<div class="richtext-class"></div>';

    const wrapper = await renderAstroComponent(PlaceholderMetadata, {
      props: { rendering: { uid: '123', componentName: 'RichText' } },
      slots: {
        default: children,
      },
    });

    expect(wrapper.innerHTML).to.equal(
      [
        '<code type="text/sitecore" chrometype="rendering" class="scpm" kind="open" id="123"></code>',
        '<div class="richtext-class"></div>',
        '<code type="text/sitecore" chrometype="rendering" class="scpm" kind="close"></code>',
      ].join('')
    );
  });

  test('renders placeholder code blocks when metadataType is placeholder', async () => {
    const children = '<div class="richtext-mock"></div>';

    const wrapper = await renderAstroComponent(PlaceholderMetadata, {
      props: {
        rendering: {
          uid: '123',
          componentName: 'RichText',
          placeholders: { main: [] },
        },
        placeholderName: 'main',
      },
      slots: {
        default: children,
      },
    });

    expect(wrapper.innerHTML).to.equal(
      [
        '<code type="text/sitecore" chrometype="placeholder" class="scpm" kind="open" id="main_123"></code>',
        '<div class="richtext-mock"></div>',
        '<code type="text/sitecore" chrometype="placeholder" class="scpm" kind="close"></code>',
      ].join('')
    );
  });

  test('renders placeholder code blocks with DEFAULT_PLACEHOLDER_UID value when metadataType is a placeholder(root) and uid is not present', async () => {
    const children = '<div class="richtext-mock"></div>';

    const wrapper = await renderAstroComponent(PlaceholderMetadata, {
      props: {
        rendering: {
          componentName: 'RichText',
          placeholders: { main: [] },
        },
        placeholderName: 'main',
      },
      slots: {
        default: children,
      },
    });

    expect(wrapper.innerHTML).to.equal(
      [
        '<code type="text/sitecore" chrometype="placeholder" class="scpm" kind="open" id="main_00000000-0000-0000-0000-000000000000"></code>',
        '<div class="richtext-mock"></div>',
        '<code type="text/sitecore" chrometype="placeholder" class="scpm" kind="close"></code>',
      ].join('')
    );
  });

  test('renders placeholder blocks with rendering uid when metadataType is dynamic placeholder', async () => {
    const children = '<div class="richtext-mock"></div>';

    const wrapper = await renderAstroComponent(PlaceholderMetadata, {
      props: {
        rendering: {
          uid: 'renderinguid',
          componentName: 'RichText',
          placeholders: { 'main-{*}': [] },
        },
        placeholderName: 'main-1',
      },
      slots: {
        default: children,
      },
    });

    expect(wrapper.innerHTML).to.equal(
      [
        '<code type="text/sitecore" chrometype="placeholder" class="scpm" kind="open" id="main-{*}_renderinguid"></code>',
        '<div class="richtext-mock"></div>',
        '<code type="text/sitecore" chrometype="placeholder" class="scpm" kind="close"></code>',
      ].join('')
    );
  });

  test('renders placeholder blocks with DEFAULT_PLACEHOLDER_UID value when metadataType is dynamic placeholder and uid is not present', async () => {
    const children = '<div class="richtext-mock"></div>';

    const wrapper = await renderAstroComponent(PlaceholderMetadata, {
      props: {
        rendering: {
          componentName: 'RichText',
          placeholders: { 'main-{*}': [] },
        },
        placeholderName: 'main-1',
      },
      slots: {
        default: children,
      },
    });

    expect(wrapper.innerHTML).to.equal(
      [
        '<code type="text/sitecore" chrometype="placeholder" class="scpm" kind="open" id="main-{*}_00000000-0000-0000-0000-000000000000"></code>',
        '<div class="richtext-mock"></div>',
        '<code type="text/sitecore" chrometype="placeholder" class="scpm" kind="close"></code>',
      ].join('')
    );
  });

  test('renders placeholder code blocks when metadataType is double digit dynamic placeholder', async () => {
    const children = '<div class="richtext-mock"></div>';

    const wrapper = await renderAstroComponent(PlaceholderMetadata, {
      props: {
        rendering: {
          uid: 'renderinguid',
          componentName: 'RichText',
          placeholders: { 'main-1-{*}': [] },
        },
        placeholderName: 'main-1-1',
      },
      slots: {
        default: children,
      },
    });

    expect(wrapper.innerHTML).to.equal(
      [
        '<code type="text/sitecore" chrometype="placeholder" class="scpm" kind="open" id="main-1-{*}_renderinguid"></code>',
        '<div class="richtext-mock"></div>',
        '<code type="text/sitecore" chrometype="placeholder" class="scpm" kind="close"></code>',
      ].join('')
    );
  });

  test('adds data-csdk-component-runtime attribute to rendering chrome', async () => {
    const children = '<div class="richtext-class"></div>';

    const wrapper = await renderAstroComponent(PlaceholderMetadata, {
      props: {
        rendering: {
          uid: '123',
          componentName: 'RichText',
        },
        componentRuntime: 'server',
      },
      slots: {
        default: children,
      },
    });

    expect(wrapper.innerHTML).to.equal(
      [
        '<code type="text/sitecore" chrometype="rendering" class="scpm" kind="open" id="123" data-csdk-component-runtime="server"></code>',
        '<div class="richtext-class"></div>',
        '<code type="text/sitecore" chrometype="rendering" class="scpm" kind="close"></code>',
      ].join('')
    );
  });

  test('does not add data-csdk-component-runtime attribute to placeholder chrome even when componentRuntime is provided', async () => {
    const children = '<div class="richtext-mock"></div>';

    const wrapper = await renderAstroComponent(PlaceholderMetadata, {
      props: {
        rendering: {
          uid: '123',
          componentName: 'RichText',
          placeholders: { main: [] },
        },
        componentRuntime: 'server',
        placeholderName: 'main',
      },
      slots: {
        default: children,
      },
    });

    expect(wrapper.innerHTML).to.equal(
      [
        '<code type="text/sitecore" chrometype="placeholder" class="scpm" kind="open" id="main_123"></code>',
        '<div class="richtext-mock"></div>',
        '<code type="text/sitecore" chrometype="placeholder" class="scpm" kind="close"></code>',
      ].join('')
    );
  });

  test('does not add data-csdk-component-runtime attribute when componentRuntime is not provided', async () => {
    const children = '<div class="richtext-class"></div>';

    const wrapper = await renderAstroComponent(PlaceholderMetadata, {
      props: {
        rendering: {
          uid: '123',
          componentName: 'RichText',
        },
      },
      slots: {
        default: children,
      },
    });

    expect(wrapper.innerHTML).to.equal(
      [
        '<code type="text/sitecore" chrometype="rendering" class="scpm" kind="open" id="123"></code>',
        '<div class="richtext-class"></div>',
        '<code type="text/sitecore" chrometype="rendering" class="scpm" kind="close"></code>',
      ].join('')
    );
  });
});
