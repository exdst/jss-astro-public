
import jssI18n from '@sitecore-jss/sitecore-jss/i18n';
import type { DictionaryService } from '@sitecore-jss/sitecore-jss/i18n';
import jss from '@sitecore-jss/sitecore-jss';
import config from '../temp/config';

const { RestDictionaryService, GraphQLDictionaryService} = jssI18n;
const { constants } = jss;

/**
 * Factory responsible for creating a DictionaryService instance
 */
export class DictionaryServiceFactory {  
  create(): DictionaryService {
    return process.env.FETCH_WITH === constants.FETCH_WITH.GRAPHQL
      ? new GraphQLDictionaryService({
          endpoint: config.graphQLEndpoint,
          apiKey: config.sitecoreApiKey,
          siteName: config.sitecoreSiteName,
          /*
            The Dictionary Service needs a root item ID in order to fetch dictionary phrases for the current
            app. If your Sitecore instance only has 1 JSS App, you can specify the root item ID here;
            otherwise, the service will attempt to figure out the root item for the current JSS App using GraphQL and app name.
          */
          rootItemId: '{1CC41A46-5AB8-4487-B321-FA4B8847EB37}',
        })
      : new RestDictionaryService({
          apiHost: config.sitecoreApiHost,
          apiKey: config.sitecoreApiKey,
          siteName: config.sitecoreSiteName,
        });
  }
}

/** DictionaryServiceFactory singleton */
export const dictionaryServiceFactory = new DictionaryServiceFactory();
