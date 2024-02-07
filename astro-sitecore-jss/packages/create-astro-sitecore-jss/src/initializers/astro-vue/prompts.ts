import { Answers, DistinctQuestion } from 'inquirer';
import chalk from 'chalk';


/*
  "sitecore": {
    "jssAppName": "astro",
    "sitecoreApiKey": "{D028BE48-F2F7-4111-A067-CD6EFC9ED0A9}",    
    "sitecoreApiHost": "https://astro.headless.localhost",
    "rootItemId": "{1CC41A46-5AB8-4487-B321-FA4B8847EB37}",
    "graphQLEndpoint": "",
    "graphQLEndpointPath": "/sitecore/api/graph/edge",
    "defaultLanguage": "en",
    "fetchWith": "GraphQL"
  }
*/

export type AstroAnswer = Answers & {
  /**
   * Application name
   */
  appName: string;
  /**
   * Application host name
   */
  hostName: string;
  /**
   * Sitecore API host name
   */
  sitecoreApiHost: string;
  /**
   * Sitecore API key
   */
  sitecoreApiKey: string;
  /**
   * Sitecore Root Item ID
  */
  rootItemId: string;
};

const DEFAULT_APPNAME = 'astro';

export const clientAppPrompts: DistinctQuestion<AstroAnswer>[] = [
  {
    type: 'input',
    name: 'appName',
    message: 'What is the name of your app?',
    default: DEFAULT_APPNAME,
    validate: (input: string): boolean => {
      if (!/^[a-z\-_.]+$/.test(input)) {
        console.error(
          chalk.red(
            `${input} is not a valid name; you may use lowercase letters, hyphens, and underscores only.`
          )
        );
        return false;
      }
      return true;
    },
    when: (answers: AstroAnswer): boolean => {
      if (answers.yes && !answers.appName) {
        answers.appName = DEFAULT_APPNAME;
      }
      return !answers.appName;
    },
  },
  {
    type: 'input',
    name: 'sitecoreApiHost',
    message: 'What is your Sitecore host?',
    default: (answers: AstroAnswer) => `${answers.sitecoreApiHost}`,
    when: (answers: AstroAnswer): boolean => {
      if (answers.yes && !answers.sitecoreApiHost) {
        answers.hostName = `${answers.sitecoreApiHost}`;
      }
      return !answers.sitecoreApiHost;
    },
  },
  {
    type: 'input',
    name: 'sitecoreApiKey',
    message: 'What is your Sitecore API key?',
    default: (answers: AstroAnswer) => `${answers.sitecoreApiKey}`,
    when: (answers: AstroAnswer): boolean => {
      if (answers.yes && !answers.sitecoreApiKey) {
        answers.hostName = `${answers.sitecoreApiKey}`;
      }
      return !answers.sitecoreApiKey;
    },
  },
  {
    type: 'input',
    name: 'rootItemId',
    message: 'What is your Sitecore app root item ID? (used to get proper Dictionary)',
    default: (answers: AstroAnswer) => `${answers.rootItemId}`,
    when: (answers: AstroAnswer): boolean => {
      if (answers.yes && !answers.rootItemId) {
        answers.hostName = `${answers.rootItemId}`;
      }
      return !answers.rootItemId;
    },
  },
];

export const prompts = clientAppPrompts;
