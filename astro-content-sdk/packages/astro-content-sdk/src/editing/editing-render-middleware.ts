import { debug, NativeDataFetcher } from '@sitecore-content-sdk/core';
import {
  QUERY_PARAM_EDITING_SECRET,
  EDITING_ALLOWED_ORIGINS,
} from '@sitecore-content-sdk/core/editing';
import { getEditingSecret } from '../utils';
import { getEnforcedCorsHeaders } from '@sitecore-content-sdk/core/utils';
import { LayoutServicePageState } from '@sitecore-content-sdk/core/layout';
import { RenderMiddlewareBase } from './render-middleware';
import {
  cleanupPreviewCookies,
  getCSPHeader,
  getEditingRenderQueryParams,
  getEditingRequestHtml,
  getHeadersForPropagation,
  getPreviewCookies,
  getQueryParamsForPropagation,
  getRequiredEditingParamsList,
  mapEditingParams,
  PreviewCookies,
  resolveServerUrl,
} from './utils';
import * as cookie from 'cookie';

/**
 * Configuration for the Editing Render Middleware.
 */
export type EditingRenderMiddlewareConfig = {
  /**
   * Function used to determine route/page URL to render.
   * This may be necessary for certain custom routing configurations.
   * @param {string} itemPath The Sitecore relative item path e.g. '/styleguide'
   * @returns {string} The URL to render
   * @default `${itemPath}`
   */
  resolvePageUrl?: (itemPath: string) => string;
  /**
   * The internal host URL for the application, used for server-side requests for page rendering during editing.
   */
  sitecoreInternalEditingHostUrl?: string;
};

/**
 * Middleware / handler for use in the editing render API route (e.g. '/api/editing/render')
 * which is required for Sitecore editing support.
 */
export class EditingRenderMiddleware extends RenderMiddlewareBase {
  private dataFetcher: NativeDataFetcher;
  /**
   * @param {EditingRenderMiddlewareConfig} [config] Editing render middleware config
   */
  constructor(public config?: EditingRenderMiddlewareConfig) {
    super();
    this.dataFetcher = new NativeDataFetcher({ debugger: debug.editing });
  }

  /**
   * Gets the API route handler
   * @returns route handler
   */
  public getHandler(): (req: Request) => Promise<Response> {
    return this.handler;
  }

  /**
   * Gets the preview data cookies string
   * @param {object} data preview data
   * @returns Cookie string with the preview data
   */
  private getPreviewDataCookies = (data: {
    [key: string]: string | string[] | undefined;
  }): string => {
    return cookie.serialize(
      PreviewCookies.PREVIEW_DATA,
      JSON.stringify(data, (_, value) => (value === null ? undefined : value)),
      {
        httpOnly: true,
        path: '/',
        maxAge: 3,
        sameSite: 'none',
        secure: true,
      }
    );
  };

  private handler = async (_req: Request): Promise<Response> => {
    const { method, headers } = _req;
    const url = new URL(_req.url.toLowerCase());
    const query = getEditingRenderQueryParams(url.searchParams);

    debug.editing('editing render middleware start: %o', {
      method,
      query,
      headers,
    });

    const _res = new Response();
    _res.headers.append('Content-Type', 'application/json; charset=utf-8');

    const corsHeaders = getEnforcedCorsHeaders({
      requestMethod: _req.method,
      headers: _req.headers,
      allowedOrigins: EDITING_ALLOWED_ORIGINS,
    });

    if (!corsHeaders) {
      debug.editing(
        'invalid origin host - set allowed origins in JSS_ALLOWED_ORIGINS environment variable'
      );

      return new Response(
        JSON.stringify({
          html: `<html><body>Requests from origin ${_req.headers?.get(
            'origin'
          )} not allowed</body></html>`,
        }),
        {
          status: 401,
          headers: _res.headers,
        }
      );
    }

    Object.keys(corsHeaders).forEach((key) => {
      _res.headers.append(key, corsHeaders[key]);
    });

    // Validate secret
    const secret = query[QUERY_PARAM_EDITING_SECRET];
    if (secret !== getEditingSecret()) {
      debug.editing('invalid editing secret - sent "%s" expected "%s"', secret, getEditingSecret());

      return new Response(
        JSON.stringify({
          html: '<html><body>Missing or invalid secret</body></html>',
        }),
        {
          status: 401,
          headers: _res.headers,
        }
      );
    }

    if (_req.method === 'OPTIONS') {
      debug.editing('preflight request');

      // CORS headers are set by enforceCors
      return new Response(null, {
        status: 204,
        headers: _res.headers,
      });
    }

    if (_req.method !== 'GET') {
      debug.editing('invalid method - sent %s expected GET', _req.method);

      _res.headers.append('Allow', 'GET');

      return new Response(
        JSON.stringify({
          html: `<html><body>Invalid request method '${_req.method}'</body></html>`,
        }),
        {
          status: 405,
          headers: _res.headers,
        }
      );
    }

    const startTimestamp = Date.now();

    const mode = query.mode;

    const requiredQueryParams = getRequiredEditingParamsList(mode);

    const missingQueryParams = requiredQueryParams.filter((param) => !query[param]);

    // Validate query parameters
    if (missingQueryParams.length) {
      debug.editing('missing required query parameters: %o', missingQueryParams);

      return new Response(
        JSON.stringify({
          html: `<html><body>Missing required query parameters: ${missingQueryParams.join(
            ', '
          )}</body></html>`,
        }),
        {
          status: 400,
          headers: _res.headers,
        }
      );
    }

    const previewDataParams = mapEditingParams(query as { [key: string]: string });

    const previewDataCookies = this.getPreviewDataCookies({
      ...previewDataParams,
      variantIds: previewDataParams.variantIds?.split(','),
    });
    _res.headers.append('Set-Cookie', previewDataCookies);

    // Set Preview mode identifier cookie, if the page is rendered in Sitecore Preview mode
    if (mode === LayoutServicePageState.Preview) {
      const previewCookies = getPreviewCookies(query.sc_site as string);

      previewCookies.forEach((cookie) => {
        _res.headers.append('Set-Cookie', cookie);
      });
    }

    // Restrict the page to be rendered only within the allowed origins
    _res.headers.append('Content-Security-Policy', getCSPHeader());

    const encodedRoute = encodeURI(query.route);
    const route = this.config?.resolvePageUrl?.(encodedRoute) || encodedRoute;

    const base = this.config?.sitecoreInternalEditingHostUrl || resolveServerUrl(_req);
    const requestUrl = new URL(route, base);

    // Grab the preview cookies to send on to the render request
    const cookies = _res.headers.getSetCookie();

    // Make actual render request for page route, passing on preview cookies as well as any approved query string parameters.
    // Note timestamp effectively disables caching the request (no amount of cache headers seemed to do it)
    try {
      debug.editing('fetching page route for %s', query.route);

      // Get query string parameters to propagate on subsequent requests (e.g. for deployment protection bypass)
      const propagatedQsParams = getQueryParamsForPropagation(query as { [key: string]: string });

      // Get headers to propagate on subsequent requests
      const propagatedHeaders = getHeadersForPropagation(headers);

      const html = await getEditingRequestHtml(
        requestUrl,
        propagatedQsParams,
        propagatedHeaders,
        cookies,
        this.dataFetcher
      );

      // remove preview cookies to not leak them to the browser
      if (cookies && Array.isArray(cookies)) {
        const filteredCookies = cleanupPreviewCookies(cookies);
        _res.headers.delete('Set-Cookie');
        filteredCookies?.forEach((cookie) => {
          _res.headers.append('Set-Cookie', cookie);
        });
      }

      debug.editing('editing render middleware end in %dms: %o', Date.now() - startTimestamp, {
        status: 200,
        route,
      });

      _res.headers.set('Content-Type', 'text/html; charset=utf-8');

      return new Response(html, {
        status: 200,
        headers: _res.headers,
      });
    } catch (err) {
      const error = err as Record<string, unknown>;

      console.error(error);

      if (error.response) {
        console.info(
          // eslint-disable-next-line quotes
          "Hint: for non-standard server or Next.js route configurations, you may need to override 'resolvePageUrl' or set the 'sitecoreInternalEditingHostUrl' (or SITECORE_INTERNAL_EDITING_HOST_URL env variable) available on the 'EditingRenderMiddleware' config."
        );
      }

      // remove preview cookies to not leak them to the browser
      const filteredCookies = cleanupPreviewCookies(cookies);
      _res.headers.delete('Set-Cookie');
      filteredCookies?.forEach((cookie) => {
        _res.headers.append('Set-Cookie', cookie);
      });

      return new Response(`<html><body>${error}</body></html>`, {
        status: 500,
        headers: _res.headers,
      });
    }
  };
}
