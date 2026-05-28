import { StaticPath } from '@sitecore-content-sdk/content';
import {
  FetchOptions,
  Page,
  PageOptions,
  SitecoreClient,
  SitecoreClientInit,
} from '@sitecore-content-sdk/content/client';
import { PreviewData } from '../sharedTypes/component-props';
import { EditingPreviewData } from '@sitecore-content-sdk/content/editing';
import { getSiteRewriteData, normalizeSiteRewrite } from '@sitecore-content-sdk/content/site';
import {
  getPersonalizedRewriteData,
  normalizePersonalizedRewrite,
} from '@sitecore-content-sdk/content/personalize';
import { SitecoreConfig } from '../config';

/**
 * Init options for Sitecore Client that allows you to override services too
 * @public
 */
export type SitecoreAstroClientInit = SitecoreClientInit & Pick<SitecoreConfig, 'multisite'>;

/**
 * The SitecoreAstroClient class extends the SitecoreClient class to provide additional functionality for Astro.
 * @public
 */
export class SitecoreAstroClient extends SitecoreClient {
  constructor(protected initOptions: SitecoreAstroClientInit) {
    super(initOptions);
  }

  /**
   * Gets site name based on the provided path
   * @param {string | string[]} path path to get site name from
   * @returns site name, or default site info if not found
   */
  getSiteNameFromPath(path: string | string[]) {
    const resolvedPath = super.parsePath(path);
    // Get site name (from path rewritten in proxy)
    const siteData = getSiteRewriteData(resolvedPath, this.initOptions.defaultSite);

    return siteData.siteName;
  }

  /**
   * Normalizes a path that could have been rewritten
   * @param {string | string[]} path path
   * @returns normalized path string
   */
  parsePath(path: string | string[]) {
    const basePath = super.parsePath(path);
    return normalizeSiteRewrite(normalizePersonalizedRewrite(basePath));
  }

  async getPage(
    path: string | string[],
    pageOptions: PageOptions,
    options?: FetchOptions
  ): Promise<Page | null> {
    const resolvedPath = this.parsePath(path);
    // Get variant(s) for personalization (from path), must ensure path is of type string
    const personalizeData =
      pageOptions.personalize || getPersonalizedRewriteData(super.parsePath(path));
    const site = pageOptions.site || this.getSiteNameFromPath(path);
    const page = await super.getPage(
      resolvedPath,
      {
        locale: pageOptions.locale,
        site,
        personalize: personalizeData,
      },
      options
    );

    return page;
  }

  /**
   * Retrieves preview page and layout details
   * @param {PreviewData} previewData - The editing preview data for metadata mode.
   * @param {FetchOptions} [fetchOptions] Additional fetch fetch options to override GraphQL requests (like retries and fetch)
   */
  async getPreview(previewData: PreviewData, fetchOptions?: FetchOptions): Promise<Page | null> {
    return super.getPreview(previewData as EditingPreviewData, fetchOptions);
  }

  /**
   * Retrieves the static paths for pages based on the given languages.
   * @param {string[]} sites - An array of site names to fetch routes for.
   * @param {string[]} [languages] - An optional array of language codes to generate paths for.
   * @param {FetchOptions} [fetchOptions] - Additional fetch options.
   * @returns {Promise<StaticPath[]>} A promise that resolves to an array of static paths.
   */
  async getPagePaths(
    sites: string[],
    languages?: string[],
    fetchOptions?: FetchOptions
  ): Promise<StaticPath[]> {
    const staticPaths = await super.getPagePaths(sites, languages, fetchOptions);

    // remove _site_ segments (Astro doesn't support multisite in SSG yet)
    staticPaths.map((path) => {
      path.params.path = normalizeSiteRewrite(path.params.path.join('/')).split('/');
    });

    return staticPaths;
  }
}
