export type ComponentMap<
  TComponent extends AstroContentSdkComponent = AstroContentSdkComponent
> = Map<string, TComponent>;

export type AstroContentSdkComponent = (_props: Record<string, any>) => any;
