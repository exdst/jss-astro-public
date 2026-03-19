import {
  SitecoreClient,
  SitemapXmlOptions,
} from '@sitecore-content-sdk/core/client';
import { SiteInfo, SiteResolver } from '../site';

/**
 * Middleware for handling sitemap requests.
 * Encapsulates all HTTP-related logic for sitemap generation and delivery.
 * @public
 */
export class SitemapMiddleware {
  private client: SitecoreClient;
  private siteResolver: SiteResolver;

  constructor(client: SitecoreClient, sites: SiteInfo[]) {
    this.client = client;
    this.siteResolver = new SiteResolver(sites);
  }

  getHandler() {
    return this.handler.bind(this);
  }

  private async handler(_req: Request): Promise<Response> {
    const url = new URL(_req.url.toLowerCase());

    const segments = url.pathname.split('/');
    const idMatch = segments[1].match(/(\d+)(?=\.xml$)/);
    const id = idMatch ? idMatch[1] : '';

    const reqHost = _req.headers.get('x-forwarded-host') || _req.headers.get('host') || '';
    const reqProtocol = _req.headers.get('x-forwarded-proto') || 'https';
    const site = this.siteResolver.getByHost(reqHost);

    const options: SitemapXmlOptions = {
      reqHost,
      reqProtocol,
      id,
      siteName: site.name,
    };

    try {
      const xmlContent = await this.client.getSiteMap(options);

      return new Response(xmlContent, {
        headers: {
          'Content-Type': 'text/xml;charset=utf-8',
        },
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'REDIRECT_404') {
        return new Response(null, {
          status: 302,
          headers: {
            location: '/404',
          },
        });
      } else {
        return new Response('Internal Server Error', {
          status: 500,
        });
      }
    }
  }
}
