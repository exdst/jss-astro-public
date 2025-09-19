export type Query = {
  [key: string]: string | string[];
};

const baseUrl = 'https://test.com';

export const mockRequest = ({
  url,
  method,
  query,
  headers,
}: {
  url?: string;
  method?: string;
  query?: Query;
  headers?: { [key: string]: string };
}) => {
  const requestUrl = addQueryToUrl(url || baseUrl, query);
  return new Request(requestUrl, {
    method,
    headers: headers,
  });
};

export const addQueryToUrl = (baseUrl: string, query?: Query): string => {
  const url = new URL(baseUrl);
  const params = new URLSearchParams();

  if (query) {
    for (const key in query) {
      const value = query[key];

      if (Array.isArray(value)) {
        value.forEach((item) => {
          params.append(key, item);
        });
      } else {
        params.append(key, value);
      }
    }

    params.forEach((value, key) => {
      url.searchParams.append(key, value);
    });
  }

  return url.toString();
};
