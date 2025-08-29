export type ComponentPropsError = { error: string; componentName: string };

/**
 * SXA uses custom default export name
 */
export const DEFAULT_EXPORT_NAME = 'Default';

/**
 * Shape of component props storage
 */
export type ComponentPropsCollection = {
  [componentUid: string]: unknown | ComponentPropsError;
};

export type ComponentMap<
  TComponent extends AstroContentSdkComponent = AstroContentSdkComponent
> = Map<string, TComponent>;

export type AstroContentSdkComponent = (_props: Record<string, any>) => any;

export type PreviewData = string | false | object | undefined;
