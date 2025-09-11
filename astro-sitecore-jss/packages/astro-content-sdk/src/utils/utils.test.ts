/* eslint-disable no-unused-expressions */
import { expect, use, spy } from 'chai';
import spies from 'chai-spies';
import { addClassName, enforceCors, getEditingSecret } from './utils';

use(spies);

describe('utils', () => {
  describe('getEditingSecret', () => {
    after(() => {
      delete process.env.SITECORE_EDITING_SECRET;
    });

    it('should throw if env variable missing', () => {
      expect(() => getEditingSecret()).to.throw();
    });

    it('should return env variable', () => {
      const secret = '1234abcd';
      process.env.SITECORE_EDITING_SECRET = secret;
      const result = getEditingSecret();
      expect(result).to.equal(secret);
    });
  });
});

describe('enforceCors', () => {
  const mockOrigin = 'https://maybeallowed.com';
  const mockRequest = ({
    origin,
    method,
  }: { origin?: string; method?: string } = {}) => {
    return new Request(mockOrigin, {
      method: method || 'GET',
      headers: {
        origin: origin || mockOrigin,
      },
    });
  };

  const mockResponse = (presetCors?: string) => {
    const res = {
      headers: {},
    } as Response;

    res.headers.append = spy(() => {
      return res;
    });
    res.headers.get = spy((headerName: string) => {
      if (headerName === 'Access-Control-Allow-Origin') {
        return presetCors || null;
      } else {
        return null;
      }
    });

    return res;
  };

  it('should return true if origin is found in allowedOrigins from JSS_ALLOWED_ORIGINS env variable', () => {
    const req = mockRequest();
    const res = mockResponse();
    process.env.JSS_ALLOWED_ORIGINS = mockOrigin;
    expect(enforceCors(req, res)).to.be.equal(true);
    delete process.env.JSS_ALLOWED_ORIGINS;
  });

  it('should return true when theres no origin header', () => {
    const req = new Request(mockOrigin);
    const res = mockResponse();

    expect(enforceCors(req, res)).to.be.equal(true);
  });

  it('should return true if origin is found in allowedOrigins passed as argument', () => {
    const req = mockRequest({ origin: 'http://allowed.com' });
    const res = mockResponse();

    expect(enforceCors(req, res, ['http://allowed.com'])).to.be.equal(true);
  });

  it('should return false if origin matches neither allowedOrigins from JSS_ALLOWED_ORIGINS env variable nor argument', () => {
    const req = mockRequest({ origin: 'https://notallowed.com' });
    const res = mockResponse();
    process.env.JSS_ALLOWED_ORIGINS =
      'https://strictallowed.com, https://alsoallowed.com';
    expect(enforceCors(req, res, ['https://paramallowed.com'])).to.be.equal(
      false
    );
    delete process.env.JSS_ALLOWED_ORIGINS;
  });

  it('should return true when origin matches a wildcard value from allowedOrigins', () => {
    const req = mockRequest({ origin: 'https://allowed.dev.com' });
    const res = mockResponse();
    expect(enforceCors(req, res, ['https://allowed.*.com'])).to.be.equal(true);
  });

  it('should set Access-Control-Allow-Origin and Access-Control-Allow-Methods headers for matching origin', () => {
    const req = mockRequest();
    const res = mockResponse();
    const allowedMethods = 'GET, POST, OPTIONS, DELETE, PUT, PATCH';
    enforceCors(req, res, [mockOrigin]);
    expect(res.headers.append).to.have.been.called.with(
      'Access-Control-Allow-Origin',
      mockOrigin
    );
    expect(res.headers.append).to.have.been.called.with(
      'Access-Control-Allow-Methods',
      allowedMethods
    );
  });

  it('should set CORS headers for preflight OPTIONS request', () => {
    const req = mockRequest({ method: 'OPTIONS' });
    const res = mockResponse();
    const allowedMethods = 'GET, POST, OPTIONS, DELETE, PUT, PATCH';
    enforceCors(req, res, [mockOrigin]);
    expect(res.headers.append).to.have.been.called.with(
      'Access-Control-Allow-Origin',
      mockOrigin
    );
    expect(res.headers.append).to.have.been.called.with(
      'Access-Control-Allow-Methods',
      allowedMethods
    );
    expect(res.headers.append).to.have.been.called.with(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization'
    );
  });

  it('should consider existing CORS header when present', () => {
    const req = mockRequest({ origin: 'https://preallowed.com' });
    const res = mockResponse('https://preallowed.com');
    expect(enforceCors(req, res)).to.be.equal(true);
  });
});

describe('addClassName', () => {
  it('should add class attribute value to className', () => {
    const modifiableAttrs = {
      className: 'first-class',
      class: 'second-class',
    };
    addClassName(modifiableAttrs);
    expect(modifiableAttrs).to.deep.equal({
      className: 'first-class second-class',
    });

    it('should convert class attribute value to className when className is absent', () => {
      const modifiableAttrs = {
        class: 'second-class',
      };
      addClassName(modifiableAttrs);
      expect(modifiableAttrs).to.deep.equal({
        className: 'second-class',
      });
    });
  });
});
