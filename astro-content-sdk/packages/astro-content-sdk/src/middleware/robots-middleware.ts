import { SitecoreClient } from '@sitecore-content-sdk/core/client';
import { SiteInfo, SiteResolver } from '../site';

/**
 * Middleware for handling robots.txt requests.
 * @public
 */
export class RobotsMiddleware {
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
    const _res = new Response();
    _res.headers.append('content-type', 'text/plain');

    const hostName = _req.headers.get('host')?.split(':')[0] || 'localhost';
    const site = this.siteResolver.getByHost(hostName);

    try {
      const robotsContent = await this.client.getRobots(site.name);
      if (!robotsContent) {
        return new Response('User-agent: *\nDisallow: /', {
          status: 404,
          headers: _res.headers,
        });
      }

      return new Response(robotsContent, {
        status: 200,
        headers: _res.headers,
      });
    } catch {
      return new Response('Internal Server Error', {
        status: 500,
        headers: _res.headers,
      });
    }
  }
}
