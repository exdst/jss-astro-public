import type { APIContext, APIRoute } from 'astro';
import { RobotsMiddleware } from '@exdst-sitecore-content-sdk/astro/middleware';
import scClient from 'lib/sitecore-client';
import sites from '.sitecore/sites.json';

/**
 * API route for serving robots.txt
 *
 * This API route generates and returns the robots.txt content dynamically
 * based on the resolved site name. It is commonly
 * used by search engine crawlers to determine crawl and indexing rules.
 */

export const GET: APIRoute = async ({ request }: APIContext) => {
  // Wire up the RobotsMiddleware handler
  const handler = new RobotsMiddleware(scClient, sites).getHandler();
  return await handler(request);
};
