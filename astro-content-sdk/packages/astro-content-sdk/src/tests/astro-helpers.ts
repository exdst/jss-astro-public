import type { ComponentProps } from 'astro/types';
import {
  experimental_AstroContainer as AstroContainer,
  type ContainerRenderOptions,
} from 'astro/container';
import { Page } from '@sitecore-content-sdk/content/client';
import { ComponentMap } from '../sharedTypes/component-props';
import { vi } from 'vitest';
import { SitecoreContext } from '../context';

type AstroComponentFactory = Parameters<AstroContainer['renderToString']>[0];

type ComponentContainerRenderOptions<T extends AstroComponentFactory> = Omit<
  ContainerRenderOptions,
  'props'
> & {
  // @ts-expect-error
  props?: ComponentProps<T>;
};

/**
 * Renders an Astro component to a DOM element for tests.
 * @param {AstroComponentFactory} Component - The Astro component to render.
 * @param {ComponentContainerRenderOptions<T>} options - Container render options, including component props.
 * @returns A `div` whose `innerHTML` is the rendered markup (Astro attributes stripped).
 */
export async function renderAstroComponent<T extends AstroComponentFactory>(
  Component: T,
  options: ComponentContainerRenderOptions<T> = {}
) {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Component, options);

  const html = removeAstroAttributes(result);

  const div = document.createElement('div');
  div.innerHTML = html;

  return div;
}

export const mockSitecoreContext = (page?: Page, map?: ComponentMap, api?: any) => {
  const getMock = vi.fn();

  getMock.mockReturnValue({
    page: page,
    componentMap: map,
    api: api,
  });

  SitecoreContext.get = getMock;
};

/**
 * Removes Astro-specific data attributes (data-astro-*)
 * and whitespaces between HTML tags from a given HTML string.
 * @param {string} html - Raw HTML string from Astro rendering.
 */
const removeAstroAttributes = (html: string) => {
  return html.replace(/\s*data-astro-[a-zA-Z0-9-]+=(\"|\').*?\1\s*/g, '').replace(/>\s+</g, '><');
};
