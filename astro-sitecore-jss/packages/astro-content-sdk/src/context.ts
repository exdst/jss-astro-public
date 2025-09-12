import { map } from 'nanostores';
import { ComponentMap } from './sharedTypes/component-props';
import { Page } from '@sitecore-content-sdk/core/client';
import { SitecoreConfig } from '@sitecore-content-sdk/core/config';

export const SitecoreContext: any = map({});

export interface SitecoreContextProps {
  /**
   * The API configuration defined in the `SitecoreConfig`.
   */
  api: SitecoreConfig['api'];
  /**
   * The component map to use for rendering components.
   */
  componentMap?: ComponentMap;
  /**
   * The page data.
   */
  page: Page;
}

export const updateSitecoreContext = ({
  page,
  api,
  componentMap,
}: SitecoreContextProps) => {
  SitecoreContext.setKey('page', page);
  SitecoreContext.setKey('api', api);
  SitecoreContext.setKey('componentMap', componentMap);
};

export const useSitecore = (): SitecoreContextProps => {
  return {
    page: SitecoreContext.get()['page'],
    api: SitecoreContext.get()['api'],
  };
};

export const useComponentMap = (): ComponentMap => {
  return SitecoreContext.get()['componentMap'];
};
