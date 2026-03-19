export const getEditingSecret = (): string => {
  const secret = import.meta.env?.SITECORE_EDITING_SECRET || process.env.SITECORE_EDITING_SECRET;

  if (!secret || secret.length === 0) {
    throw new Error('The SITECORE_EDITING_SECRET environment variable is missing or invalid.');
  }
  return secret.toLowerCase();
};

export const extractPath = (params: Record<string, string | undefined>) => {
  return params === undefined
    ? '/'
    : Array.isArray(params.path)
    ? params.path.join('/')
    : params.path ?? '/';
};

export const removeLanguageFromPath = (path: string, languages: string[]): string => {
  const segments = path.split('/');

  const langs = languages.map((lang) => lang.toLowerCase());

  if (segments.length > 0 && langs.includes(segments[0].toLowerCase())) {
    // E.g. /en/About
    segments.splice(0, 1);
  } else if (segments.length > 1 && langs.includes(segments[1].toLowerCase())) {
    // if path contains _site_ segment before language
    // E.g. /_site_Basic/en/About
    segments.splice(1, 1);
  }

  return segments.join('/') || '/';
};

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
