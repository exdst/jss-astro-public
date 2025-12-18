/* eslint-disable no-unused-expressions */
/* eslint-disable dot-notation */
import * as chai from 'chai';
import { use } from 'chai';
import chaiString from 'chai-string';
import sinonChai from 'sinon-chai';
import sinon, { spy } from 'sinon';
import { debug } from '@sitecore-content-sdk/core';

import { MultisiteMiddleware } from './multisite-middleware';
import { SiteInfo, SiteResolver } from '@sitecore-content-sdk/core/site';
import { APIContext, AstroCookieSetOptions } from 'astro';

use(sinonChai);
const expect = chai.use(chaiString).expect;

describe('MultisiteMiddleware', () => {
  const debugSpy = spy(debug, 'multisite');
  const validateDebugLog = (message: string, ...params: any) =>
    expect(debugSpy.args.find((log) => log[0] === message)).to.deep.equal([
      message,
      ...params,
    ]);
  const validateEndMessageDebugLog = (message: string, params: any) => {
    const logParams = debugSpy.args.find(
      (log) => log[0] === message
    ) as Array<unknown>;

    expect(logParams[2]).to.deep.include(params);
  };

  const siteName = 'foo';
  const hostname = 'http://test.test/styleguide';

  const defaultConfig = {
    sites: [],
    enabled: true,
    useCookieResolution: () => false,
    defaultHostname: '',
  };

  const createContext = (props: any = {}) => {
    const context = {
      request: {
        url: props.url || new URL(hostname),
        headers: {
          get(key: string) {
            const headers = {
              host: 'foo.net',
              ...props.headerValues,
            };
            return headers[key];
          },
          append(key: string, value: string | Record<string, any>) {
            context.request.headers[key] = value;
          },
          ...props.headers,
        },
      },
      cookies: {
        get(cookieName: string) {
          const cookies = { ...props?.cookieValues };
          return cookies[cookieName]
            ? { value: cookies[cookieName] }
            : undefined;
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
      locals: props.locals || {},
      url: props.url || new URL(hostname),
      currentLocale: props.currentLocale,
      preferredLocale: props.preferredLocale,
      // eslint-disable-next-line no-unused-vars
      rewrite: (_) => props.response,
    } as APIContext;

    return context;
  };

  const createResponse = (props: any = {}) => {
    const response = {
      ...props,
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

    Object.defineProperties(response.headers, {
      forEach: {
        value: (cb) => {
          Object.keys(response.headers).forEach((key) =>
            cb(response.headers[key], key, response.headers)
          );
        },
        enumerable: false,
      },
    });

    return response;
  };

  const createMiddleware = (
    input: { [key: string]: any; siteResolver?: SiteResolver } = {}
  ) => {
    const props = { ...defaultConfig, ...input.config };
    class MockSiteResolver extends SiteResolver {
      getByName = sinon.stub().returns({
        name: siteName,
        language: input.language || '',
        hostName: input.hostName,
      });

      getByHost = sinon.stub().returns({
        name: siteName,
        language: input.language || '',
        hostName: input.hostName,
      });
    }

    const siteResolver = new MockSiteResolver([]);
    const middleware = new MultisiteMiddleware({
      ...props,
    });
    middleware['siteResolver'] = siteResolver;

    return { middleware, siteResolver };
  };

  beforeEach(() => {
    debugSpy.resetHistory();
  });

  describe('request skipped', () => {
    describe('disabled / skip', () => {
      const res = createResponse();

      const test = async (
        pathname: string,
        middleware: MultisiteMiddleware
      ) => {
        const context = createContext({
          url: {
            pathname,
          },
        });

        const mockNext = async () => res;

        const finalRes = await middleware.handle(context, mockNext);
        const isDisabledGlobally = middleware['config'].enabled === false;

        if (!isDisabledGlobally) {
          validateDebugLog('multisite middleware start: %o', {
            pathname,
            language: 'en',
            hostname: 'foo.net',
          });
        }

        const message = isDisabledGlobally
          ? 'skipped (multisite middleware is disabled globally)'
          : 'skipped (multisite middleware is disabled)';
        validateDebugLog(message);

        expect(finalRes).to.deep.equal(res);

        debugSpy.resetHistory();
      };

      it('default', async () => {
        const { middleware } = createMiddleware();

        await test('/src/image.png', middleware);
        await test('/api/layout/render', middleware);
        await test('/sitecore/render', middleware);
      });

      it('should apply both default and custom rules when custom disabled function provided', async () => {
        const skip = (context: APIContext) =>
          context.url.pathname === '/crazypath/luna';

        const { middleware } = createMiddleware({
          config: { ...defaultConfig, skip },
        });

        await test('/src/image.png', middleware);
        await test('/api/layout/render', middleware);
        await test('/sitecore/render', middleware);
        await test('/crazypath/luna', middleware);
      });
    });

    describe('disabled in chain', () => {
      it('should skip if skipMiddleware local variable is true', async () => {
        const { middleware } = createMiddleware();
        const res = createResponse();

        const context = createContext({
          locals: {
            skipMiddleware: true,
          },
        });

        const mockNext = async () => res;

        const finalRes = await middleware.handle(context, mockNext);

        validateDebugLog(
          'skipped (multisite middleware is disabled by one of the previous middlewares)'
        );

        expect(finalRes).to.deep.equal(res);

        debugSpy.resetHistory();
      });
    });
  });

  describe('preview', () => {
    it('prerender bypass cookie is present', async () => {
      const { middleware } = createMiddleware();
      const res = createResponse();

      const context = createContext({
        url: new URL(hostname),
        cookieValues: {
          _preview_data: true,
        },
      });

      const mockNext = async () => {
        return res;
      };

      const finalRes = await middleware.handle(context, mockNext);

      validateDebugLog('skipped (preview)');

      expect(finalRes).to.deep.equal(res);
    });
  });

  describe('Sitecore Preview', () => {
    it('request is passed', async () => {
      const context = createContext({
        cookieValues: { sc_site: 'foobar', sc_preview: 'true' },
      });

      const mockNext = sinon.stub().returns(
        createResponse({
          headers: [],
        })
      );

      const { middleware, siteResolver } = createMiddleware({
        config: { ...defaultConfig, useCookieResolution: () => true },
      });

      const finalRes = await middleware.handle(context, mockNext);

      validateDebugLog('multisite middleware start: %o', {
        pathname: '/styleguide',
        language: 'en',
        hostname: 'foo.net',
      });

      validateEndMessageDebugLog('multisite middleware end in %dms: %o', {
        rewritePath: '/_site_foobar/styleguide',
        siteName: 'foobar',
        headers: {
          ...finalRes.headers,
          'x-sc-rewrite': '/_site_foobar/styleguide',
        },
        cookies: 'sc_site=foobar; HttpOnly; Secure; SameSite=None',
      });

      expect(siteResolver.getByHost.called).to.be.false;
      expect(siteResolver.getByName.called).to.be.false;

      expect(mockNext).calledWith(
        sinon.match({ pathname: '/_site_foobar/styleguide' })
      );
    });
  });

  describe('request passed', () => {
    it('fallback hostname is used', async () => {
      const context = createContext({
        headerValues: { host: undefined },
      });

      const mockNext = sinon.stub().returns(
        createResponse({
          headers: [],
        })
      );

      const { middleware, siteResolver } = createMiddleware({
        config: { ...defaultConfig, defaultHostname: 'bar.net' },
      });

      const finalRes = await middleware.handle(context, mockNext);

      validateDebugLog('multisite middleware start: %o', {
        pathname: '/styleguide',
        language: 'en',
        hostname: 'bar.net',
      });

      validateEndMessageDebugLog('multisite middleware end in %dms: %o', {
        rewritePath: '/_site_foo/styleguide',
        siteName: 'foo',
        headers: {
          ...finalRes.headers,
          'x-sc-rewrite': '/_site_foo/styleguide',
        },
        cookies: 'sc_site=foo; HttpOnly; Secure; SameSite=None',
      });

      expect(siteResolver.getByHost.calledWith('bar.net')).to.be.true;

      expect(mockNext).calledWith(
        sinon.match({ pathname: '/_site_foo/styleguide' })
      );
    });

    it('fallback default hostName is used', async () => {
      const context = createContext({
        headerValues: { host: undefined },
      });

      const mockNext = sinon.stub().returns(
        createResponse({
          headers: [],
        })
      );

      const { middleware, siteResolver } = createMiddleware();

      const finalRes = await middleware.handle(context, mockNext);

      validateDebugLog('multisite middleware start: %o', {
        pathname: '/styleguide',
        language: 'en',
        hostname: 'localhost',
      });

      validateEndMessageDebugLog('multisite middleware end in %dms: %o', {
        rewritePath: '/_site_foo/styleguide',
        siteName: 'foo',
        headers: {
          ...finalRes.headers,
          'x-sc-rewrite': '/_site_foo/styleguide',
        },
        cookies: 'sc_site=foo; HttpOnly; Secure; SameSite=None',
      });

      expect(siteResolver.getByHost).to.be.calledWith('localhost');

      expect(mockNext).calledWith(
        sinon.match({ pathname: '/_site_foo/styleguide' })
      );
    });

    it('host header is used', async () => {
      const context = createContext();

      const mockNext = sinon.stub().returns(
        createResponse({
          headers: [],
        })
      );

      const { middleware, siteResolver } = createMiddleware();

      const finalRes = await middleware.handle(context, mockNext);

      validateDebugLog('multisite middleware start: %o', {
        pathname: '/styleguide',
        language: 'en',
        hostname: 'foo.net',
      });

      validateEndMessageDebugLog('multisite middleware end in %dms: %o', {
        rewritePath: '/_site_foo/styleguide',
        siteName: 'foo',
        headers: {
          ...finalRes.headers,
          'x-sc-rewrite': '/_site_foo/styleguide',
        },
        cookies: 'sc_site=foo; HttpOnly; Secure; SameSite=None',
      });

      expect(siteResolver.getByHost).to.be.calledWith('foo.net');

      expect(mockNext).calledWith(
        sinon.match({ pathname: '/_site_foo/styleguide' })
      );
    });

    it('custom response object is not provided', async () => {
      const context = createContext();

      const mockNext = sinon.stub().returns(
        createResponse({
          headers: [],
        })
      );

      const { middleware, siteResolver } = createMiddleware({});

      const finalRes = await middleware.handle(context, mockNext);

      validateDebugLog('multisite middleware start: %o', {
        pathname: '/styleguide',
        language: 'en',
        hostname: 'foo.net',
      });

      validateEndMessageDebugLog('multisite middleware end in %dms: %o', {
        rewritePath: '/_site_foo/styleguide',
        siteName: 'foo',
        headers: {
          ...finalRes.headers,
          'x-sc-rewrite': '/_site_foo/styleguide',
        },
        cookies: 'sc_site=foo; HttpOnly; Secure; SameSite=None',
      });

      expect(siteResolver.getByHost).to.be.calledWith('foo.net');

      expect(mockNext).calledWith(
        sinon.match({ pathname: '/_site_foo/styleguide' })
      );
    });

    it('sc_site querystring parameter is provided', async () => {
      const context = createContext({
        url: new URL(hostname + '?sc_site=qsFoo'),
      });

      const mockNext = sinon.stub().returns(
        createResponse({
          headers: [],
        })
      );

      const { middleware, siteResolver } = createMiddleware({
        useCookieResolution: () => true,
      });

      const finalRes = await middleware.handle(context, mockNext);

      validateDebugLog('multisite middleware start: %o', {
        pathname: '/styleguide',
        language: 'en',
        hostname: 'foo.net',
      });

      validateEndMessageDebugLog('multisite middleware end in %dms: %o', {
        rewritePath: '/_site_qsFoo/styleguide',
        siteName: 'qsFoo',
        headers: {
          ...finalRes.headers,
          'x-sc-rewrite': '/_site_qsFoo/styleguide',
        },
        cookies: 'sc_site=qsFoo; HttpOnly; Secure; SameSite=None',
      });

      expect(siteResolver.getByHost.called).to.be.false;
      expect(siteResolver.getByName.called).to.be.false;

      expect(mockNext).calledWith(
        sinon.match({ pathname: '/_site_qsFoo/styleguide' })
      );
    });

    it('sc_site cookie is provided and its usage enabled', async () => {
      const context = createContext({
        cookieValues: { sc_site: 'foobar' },
      });

      const mockNext = sinon.stub().returns(
        createResponse({
          headers: [],
        })
      );

      const { middleware, siteResolver } = createMiddleware({
        config: { ...defaultConfig, useCookieResolution: () => true },
      });

      const finalRes = await middleware.handle(context, mockNext);

      validateDebugLog('multisite middleware start: %o', {
        pathname: '/styleguide',
        language: 'en',
        hostname: 'foo.net',
      });

      validateEndMessageDebugLog('multisite middleware end in %dms: %o', {
        rewritePath: '/_site_foobar/styleguide',
        siteName: 'foobar',
        headers: {
          ...finalRes.headers,
          'x-sc-rewrite': '/_site_foobar/styleguide',
        },
        cookies: 'sc_site=foobar; HttpOnly; Secure; SameSite=None',
      });

      expect(siteResolver.getByHost.called).to.be.false;
      expect(siteResolver.getByName.called).to.be.false;

      expect(mockNext).calledWith(
        sinon.match({ pathname: '/_site_foobar/styleguide' })
      );
    });

    it('sc_site cookie is provided and its usage disabled', async () => {
      const context = createContext({
        cookieValues: { sc_site: 'foobar' },
      });

      const mockNext = sinon.stub().returns(
        createResponse({
          headers: [],
        })
      );

      const { middleware, siteResolver } = createMiddleware();

      const finalRes = await middleware.handle(context, mockNext);

      validateDebugLog('multisite middleware start: %o', {
        pathname: '/styleguide',
        language: 'en',
        hostname: 'foo.net',
      });

      validateEndMessageDebugLog('multisite middleware end in %dms: %o', {
        rewritePath: '/_site_foo/styleguide',
        siteName: 'foo',
        headers: {
          ...finalRes.headers,
          'x-sc-rewrite': '/_site_foo/styleguide',
        },
        cookies: 'sc_site=foo; HttpOnly; Secure; SameSite=None',
      });

      expect(siteResolver.getByHost.calledWith('foo.net')).to.be.true;

      expect(mockNext).calledWith(
        sinon.match({ pathname: '/_site_foo/styleguide' })
      );
    });
  });

  describe('error handling', () => {
    const context = createContext();
    const res = createResponse();

    let errorSpy: sinon.SinonSpy<[message?: any, ...optionalParams: any[]], void>;

    before(() => {
      errorSpy = spy(console, 'log');
    });

    beforeEach(() => {
      errorSpy.resetHistory();
    });

    after(() => {
      errorSpy.restore();
    });

    it('should handle error', async () => {
      const error = new Error('Custom error');

      class SampleSiteResolver extends SiteResolver {
        constructor(sites: SiteInfo[]) {
          super(sites);
        }

        getByHost = () => {
          throw error;
        };
      }

      const middleware = new MultisiteMiddleware({ ...defaultConfig });
      middleware['siteResolver'] = new SampleSiteResolver([]);

      const mockNext = sinon.stub().returns(res);

      const finalRes = await middleware.handle(context, mockNext);

      expect(errorSpy.getCall(0).calledWith('Multisite middleware failed:')).to
        .be.true;
      expect(errorSpy.getCall(1).calledWith(error)).to.be.true;

      expect(finalRes).to.deep.equal(res);
    });
  });
});
