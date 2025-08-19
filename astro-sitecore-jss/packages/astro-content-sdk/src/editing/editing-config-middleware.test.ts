/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import { EditingConfigMiddleware } from './editing-config-middleware';
import { QUERY_PARAM_EDITING_SECRET } from '@sitecore-content-sdk/core/editing';
import { AstroContentSdkComponent } from '../sharedTypes/component-props';

type Query = {
  [key: string]: string;
};

const allowedOrigin = 'https://allowed.com';
const baseUrl = 'https://test.com';

const mockRequest = (
  method: string,
  query?: Query,
  headers?: { [key: string]: string }
) => {
  const url = addQueryToUrl(baseUrl, query);
  return new Request(url, {
    method,
    headers: {
      origin: allowedOrigin,
      ...headers,
    },
  });
};

const addQueryToUrl = (baseUrl: string, query?: Query): string => {
  const url = new URL(baseUrl);

  if (query) {
    const params = new URLSearchParams(query);
    params.forEach((value, key) => {
      url.searchParams.set(key, value);
    });
  }

  return url.toString();
};

const componentsMap = new Map<string, AstroContentSdkComponent>();
componentsMap.set('TestComponentOne', () => {});
componentsMap.set('TestComponentTwo', () => {});
const metadata = { packages: { testPackageOne: '0.1.1' } };

const expectedResultWithMetadata = {
  components: ['TestComponentOne', 'TestComponentTwo'],
  packages: { testPackageOne: '0.1.1' },
  editMode: 'metadata',
};

const expectedResultForbidden = {
  message: 'Missing or invalid editing secret',
};

describe('EditingConfigMiddleware', () => {
  const secret = 'jss-editing-secret-mock';

  beforeEach(() => {
    process.env.SITECORE_EDITING_SECRET = secret;
    process.env.JSS_ALLOWED_ORIGINS = allowedOrigin;
  });

  after(() => {
    delete process.env.SITECORE_EDITING_SECRET;
    delete process.env.JSS_ALLOWED_ORIGINS;
  });

  it('should respond with 401 for missing secret', async () => {
    const key = 'wrongkey';
    const query = { key } as Query;
    const req = mockRequest('GET', query);

    const middleware = new EditingConfigMiddleware({
      components: componentsMap,
      metadata,
    });
    const handler = middleware.getHandler();

    const res = await handler(req);

    const body = await res.json();
    expect(res.status).to.equal(401);
    expect(body).to.deep.equal(expectedResultForbidden);
  });

  it('should stop request and return 401 when CORS match is not met', async () => {
    const req = mockRequest('GET', {}, { origin: 'https://notallowed.com' });
    const middleware = new EditingConfigMiddleware({
      components: componentsMap,
      metadata,
    });
    const handler = middleware.getHandler();

    const res = await handler(req);

    const body = await res.json();
    expect(res.status).to.equal(401);
    expect(body).to.deep.equal({ message: 'Invalid origin' });
  });

  it('should respond with 401 for invalid secret', async () => {
    const key = 'wrongkey';
    const query = { key } as Query;
    query[QUERY_PARAM_EDITING_SECRET] = 'wrongsekret';
    const req = mockRequest('GET', query);

    const middleware = new EditingConfigMiddleware({
      components: componentsMap,
      metadata,
    });
    const handler = middleware.getHandler();

    const res = await handler(req);

    const body = await res.json();
    expect(res.status).to.equal(401);
    expect(body).to.deep.equal(expectedResultForbidden);
  });

  it('should respond with 204 for preflight OPTIONS request', async () => {
    const query = {} as Query;
    query[QUERY_PARAM_EDITING_SECRET] = secret;
    const req = mockRequest('OPTIONS', query);

    const middleware = new EditingConfigMiddleware({
      components: componentsMap,
      metadata,
    });
    const handler = middleware.getHandler();

    const res = await handler(req);

    console.log('res :>> ', res);

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

    expect(res.status).to.equal(204);
    expect(res.body).to.equal(null);
  });

  const testEditingConfig = async (
    components: Map<string, AstroContentSdkComponent>,
    expectedResult
  ) => {
    const key = 'wrongkey';
    const query = { key } as Query;
    query[QUERY_PARAM_EDITING_SECRET] = secret;
    const req = mockRequest('GET', query);
    const middleware = new EditingConfigMiddleware({ components, metadata });
    const handler = middleware.getHandler();

    const res = await handler(req);

    const body = await res.json();
    expect(res.status).to.equal(200);
    expect(body).to.deep.equal(expectedResult);
  };

  it('should respond with 200 and return config data with components array as argument', async () => {
    await testEditingConfig(componentsMap, expectedResultWithMetadata);
  });

  it('should respond with 200 and return config data with components map as argument', async () => {
    await testEditingConfig(componentsMap, expectedResultWithMetadata);
  });
});
