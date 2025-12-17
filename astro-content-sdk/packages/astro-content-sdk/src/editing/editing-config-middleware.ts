import {
  EDITING_ALLOWED_ORIGINS,
  QUERY_PARAM_EDITING_SECRET,
} from '@sitecore-content-sdk/core/editing';
import { debug } from '@sitecore-content-sdk/core';
import { Metadata } from '@sitecore-content-sdk/core/editing';
import { EditMode } from '@sitecore-content-sdk/core/layout';
import { enforceCors, getEditingSecret } from '../utils';
import {
  AstroContentSdkComponent,
  ComponentMap,
} from '../sharedTypes/component-props';

export type EditingConfigMiddlewareConfig = {
  /**
   * Components available in the application
   */
  components: ComponentMap<AstroContentSdkComponent>;
  /**
   * Application metadata
   */
  metadata: Metadata;
};

/**
 * Middleware / handler used in the editing config API route in xmcloud add on (e.g. '/api/editing/config')
 * provides configuration information to determine feature compatibility on Pages side.
 */
export class EditingConfigMiddleware {
  /**
   * @param {EditingConfigMiddlewareConfig} [config] Editing configuration middleware config
   */
  constructor(protected config: EditingConfigMiddlewareConfig) {}

  /**
   * Gets the API route handler
   * @returns middleware handler
   */
  public getHandler(): (req: Request) => Promise<Response> {
    return this.handler;
  }

  private handler = async (_req: Request): Promise<Response> => {
    const url = new URL(_req.url.toLowerCase());
    const secret = url.searchParams.get(QUERY_PARAM_EDITING_SECRET);

    const _res = new Response();
    _res.headers.append('content-type', 'application/json; charset=utf-8');

    if (!enforceCors(_req, _res, EDITING_ALLOWED_ORIGINS)) {
      debug.editing(
        'invalid origin host - set allowed origins in JSS_ALLOWED_ORIGINS environment variable'
      );

      return new Response(
        JSON.stringify({
          message: 'Invalid origin',
        }),
        {
          status: 401,
        }
      );
    }

    if (secret !== getEditingSecret()) {
      debug.editing(
        'invalid editing secret - sent "%s" expected "%s"',
        secret,
        getEditingSecret()
      );

      return new Response(
        JSON.stringify({
          message: 'Missing or invalid editing secret',
        }),
        {
          status: 401,
          headers: _res.headers,
        }
      );
    }

    // Handle preflight request
    if (_req.method === 'OPTIONS') {
      debug.editing('preflight request');

      // CORS headers are set by enforceCors
      return new Response(null, {
        status: 204,
        headers: _res.headers,
      });
    }

    const components = Array.from(this.config.components.keys());

    return new Response(
      JSON.stringify({
        components,
        packages: this.config.metadata.packages,
        editMode: EditMode.Metadata,
      }),
      {
        headers: _res.headers,
      }
    );
  };
}
