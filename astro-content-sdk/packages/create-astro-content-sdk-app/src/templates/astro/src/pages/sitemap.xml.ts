import type { APIContext, APIRoute } from 'astro';
import { SitemapMiddleware } from '@exdst-sitecore-content-sdk/astro/middleware';
import scClient from 'lib/sitecore-client';
import sites from '.sitecore/sites.json';

/**
 * API route for generating sitemap.xml
 *
 * This API route dynamically generates and serves the sitemap XML for your site.
 * The sitemap configuration can be managed within XM Cloud.
 */

export const GET: APIRoute = async ({ request }: APIContext) => {
  // Wire up the SitemapMiddleware handler
  const handler = new SitemapMiddleware(scClient, sites).getHandler();
  return await handler(request);
};
