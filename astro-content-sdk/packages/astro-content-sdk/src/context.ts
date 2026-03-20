import { map } from 'nanostores';
import { ComponentMap } from './sharedTypes/component-props';
import { Page } from '@sitecore-content-sdk/content/client';
import { SitecoreConfig } from '@sitecore-content-sdk/content/config';
import { DictionaryPhrases } from '@sitecore-content-sdk/content/types/i18n';

/**
 * Nanostore map holding Sitecore page, API config, component map, and dictionary for the current request or app scope.
 * @internal
 */
export const SitecoreContext: any = map({});

/**
 * Shape of values passed when updating {@link SitecoreContext} (page, API, and optional component map).
 * @internal
 */
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

/**
 * Shape of values passed when updating dictionary phrases on {@link SitecoreContext}.
 * @internal
 */
export interface SitecoreDictionarytProps {
  /**
   * The dictionary data.
   */
  dictionary: DictionaryPhrases;
}

/**
 * Writes page data, API config, and optional component map into {@link SitecoreContext}.
 * @param {Page} props.page - The page data.
 * @param {SitecoreConfig['api']} props.api - The API configuration.
 * @param {ComponentMap} [props.componentMap] - Component map.
 * @internal
 */
export const updateSitecoreContext = ({ page, api, componentMap }: SitecoreContextProps) => {
  SitecoreContext.setKey('page', page);
  SitecoreContext.setKey('api', api);
  SitecoreContext.setKey('componentMap', componentMap);
};

/**
 * Writes dictionary phrases into {@link SitecoreContext} for {@link useDictionary}.
 * @param {SitecoreDictionarytProps} props
 * @param {DictionaryPhrases} props.dictionary
 * @internal
 */
export const updateSitecoreDictionary = ({ dictionary }: SitecoreDictionarytProps) => {
  SitecoreContext.setKey('dictionary', dictionary);
};

/**
 * Returns the current page and API config from {@link SitecoreContext}.
 * @public
 */
export const useSitecore = (): SitecoreContextProps => {
  return {
    page: SitecoreContext.get()['page'],
    api: SitecoreContext.get()['api'],
  };
};

/**
 * Returns the component map from {@link SitecoreContext} for resolving rendering components.
 * @public
 */
export const useComponentMap = (): ComponentMap => {
  return SitecoreContext.get()['componentMap'];
};

/**
 * Returns a translator function `t(key)` that resolves keys against the dictionary on {@link SitecoreContext}, or returns the key if no dictionary is set.
 * @public
 */
export const useDictionary = () => {
  const t = (key: string): string => {
    const dictionary = SitecoreContext.get()['dictionary'];
    if (!dictionary) {
      return key;
    }
    return dictionary[key];
  };

  return t;
};
