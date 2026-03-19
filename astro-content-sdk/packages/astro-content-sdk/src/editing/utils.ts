import {
  DesignLibraryRenderPreviewData,
  EDITING_ALLOWED_ORIGINS,
  EditingRenderQueryParams,
  isDesignLibraryMode,
  LayoutKind,
  PREVIEW_KEY,
  QUERY_PARAM_EDITING_SECRET,
} from '@sitecore-content-sdk/core/editing';
import { DEFAULT_VARIANT } from '@sitecore-content-sdk/core/personalize';
import { SITE_KEY } from '@sitecore-content-sdk/core/site';
import {
  EDITING_PASS_THROUGH_HEADERS,
  QUERY_PARAM_VERCEL_PROTECTION_BYPASS,
  QUERY_PARAM_VERCEL_SET_BYPASS_COOKIE,
} from './constants';
import { IncomingHttpHeaders } from 'http';
import { NativeDataFetcher } from '@sitecore-content-sdk/core';
import { getAllowedOriginsFromEnv } from '@sitecore-content-sdk/core/utils';

/**
 * Gets editing secret value from request
 * @param {Request} req incoming request
 * @returns {string | undefined} editing secret value if present
 */
export const getEditingSecretFromRequest = (req: Request) => {
  const reqUrl = (req as Request).url;

  const url = new URL(reqUrl);
  const secret = url.searchParams.get(QUERY_PARAM_EDITING_SECRET);

  return secret;
};

/**
 * Parses query string and its parameters to required editing parameters
 * @param {URLSearchParams} query query string values
 * @returns {EditingRenderQueryParams} editing parameters
 */
export const mapEditingParams = (query: {
  [key: string]: string | undefined;
}): { [key: string]: string | undefined } => {
  const params = isDesignLibraryMode(query.mode)
    ? {
        itemId: query.sc_itemid,
        componentUid: query.sc_uid,
        renderingId: query.sc_renderingId,
        language: query.sc_lang,
        site: query.sc_site,
        mode: query.mode,
        dataSourceId: query.dataSourceId,
        version: query.sc_version,
        generation: query.generation,
      }
    : {
        site: query.sc_site,
        itemId: query.sc_itemid,
        language: query.sc_lang,
        // for sc_variantId we may employ multiple variants (page-layout + component level)
        // they will be separated by commas (,)
        variantIds: query.sc_variant || DEFAULT_VARIANT,
        version: query.sc_version,
        mode: query.mode,
        layoutKind: query.sc_layoutKind,
      };
  return params;
};

/**
 * Preview cookies enum
 */
export enum PreviewCookies {
  PREVIEW_DATA = '_preview_data',
}

/**
 * Filters out preview cookies from a cookie string or array
 * @param {string | string[] | null} cookies cookie header value
 * @returns {string[] | null} filtered cookies
 */
export const cleanupPreviewCookies = (cookies: string | string[] | null) => {
  if (!cookies) {
    return null;
  }
  if (!Array.isArray(cookies)) {
    cookies = cookies.split(',');
  }
  // Filter out preview cookies
  const filteredCookies = cookies.filter(
    (cookie: string) => !new RegExp(`^${PreviewCookies.PREVIEW_DATA}=`).test(cookie)
  );

  return filteredCookies;
};

/**
 * Gets the preview cookies to enable preview mode
 * @param {string} site current site name
 * @returns {string[]} list of cookies to set
 */
export const getPreviewCookies = (site: string) => {
  const previewSite = `${SITE_KEY}=${site}; Path=/; HttpOnly; SameSite=None; Secure`;
  const previewCookie = `${PREVIEW_KEY}=true; Path=/; HttpOnly; SameSite=None; Secure`;
  return [previewSite, previewCookie];
};

/**
 * Returns the list of required query parameters based on the page editing mode
 * @param {DesignLibraryMode | LayoutServicePageState.Preview | LayoutServicePageState.Edit} mode current page mode
 * @returns {string[]} list of required parameters for validation
 */
export const getRequiredEditingParamsList = (mode: EditingRenderQueryParams['mode']) => {
  const editingRequiredParams = ['sc_site', 'sc_itemid', 'sc_lang', 'route', 'mode'];

  const componentRequiredParams = [
    'sc_site',
    'sc_itemid',
    'sc_renderingId',
    'sc_uid',
    'sc_lang',
    'mode',
  ];
  return isDesignLibraryMode(mode) ? componentRequiredParams : editingRequiredParams;
};

/**
 * Gets query parameters that should be passed along to subsequent requests (e.g. for deployment protection bypass)
 * @param {object} query URLSearchParams object from incoming URL
 * @returns object of approved query parameters
 */
export const getQueryParamsForPropagation = (
  query: Partial<{ [key: string]: string | string[] }>
): { [key: string]: string } => {
  const params: { [key: string]: string } = {};
  if (query[QUERY_PARAM_VERCEL_PROTECTION_BYPASS]) {
    params[QUERY_PARAM_VERCEL_PROTECTION_BYPASS] = query[
      QUERY_PARAM_VERCEL_PROTECTION_BYPASS
    ] as string;
  }
  if (query[QUERY_PARAM_VERCEL_SET_BYPASS_COOKIE]) {
    params[QUERY_PARAM_VERCEL_SET_BYPASS_COOKIE] = query[
      QUERY_PARAM_VERCEL_SET_BYPASS_COOKIE
    ] as string;
  }
  return params;
};

/**
 * Get headers that should be passed along to subsequent requests
 * @param {IncomingHttpHeaders | Headers} headers Incoming HTTP Headers
 * @returns Object of approved headers
 */
export const getHeadersForPropagation = (
  headers: IncomingHttpHeaders | Headers
): { [key: string]: string } => {
  // Filter and normalize headers
  const filteredHeaders = EDITING_PASS_THROUGH_HEADERS.reduce((acc, header) => {
    const value = (headers as Headers).get
      ? (headers as Headers).get(header)
      : (headers as IncomingHttpHeaders)[header];
    if (value) {
      acc[header] = Array.isArray(value) ? value.join(', ') : value;
    }
    return acc;
  }, {} as Record<string, string>);

  return filteredHeaders;
};

/**
 * Performs an internal request to get the HTML for the editing mode
 * @param {string} requestUrl URL to send request to
 * @param {object} propagatedQsParams query string params to use with request
 * @param {object} propagatedHeaders headers to use with request
 * @param {string[]} cookies cookies to use with request
 * @param {NativeDataFetcher} dataFetcher NativeFetcher instance to send request with
 * @returns {string} HTML with editing markup
 */
export const getEditingRequestHtml = async (
  requestUrl: URL,
  propagatedQsParams: { [key: string]: string | undefined },
  propagatedHeaders: { [key: string]: string },
  cookies: string[],
  dataFetcher: NativeDataFetcher
): Promise<string> => {
  // Grab the preview cookies to send on to the render request
  propagatedHeaders.cookie = `${
    propagatedHeaders.cookie ? propagatedHeaders.cookie + ';' : ''
  }${cookies.join(';')}`;
  // enable content sdk preview
  propagatedHeaders.__content_sdk_preview = '1';

  for (const key in propagatedQsParams) {
    if ({}.hasOwnProperty.call(propagatedQsParams, key)) {
      propagatedQsParams[key] && requestUrl.searchParams.append(key, propagatedQsParams[key]);
    }
  }
  requestUrl.searchParams.append('timestamp', Date.now().toString());

  const pageRes = await dataFetcher
    .get<string>(requestUrl.toString(), {
      credentials: 'include',
      headers: propagatedHeaders,
    })
    .catch((err) => {
      // We need to handle not found error provided by Vercel
      // for `fallback: false` pages
      if (err.response.status === 404) {
        return err.response;
      }

      throw err;
    });

  let html = pageRes.data;
  if (!html || html.length === 0) {
    throw new Error(`Failed to render html for ${requestUrl.toString()}`);
  }

  // replace phkey attribute with key attribute so that newly added renderings
  // show correct placeholders, so save and refresh won't be needed after adding each rendering
  html = html.replace(new RegExp('phkey', 'g'), 'key');

  return html;
};

/**
 * Type guard for Design Library mode
 * @param {object} data preview data to check
 * @returns true if the data is EditingPreviewData
 * @see EditingPreviewData
 */
export const isDesignLibraryPreviewData = (
  data: unknown
): data is DesignLibraryRenderPreviewData => {
  return (
    typeof data === 'object' &&
    data !== null &&
    'mode' in data &&
    isDesignLibraryMode((data as DesignLibraryRenderPreviewData).mode)
  );
};

/**
 * Server URL Resolution order (highest to lowest priority):
 * 1. `config.sitecoreInternalEditingHostUrl` (explicitly set in config)
 * 2. Environment variable `SITECORE_INTERNAL_EDITING_HOST_URL`
 * 3. Fallbacks:
 *    - For XM Cloud deployments → `'http://localhost:3000'`
 *    - For all other cases → use the request `Host` header
 * Note we use https protocol on Vercel due to serverless function architecture.
 * In all other scenarios, including localhost (with or without a proxy e.g. ngrok)
 * and within a nodejs container, http protocol should be used.
 *
 * For information about the VERCEL environment variable, see
 * https://vercel.com/docs/environment-variables#system-environment-variables
 * @param {Request} req
 */
export const resolveServerUrl = (req: Request) => {
  const internalHostUrl =
    import.meta.env?.SITECORE_INTERNAL_EDITING_HOST_URL ||
    process.env.SITECORE_INTERNAL_EDITING_HOST_URL;
  if (internalHostUrl) {
    return internalHostUrl;
  }

  // in xmc deployment we always use localhost:3000
  if (import.meta.env?.SITECORE || process.env.SITECORE) {
    return 'http://localhost:3000';
  }

  // to preserve auth headers, use https if we're in our 3 main hosting options
  const useHttps =
    (import.meta.env?.VERCEL || process.env.VERCEL ||
     import.meta.env?.NETLIFY || process.env.NETLIFY) !== undefined;
  // use https for requests with auth but also support unsecured http rendering hosts
  return `${useHttps ? 'https' : 'http'}://${req.headers.get('host') ?? undefined}`;
};

/**
 * Gets the Content-Security-Policy header value
 * @returns Content-Security-Policy header value
 */
export const getCSPHeader = () => {
  return `frame-ancestors 'self' ${[...getAllowedOriginsFromEnv(), ...EDITING_ALLOWED_ORIGINS].join(
    ' '
  )}`;
};

/**
 * Gets the object with query params from URLSearchParams object
 * @param {URLSearchParams} query - URLSearchParams query object
 * @returns object with query params
 */
export const getEditingRenderQueryParams = (query: URLSearchParams): EditingRenderQueryParams => {
  const params = Object.fromEntries(query.entries());

  return {
    ...params,
    secret: params.secret ?? '',
    sc_lang: params.sc_lang ?? '',
    sc_itemid: params.sc_itemid ?? '',
    sc_site: params.sc_site ?? '',
    route: params.route ?? '',
    mode: params.mode as EditingRenderQueryParams['mode'],
    sc_layoutKind: params.sc_layoutkind as LayoutKind,
    sc_variant: params.sc_variant ?? undefined,
    sc_version: params.sc_version ?? undefined,
    sc_renderingId: params.sc_renderingid ?? undefined,
    dataSourceId: params.datasourceid ?? undefined,
  };
};
