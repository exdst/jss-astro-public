import jss from "@sitecore-jss/sitecore-jss";
import config from "../../temp/config";
import type { GraphQLClient, PageInfo } from "@sitecore-jss/sitecore-jss/graphql";
import type GraphQLRequestClientFactory from "../graphql/graphql-request-client-factory";
const { debug } = jss;

export type StaticPath = {
  params: {
    path?: string;
  }
};

export type RouteQueryResult = {
  path: string;
};

export type SiteRouteQueryResult<T> = {
  site: {
    siteInfo: {
      routes: {
        pageInfo: PageInfo;
        results: T[];
      }
    }
  }
}

export interface ISitemapService {
  getStaticSitemap(language: string): Promise<StaticPath[]>;
}

type SitemapQueryArgs = {
  siteName: string;
  language: string;
  pageSize: number;
};

export class SitemapService implements ISitemapService {
  private readonly _siteMapQuery: string = `
  query DefaultSitemapQuery(
    $siteName: String!
    $language: String!
    $pageSize: Int = 10
    $after: String
  ) {
    site {
      siteInfo(site: $siteName) {
        routes(
          language: $language
          first: $pageSize
          after: $after
        ){
          total
          pageInfo {
            endCursor
            hasNext
          }
          results {
            path: routePath            
          }
        }
      }
    }
  }
  `;

  private readonly _pageSize: number = 20;

  private _graphQlClient: GraphQLClient

  constructor(graphQlClientFactory: GraphQLRequestClientFactory) {
    this._graphQlClient = graphQlClientFactory.create(debug.sitemap);
  }

  async getStaticSitemap(language: string): Promise<StaticPath[]> {
    const routes: RouteQueryResult[] = await this.fetchSitemap(language);
    
    return routes.filter(route => {
      if(route.path) {
        return true;
      }

      return false;
    }).map(route => {
      let normalized:string|undefined = undefined;
      if(route.path !== "/") {
        normalized = route.path.replace(/^\/|\/$/g, "");
      }

      return {
        params: {
          path: normalized,
        }
      };
    });
  }

  protected async fetchSitemap(language: string): Promise<RouteQueryResult[]> {
    const args: SitemapQueryArgs = {
      siteName: config.jssAppName,
      language: language,
      pageSize: this._pageSize
    };

    let result: RouteQueryResult[] = [];
    let hasNext = true;
    let after = "";

    while(hasNext) {
      const response = await this._graphQlClient.request<SiteRouteQueryResult<RouteQueryResult>>(this._siteMapQuery, { ...args, after });
      result = result.concat(response.site.siteInfo?.routes.results);
      hasNext = response.site.siteInfo.routes?.pageInfo.hasNext;
      after = response.site.siteInfo.routes?.pageInfo.endCursor;
    }

    return result;
  }
}