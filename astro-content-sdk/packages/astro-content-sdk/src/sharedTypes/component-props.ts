export type ComponentPropsError = { error: string; componentName: string };

/**
 * Shape of component props storage
 * @public
 */
export type ComponentPropsCollection = {
  [componentUid: string]: unknown | ComponentPropsError;
};

/**
 * Represents an Astro component import
 * @public
 */
export type AstroContentSdkComponent = (_props: Record<string, any>) => any;

/**
 * Represents PreviewData type
 * @public
 */
export type PreviewData = string | false | object | undefined;

/**
 * Represents component map type
 * @public
 */
export type ComponentMap<TComponent extends AstroContentSdkComponent = AstroContentSdkComponent> =
  Map<string, TComponent>;
