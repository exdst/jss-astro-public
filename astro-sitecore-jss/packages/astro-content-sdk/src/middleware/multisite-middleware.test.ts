/* eslint-disable no-unused-expressions */
/* eslint-disable dot-notation */
import * as chai from 'chai';
import { use } from 'chai';
import chaiString from 'chai-string';
import sinonChai from 'sinon-chai';
import sinon, { spy } from 'sinon';
import { debug } from '@sitecore-content-sdk/core';

import { MultisiteMiddleware } from './multisite-middleware';
import { SiteResolver } from '@sitecore-content-sdk/core/site';
import { APIContext, AstroCookieSetOptions } from 'astro';

use(sinonChai);
const expect = chai.use(chaiString).expect;

describe('MultisiteMiddleware', () => {
  const debugSpy = spy(debug, 'multisite');
  const validateDebugLog = (message, ...params) =>
    expect(debugSpy.args.find((log) => log[0] === message)).to.deep.equal([
      message,
      ...params,
    ]);
  const validateEndMessageDebugLog = (message, params) => {
    const logParams = debugSpy.args.find(
      (log) => log[0] === message
    ) as Array<unknown>;

    expect(logParams[2]).to.deep.include(params);
  };

  const siteName = 'foo';

  const defaultConfig = {
    sites: [],
    enabled: true,
    useCookieResolution: () => false,
    defaultHostname: '',
  };

  const createContext = (props: any = {}) => {
    const context = {
      ...props,
      request: {
        url: '',
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
      url: {
        pathname: '/styleguide',
        origin: 'https://test.test',
        searchParams: {
          get(key) {
            return context.url.searchParams[key];
          },
          ...props.searchParams,
        },
        ...props.url,
      },
      currentLocale: props.currentLocale,
      preferredLocale: props.preferredLocale,
      rewrite: (_) => props.response,
    } as APIContext;

    Object.defineProperties(context.request.headers, {
      forEach: {
        value: (cb) => {
          Object.keys(context.request.headers).forEach((key) =>
            cb(context.request.headers[key], key, context.request.headers)
          );
        },
        enumerable: false,
      },
    });

    return context;
  };

  const createResponse = (props: any = {}) => {
    const res = {
      ...props,
    } as Response;

    return res;
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
      const mockNext = async () => res;

      const test = async (pathname: string, middleware) => {
        const context = createContext({
          url: {
            pathname,
          },
        });

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
  });

  describe('preview', () => {
    it('prerender bypass cookie is present', async () => {
      const { middleware } = createMiddleware();
      const res = createResponse();
      const mockNext = async () => res;

      const context = createContext({
        cookieValues: {
          _preview_data: true,
        },
      });

      const finalRes = await middleware.handle(context, mockNext);

      validateDebugLog('skipped (preview)');

      expect(finalRes).to.deep.equal(res);
    });
  });

  describe('Sitecore Preview', () => {
    it('request is passed', async () => {
      const defaultSiteCookieAttributes = {
        secure: true,
        httpOnly: true,
        sameSite: 'none',
      };

      const context = createContext({
        cookieValues: { sc_site: 'foobar', sc_preview: 'true' },
      });

      const res = createResponse();
      const mockNext = sinon.spy(async () => res);

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
          ...context.request.headers,
          'x-sc-rewrite': '/_site_foobar/styleguide',
        },
        cookies: {
          ...context.cookies,
          sc_site: {
            ...defaultSiteCookieAttributes,
            value: 'foobar',
          },
        },
      });

      expect(siteResolver.getByHost.called).to.be.false;
      expect(siteResolver.getByName.called).to.be.false;

      expect(finalRes).to.deep.equal(res);

      expect(mockNext).calledWith('/_site_foobar/styleguide');
    });
  });

  describe('request passed', () => {
    const defaultSiteCookieAttributes = {
      secure: true,
      httpOnly: true,
      sameSite: 'none',
    };

    it('fallback hostname is used', async () => {
      const context = createContext({
        headerValues: { host: undefined },
      });

      const res = createResponse();
      const mockNext = sinon.spy(async () => res);

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
          ...context.request.headers,
          'x-sc-rewrite': '/_site_foo/styleguide',
        },
        cookies: {
          ...context.cookies,
          sc_site: {
            ...defaultSiteCookieAttributes,
            value: 'foo',
          },
        },
      });

      expect(siteResolver.getByHost.calledWith('bar.net')).to.be.true;

      expect(finalRes).to.deep.equal(res);

      expect(mockNext).calledWith('/_site_foo/styleguide');
    });

    it('fallback default hostName is used', async () => {
      const context = createContext({
        headerValues: { host: undefined },
      });

      const res = createResponse();
      const mockNext = sinon.spy(async () => res);

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
          ...context.request.headers,
          'x-sc-rewrite': '/_site_foo/styleguide',
        },
        cookies: {
          ...context.cookies,
          sc_site: {
            ...defaultSiteCookieAttributes,
            value: 'foo',
          },
        },
      });

      expect(siteResolver.getByHost).to.be.calledWith('localhost');

      expect(finalRes).to.deep.equal(res);

      expect(mockNext).calledWith('/_site_foo/styleguide');
    });

    it('host header is used', async () => {
      const context = createContext();

      const res = createResponse();
      const mockNext = sinon.spy(async () => res);

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
          ...context.request.headers,
          'x-sc-rewrite': '/_site_foo/styleguide',
        },
        cookies: {
          ...context.cookies,
          sc_site: {
            ...defaultSiteCookieAttributes,
            value: 'foo',
          },
        },
      });

      expect(siteResolver.getByHost).to.be.calledWith('foo.net');

      expect(finalRes).to.deep.equal(res);

      expect(mockNext).calledWith('/_site_foo/styleguide');
    });

    it('custom response object is not provided', async () => {
      const context = createContext();

      const res = createResponse();
      const mockNext = sinon.spy(async () => res);

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
          ...context.request.headers,
          'x-sc-rewrite': '/_site_foo/styleguide',
        },
        cookies: {
          ...context.cookies,
          sc_site: {
            ...defaultSiteCookieAttributes,
            value: 'foo',
          },
        },
      });

      expect(siteResolver.getByHost).to.be.calledWith('foo.net');

      expect(finalRes).to.deep.equal(res);

      expect(mockNext).calledWith('/_site_foo/styleguide');
    });

    it('sc_site querystring parameter is provided', async () => {
      const context = createContext({
        searchParams: { sc_site: 'qsFoo' },
      });

      const res = createResponse();
      const mockNext = sinon.spy(async () => res);

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
          ...context.request.headers,
          'x-sc-rewrite': '/_site_qsFoo/styleguide',
        },
        cookies: {
          ...context.cookies,
          sc_site: {
            ...defaultSiteCookieAttributes,
            value: 'qsFoo',
          },
        },
      });

      expect(siteResolver.getByHost.called).to.be.false;
      expect(siteResolver.getByName.called).to.be.false;

      expect(finalRes).to.deep.equal(res);

      expect(mockNext).calledWith('/_site_qsFoo/styleguide');
    });

    it('sc_site cookie is provided and its usage enabled', async () => {
      const context = createContext({
        cookieValues: { sc_site: 'foobar' },
      });

      const res = createResponse();
      const mockNext = sinon.spy(async () => res);

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
          ...context.request.headers,
          'x-sc-rewrite': '/_site_foobar/styleguide',
        },
        cookies: {
          ...context.cookies,
          sc_site: {
            ...defaultSiteCookieAttributes,
            value: 'foobar',
          },
        },
      });

      expect(siteResolver.getByHost.called).to.be.false;
      expect(siteResolver.getByName.called).to.be.false;

      expect(finalRes).to.deep.equal(res);

      expect(mockNext).calledWith('/_site_foobar/styleguide');
    });

    it('sc_site cookie is provided and its usage disabled', async () => {
      const context = createContext({
        cookieValues: { sc_site: 'foobar' },
      });

      const res = createResponse();
      const mockNext = sinon.spy(async () => res);

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
          ...context.request.headers,
          'x-sc-rewrite': '/_site_foo/styleguide',
        },
        cookies: {
          ...context.cookies,
          sc_site: {
            ...defaultSiteCookieAttributes,
            value: 'foo',
          },
        },
      });

      expect(siteResolver.getByHost.calledWith('foo.net')).to.be.true;

      expect(finalRes).to.deep.equal(res);

      expect(mockNext).calledWith('/_site_foo/styleguide');
    });
  });

  describe('error handling', () => {
    const context = createContext();
    const res = createResponse();
    const mockNext = async () => res;

    let errorSpy;

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
        constructor(sites) {
          super(sites);
        }

        getByHost = () => {
          throw error;
        };
      }

      const middleware = new MultisiteMiddleware({ ...defaultConfig });
      middleware['siteResolver'] = new SampleSiteResolver([]);

      const finalRes = await middleware.handle(context, mockNext);

      expect(errorSpy.getCall(0).calledWith('Multisite middleware failed:')).to
        .be.true;
      expect(errorSpy.getCall(1).calledWith(error)).to.be.true;

      expect(finalRes).to.deep.equal(res);
    });
  });
});
