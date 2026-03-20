import { Page } from '@sitecore-content-sdk/content/client';
import { AstroContentSdkComponent } from '../../sharedTypes/component-props';
import { ComponentRendering, Field, Item, RouteData } from '@sitecore-content-sdk/content/layout';

/**
 * Base Placeholder props
 * @public
 */
export interface PlaceholderProps {
  /** Name of the placeholder to render. */
  name: string;
  /** Rendering data to be used when rendering the placeholder. */
  rendering: ComponentRendering | RouteData;
  /**
   * An object of field names/values that are aggregated and propagated through the component tree created by a placeholder.
   * Any component or placeholder rendered by a placeholder will have access to this data via `props.fields`.
   */
  fields?: {
    [name: string]: Field | Item | Item[];
  };
  /**
   * An object of rendering parameter names/values that are aggregated and propagated through the component tree created by a placeholder.
   * Any component or placeholder rendered by a placeholder will have access to this data via `props.params`.
   */
  params?: {
    [name: string]: string;
  };

  /**
   * A component that is rendered in place of any components that are in this placeholder,
   * but do not have a definition in the componentMap (i.e. don't have an implementation)
   */
  missingComponentComponent?: AstroContentSdkComponent;

  /**
   * A component that is rendered in place of any components that are hidden
   */
  hiddenRenderingComponent?: AstroContentSdkComponent;

  /**
   * A component that is rendered in place of the placeholder when an error occurs rendering
   * the placeholder
   */
  errorComponent?: AstroContentSdkComponent;
  /**
   * Page data.
   * This data is passed by the SitecoreProvider.
   */
  page?: Page;

  /**
   * Render HTML or an Astro component when the placeholder contains no content components.
   */
  renderEmpty?: string | AstroContentSdkComponent;

  /**
   * Render HTML or an Astro component wrapped around the placeholder and components.
   * For HTML wrapper use ${component} string placeholder to set where the placeholder and components should be rendered.
   */
  render?: string | AstroContentSdkComponent;

  /**
   * Render HTML or an Astro component wrapped around each non-system component added to the placeholder.
   * For HTML wrapper use ${component} string placeholder to set where the component should be rendered.
   * Mutually exclusive with `render`.
   */
  renderEach?: string | AstroContentSdkComponent;

  /**
   * Modify final props of component (before render) provided by rendering data.
   * Can be used in case when you need to insert additional data into the component.
   * @param {ChildComponentProps} componentProps component props to be modified
   * @returns {ChildComponentProps} modified or initial props
   */
  modifyComponentProps?: (componentProps: ChildComponentProps) => ChildComponentProps;
}

export interface ChildComponentProps {
  fields: {
    [name: string]: Field | Item | Item[];
  };
  params: {
    [name: string]: string;
  };
  rendering: ComponentRendering;
}

export interface ComponentForRendering {
  component: AstroContentSdkComponent;
  isEmpty: boolean;
}
