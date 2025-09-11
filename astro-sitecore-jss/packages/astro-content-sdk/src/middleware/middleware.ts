import {
  SITE_KEY,
  SiteInfo,
  SiteResolver,
} from '@sitecore-content-sdk/core/site';
import { GraphQLRequestClientFactory } from '@sitecore-content-sdk/core';
import {
  createGraphQLClientFactory,
  GraphQLClientOptions,
} from '@sitecore-content-sdk/core/client';
import { COOKIE_NAME_PRERENDER_DATA } from '../editing';
import { APIContext, MiddlewareNext } from 'astro';

export const REWRITE_HEADER_NAME = 'x-sc-rewrite';

export type MiddlewareBaseConfig = {
  /**
   * function, determines if middleware execution should be skipped, based on cookie, header, or other considerations
   * @param {NextRequest} req request object from middleware handler
   */
  skip?: (context: APIContext) => boolean;
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
   * @param {MiddlewareNext} next next middleware
   */
  abstract handle(context: APIContext, next: MiddlewareNext): Promise<Response>;
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

  protected disabled(context: APIContext) {
    const { pathname } = context.url;

    return (
      pathname.startsWith('/api/') || // Ignore API calls
      pathname.startsWith('/sitecore/') || // Ignore Sitecore API calls
      (this.config.skip && this.config.skip(context))
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
  protected getSite(context: APIContext): SiteInfo {
    const siteNameCookie = context?.cookies.get(SITE_KEY)?.value;
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
   * Write rewrite header if not skipped
   * @param {string} rewritePath the destionation path
   * @param {APIContext} context Astro context
   * @param {boolean} [skipHeader] don't write 'x-sc-rewrite' header
   */
  protected rewrite(
    rewritePath: string,
    context: APIContext,
    skipHeader?: boolean
  ) {
    // Share rewrite path with following executed middlewares
    if (!skipHeader) {
      //response.headers.set(REWRITE_HEADER_NAME, rewritePath);
      context.request.headers.append(REWRITE_HEADER_NAME, rewritePath);
    }
  }
}
