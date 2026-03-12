/* eslint-disable no-unused-expressions */
import { expect, use } from 'chai';
import spies from 'chai-spies';
import { addClassName, getEditingSecret } from './utils';

use(spies);

describe('utils', () => {
  describe('getEditingSecret', () => {
    afterEach(() => {
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
