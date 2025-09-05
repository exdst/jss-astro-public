import { getAllowedOriginsFromEnv } from '@sitecore-content-sdk/core/utils';
import * as cookie from 'cookie';

export const getEditingSecret = (): string => {
  const secret = process.env.SITECORE_EDITING_SECRET;

  if (!secret || secret.length === 0) {
    throw new Error(
      'The SITECORE_EDITING_SECRET environment variable is missing or invalid.'
    );
  }
  return secret.toLowerCase();
};

export const enforceCors = (
  req: Request,
  res: Response,
  allowedOrigins?: string[]
): boolean => {
  // origin in not present for non-CORS requests (e.g. server-side) - so we skip the checks
  if (!req.headers.get('origin')) {
    return true;
  }

  // 3 sources of allowed origins are considered:
  // the env value
  const defaultAllowedOrigins = getAllowedOriginsFromEnv();
  // the allowedOrigins prop
  allowedOrigins = defaultAllowedOrigins.concat(allowedOrigins || []);
  // and the existing CORS header, if present (i.e. set by nextjs config)
  const presetCors = res.headers.get('Access-Control-Allow-Origin');
  if (presetCors) {
    allowedOrigins.push(presetCors as string);
  }

  const origin = req.headers.get('origin');
  if (
    origin &&
    allowedOrigins.some(
      (allowedOrigin) =>
        origin === allowedOrigin ||
        new RegExp(convertToWildcardRegex(allowedOrigin)).test(origin)
    )
  ) {
    res.headers.append('Access-Control-Allow-Origin', origin);
    res.headers.append(
      'Access-Control-Allow-Methods',
      'GET, POST, OPTIONS, DELETE, PUT, PATCH'
    );

    // set the allowed headers for preflight requests
    if (req.method === 'OPTIONS') {
      res.headers.append(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization'
      );
    }

    return true;
  }
  return false;
};

export const extractPath = (params: Record<string, string | undefined>) => {
  return params === undefined
    ? '/'
    : Array.isArray(params.path)
      ? params.path.join('/')
      : params.path ?? '/';
};

export const parseCookie = (value: string): Record<string, string | undefined> => {
  return cookie.parse(value);
}

/**
 * "class" property will be transformed into or appended to "className" instead.
 * @param {string} otherAttrs all other props included on the image component
 * @returns {void}
 */
export const addClassName = (otherAttrs: { [key: string]: unknown }): void => {
  if (otherAttrs.class) {
    // if any classes are defined properly already
    if (otherAttrs.className) {
      let className: string = otherAttrs.className as string;
      className += ` ${otherAttrs.class}`;
      otherAttrs.className = className;
    } else {
      otherAttrs.className = otherAttrs.class;
    }
    delete otherAttrs.class;
  }
};

/**
 * Converts a string value in a regex pattern allowing wildcard matching
 * @param {string} pattern input with wildcards i.e. site.*.com
 * @returns {string} modified string that can be used as regexp input
 */
const convertToWildcardRegex = (pattern: string) => {
  return (
    '^' +
    pattern.replace(/\//g, '\\/').replace(/\./g, '\\.').replace(/\*/g, '.*') +
    '$'
  );
};
