/* eslint-disable dot-notation */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { expect, use } from 'chai';
import {
  EDITING_ALLOWED_ORIGINS,
  QUERY_PARAM_EDITING_SECRET,
  EditingRenderQueryParams,
  DesignLibraryMode,
} from '@sitecore-content-sdk/core/editing';
import { EditingRenderMiddleware } from './editing-render-middleware';
import sinonChai from 'sinon-chai';
import sinon from 'sinon';
import { mockRequest as MockRequest, Query } from '../test-data/helpers';
import {
  QUERY_PARAM_VERCEL_PROTECTION_BYPASS,
  QUERY_PARAM_VERCEL_SET_BYPASS_COOKIE,
} from './constants';

use(sinonChai);

const mockPreviewCookies =
  '_preview_data=1122334455; Max-Age=3; Path=/; HttpOnly; Secure; SameSite=None';

const allowedOrigin = 'https://allowed.com';

const mockRequest = ({
  query,
  method,
  headers,
}: {
  query?: Query | EditingRenderQueryParams;
  method?: string;
  headers?: { [key: string]: string };
}) => {
  return MockRequest({
    query: query ? toQuery(query) : query,
    method: method ?? 'GET',
    headers: {
      host: 'localhost:3000',
      origin: allowedOrigin,
      ...headers,
    },
  });
};

const toQuery = (params: Query | EditingRenderQueryParams): Query => {
  const query: Query = {};

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      query[key] = String(value);
    }
  });

  return query;
};

describe('EditingRenderMiddleware', () => {
  const secret = 'secret1234';

  beforeEach(() => {
    process.env.SITECORE_EDITING_SECRET = secret;
    process.env.JSS_ALLOWED_ORIGINS = allowedOrigin;
    delete process.env.VERCEL;
  });

  afterEach(() => {
    delete process.env.SITECORE_EDITING_SECRET;
    delete process.env.VERCEL;
    delete process.env.JSS_ALLOWED_ORIGINS;
  });

  it('should respond with 405 for unsupported method', async () => {
    const query = {} as Query;
    query[QUERY_PARAM_EDITING_SECRET] = secret;
    const req = mockRequest({
      query,
      method: 'PUT',
    });

    const middleware = new EditingRenderMiddleware();
    const handler = middleware.getHandler();

    const res = await handler(req);

    expect(res.headers.has('Allow')).to.be.true;
    expect(res.headers.get('Allow')).to.equal('GET');
    expect(res.status).to.equal(405);
  });

  it('should respond with 204 for OPTIONS method', async () => {
    const query = {} as Query;
    query[QUERY_PARAM_EDITING_SECRET] = secret;
    const req = mockRequest({
      query,
      method: 'OPTIONS',
    });

    const middleware = new EditingRenderMiddleware();
    const handler = middleware.getHandler();

    const res = await handler(req);

    expect(res.status).to.equal(204);
    expect(res.body).to.equal(null);

    expect(res.headers.has('Access-Control-Allow-Origin')).to.be.true;
    expect(res.headers.get('Access-Control-Allow-Origin')).to.include(allowedOrigin);

    expect(res.headers.has('Access-Control-Allow-Methods')).to.be.true;
    expect(res.headers.get('Access-Control-Allow-Methods')).to.include(
      'GET, POST, OPTIONS, DELETE, PUT, PATCH'
    );

    expect(res.headers.has('Access-Control-Allow-Headers')).to.be.true;
    expect(res.headers.get('Access-Control-Allow-Headers')).to.include(
      'Content-Type, Authorization'
    );
  });

  it('should respond with 401 for invalid secret', async () => {
    const query = {} as Query;
    query[QUERY_PARAM_EDITING_SECRET] = 'nope';
    const req = mockRequest({
      query,
    });

    const middleware = new EditingRenderMiddleware();
    const handler = middleware.getHandler();

    const res = await handler(req);

    const body = await res.json();

    expect(res.status).to.equal(401);
    expect(body).to.deep.equal({
      html: '<html><body>Missing or invalid secret</body></html>',
    });
  });

  it('should stop request and return 401 when CORS match is not met', async () => {
    const req = mockRequest({
      headers: { origin: 'https://notallowed.com' },
    });
    const middleware = new EditingRenderMiddleware();
    const handler = middleware.getHandler();

    const res = await handler(req);

    const body = await res.json();

    expect(res.status).to.equal(401);
    expect(body).to.deep.equal({
      html: '<html><body>Requests from origin https://notallowed.com not allowed</body></html>',
    });
  });

  it('should respond with 401 for missing secret', async () => {
    const query = {} as Query;
    const req = mockRequest({ query });

    const middleware = new EditingRenderMiddleware();
    const handler = middleware.getHandler();

    const res = await handler(req);

    const body = await res.json();

    expect(res.status).to.equal(401);
    expect(body).to.deep.equal({
      html: '<html><body>Missing or invalid secret</body></html>',
    });
  });

  const query = {
    mode: 'edit',
    route: '/styleguide',
    sc_itemid: '{11111111-1111-1111-1111-111111111111}',
    sc_lang: 'en',
    sc_site: 'website',
    sc_variant: 'dev',
    sc_version: 'latest',
    secret: secret,
    sc_layoutKind: 'shared',
  } as EditingRenderQueryParams;

  it('should handle request', async () => {
    const req = mockRequest({ query });

    const middleware = new EditingRenderMiddleware();

    const getPreviewDataCookiesSpy = sinon.spy(middleware as any, 'getPreviewDataCookies');

    const handler = middleware.getHandler();

    sinon
      .stub(middleware['dataFetcher'], 'get')
      .resolves({ status: 200, statusText: 'success', data: '<div>some html</div>' });
    const res = await handler(req);

    expect(getPreviewDataCookiesSpy).to.have.been.calledWith({
      site: 'website',
      itemId: '{11111111-1111-1111-1111-111111111111}',
      language: 'en',
      variantIds: ['dev'],
      version: 'latest',
      mode: 'edit',
      layoutKind: 'shared',
    });

    const body = await res.text();

    expect(res.status).to.equal(200);
    expect(body).to.equal('<div>some html</div>');

    expect(res.headers.has('Content-Security-Policy')).to.be.true;
    expect(res.headers.get('Content-Security-Policy')).to.equal(
      `frame-ancestors 'self' https://allowed.com ${EDITING_ALLOWED_ORIGINS.join(' ')}`
    );
  });

  it('should pass multiple variant ids into setPreviewData when sc_variantId parameter has many values', async () => {
    const query = {
      mode: 'edit',
      route: '/styleguide',
      sc_itemid: '{11111111-1111-1111-1111-111111111111}',
      sc_lang: 'en',
      sc_site: 'website',
      secret: secret,
      sc_variant: 'id-1,id-2,id-3',
    } as EditingRenderQueryParams;

    const req = mockRequest({ query });

    const middleware = new EditingRenderMiddleware();

    const getPreviewDataCookiesSpy = sinon.spy(middleware as any, 'getPreviewDataCookies');

    const handler = middleware.getHandler();

    sinon
      .stub(middleware['dataFetcher'], 'get')
      .resolves({ status: 200, statusText: 'success', data: '<div>some html</div>' });
    await handler(req);

    expect(getPreviewDataCookiesSpy).to.have.been.calledWith({
      site: 'website',
      itemId: '{11111111-1111-1111-1111-111111111111}',
      language: 'en',
      variantIds: ['id-1', 'id-2', 'id-3'],
      version: undefined,
      mode: 'edit',
      layoutKind: undefined,
    });
  });

  it('should handle request with missing optional parameters', async () => {
    const queryWithoutOptionalParams = {
      mode: 'edit',
      route: '/styleguide',
      sc_itemid: '{11111111-1111-1111-1111-111111111111}',
      sc_lang: 'en',
      sc_site: 'website',
      secret: secret,
    } as EditingRenderQueryParams;
    const req = mockRequest({ query: queryWithoutOptionalParams });

    const middleware = new EditingRenderMiddleware();

    const getPreviewDataCookiesSpy = sinon.spy(middleware as any, 'getPreviewDataCookies');

    const handler = middleware.getHandler();

    sinon
      .stub(middleware['dataFetcher'], 'get')
      .resolves({ status: 200, statusText: 'success', data: '<div>some html</div>' });

    const res = await handler(req);

    expect(getPreviewDataCookiesSpy).to.have.been.calledWith({
      site: 'website',
      itemId: '{11111111-1111-1111-1111-111111111111}',
      language: 'en',
      variantIds: ['_default'],
      version: undefined,
      mode: 'edit',
      layoutKind: undefined,
    });

    const body = await res.text();

    expect(res.status).to.equal(200);
    expect(body).to.equal('<div>some html</div>');

    expect(res.headers.has('Content-Security-Policy')).to.be.true;
    expect(res.headers.get('Content-Security-Policy')).to.equal(
      `frame-ancestors 'self' https://allowed.com ${EDITING_ALLOWED_ORIGINS.join(' ')}`
    );
  });

  it('should use custom resolvePageUrl', async () => {
    const req = mockRequest({ query });

    const middleware = new EditingRenderMiddleware({
      resolvePageUrl: (itemPath) => {
        return `/custom/path${itemPath}`;
      },
    });

    const handler = middleware.getHandler();

    sinon
      .stub(middleware['dataFetcher'], 'get')
      .resolves({ status: 200, statusText: 'success', data: '<div>some html</div>' });

    const getPreviewDataCookiesSpy = sinon.spy(middleware as any, 'getPreviewDataCookies');

    const res = await handler(req);

    expect(getPreviewDataCookiesSpy).to.have.been.calledWith({
      site: 'website',
      itemId: '{11111111-1111-1111-1111-111111111111}',
      language: 'en',
      variantIds: ['dev'],
      version: 'latest',
      mode: 'edit',
      layoutKind: 'shared',
    });

    const body = await res.text();

    expect(res.status).to.equal(200);
    expect(body).to.equal('<div>some html</div>');
  });

  it('should handle request with special characters in route', async () => {
    const query = {
      mode: 'edit',
      route: '/Åbout',
      sc_itemid: '{11111111-1111-1111-1111-111111111111}',
      sc_lang: 'en',
      sc_site: 'website',
      sc_variant: 'dev',
      sc_version: 'latest',
      secret: secret,
      sc_layoutKind: 'shared',
    } as EditingRenderQueryParams;

    const req = mockRequest({ query });

    const middleware = new EditingRenderMiddleware();
    const handler = middleware.getHandler();

    sinon
      .stub(middleware['dataFetcher'], 'get')
      .resolves({ status: 200, statusText: 'success', data: '<div>some html</div>' });

    const getPreviewDataCookiesSpy = sinon.spy(middleware as any, 'getPreviewDataCookies');

    const res = await handler(req);

    expect(getPreviewDataCookiesSpy).to.have.been.calledWith({
      site: 'website',
      itemId: '{11111111-1111-1111-1111-111111111111}',
      language: 'en',
      variantIds: ['dev'],
      version: 'latest',
      mode: 'edit',
      layoutKind: 'shared',
    });

    const body = await res.text();

    expect(res.status).to.equal(200);
    expect(body).to.equal('<div>some html</div>');

    expect(res.headers.has('Content-Security-Policy')).to.be.true;
    expect(res.headers.get('Content-Security-Policy')).to.equal(
      `frame-ancestors 'self' https://allowed.com ${EDITING_ALLOWED_ORIGINS.join(' ')}`
    );
  });

  it('should response with 400 for missing query params', async () => {
    const req = mockRequest({ query: { sc_site: 'website', secret } });

    const middleware = new EditingRenderMiddleware();
    const handler = middleware.getHandler();

    const res = await handler(req);

    const body = await res.json();

    expect(res.status).to.equal(400);
    expect(body).to.deep.equal({
      html: '<html><body>Missing required query parameters: sc_itemid, sc_lang, route, mode</body></html>',
    });
  });

  it('should set allowed origins when multiple allowed origins are provided in env variable', async () => {
    process.env.JSS_ALLOWED_ORIGINS = 'https://allowed.com,https://anotherallowed.com';
    const req = mockRequest({ query });

    const middleware = new EditingRenderMiddleware();
    const handler = middleware.getHandler();

    sinon
      .stub(middleware['dataFetcher'], 'get')
      .resolves({ status: 200, statusText: 'success', data: '<div>some html</div>' });

    const res = await handler(req);

    expect(res.headers.has('Content-Security-Policy')).to.be.true;
    expect(res.headers.get('Content-Security-Policy')).to.equal(
      `frame-ancestors 'self' https://allowed.com https://anotherallowed.com ${EDITING_ALLOWED_ORIGINS.join(
        ' '
      )}`
    );
  });

  it('should issue internal request propagating allowed query parameters', async () => {
    const protectedQuery = {} as Query;
    protectedQuery[QUERY_PARAM_VERCEL_PROTECTION_BYPASS] = 'bypass123';
    protectedQuery[QUERY_PARAM_VERCEL_SET_BYPASS_COOKIE] = 'true';
    protectedQuery['someOtherParam'] = 'shouldNotBeIncluded';
    const req = mockRequest({ query: { ...query, ...protectedQuery } });

    const middleware = new EditingRenderMiddleware();

    const handler = middleware.getHandler();

    const fetcherGetStub = sinon
      .stub(middleware['dataFetcher'], 'get')
      .resolves({ status: 200, statusText: 'success', data: '<div>some html</div>' });

    await handler(req);

    const fetchRequestUrl = fetcherGetStub.getCall(0).args[0];
    expect(fetchRequestUrl.includes(`${QUERY_PARAM_VERCEL_PROTECTION_BYPASS}=bypass123`)).to.be
      .true;
    expect(fetchRequestUrl.includes(`${QUERY_PARAM_VERCEL_SET_BYPASS_COOKIE}=true`)).to.be.true;
    expect(fetchRequestUrl.includes('someOtherParam=shouldNotBeIncluded')).to.be.false;
  });

  it('should issue intrnal request propagating allowed headers', async () => {
    const req = mockRequest({
      query,
      headers: {
        authorization: 'yes',
        cookie: 'sc_another_cookie=12345',
        otherHeader: 'shouldNotBeIncluded',
      },
    });

    const middleware = new EditingRenderMiddleware();
    const handler = middleware.getHandler();

    sinon.stub(middleware as any, 'getPreviewDataCookies').returns(mockPreviewCookies);

    const fetcherGetStub = sinon
      .stub(middleware['dataFetcher'], 'get')
      .resolves({ status: 200, statusText: 'success', data: '<div>some html</div>' });

    await handler(req);

    const fetchRequestHeaders = fetcherGetStub.getCall(0).args[1]?.headers as Headers;

    expect(fetchRequestHeaders).to.not.be.undefined;
    expect(fetchRequestHeaders).to.have.property(
      'cookie',
      'sc_another_cookie=12345;_preview_data=1122334455; Max-Age=3; Path=/; HttpOnly; Secure; SameSite=None'
    );
    expect(fetchRequestHeaders).to.have.property('authorization', 'yes');
    expect(fetchRequestHeaders).to.not.have.property('otherHeader');
  });

  it('should return 200 if internal request successful', async () => {
    const req = mockRequest({ query });

    const middleware = new EditingRenderMiddleware();
    const handler = middleware.getHandler();

    sinon
      .stub(middleware['dataFetcher'], 'get')
      .resolves({ status: 200, statusText: 'success', data: '<div>some html</div>' });

    const res = await handler(req);

    expect(res.status).to.equal(200);
  });

  it('should remove preview cookies before responding to browser', async () => {
    const req = mockRequest({ query });

    const middleware = new EditingRenderMiddleware();
    const handler = middleware.getHandler();

    sinon
      .stub(middleware['dataFetcher'], 'get')
      .resolves({ status: 200, statusText: 'success', data: '<div>some html</div>' });

    const res = await handler(req);

    expect(res.headers.has('Set-Cookie')).to.be.false;
    expect(res.status).to.equal(200);
  });

  it('should respondWith 500 if rendered html empty', async () => {
    const req = mockRequest({ query });

    const middleware = new EditingRenderMiddleware();
    const handler = middleware.getHandler();

    sinon
      .stub(middleware['dataFetcher'], 'get')
      .resolves({ status: 200, statusText: 'success', data: '' });

    const res = await handler(req);

    expect(res.status).to.equal(500);
  });

  it('should respondWith 500 if internal request fails', async () => {
    const req = mockRequest({ query });

    const middleware = new EditingRenderMiddleware();
    const handler = middleware.getHandler();

    sinon.stub(middleware['dataFetcher'], 'get').throws(new Error('Request failed'));

    const res = await handler(req);

    expect(res.status).to.equal(500);
  });

  describe('Design Library handling', () => {
    const query = {
      mode: DesignLibraryMode.Normal,
      sc_itemid: '{11111111-1111-1111-1111-111111111111}',
      sc_lang: 'en',
      sc_site: 'website',
      sc_variant: 'dev',
      sc_version: 'latest',
      secret: secret,
      sc_renderingId: '123',
      dataSourceId: '456',
      sc_uid: '789',
      generation: 'variant',
    };

    it('should handle request with mode=library', async () => {
      const req = mockRequest({ query });

      const middleware = new EditingRenderMiddleware();

      const getPreviewDataCookiesSpy = sinon.spy(middleware as any, 'getPreviewDataCookies');

      const handler = middleware.getHandler();

      sinon
        .stub(middleware['dataFetcher'], 'get')
        .resolves({ status: 200, statusText: 'success', data: '<div>some html</div>' });

      const res = await handler(req);

      expect(getPreviewDataCookiesSpy).to.have.been.calledWithMatch({
        itemId: query.sc_itemid,
        componentUid: query.sc_uid,
        renderingId: query.sc_renderingId,
        language: query.sc_lang,
        site: query.sc_site,
        mode: DesignLibraryMode.Normal,
        dataSourceId: query.dataSourceId,
        version: query.sc_version,
        generation: query.generation,
      });

      const body = await res.text();

      expect(res.status).to.equal(200);
      expect(body).to.equal('<div>some html</div>');

      expect(res.headers.has('Content-Security-Policy')).to.be.true;
      expect(res.headers.get('Content-Security-Policy')).to.equal(
        `frame-ancestors 'self' https://allowed.com ${EDITING_ALLOWED_ORIGINS.join(' ')}`
      );
    });

    it('should handle request with mode=library-metadata', async () => {
      const req = mockRequest({
        query: { ...query, mode: DesignLibraryMode.Metadata },
      });

      const middleware = new EditingRenderMiddleware();

      const getPreviewDataCookiesSpy = sinon.spy(middleware as any, 'getPreviewDataCookies');

      const handler = middleware.getHandler();

      sinon
        .stub(middleware['dataFetcher'], 'get')
        .resolves({ status: 200, statusText: 'success', data: '<div>some html</div>' });

      const res = await handler(req);

      expect(getPreviewDataCookiesSpy).to.have.been.calledWithMatch({
        itemId: query.sc_itemid,
        componentUid: query.sc_uid,
        renderingId: query.sc_renderingId,
        language: query.sc_lang,
        site: query.sc_site,
        mode: DesignLibraryMode.Metadata,
        dataSourceId: query.dataSourceId,
        version: query.sc_version,
        generation: query.generation,
      });

      const body = await res.text();

      expect(res.status).to.equal(200);
      expect(body).to.equal('<div>some html</div>');

      expect(res.headers.has('Content-Security-Policy')).to.be.true;
      expect(res.headers.get('Content-Security-Policy')).to.equal(
        `frame-ancestors 'self' https://allowed.com ${EDITING_ALLOWED_ORIGINS.join(' ')}`
      );
    });

    it('should response with 400 for missing query params', async () => {
      const req = mockRequest({
        query: { sc_site: 'website', secret },
      });

      const middleware = new EditingRenderMiddleware();
      const handler = middleware.getHandler();

      const res = await handler(req);

      const body = await res.json();

      expect(res.status).to.equal(400);
      expect(body).to.deep.equal({
        html: '<html><body>Missing required query parameters: sc_itemid, sc_lang, route, mode</body></html>',
      });
    });
  });

  describe('Sitecore Preview handling', () => {
    const query = {
      mode: 'preview',
      route: '/styleguide',
      sc_itemid: '{11111111-1111-1111-1111-111111111111}',
      sc_lang: 'en',
      sc_site: 'website',
      sc_variant: 'dev',
      sc_version: 'latest',
      secret: secret,
      sc_layoutKind: 'final',
    } as EditingRenderQueryParams;

    it('should handle request', async () => {
      const req = mockRequest({ query });

      const middleware = new EditingRenderMiddleware();

      const getPreviewDataCookiesSpy = sinon
        .stub(middleware as any, 'getPreviewDataCookies')
        .returns(mockPreviewCookies);

      const handler = middleware.getHandler();

      sinon
        .stub(middleware['dataFetcher'], 'get')
        .resolves({ status: 200, statusText: 'success', data: '<div>some html</div>' });

      const res = await handler(req);

      expect(getPreviewDataCookiesSpy).to.have.been.calledWith({
        site: 'website',
        itemId: '{11111111-1111-1111-1111-111111111111}',
        language: 'en',
        variantIds: ['dev'],
        version: 'latest',
        mode: 'preview',
        layoutKind: 'final',
      });

      expect(res.headers.has('Access-Control-Allow-Origin')).to.be.true;
      expect(res.headers.get('Access-Control-Allow-Origin')).to.equal(allowedOrigin);

      expect(res.headers.has('Access-Control-Allow-Methods')).to.be.true;
      expect(res.headers.get('Access-Control-Allow-Methods')).to.equal(
        'GET, POST, OPTIONS, DELETE, PUT, PATCH'
      );

      expect(res.headers.has('Set-Cookie')).to.be.true;
      expect(res.headers.getSetCookie()).to.have.members([
        'sc_site=website; Path=/; HttpOnly; SameSite=None; Secure',
        'sc_preview=true; Path=/; HttpOnly; SameSite=None; Secure',
      ]);

      expect(res.headers.getSetCookie()).to.not.include(mockPreviewCookies);

      expect(res.headers.has('Content-Security-Policy')).to.be.true;
      expect(res.headers.get('Content-Security-Policy')).to.equal(
        `frame-ancestors 'self' https://allowed.com ${EDITING_ALLOWED_ORIGINS.join(' ')}`
      );

      const body = await res.text();

      expect(res.status).to.equal(200);
      expect(body).to.equal('<div>some html</div>');
    });
  });

  describe('internal server request host resolution', () => {
    it('should use host header for making the internal request if config setting or env is not provided and we are not in XMC env', async () => {
      const req = mockRequest({ query });
      const reqHost = 'some-other-host';
      req.headers.set('host', reqHost);

      const middleware = new EditingRenderMiddleware();

      const handler = middleware.getHandler();

      const fetcherGetStub = sinon
        .stub(middleware['dataFetcher'], 'get')
        .resolves({ status: 200, statusText: 'success', data: '<div>some html</div>' });

      await handler(req);

      const fetchRequestUrl = fetcherGetStub.getCall(0).args[0];
      expect(fetchRequestUrl.includes(reqHost)).to.be.true;
    });

    it('should use http://localhost:3000 for making the internal request if config setting or env is not provided and we are in XMC', async () => {
      process.env.SITECORE = 'yes';
      const req = mockRequest({ query });
      const expectedHost = 'http://localhost:3000';
      const reqHost = 'some-other-host';
      req.headers.set('host', reqHost);

      const middleware = new EditingRenderMiddleware();

      const handler = middleware.getHandler();

      const fetcherGetStub = sinon
        .stub(middleware['dataFetcher'], 'get')
        .resolves({ status: 200, statusText: 'success', data: '<div>some html</div>' });

      await handler(req);

      const fetchRequestUrl = fetcherGetStub.getCall(0).args[0];
      expect(fetchRequestUrl.includes(expectedHost)).to.be.true;
      delete process.env.SITECORE;
    });

    it('should use internal editing url from env variable if provided', async () => {
      const reqHostEnv = 'http://custom-internal-host-env';
      process.env.SITECORE_INTERNAL_EDITING_HOST_URL = reqHostEnv;

      const req = mockRequest({ query });

      const middleware = new EditingRenderMiddleware();

      const handler = middleware.getHandler();

      const fetcherGetStub = sinon
        .stub(middleware['dataFetcher'], 'get')
        .resolves({ status: 200, statusText: 'success', data: '<div>some html</div>' });

      await handler(req);

      const fetchRequestUrl = fetcherGetStub.getCall(0).args[0];
      expect(fetchRequestUrl.includes(reqHostEnv)).to.be.true;
      delete process.env.SITECORE_INTERNAL_EDITING_HOST_URL;
    });

    it('should use internal editing url from config if provided', async () => {
      const reqHostConfig = 'http://custom-internal-host-config';
      const reqHostEnv = 'http://custom-internal-host-env';
      process.env.SITECORE_INTERNAL_EDITING_HOST_URL = reqHostEnv;

      const req = mockRequest({ query });

      const middleware = new EditingRenderMiddleware({
        sitecoreInternalEditingHostUrl: reqHostConfig,
      });

      const handler = middleware.getHandler();

      const fetcherGetStub = sinon
        .stub(middleware['dataFetcher'], 'get')
        .resolves({ status: 200, statusText: 'success', data: '<div>some html</div>' });

      await handler(req);

      const fetchRequestUrl = fetcherGetStub.getCall(0).args[0];
      expect(fetchRequestUrl.includes(reqHostConfig)).to.be.true;
      delete process.env.SITECORE_INTERNAL_EDITING_HOST_URL;
    });
  });
});
