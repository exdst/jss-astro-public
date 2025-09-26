import {
  SITE_KEY,
  SiteInfo,
  SiteResolver,
} from '@sitecore-content-sdk/core/site';
import { debug, GraphQLRequestClientFactory } from '@sitecore-content-sdk/core';
import {
  createGraphQLClientFactory,
  GraphQLClientOptions,
} from '@sitecore-content-sdk/core/client';
import { COOKIE_NAME_PRERENDER_DATA } from '../editing';
import { APIContext, MiddlewareNext } from 'astro';
import * as cookie from 'cookie';

export const REWRITE_HEADER_NAME = 'x-sc-rewrite';

export type MiddlewareBaseConfig = {
  /**
   * function, determines if middleware execution should be skipped, based on cookie, header, or other considerations
   * @param {APIContext} context the Astro context
   * @param {Response} res response object from middleware handler
   */
  skip?: (context: APIContext, res: Response) => boolean;
  /**
   * Fallback hostname in case `host` header is not present
   * @default localhost
   */
  defaultHostname?: string;
  /**
   * Fallback language in locale cannot be extracted from request URL
   * @default 'en'
   */
  defaultLanguage?: string;
  /**
   * Site resolution implementation by name/hostname
   */
  sites: SiteInfo[];
};

/**
 * Middleware class to be extended by all middleware implementations
 */
export abstract class Middleware {
  /**
   * Handler method to execute middleware logic
   * @param {APIContext} context context
   * @param {Response} res response
   * @param {MiddlewareNext} next MiddlewareNext
   */
  abstract handle(
    context: APIContext,
    res: Response,
    next: MiddlewareNext
  ): Promise<Response>;
}

/**
 * Base middleware class with common methods
 */
export abstract class MiddlewareBase extends Middleware {
  protected defaultHostname: string;
  protected siteResolver: SiteResolver;

  constructor(protected config: MiddlewareBaseConfig) {
    super();
    this.siteResolver = new SiteResolver(config.sites);
    this.defaultHostname = config.defaultHostname || 'localhost';
  }

  /**
   * Determines if mode is preview
   * @param {APIContext} context Astro context
   * @returns {boolean} is preview
   */
  protected isPreview(context: APIContext) {
    return !!context.cookies.get(COOKIE_NAME_PRERENDER_DATA);
  }

  protected disabled(context: APIContext, res: Response) {
    const { pathname } = context.url;

    return (
      pathname.startsWith('/api/') || // Ignore API calls
      pathname.startsWith('/sitecore/') || // Ignore Sitecore API calls
      (this.config.skip && this.config.skip(context, res))
    );
  }

  /**
   * Safely extract all headers for debug logging
   * Necessary to avoid middleware issue https://github.com/vercel/next.js/issues/39765
   * @param {Headers} incomingHeaders Incoming headers
   * @returns Object with headers as key/value pairs
   */
  protected extractDebugHeaders(incomingHeaders: Headers) {
    const headers = {} as { [key: string]: string };
    incomingHeaders.forEach((value, key) => (headers[key] = value));
    return headers;
  }

  /**
   * Provides used language
   * @param {APIContext} context Astro context
   * @returns {string} language
   */
  protected getLanguage(context: APIContext) {
    return (
      context.currentLocale ||
      context.preferredLocale ||
      this.config.defaultLanguage ||
      'en'
    );
  }

  /**
   * Extract 'host' header
   * @param {APIContext} context Astro context
   */
  protected getHostHeader(context: APIContext) {
    return context.request.headers.get('host')?.split(':')[0];
  }

  /**
   * Get site information. If site name is stored in cookie, use it, otherwise resolve by hostname
   * - If site can't be resolved by site name cookie use default site info based on provided parameters
   * - If site can't be resolved by hostname throw an error
   * @param {APIContext} context Astro context
   * @param {Response} [res] response
   * @returns {SiteInfo} site information
   */
  protected getSite(context: APIContext, res?: Response): SiteInfo {
    const siteNameCookie = cookie.parse(res?.headers.get('Set-Cookie') || '')[
      SITE_KEY
    ];
    const hostname = this.getHostHeader(context) || this.defaultHostname;

    if (siteNameCookie) {
      // Usually we should be able to resolve site by cookie
      // in case of Sitecore Preview mode, there can be a case that new site was created
      // but it's not present in the sitemap, so we fallback to default site info
      return (
        this.siteResolver.getByName(siteNameCookie) || {
          name: siteNameCookie,
          language: this.getLanguage(context),
          hostName: '*',
        }
      );
    }

    return this.siteResolver.getByHost(hostname);
  }

  protected getClientFactory(
    graphQLOptions: GraphQLClientOptions
  ): GraphQLRequestClientFactory {
    return createGraphQLClientFactory(graphQLOptions);
  }

  /**
   * Create a rewrite response
   * @param {string} rewritePath the destionation path
   * @param {MiddlewareNext} next the middleware object to execute rewrite
   * @param {boolean} [skipHeader] don't write 'x-sc-rewrite' header
   */
  protected async rewrite(
    rewritePath: string,
    context: APIContext,
    next: MiddlewareNext,
    skipHeader?: boolean
  ): Promise<Response> {
    const url = new URL(context.url);
    url.pathname = rewritePath;
    const response = await next(url);

    // Share rewrite path with following executed middlewares
    if (!skipHeader) {
      response.headers.append(REWRITE_HEADER_NAME, rewritePath);
    }

    return response;
  }
}

/**
 * Define a middleware with a list of middlewares
 * @param {Middleware[]} middlewares List of middlewares to execute
 */
export const defineMiddleware = (...middlewares: Middleware[]) => {
  return {
    /**
     * Execute all middlewares
     * @param {APIContext} context the Astro context
     * @param {MiddlewareNext} next the middleware object
     * @param {NextResponse} [res] response
     */
    exec: async (context: APIContext, next: MiddlewareNext, res?: Response) => {
      const response = res || next();

      debug.common('middleware start');

      const start = Date.now();

      const middlewareResponse = await middlewares.reduce(
        (p, middleware) =>
          p.then((res) => middleware.handle(context, res, next)),
        Promise.resolve(response)
      );

      debug.common('middleware end in %dms', Date.now() - start);

      return middlewareResponse;
    },
  };
};
