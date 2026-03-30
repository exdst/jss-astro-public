import { defineMiddleware, sequence } from 'astro/middleware';
import { MultisiteMiddleware } from '@exdst-sitecore-content-sdk/astro/middleware';
import sites from '.sitecore/sites.json';
import scConfig from 'sitecore.config';

const requestFilterMiddleware = defineMiddleware(async (context, next) => {
  <% if (prerender === 'SSG') { -%>
  // Skip the multisite middleware for SSG
  if (context.isPrerendered) {
    context.locals.skipMiddleware = true;
    return next();
  }
  <% } -%>
  /*
   * Match all paths except for:
   * 1. /api routes
   * 2. /sitecore/api (Sitecore API routes)
   * 3. /- (Sitecore media)
   * 4. /healthz (Health check)
   * 5. all root files inside /public
   * 6. Astro files
   */
  const matcher = new RegExp(
    '(api/|healthz|sitecore/api/|-/|_astro|_image|favicon.ico|sc_logo.svg|_site_)'
  );

  const requestUrl = new URL(context.request.url.toLowerCase());
  if (matcher.test(requestUrl.pathname)) {
    context.locals.skipMiddleware = true;
    return next();
  }

  return next();
});

// Instantiate middlewares - they will use Edge config if available, otherwise fall back to local config
const multisite = new MultisiteMiddleware({
  /**
   * List of sites for site resolver to work with
   */
  sites,
  ...scConfig.api.edge,
  ...scConfig.multisite,
  // This function determines if the middleware should be turned off on per-request basis.
  // Certain paths are ignored by default (e.g. files and Next.js API routes), but you may wish to disable more.
  // This is an important performance consideration since Next.js Edge middleware runs on every request.
  skip: () => false,
});

export const onRequest = sequence(requestFilterMiddleware, multisite.handle);
