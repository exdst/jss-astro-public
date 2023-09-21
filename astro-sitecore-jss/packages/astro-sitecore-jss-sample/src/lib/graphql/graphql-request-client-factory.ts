import jss from "@sitecore-jss/sitecore-jss/graphql";
import type { GraphQLRequestClientConfig } from "@sitecore-jss/sitecore-jss/graphql";
import type { Debugger } from "@sitecore-jss/sitecore-jss";
import config from "../../temp/config";
const { GraphQLRequestClient } = jss;


export default class GraphQLRequestClientFactory {
  create(debug: Debugger) {
    const graphQlConfig: GraphQLRequestClientConfig = {
      apiKey: config.sitecoreApiKey,
      debugger: debug
    };

    return new GraphQLRequestClient(config.graphQLEndpoint, graphQlConfig);
  }
}