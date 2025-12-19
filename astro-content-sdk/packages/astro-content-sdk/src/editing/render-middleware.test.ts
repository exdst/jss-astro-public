/* eslint-disable dot-notation */
import chai from 'chai';
import chaiString from 'chai-string';
import { QUERY_PARAM_EDITING_SECRET } from '@sitecore-content-sdk/core/editing';
import { RenderMiddlewareBase } from './render-middleware';
import {
  QUERY_PARAM_VERCEL_PROTECTION_BYPASS,
  QUERY_PARAM_VERCEL_SET_BYPASS_COOKIE,
  EDITING_PASS_THROUGH_HEADERS,
} from './constants';

const expect = chai.use(chaiString).expect;

describe('RenderMiddlewareBase', () => {
  class SampleMiddleware extends RenderMiddlewareBase {}

  describe('getQueryParamsForPropagation', () => {
    it('should construct query params for protection bypass', () => {
      const middleware = new SampleMiddleware();

      const secret = 'secret1234';
      const vercelBypassToken = 'token1234Vercel';
      const vercelBypassCookie = 'samesitenone';
      const query = new URLSearchParams({
        [QUERY_PARAM_EDITING_SECRET]: secret,
        [QUERY_PARAM_VERCEL_PROTECTION_BYPASS]: vercelBypassToken,
        [QUERY_PARAM_VERCEL_SET_BYPASS_COOKIE]: vercelBypassCookie,
      });

      const approvedQuery = new URLSearchParams({
        [QUERY_PARAM_VERCEL_PROTECTION_BYPASS]: vercelBypassToken,
        [QUERY_PARAM_VERCEL_SET_BYPASS_COOKIE]: vercelBypassCookie,
      });

      expect(middleware['getQueryParamsForPropagation'](query)).to.deep.equal(approvedQuery);
    });
  });

  describe('getHeadersForPropagation', () => {
    it('should return approved headers', () => {
      const middleware = new SampleMiddleware();

      const allHeaders = new Headers();
      const approvedHeaders = new Headers();

      EDITING_PASS_THROUGH_HEADERS.forEach((key) => {
        allHeaders.append(key, `${key}-value`);
        approvedHeaders.append(key, `${key}-value`);
      });

      allHeaders.append('nope', 'nope');
      allHeaders.append('should-not-pass', 'n/a');

      expect(middleware['getHeadersForPropagation'](allHeaders)).to.deep.equal(approvedHeaders);
    });
  });
});
