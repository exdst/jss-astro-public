import type {IConfigPlugin, JssConfig} from "../config-generator";

/*
 * This plugin initializes properties that are left empty or undefined with fallback values.
 * If neither env, nor other places has a proper value, this ensures a fallback is set.
 */
class FallbackPlugin implements IConfigPlugin {
  order = 100;
  
  async execute(config: JssConfig): Promise<JssConfig> {
    console.log("Fallback Plugin");

    return Object.assign({}, config, {
      sitecoreApiKey: config.sitecoreApiKey || 'no-api-key-set',
      defaultLanguage: config.defaultLanguage || 'en'      
    });
  }
}

export const fallbackPlugin = new FallbackPlugin();