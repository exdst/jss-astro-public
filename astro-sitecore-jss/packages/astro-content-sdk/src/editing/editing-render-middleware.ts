import { debug } from '@sitecore-content-sdk/core';
import {
  QUERY_PARAM_EDITING_SECRET,
  EDITING_ALLOWED_ORIGINS,
  DesignLibraryRenderPreviewData,
  isDesignLibraryMode,
  EditingPreviewData,
} from '@sitecore-content-sdk/core/editing';
import { enforceCors, getEditingSecret } from '../utils';
import { getAllowedOriginsFromEnv } from '@sitecore-content-sdk/core/utils';
import { DEFAULT_VARIANT } from '@sitecore-content-sdk/core/personalize';
import * as cookie from 'cookie';
import { COOKIE_NAME_PRERENDER_DATA } from './constants';
/**
 * Configuration for the Editing Render Middleware.
 */
export type EditingRenderMiddlewareConfig = {
  /**
   * Function used to determine route/page URL to render.
   * This may be necessary for certain custom Next.js routing configurations.
   * @param {string} itemPath The Sitecore relative item path e.g. '/styleguide'
   * @returns {string} The URL to render
   * @default `${itemPath}`
   */
  resolvePageUrl?: (itemPath: string) => string;
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
export class EditingRenderMiddleware {
  /**
   * @param {EditingRenderMiddlewareConfig} [config] Editing render middleware config
   */
  constructor(public config?: EditingRenderMiddlewareConfig) {}

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
   * Gets the preview data cookies string
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

  private handler = async (_req: Request): Promise<Response> => {
    const { method, headers } = _req;
    //const body = await request.json();
    const url = new URL(_req.url.toLowerCase());
    const query = url.searchParams;

    debug.editing('editing render middleware start: %o', {
      method,
      query,
      headers,
      //body,
    });

    const _res = new Response();
    _res.headers.append('content-type', 'application/json; charset=utf-8');

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
        }
      );
    }

    // Validate secret
    const secret = query.get(QUERY_PARAM_EDITING_SECRET);

    if (secret !== getEditingSecret()) {
      debug.editing(
        'invalid editing secret - sent "%s" expected "%s"',
        secret,
        getEditingSecret()
      );

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
    const defaultRequiredParams = [
      'sc_site',
      'sc_itemid',
      'sc_lang',
      'route',
      'mode',
    ];

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

    const missingQueryParams = requiredQueryParams.filter(
      (param) => !query.get(param)
    );

    // Validate query parameters
    if (missingQueryParams.length) {
      debug.editing(
        'missing required query parameters: %o',
        missingQueryParams
      );

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

    const route =
      this.config?.resolvePageUrl?.(query.get('route') || '/') ||
      query.get('route');

    debug.editing(
      'editing render middleware end in %dms: redirect %o',
      Date.now() - startTimestamp,
      {
        status: 307,
        route,
      }
    );

    // Restrict the page to be rendered only within the allowed origins
    _res.headers.append('Content-Security-Policy', this.getSCPHeader());
    _res.headers.append('Location', route ?? '/');
    _res.headers.append('Set-Cookie', previewDataCookies);

    return new Response(null, {
      status: 307,
      headers: _res.headers,
    });
  };
}
