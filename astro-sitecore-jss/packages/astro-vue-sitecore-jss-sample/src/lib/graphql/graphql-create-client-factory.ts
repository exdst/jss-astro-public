import jss from "@sitecore-jss/sitecore-jss/graphql";
import type { GraphQLRequestClientFactoryConfig } from "@sitecore-jss/sitecore-jss/graphql";
import config from "../../temp/config";
const { GraphQLRequestClient } = jss;

export const createGraphQLClientFactory = () => {
  let clientConfig: GraphQLRequestClientFactoryConfig;

  if (config.graphQLEndpoint && config.sitecoreApiKey) {
    clientConfig = {
      endpoint: config.graphQLEndpoint,
      apiKey: config.sitecoreApiKey,
    };
  } else {
    throw new Error('Please configure your graphQLEndpoint and sitecoreApiKey.');
  }

  return GraphQLRequestClient.createClientFactory(clientConfig);
};

export default createGraphQLClientFactory();