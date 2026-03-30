import { type ComponentParams, type ComponentRendering } from '@exdst-sitecore-content-sdk/astro';

/**
 * Shared component props
 */
export type ComponentProps = {
  rendering: ComponentRendering;
  params: ComponentParams & {
    /**
     * The identifier for the rendering
     */
    RenderingIdentifier?: string;
    /**
     * The styles for the rendering
     * This value is calculated by the Placeholder component
     */
    styles?: string;
    /**
     * The enabled placeholders for the rendering
     */
    EnabledPlaceholders?: string;
  };
};
