/* eslint-disable no-unused-expressions */
import { expect, use } from 'chai';
import spies from 'chai-spies';
import { addClassName, extractPath, getEditingSecret, removeLanguageFromPath } from './utils';

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

  it('should keep attributes unchanged when class is absent', () => {
    const modifiableAttrs = {
      className: 'first-class',
      id: 'image',
    };
    addClassName(modifiableAttrs);
    expect(modifiableAttrs).to.deep.equal({
      className: 'first-class',
      id: 'image',
    });
  });
});

describe('extractPath', () => {
  it('should return root slash when params are undefined', () => {
    const result = extractPath(undefined as unknown as Record<string, string | undefined>);
    expect(result).to.equal('/');
  });

  it('should join path segments when path is an array', () => {
    const result = extractPath({ path: ['about', 'team'] as unknown as string });
    expect(result).to.equal('about/team');
  });

  it('should return path when path is a string', () => {
    const result = extractPath({ path: 'about' });
    expect(result).to.equal('about');
  });

  it('should return root slash when path is missing', () => {
    const result = extractPath({});
    expect(result).to.equal('/');
  });
});

describe('removeLanguageFromPath', () => {
  const languages = ['en', 'fr', 'de-DE'];

  it('should remove a leading language segment', () => {
    const result = removeLanguageFromPath('en/About', languages);
    expect(result).to.equal('About');
  });

  it('should remove a language segment following a _site_ segment', () => {
    const result = removeLanguageFromPath('_site_Basic/en/About', languages);
    expect(result).to.equal('_site_Basic/About');
  });

  it('should match languages case-insensitively', () => {
    const result = removeLanguageFromPath('_site_Basic/FR/About', languages);
    expect(result).to.equal('_site_Basic/About');
  });

  it('should return root slash when path only contains a language segment', () => {
    const result = removeLanguageFromPath('en', languages);
    expect(result).to.equal('/');
  });

  it('should leave path unchanged when no supported language is found', () => {
    const result = removeLanguageFromPath('es/About', languages);
    expect(result).to.equal('es/About');
  });
});
