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

use(sinonChai);

type Query = {
  [key: string]: string;
};

const allowedOrigin = 'https://allowed.com';
const baseUrl = 'https://test.com';

const mockRequest = ({
  query,
  method,
  headers,
}: {
  query?: Query | EditingRenderQueryParams;
  method?: string;
  headers?: { [key: string]: string };
}) => {
  const url = addQueryToUrl(baseUrl, query);
  return new Request(url, {
    method: method ?? 'GET',
    headers: {
      host: 'localhost:3000',
      origin: allowedOrigin,
      ...headers,
    },
  });
};

const addQueryToUrl = (
  baseUrl: string,
  query?: Query | EditingRenderQueryParams
): string => {
  const url = new URL(baseUrl);

  if (query) {
    const normalizedQuery: Query = toQuery(query);

    const params = new URLSearchParams(normalizedQuery);
    params.forEach((value, key) => {
      url.searchParams.set(key, value);
    });
  }

  return url.toString();
};

const toQuery = (params: Query | EditingRenderQueryParams): Query => {
  const query: Query = {};

  for (const key in params) {
    const value = params[key];

    if (value !== undefined && value !== null) {
      query[key] = String(value);
    }
  }

  return query;
};

describe('EditingRenderMiddleware', () => {
  const secret = 'secret1234';

  beforeEach(() => {
    process.env.SITECORE_EDITING_SECRET = secret;
    process.env.JSS_ALLOWED_ORIGINS = allowedOrigin;
    delete process.env.VERCEL;
  });

  after(() => {
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
    expect(res.headers.get('Access-Control-Allow-Origin')).to.equal(
      allowedOrigin
    );

    expect(res.headers.has('Access-Control-Allow-Methods')).to.be.true;
    expect(res.headers.get('Access-Control-Allow-Methods')).to.equal(
      'GET, POST, OPTIONS, DELETE, PUT, PATCH'
    );

    expect(res.headers.has('Access-Control-Allow-Headers')).to.be.true;
    expect(res.headers.get('Access-Control-Allow-Headers')).to.equal(
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

    const getPreviewDataCookiesSpy = sinon.spy(
      middleware as any,
      'getPreviewDataCookies'
    );

    const handler = middleware.getHandler();

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

    expect(res.status).to.equal(307);
    expect(res.body).to.equal(null);

    expect(res.headers.has('Location')).to.be.true;
    expect(res.headers.get('Location')).to.equal('/styleguide');

    expect(res.headers.has('Content-Security-Policy')).to.be.true;
    expect(res.headers.get('Content-Security-Policy')).to.equal(
      `frame-ancestors 'self' https://allowed.com ${EDITING_ALLOWED_ORIGINS.join(
        ' '
      )}`
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

    const getPreviewDataCookiesSpy = sinon.spy(
      middleware as any,
      'getPreviewDataCookies'
    );

    const handler = middleware.getHandler();

    await handler(req);

    expect(getPreviewDataCookiesSpy).to.have.been.calledWith({
      site: 'website',
      itemId: '{11111111-1111-1111-1111-111111111111}',
      language: 'en',
      variantIds: ['id-1', 'id-2', 'id-3'],
      version: null,
      mode: 'edit',
      layoutKind: null,
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

    const getPreviewDataCookiesSpy = sinon.spy(
      middleware as any,
      'getPreviewDataCookies'
    );

    const handler = middleware.getHandler();

    const res = await handler(req);

    expect(getPreviewDataCookiesSpy).to.have.been.calledWith({
      site: 'website',
      itemId: '{11111111-1111-1111-1111-111111111111}',
      language: 'en',
      variantIds: ['_default'],
      version: null,
      mode: 'edit',
      layoutKind: null,
    });

    expect(res.status).to.equal(307);
    expect(res.body).to.equal(null);

    expect(res.headers.has('Location')).to.be.true;
    expect(res.headers.get('Location')).to.equal('/styleguide');

    expect(res.headers.has('Content-Security-Policy')).to.be.true;
    expect(res.headers.get('Content-Security-Policy')).to.equal(
      `frame-ancestors 'self' https://allowed.com ${EDITING_ALLOWED_ORIGINS.join(
        ' '
      )}`
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

    const getPreviewDataCookiesSpy = sinon.spy(
      middleware as any,
      'getPreviewDataCookies'
    );

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

    expect(res.headers.has('Location')).to.be.true;
    expect(res.headers.get('Location')).to.equal('/custom/path/styleguide');
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
    process.env.JSS_ALLOWED_ORIGINS =
      'https://allowed.com,https://anotherallowed.com';
    const req = mockRequest({ query });

    const middleware = new EditingRenderMiddleware();
    const handler = middleware.getHandler();

    const res = await handler(req);

    expect(res.headers.has('Content-Security-Policy')).to.be.true;
    expect(res.headers.get('Content-Security-Policy')).to.equal(
      `frame-ancestors 'self' https://allowed.com https://anotherallowed.com ${EDITING_ALLOWED_ORIGINS.join(
        ' '
      )}`
    );
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
    };

    it('should handle request with mode=library', async () => {
      const req = mockRequest({ query });

      const middleware = new EditingRenderMiddleware();

      const getPreviewDataCookiesSpy = sinon.spy(
        middleware as any,
        'getPreviewDataCookies'
      );

      const handler = middleware.getHandler();

      const res = await handler(req);

      expect(getPreviewDataCookiesSpy).to.have.been.calledWith({
        itemId: query.sc_itemid,
        componentUid: query.sc_uid,
        renderingId: query.sc_renderingId,
        language: query.sc_lang,
        site: query.sc_site,
        mode: DesignLibraryMode.Normal,
        dataSourceId: query.dataSourceId,
        version: query.sc_version,
      });

      expect(res.status).to.equal(307);
      expect(res.headers.has('Content-Security-Policy')).to.be.true;
      expect(res.headers.get('Content-Security-Policy')).to.equal(
        `frame-ancestors 'self' https://allowed.com ${EDITING_ALLOWED_ORIGINS.join(
          ' '
        )}`
      );
    });

    it('should handle request with mode=library-metadata', async () => {
      const req = mockRequest({
        query: { ...query, mode: DesignLibraryMode.Metadata },
      });

      const middleware = new EditingRenderMiddleware();

      const getPreviewDataCookiesSpy = sinon.spy(
        middleware as any,
        'getPreviewDataCookies'
      );

      const handler = middleware.getHandler();

      const res = await handler(req);

      expect(getPreviewDataCookiesSpy).to.have.been.calledWith({
        itemId: query.sc_itemid,
        componentUid: query.sc_uid,
        renderingId: query.sc_renderingId,
        language: query.sc_lang,
        site: query.sc_site,
        mode: DesignLibraryMode.Metadata,
        dataSourceId: query.dataSourceId,
        version: query.sc_version,
      });

      expect(res.status).to.equal(307);
      expect(res.headers.has('Content-Security-Policy')).to.be.true;
      expect(res.headers.get('Content-Security-Policy')).to.equal(
        `frame-ancestors 'self' https://allowed.com ${EDITING_ALLOWED_ORIGINS.join(
          ' '
        )}`
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

      const getPreviewDataCookiesSpy = sinon.spy(
        middleware as any,
        'getPreviewDataCookies'
      );

      const handler = middleware.getHandler();

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
      expect(res.headers.get('Access-Control-Allow-Origin')).to.equal(
        allowedOrigin
      );

      expect(res.headers.has('Access-Control-Allow-Methods')).to.be.true;
      expect(res.headers.get('Access-Control-Allow-Methods')).to.equal(
        'GET, POST, OPTIONS, DELETE, PUT, PATCH'
      );

      expect(res.headers.has('Content-Security-Policy')).to.be.true;
      expect(res.headers.get('Content-Security-Policy')).to.equal(
        `frame-ancestors 'self' https://allowed.com ${EDITING_ALLOWED_ORIGINS.join(
          ' '
        )}`
      );

      expect(res.status).to.equal(307);
      expect(res.body).to.equal(null);

      expect(res.headers.has('Location')).to.be.true;
      expect(res.headers.get('Location')).to.equal('/styleguide');
    });
  });
});
