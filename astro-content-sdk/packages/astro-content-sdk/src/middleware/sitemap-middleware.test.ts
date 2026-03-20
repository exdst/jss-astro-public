/* eslint-disable no-unused-expressions, @typescript-eslint/no-unused-expressions */
import * as chai from 'chai';
import { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { SitemapMiddleware } from './sitemap-middleware';
import { SitecoreClient } from '@sitecore-content-sdk/content/client';
import { constants } from '@sitecore-content-sdk/core';
import { mockRequest } from '../test-data/helpers';

const { ERROR_MESSAGES } = constants;

chai.use(sinonChai);

describe('SitemapMiddleware', () => {
  const sandbox = sinon.createSandbox();
  let sitecoreClientStub: sinon.SinonStubbedInstance<SitecoreClient>;
  let middleware: SitemapMiddleware;
  let req: Partial<Request>;
  let siteResolverStub = {
    getByHost: sandbox.stub(),
    getByName: sandbox.stub(),
  };

  const sites = [
    { name: 'test-site', hostName: 'example.com', language: 'en' },
    { name: 'test-site-two', hostName: '*', language: 'da' },
  ];

  beforeEach(() => {
    sitecoreClientStub = sandbox.createStubInstance(SitecoreClient);

    req = mockRequest({
      headers: {
        host: 'example.com',
        'x-forwarded-proto': 'https',
      },
    });

    siteResolverStub = {
      getByHost: sandbox.stub(),
      getByName: sandbox.stub(),
    };

    middleware = new SitemapMiddleware(sitecoreClientStub as unknown as SitecoreClient, sites);
    (middleware as any).siteResolver = siteResolverStub;
    siteResolverStub.getByHost.callsFake((hostName) =>
      sites.find((site) => site.hostName === hostName)
    );
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('getHandler', () => {
    it('should return a handler function', () => {
      const handler = middleware.getHandler();
      expect(handler).to.be.a('function');
    });
  });

  describe('handler', () => {
    it('should process sitemap request without id parameter', async () => {
      const siteName = sites[0].name;
      const xmlContent = '<sitemapindex>...</sitemapindex>';

      sitecoreClientStub.getSiteMap.resolves(xmlContent);

      const res = await middleware.getHandler()(req as Request);

      expect(sitecoreClientStub.getSiteMap.calledOnce).to.be.true;
      expect(sitecoreClientStub.getSiteMap.firstCall.args[0]).to.deep.include({
        reqHost: 'example.com',
        reqProtocol: 'https',
        id: '',
        siteName: siteName,
      });

      expect(res.headers.get('Content-Type')).to.equal('text/xml;charset=utf-8');

      const body = await res.text();
      expect(body).to.deep.equal(xmlContent);
    });

    it('should handle sitemap request with specific id parameter', async () => {
      const sitemapId = '1';
      req = mockRequest({
        url: `https://test.com/sitemap-${sitemapId}.xml`,
        headers: {
          host: 'example.com',
          'x-forwarded-proto': 'https',
        },
      });
      const siteName = sites[0].name;
      const xmlContent = '<urlset>...</urlset>';

      sitecoreClientStub.getSiteMap.resolves(xmlContent);

      const res = await middleware.getHandler()(req as Request);

      expect(sitecoreClientStub.getSiteMap.firstCall.args[0]).to.deep.include({
        reqHost: 'example.com',
        reqProtocol: 'https',
        id: sitemapId,
        siteName: siteName,
      });

      const body = await res.text();
      expect(body).to.deep.equal(xmlContent);
    });

    it('should default to https protocol when x-forwarded-proto header is missing', async () => {
      req.headers?.delete('x-forwarded-proto');
      const siteName = sites[0].name;
      const xmlContent = '<sitemapindex>...</sitemapindex>';

      sitecoreClientStub.getSiteMap.resolves(xmlContent);

      await middleware.getHandler()(req as Request);

      expect(sitecoreClientStub.getSiteMap.firstCall.args[0]).to.deep.include({
        reqHost: 'example.com',
        reqProtocol: 'https',
        siteName: siteName,
      });
    });

    it('should use x-forwarded-host header when present', async () => {
      req = mockRequest({
        headers: {
          'x-forwarded-host': 'example.com',
          host: 'localhost:3000',
        },
      });

      await middleware.getHandler()(req as Request);

      expect(siteResolverStub.getByHost).to.have.been.calledWith('example.com');
    });

    it('should use empty string when both x-forwarded-host and host headers are missing', async () => {
      req.headers?.delete('host');
      const xmlContent = '<sitemapindex>...</sitemapindex>';

      siteResolverStub.getByHost.withArgs('').returns(sites[1]);

      sitecoreClientStub.getSiteMap.resolves(xmlContent);

      await middleware.getHandler()(req as Request);

      expect(sitecoreClientStub.getSiteMap.firstCall.args[0]).to.deep.include({
        reqHost: '',
        reqProtocol: 'https',
      });
    });

    it('should redirect to 404 when REDIRECT_404 error is thrown', async () => {
      const error = new Error('REDIRECT_404');

      sitecoreClientStub.getSiteMap.rejects(error);

      const res = await middleware.getHandler()(req as Request);

      expect(res.status).to.equal(302);
      expect(res.body).to.equal(null);

      expect(res.headers.has('Location')).to.be.true;
      expect(res.headers.get('Location')).to.equal('/404');
    });

    it('should return 500 error when any other error occurs', async () => {
      const error = new Error('Unexpected error');

      sitecoreClientStub.getSiteMap.rejects(error);

      const res = await middleware.getHandler()(req as Request);

      const body = await res.text();
      expect(res.status).to.equal(500);
      expect(body).to.equal(`Internal Server Error. ${ERROR_MESSAGES.CONTACT_SUPPORT}`);
    });
  });
});
