/* eslint-disable dot-notation */
import * as chai from 'chai';
import { use } from 'chai';
import sinonChai from 'sinon-chai';
import sinon from 'sinon';
import chaiString from 'chai-string';
import {
  defineMiddleware,
  Middleware,
  MiddlewareBase,
  REWRITE_HEADER_NAME,
} from './middleware';
import { SiteResolver } from '../site';
import { COOKIE_NAME_PRERENDER_DATA } from '../editing';
import { APIContext, AstroCookieSetOptions, RewritePayload } from 'astro';

use(sinonChai);
const expect = chai.use(chaiString).expect;

class MockSiteResolver extends SiteResolver {
  getByName = sinon.stub().callsFake((siteName: string) => ({
    name: siteName,
    language: 'en',
    hostName: 'foo.net',
  }));

  getByHost = sinon.stub().callsFake((hostName: string) => ({
    name: 'foo',
    language: 'en',
    hostName,
  }));
}

const createContext = (props: any = {}) => {
  const context = {
    request: {
      url: '',
      headers: {
        get(key: string) {
          const headers = {
            ...context.request.headers,
            ...props?.headerValues,
          };
          return headers[key];
        },
        append(key: string, value: string | Record<string, any>) {
          context.request.headers[key] = value;
        },
      },
    },
    cookies: {
      get(cookieName: string) {
        const cookies = { ...props?.cookieValues };
        return cookies[cookieName] ? { value: cookies[cookieName] } : undefined;
      },
      set(
        cookieName: string,
        value: string | Record<string, any>,
        options?: AstroCookieSetOptions
      ) {
        context.cookies[cookieName] = { value, ...options };
      },
      ...props?.cookies,
      ...props.cookieValues,
    },
    url: {
      ...props?.url,
    },
    currentLocale: props.currentLocale,
    preferredLocale: props.preferredLocale,
    rewrite: (_) => props.response,
  } as APIContext;

  return context;
};

const createResponse = (props: any = {}) => {
  const response = {
    ...props,
    url: props.url,
    headers: {
      get(key: string) {
        const headers = {
          ...response.headers,
          ...props.headerValues,
        };
        return headers[key];
      },
      append(key: string, value: string | Record<string, any>) {
        response.headers[key] = value;
      },
      ...props.headers,
    },
  } as Response;

  return response;
};

describe('MiddlewareBase', () => {
  class SampleMiddleware extends MiddlewareBase {
    handle() {
      return Promise.resolve({} as Response);
    }
  }

  describe('defaultHostname', () => {
    it('should set default hostname', () => {
      const middleware = new SampleMiddleware({ sites: [] });

      expect(middleware['defaultHostname']).to.equal('localhost');
    });

    it('should set custom hostname', () => {
      const middleware = new SampleMiddleware({
        sites: [],
        defaultHostname: 'foo',
      });

      expect(middleware['defaultHostname']).to.equal('foo');
    });
  });

  describe('isPreview', () => {
    it('should return true when preview data cookie is provided', () => {
      const middleware = new SampleMiddleware({ sites: [] });
      const context = createContext({
        cookieValues: {
          [COOKIE_NAME_PRERENDER_DATA]: 'value',
        },
      });

      expect(middleware['isPreview'](context)).to.equal(true);
    });

    it('should return false when required cookie is not provided', () => {
      const middleware = new SampleMiddleware({ sites: [] });
      const context = createContext({});

      expect(middleware['isPreview'](context)).to.equal(false);
    });
  });
  /*
  describe('isPrefetch', () => {
    it('should return true when purpose header is prefetch', () => {
      const middleware = new SampleMiddleware({ sites: [] });
      const req = createReq({
        headerValues: {
          purpose: 'prefetch',
        },
      });

      expect(middleware['isPrefetch'](req)).to.equal(true);
    });

    it('should return true when Next-Router-Prefetch header is 1', () => {
      const middleware = new SampleMiddleware({ sites: [] });
      const req = createReq({
        headerValues: {
          'Next-Router-Prefetch': '1',
        },
      });

      expect(middleware['isPrefetch'](req)).to.equal(true);
    });

    it('should return true when x-middleware-prefetch header is 1', () => {
      const middleware = new SampleMiddleware({ sites: [] });
      const req = createReq({
        headerValues: {
          'x-middleware-prefetch': '1',
        },
      });

      expect(middleware['isPrefetch'](req)).to.equal(true);
    });

    it('should return false when required header is not provided', () => {
      const middleware = new SampleMiddleware({ sites: [] });
      const req = createReq();

      expect(middleware['isPrefetch'](req)).to.equal(false);
    });

    it('returns false for known device with x-middleware-prefetch header', () => {
      const middleware = new SampleMiddleware({ sites: [] });
      const req = createReq({
        headerValues: {
          'x-middleware-prefetch': '1',
          'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X)',
        },
      });

      expect(middleware['isPrefetch'](req)).to.equal(false);
    });

    it('should return true when it is a desktop device and purpose is prefetch', () => {
      const middleware = new SampleMiddleware({ sites: [] });
      const req = createReq({
        headerValues: {
          purpose: 'prefetch',
          'sec-ch-ua-mobile': '?0',
        },
      });

      expect(middleware['isPrefetch'](req)).to.equal(true);
    });
  });
*/
  describe('disabled / skip', () => {
    it('default', () => {
      const middleware = new SampleMiddleware({ sites: [] });

      expect(
        middleware['disabled'](
          createContext({
            url: {
              pathname: '/api/layout/render',
            },
          }),
          createResponse()
        )
      ).to.equal(true);

      expect(
        middleware['disabled'](
          createContext({
            url: {
              pathname: '/sitecore/render',
            },
          }),
          createResponse()
        )
      ).to.equal(true);
    });

    it('custom function', () => {
      const middleware = new SampleMiddleware({
        sites: [],
        skip(context: APIContext) {
          return context.url.pathname === 'foo';
        },
      });

      expect(
        middleware['disabled'](
          createContext({
            url: {
              pathname: 'bar',
            },
          }),
          createResponse()
        )
      ).to.equal(false);
      expect(
        middleware['disabled'](
          createContext({
            url: {
              pathname: 'foo',
            },
          }),
          createResponse()
        )
      ).to.equal(true);
    });
  });

  it('extractDebugHeaders', () => {
    const middleware = new SampleMiddleware({ sites: [] });

    const headers = new Headers({});
    headers.set('foo', 'net');
    headers.set('bar', 'one');

    expect(middleware['extractDebugHeaders'](headers)).to.deep.equal({
      foo: 'net',
      bar: 'one',
    });
  });

  describe('getHostHeader', () => {
    it('should return default hostname when header is not present', () => {
      const middleware = new SampleMiddleware({ sites: [] });
      const context = createContext({
        headerValues: {
          foo: 'one',
        },
      });

      expect(middleware['getHostHeader'](context)).to.equal(undefined);
    });

    it('should return host header', () => {
      const middleware = new SampleMiddleware({ sites: [] });
      const context = createContext({
        headerValues: {
          foo: 'one',
          host: 'bar.net:9999',
        },
      });

      expect(middleware['getHostHeader'](context)).to.equal('bar.net');
    });
  });

  describe('getLanguage', () => {
    it('should return defined language', () => {
      const middleware = new SampleMiddleware({ sites: [] });
      const context = createContext({
        currentLocale: 'be',
        preferredLocale: 'fr',
      });

      expect(middleware['getLanguage'](context)).to.equal('be');
    });

    it('should return defined default language', () => {
      const middleware = new SampleMiddleware({ sites: [] });
      const context = createContext({
        preferredLocale: 'fr',
      });

      expect(middleware['getLanguage'](context)).to.equal('fr');
    });

    it('should use fallback language from config when present', () => {
      const middleware = new SampleMiddleware({
        sites: [],
        defaultLanguage: 'es-ES',
      });
      const context = createContext();

      expect(middleware['getLanguage'](context)).to.equal('es-ES');
    });

    it('should return fallback language', () => {
      const middleware = new SampleMiddleware({ sites: [] });
      const context = createContext();

      expect(middleware['getLanguage'](context)).to.equal('en');
    });
  });

  describe('getSite', () => {
    it('should get site by name when site cookie is provided', () => {
      const context = createContext();

      const res = createResponse({
        headers: {
          'Set-Cookie': 'sc_site=xxx',
        },
      });

      const middleware = new SampleMiddleware({ sites: [] });
      middleware['siteResolver'] = new MockSiteResolver([]);

      expect(middleware['getSite'](context, res).name).to.equal('xxx');
      expect(middleware['siteResolver'].getByName).to.be.calledWith('xxx');
    });

    it('should get default site info when site cookie is provided', () => {
      class MockSiteResolver extends SiteResolver {
        getByName = sinon.stub().callsFake((_siteName: string) => undefined);
      }

      const context = createContext();

      const res = createResponse({
        headers: {
          'Set-Cookie': 'sc_site=xxx',
        },
      });

      const middleware = new SampleMiddleware({ sites: [] });
      middleware['siteResolver'] = new MockSiteResolver([]);

      expect(middleware['getSite'](context, res)).deep.equal({
        name: 'xxx',
        language: 'en',
        hostName: '*',
      });
      expect(middleware['siteResolver'].getByName).to.be.calledWith('xxx');
    });
  });

  it('should get site by host header', () => {
    const context = createContext({
      headerValues: {
        host: 'xxx.net:9999',
      },
    });
    const middleware = new SampleMiddleware({ sites: [] });
    middleware['siteResolver'] = new MockSiteResolver([]);

    expect(middleware['getSite'](context).hostName).to.equal('xxx.net');
    expect(middleware['siteResolver'].getByHost).to.be.calledWith('xxx.net');
  });

  it('should get site by default host', () => {
    const context = createContext();
    const middleware = new SampleMiddleware({ sites: [] });
    middleware['siteResolver'] = new MockSiteResolver([]);

    expect(middleware['getSite'](context).hostName).to.equal('localhost');
    expect(middleware['siteResolver'].getByHost).to.be.calledWith('localhost');
  });

  it('should get site by custom default host', () => {
    const context = createContext();

    const middleware = new SampleMiddleware({
      sites: [],
      defaultHostname: 'yyy.net',
    });
    middleware['siteResolver'] = new MockSiteResolver([]);

    expect(middleware['getSite'](context).hostName).to.equal('yyy.net');
    expect(middleware['siteResolver'].getByHost).to.be.calledWith('yyy.net');
  });

  describe('rewrite', () => {
    let rewriteStub = sinon.stub();

    const createRewriteResponse = (rewritePath: RewritePayload) => {
      const getPathname = (path: RewritePayload) => {
        if (typeof path === 'string') {
          return path;
        }

        if (path instanceof URL) {
          return path.pathname;
        }

        return new URL(path.url).pathname;
      };

      return Promise.resolve(
        createResponse({
          url: getPathname(rewritePath),
          headers: new Map(),
        })
      );
    };

    after(() => {
      rewriteStub.restore();
    });

    it('should add header by default', async () => {
      const middleware = new SampleMiddleware({ sites: [] });
      const url = {
        href: 'http://localhost:3000/not-found',
        locale: 'en',
        pathname: 'http://localhost:3000/found',
      };
      const context = createContext({
        url: url,
      });

      const mockNext = async (rewritePath?: RewritePayload) => {
        return createResponse({
          url: rewritePath,
          headers: [],
        });
      };

      rewriteStub = sinon
        .stub(context, 'rewrite')
        .callsFake(createRewriteResponse);

      const response = await middleware['rewrite']('/new', mockNext);

      expect(response.headers.get(REWRITE_HEADER_NAME)).to.equal('/new');
      expect(response.url).to.endWith('/new');
    });

    it('should not rewrite header when skipHeader is true', async () => {
      const middleware = new SampleMiddleware({ sites: [] });
      const url = {
        href: 'http://localhost:3000/not-found',
        locale: 'en',
        pathname: 'http://localhost:3000/found',
      };
      const context = createContext({
        url: url,
      });

      const mockNext = async (rewritePath?: RewritePayload) => {
        return createResponse({
          url: rewritePath,
          headers: [],
        });
      };

      rewriteStub = sinon
        .stub(context, 'rewrite')
        .callsFake(createRewriteResponse);

      const response = await middleware['rewrite']('/new', mockNext, true);

      expect(response.headers.get(REWRITE_HEADER_NAME)).to.be.undefined;
      expect(response.url).to.endWith('/new');
    });
  });
});

describe('defineMiddleware', () => {
  it('should execute middlewares', async () => {
    type CustomResponse = {
      params: string[];
    } & Response;

    class SampleMiddleware extends MiddlewareBase {
      handle(_: APIContext, res: CustomResponse): Promise<Response> {
        res.params.push('m1');
        return Promise.resolve(res);
      }
    }

    const middleware1 = new SampleMiddleware({
      sites: [],
    });
    const middleware2: Middleware = {
      handle: (_, res) => {
        (res as CustomResponse).params.push('m2');
        return Promise.resolve(res);
      },
    };
    const middleware3: Middleware = {
      handle: (_, res) => {
        (res as CustomResponse).params.push('m3');
        return Promise.resolve(res);
      },
    };

    const context = {} as APIContext;
    const res = {
      params: [],
    } as unknown as Response;
    const mockNext = async () => res;

    const result = await defineMiddleware(
      middleware2,
      middleware1,
      middleware3
    ).exec(context, mockNext);

    expect(result).to.deep.equal({
      params: ['m2', 'm1', 'm3'],
    });
  });

  it('should execute middlewares with empty response', async () => {
    class SampleMiddleware extends MiddlewareBase {
      handle(_: APIContext, res: Response) {
        res.headers.append('m1', 'true');
        return Promise.resolve(res);
      }
    }

    const middleware1 = new SampleMiddleware({ sites: [] });
    const middleware2: Middleware = {
      handle: (_, res) => {
        res.headers.append('m2', 'true');
        return Promise.resolve(res);
      },
    };
    const middleware3: Middleware = {
      handle: (_, res) => {
        res.headers.append('m3', 'true');
        return Promise.resolve(res);
      },
    };

    const context = {} as APIContext;
    const res = createResponse();
    const mockNext = async () => res;

    const result = await defineMiddleware(
      middleware2,
      middleware1,
      middleware3
    ).exec(context, mockNext);

    expect(result.headers.get('m1')).to.equal('true');
    expect(result.headers.get('m2')).to.equal('true');
    expect(result.headers.get('m3')).to.equal('true');
  });
});
