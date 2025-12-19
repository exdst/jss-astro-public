import { debug, NativeDataFetcher } from '@sitecore-content-sdk/core';
import {
  QUERY_PARAM_EDITING_SECRET,
  EDITING_ALLOWED_ORIGINS,
  DesignLibraryRenderPreviewData,
  isDesignLibraryMode,
  EditingPreviewData,
  PREVIEW_KEY,
} from '@sitecore-content-sdk/core/editing';
import { enforceCors, getEditingSecret } from '../utils';
import { getAllowedOriginsFromEnv } from '@sitecore-content-sdk/core/utils';
import { DEFAULT_VARIANT } from '@sitecore-content-sdk/core/personalize';
import * as cookie from 'cookie';
import { COOKIE_NAME_PRERENDER_DATA } from './constants';
import { LayoutServicePageState } from '@sitecore-content-sdk/core/layout';
import { SITE_KEY } from '@sitecore-content-sdk/core/site';
import { RenderMiddlewareBase } from './render-middleware';
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
   * Gets the Content-Security-Policy header value
   * @returns Content-Security-Policy header value
   */
  private getSCPHeader() {
    return `frame-ancestors 'self' ${[
      ...getAllowedOriginsFromEnv(),
      ...EDITING_ALLOWED_ORIGINS,
    ].join(' ')}`;
  }

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
   * @param {NextApiRequest} req
   */
  private resolveServerUrl = (req: Request) => {
    const internalHostUrl =
      this.config?.sitecoreInternalEditingHostUrl || process.env.SITECORE_INTERNAL_EDITING_HOST_URL;
    if (internalHostUrl) {
      return internalHostUrl;
    }

    // in xmc deployment we always use localhost:3000
    if (process.env.SITECORE) {
      return 'http://localhost:3000';
    }

    // to preserve auth headers, use https if we're in our 3 main hosting options
    const useHttps = (process.env.VERCEL || process.env.NETLIFY) !== undefined;
    // use https for requests with auth but also support unsecured http rendering hosts
    return `${useHttps ? 'https' : 'http'}://${req.headers.get('host')}`;
  };

  /**
   * Gets the preview data cookies string
   * @param {object} data preview data
   * @returns Cookie string with the preview data
   */
  private getPreviewDataCookies = (
    data: EditingPreviewData | DesignLibraryRenderPreviewData
  ): string => {
    return cookie.serialize(
      COOKIE_NAME_PRERENDER_DATA,
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

  private filterPreviewDataCookies = (res: Response) => {
    // remove preview cookies to not leak them to the browser
    const setCookieHeader = res.headers.getSetCookie();
    if (setCookieHeader?.length) {
      // Filter out preview cookies
      const filteredCookies = setCookieHeader.filter(
        (cookie: string) => !/^_preview_data=/.test(cookie)
      );

      res.headers.delete('Set-Cookie');

      for (const cookie of filteredCookies) {
        res.headers.append('Set-Cookie', cookie);
      }
    }
  };

  private handler = async (_req: Request): Promise<Response> => {
    const { method, headers } = _req;
    const url = new URL(_req.url.toLowerCase());
    const query = url.searchParams;

    debug.editing('editing render middleware start: %o', {
      method,
      query,
      headers,
    });

    const _res = new Response();
    _res.headers.append('Content-Type', 'application/json; charset=utf-8');

    if (!enforceCors(_req, _res, EDITING_ALLOWED_ORIGINS)) {
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

    // Validate secret
    const secret = query.get(QUERY_PARAM_EDITING_SECRET);

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

    const mode = query.get('mode');
    const defaultRequiredParams = ['sc_site', 'sc_itemid', 'sc_lang', 'route', 'mode'];

    const componentRequiredParams = [
      'sc_site',
      'sc_itemid',
      'sc_renderingid',
      'sc_uid',
      'sc_lang',
      'mode',
    ];

    const requiredQueryParams = isDesignLibraryMode(mode)
      ? componentRequiredParams
      : defaultRequiredParams;

    const missingQueryParams = requiredQueryParams.filter((param) => !query.get(param));

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

    let previewDataCookies = '';

    if (isDesignLibraryMode(mode)) {
      previewDataCookies = this.getPreviewDataCookies({
        itemId: query.get('sc_itemid'),
        componentUid: query.get('sc_uid'),
        renderingId: query.get('sc_renderingid'),
        language: query.get('sc_lang'),
        site: query.get('sc_site'),
        mode: query.get('mode'),
        dataSourceId: query.get('datasourceid'),
        version: query.get('sc_version'),
        generation: query.get('generation'),
      } as DesignLibraryRenderPreviewData);
    } else {
      previewDataCookies = this.getPreviewDataCookies({
        site: query.get('sc_site'),
        itemId: query.get('sc_itemid'),
        language: query.get('sc_lang'),
        // for sc_variantId we may employ multiple variants (page-layout + component level)
        variantIds: query.get('sc_variant')?.split(',') || [DEFAULT_VARIANT],
        version: query.get('sc_version'),
        mode: query.get('mode'),
        layoutKind: query.get('sc_layoutkind'),
      } as EditingPreviewData);
    }

    _res.headers.append('Set-Cookie', previewDataCookies);

    // Set Preview mode identifier cookie, if the page is rendered in Sitecore Preview mode
    if (mode === LayoutServicePageState.Preview) {
      const previewSite = `${SITE_KEY}=${query.get(
        'sc_site'
      )}; Path=/; HttpOnly; SameSite=None; Secure`;
      const previewCookie = `${PREVIEW_KEY}=true; Path=/; HttpOnly; SameSite=None; Secure`;

      _res.headers.append('Set-Cookie', previewSite);
      _res.headers.append('Set-Cookie', previewCookie);
    }

    // Restrict the page to be rendered only within the allowed origins
    _res.headers.append('Content-Security-Policy', this.getSCPHeader());

    const encodedRoute = encodeURI(query.get('route') ?? '/');
    const route = this.config?.resolvePageUrl?.(encodedRoute) || encodedRoute;

    const base = this.resolveServerUrl(_req);
    const requestUrl = new URL(route, base);

    // Get query string parameters to propagate on subsequent requests (e.g. for deployment protection bypass)
    const params = this.getQueryParamsForPropagation(query);

    // Get headers to propagate on subsequent requests
    const propagatedHeaders = this.getHeadersForPropagation(headers);

    // Grab the preview cookies to send on to the render request
    const cookies = _res.headers.get('Set-Cookie') || '';
    propagatedHeaders.append('cookie', cookies);

    // Make actual render request for page route, passing on preview cookies as well as any approved query string parameters.
    // Note timestamp effectively disables caching the request (no amount of cache headers seemed to do it)
    params.forEach((value, key) => {
      requestUrl.searchParams.append(key, value);
    });
    requestUrl.searchParams.append('timestamp', Date.now().toString());

    try {
      debug.editing('fetching page route for %s', query.get('route'));

      const pageRes = await this.dataFetcher
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
        throw new Error(`Failed to render html for ${query.get('route')}`);
      }

      // replace phkey attribute with key attribute so that newly added renderings
      // show correct placeholders, so save and refresh won't be needed after adding each rendering
      html = html.replace(new RegExp('phkey', 'g'), 'key');

      // remove preview cookies to not leak them to the browser
      this.filterPreviewDataCookies(_res);

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
      this.filterPreviewDataCookies(_res);

      return new Response(`<html><body>${error}</body></html>`, {
        status: 500,
        headers: _res.headers,
      });
    }
  };
}
