import type { APIRoute } from 'astro';
import config from 'sitecore.config';

// Proxy media requests to the Sitecore host without a client-side redirect.
// When IncludeServerURLinMediaURLs is disabled, Sitecore returns relative media URLs
// (for example `/-/media/...`). We forward those requests to the Sitecore host so media still loads correctly.
// Astro does not provide a rewrite rules config, so we handle this with a route-level proxy.
export const GET: APIRoute = async ({ url }) => {
  const target = new URL(
    `${config.api.local.apiHost || process.env.PUBLIC_SITECORE_API_HOST || ''}${url.pathname}${url.search}`
  );

  const upstream = await fetch(new Request(target.toString()));

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: upstream.headers,
  });
};
