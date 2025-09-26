/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
import { getSiteRewrite, SITE_KEY } from '@sitecore-content-sdk/core/site';
import { debug } from '@sitecore-content-sdk/core';
import { MiddlewareBase, MiddlewareBaseConfig } from './middleware';
import { SitecoreConfig } from '../config';
import { PREVIEW_KEY } from '@sitecore-content-sdk/core/editing';
import { APIContext, MiddlewareNext } from 'astro';
import * as cookie from 'cookie';

export type CookieAttributes = {
  /**
   * the Secure attribute of the site cookie
   */
  secure: boolean;
  /**
   * the HttpOnly attribute of the site cookie
   */
  httpOnly: boolean;
  /**
   * the SameSite attribute of the site cookie
   */
  sameSite?: true | false | 'lax' | 'strict' | 'none' | undefined;
};

export type MultisiteMiddlewareConfig = MiddlewareBaseConfig &
  SitecoreConfig['multisite'];

/**
 * Middleware / handler for multisite support
 */
export class MultisiteMiddleware extends MiddlewareBase {
  /**
   * @param {MultisiteMiddlewareConfig} [config] Multisite middleware config
   */
  constructor(protected config: MultisiteMiddlewareConfig) {
    super(config);
  }

  handle = async (context: APIContext, res: Response, next: MiddlewareNext): Promise<Response> => {
    if (!this.config.enabled) {
      debug.multisite('skipped (multisite middleware is disabled globally)');
      return res;
    }
    try {
      const pathname = context.url.pathname;
      const language = this.getLanguage(context);
      const hostname = this.getHostHeader(context) || this.defaultHostname;
      const startTimestamp = Date.now();

      debug.multisite('multisite middleware start: %o', {
        pathname,
        language,
        hostname,
      });

      if (this.disabled(context, res)) {
        debug.multisite('skipped (multisite middleware is disabled)');

        return res;
      }

      if (this.isPreview(context)) {
        debug.multisite('skipped (preview)');

        return res;
      }

      let siteName: string;

      const isSitecorePreview = context.cookies.get(PREVIEW_KEY)?.value;

      if (isSitecorePreview) {
        // This cookie is required to be set in the Sitecore Preview mode
        siteName = context.cookies.get(SITE_KEY)?.value!;
      } else {
        // Site name can be forced by query string parameter or cookie
        siteName =
          context.url.searchParams.get(SITE_KEY) ||
          (this.config.useCookieResolution &&
            this.config.useCookieResolution(context.request) &&
            context.cookies.get(SITE_KEY)?.value) ||
          this.siteResolver.getByHost(hostname).name;
      }

      // Rewrite to site specific path
      const rewritePath = getSiteRewrite(pathname, {
        siteName,
      });

      // Set rewrite header
      const response = await this.rewrite(rewritePath, context, next);

      // default site cookie attributes
      const defaultCookieAttributes = {
        secure: true,
        httpOnly: true,
        sameSite: 'none',
      } as CookieAttributes;

      // Share site name with the following executed middlewares
      response.headers.append(
        'Set-Cookie',
        cookie.serialize(SITE_KEY, siteName, defaultCookieAttributes)
      );

      debug.multisite(
        'multisite middleware end in %dms: %o',
        Date.now() - startTimestamp,
        {
          rewritePath,
          siteName,
          headers: this.extractDebugHeaders(response.headers),
          cookies: response.headers.get('Set-Cookie'),
        }
      );

      return response;
    } catch (error) {
      console.log('Multisite middleware failed:');
      console.log(error);
      return res;
    }
  };

  protected disabled(context: APIContext, res: Response): boolean | undefined {
    // ignore files
    return context.url.pathname.includes('.') || super.disabled(context, res);
  }
}
