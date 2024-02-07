import jss from '@sitecore-jss/sitecore-jss';
import config from '../../temp/config';
import type { IQueryResult, IResultsItem } from './types';
import type { GraphQLClient } from '@sitecore-jss/sitecore-jss/graphql';
import type GraphQLRequestClientFactory from '../graphql/graphql-request-client-factory';

const { debug } = jss;

// gql query variables

type QueryArgs = {
  contextItem: string;
  datasource: string;
  language: string;
};

// service definition

export interface IGQLConnectedDemoService {
  getContextItemData(
    itemId: string,
    datasourceId: string,
    language: string
  ): Promise<IQueryResult<IResultsItem>>;
}

export class GQLConnectedDemoService implements IGQLConnectedDemoService {
  private readonly gqlQuery: string = `
  query ConnectedDemoQuery($datasource: String!, $contextItem: String!, $language: String!) {
    # Datasource query
    # $datasource should be set to the ID of the rendering's datasource item
    datasource: item(path: $datasource, language: $language) {
      id
      name
      # Strongly-typed querying on known templates is possible!
      ...on GraphQLConnectedDemo {
        # Single-line text field
        sample1 {
          # the 'jsonValue' field is a JSON blob that represents the object that
          # should be passed to JSS field rendering helpers (i.e. text, image, link)
          jsonValue
          value
        }
        # General Link field
        sample2 {
          jsonValue
          # Structured querying of the field's values is possible
          text
          target
          url
          # Access to the template definition is possible
          definition {
            type
            shared
          }
        }
      }
    }
  
    # Context/route item query
    # $contextItem should be set to the ID of the current context item (the route item)
    contextItem: item(path: $contextItem, language: $language) {
      id
      # Get the page title from the app route template
      ...on AppRoute  {
        pageTitle {
          value
        }
      }
  
      # List the children of the current route
      children(hasLayout: true) {
        results {
          id
          # typing fragments can be used anywhere!
          # so in this case, we're grabbing the 'pageTitle'
          # field on all child route items.
          ...on AppRoute  {
            pageTitle {
              jsonValue
              value
            }
          }
          url{
            path
          }
        }
      }
    }
  }
  `;

  private _graphQlClient: GraphQLClient;

  constructor(graphQlClientFactory: GraphQLRequestClientFactory) {
    this._graphQlClient = graphQlClientFactory.create(debug.common);
  }

  async getContextItemData(
    itemId: string,
    datasourceId: string,
    language: string
  ): Promise<IQueryResult<IResultsItem>> {
    try {
      const routeQueryResult: IQueryResult<IResultsItem> =
        await this.fetchQuery(itemId, datasourceId, language);      
      return routeQueryResult;
    } catch (error) {
      const routeQueryResultDefault: IQueryResult<IResultsItem> = {
        contextItem: {
          id: '',
          pageTitle: {
            value: '',
            jsonValue: {
              value: '',
            },
          },
          children: {
            results: [],
          },
        },
        datasource: {
          id: '',
          name: '',
          sample1: undefined,
          sample2: undefined,
        },
        errors: {...error?.response?.errors}
      };
      return routeQueryResultDefault;
    }
  }

  protected async fetchQuery(
    itemId: string,
    datasourceId: string,
    language: string
  ): Promise<IQueryResult<IResultsItem>> {
    const args: QueryArgs = {
      contextItem: itemId,
      datasource: datasourceId,
      language: language,
    };

    const response = await this._graphQlClient.request<
      IQueryResult<IResultsItem>
    >(this.gqlQuery, { ...args });
    return response;
  }
}
