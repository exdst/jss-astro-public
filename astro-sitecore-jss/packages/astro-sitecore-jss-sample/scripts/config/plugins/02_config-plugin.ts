import type { IConfigPlugin, JssConfig } from "../config-generator";

/*
 * This plugin sets configuration properties based on scjssconfig.json
 */
class ConfigPlugin implements IConfigPlugin {
  order = 20;

  async execute(config: JssConfig): Promise<JssConfig> {
    console.log("Config Plugin");

    const scJssConfig = require("../../../scjssconfig.json");
    if(!scJssConfig) {
      return config;
    }

    const getValue = (key: string): string => {
      return scJssConfig.sitecore[key]
          || config[key]
          || "";
    };
 
    const apiHost = getValue("sitecoreApiHost");
    const graphQLEndpointPath = getValue("graphQLEndpointPath");
    const graphQLEndpoint = getValue("graphQLEndpoint") || `${apiHost}${graphQLEndpointPath}`;

    return Object.assign({}, config, {
      jssAppName: getValue("jssAppName"),
      sitecoreApiKey: getValue("sitecoreApiKey"),
      sitecoreApiHost: apiHost,      
      graphQLEndpointPath: graphQLEndpointPath,
      graphQLEndpoint: graphQLEndpoint,
      rootItemId: getValue("rootItemId"),
      defaultLanguage: getValue("defaultLanguage"),
      fetchWith: getValue("fetchWith")
    });
  }
}

export const configPlugin = new ConfigPlugin();