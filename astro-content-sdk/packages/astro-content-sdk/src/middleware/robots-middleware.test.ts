import * as chai from 'chai';
import { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { RobotsMiddleware } from './robots-middleware';
import { SitecoreClient } from '@sitecore-content-sdk/content/client';
import { SiteInfo } from '@sitecore-content-sdk/content/site';
import { mockRequest } from '../test-data/helpers';
import { constants } from '@sitecore-content-sdk/core';

const { ERROR_MESSAGES } = constants;

chai.use(sinonChai);

describe('RobotsMiddleware', () => {
  const sandbox = sinon.createSandbox();
  let sitecoreClientStub: sinon.SinonStubbedInstance<SitecoreClient>;
  let middleware: RobotsMiddleware;
  let req: Partial<Request>;
  let siteResolverStub = {
    getByHost: sandbox.stub(),
    getByName: sandbox.stub(),
  };

  const mockSiteInfo: SiteInfo = {
    name: 'test-site',
    hostName: 'example.com',
    language: 'en',
  };

  const sites = [mockSiteInfo, { name: 'test-site-two', hostName: 'localhost', language: 'da' }];

  beforeEach(() => {
    sitecoreClientStub = sandbox.createStubInstance(SitecoreClient);
    siteResolverStub = {
      getByHost: sandbox.stub(),
      getByName: sandbox.stub(),
    };

    req = mockRequest({
      headers: {
        host: 'example.com',
      },
    });

    middleware = new RobotsMiddleware(sitecoreClientStub as unknown as SitecoreClient, sites);
    (middleware as any).siteResolver = siteResolverStub;
    siteResolverStub.getByHost.callsFake((hostName) =>
      sites.find((site) => site.hostName === hostName)
    );
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should set the content type header to text/plain', async () => {
    sitecoreClientStub.getRobots.resolves('User-agent: *\nDisallow: /');

    const res = await middleware.getHandler()(req as Request);

    expect(res.headers.get('Content-Type')).to.equal('text/plain');
  });

  it('should call getRobots with the correct siteName', async () => {
    sitecoreClientStub.getRobots.resolves('User-agent: *\nDisallow: /');

    await middleware.getHandler()(req as Request);

    expect(sitecoreClientStub.getRobots).to.have.been.calledWith('test-site');
  });

  it('should return 200 with robots content', async () => {
    sitecoreClientStub.getRobots.resolves('User-agent: *\nDisallow: /');

    const res = await middleware.getHandler()(req as Request);

    const body = await res.text();
    expect(res.status).to.equal(200);
    expect(body).to.deep.equal('User-agent: *\nDisallow: /');
  });

  it('should return 404 if getRobots returns null', async () => {
    sitecoreClientStub.getRobots.resolves(undefined);

    const res = await middleware.getHandler()(req as Request);

    const body = await res.text();
    expect(res.status).to.equal(404);
    expect(body).to.deep.equal('User-agent: *\nDisallow: /');
  });

  it('should return 500 if getRobots throws an error', async () => {
    sitecoreClientStub.getRobots.rejects(new Error('Unexpected failure'));

    const res = await middleware.getHandler()(req as Request);

    const body = await res.text();
    expect(res.status).to.equal(500);
    expect(body).to.deep.equal(`Internal Server Error. ${ERROR_MESSAGES.CONTACT_SUPPORT}`);
  });

  it('should use "localhost" as fallback when host header is missing', async () => {
    req = new Request('https://test.com'); // no host header

    sitecoreClientStub.getRobots.resolves('User-agent: *\nDisallow: /');

    const res = await middleware.getHandler()(req as Request);

    expect(sitecoreClientStub.getRobots).to.have.been.calledWith('test-site-two');

    const body = await res.text();
    expect(res.status).to.equal(200);
    expect(body).to.deep.equal('User-agent: *\nDisallow: /');
  });

  it('should use x-forwarded-host header when present', async () => {
    req = mockRequest({
      headers: {
        'x-forwarded-host': 'proxy.forwarded.com',
        host: 'localhost:3000',
      },
    });

    await middleware.getHandler()(req as Request);

    expect(siteResolverStub.getByHost).to.have.been.calledWith('proxy.forwarded.com');
  });
});
