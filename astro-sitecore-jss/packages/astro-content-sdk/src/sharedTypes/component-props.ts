export type ComponentPropsError = { error: string; componentName: string };

/**
 * Shape of component props storage
 */
export type ComponentPropsCollection = {
  [componentUid: string]: unknown | ComponentPropsError;
};

export type AstroContentSdkComponent = (_props: Record<string, any>) => any;

export type PreviewData = string | false | object | undefined;

export type ComponentMap<
  TComponent extends AstroContentSdkComponent = AstroContentSdkComponent
> = Map<string, TComponent>;

