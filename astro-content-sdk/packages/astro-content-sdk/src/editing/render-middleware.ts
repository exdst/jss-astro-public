import {
  QUERY_PARAM_VERCEL_PROTECTION_BYPASS,
  QUERY_PARAM_VERCEL_SET_BYPASS_COOKIE,
  EDITING_PASS_THROUGH_HEADERS,
} from './constants';

/**
 * Base class for middleware that handles pages and components rendering in Sitecore Editors.
 */
export abstract class RenderMiddlewareBase {
  /**
   * Gets query parameters that should be passed along to subsequent requests (e.g. for deployment protection bypass)
   * @param {object} query URLSearchParams object from incoming URL
   * @returns URLSearchParams object of approved query parameters
   */
  protected getQueryParamsForPropagation = (query: URLSearchParams): URLSearchParams => {
    const params = new URLSearchParams();
    if (query.get(QUERY_PARAM_VERCEL_PROTECTION_BYPASS)) {
      params.append(
        QUERY_PARAM_VERCEL_PROTECTION_BYPASS,
        query.get(QUERY_PARAM_VERCEL_PROTECTION_BYPASS) as string
      );
    }
    if (query.get(QUERY_PARAM_VERCEL_SET_BYPASS_COOKIE)) {
      params.append(
        QUERY_PARAM_VERCEL_SET_BYPASS_COOKIE,
        query.get(QUERY_PARAM_VERCEL_SET_BYPASS_COOKIE) as string
      );
    }
    return params;
  };

  /**
   * Get headers that should be passed along to subsequent requests
   * @param {IncomingHttpHeaders} headers Incoming HTTP Headers
   * @returns Object of approved headers
   */
  protected getHeadersForPropagation = (headers: Headers): Headers => {
    // Filter and normalize headers
    const filteredHeaders = EDITING_PASS_THROUGH_HEADERS.reduce((acc, header) => {
      const value = headers.get(header);
      if (value) {
        acc.append(header, Array.isArray(value) ? value.join(', ') : value);
      }
      return acc;
    }, new Headers());

    return filteredHeaders;
  };
}
