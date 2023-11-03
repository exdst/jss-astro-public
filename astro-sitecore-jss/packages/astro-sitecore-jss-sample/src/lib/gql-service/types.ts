// gql response types
export type IQueryResult<T> = {
  contextItem: {
    id: string;
    pageTitle: IPageTitle;
    children: {
      results: T[];
    };
  };
  datasource: IDatasource;
  errors: object;
};

export type IResultsItem = {
  id: string;
  pageTitle: IPageTitle;
  url: {
    path: string;
  };
};

export type IDatasource = {
  id: string;
  name: string;
  sample1: {
    value: string;
    jsonValue: object;
  };
  sample2: {
    text: string;
    url: string;
    target: string;
    definition: object;
    jsonValue: object;
  };
};

export type IPageTitle = {
  value: string;
  jsonValue: object;
};
