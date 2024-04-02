const plugins = require("./../config/plugins");

export interface JssConfig extends Record<string, string | undefined> {
  sitecoreSiteName?: string;
  sitecoreApiKey?: string;
  sitecoreApiHost?: string;
  graphQLEndpointPath?: string;
  graphQLEndpoint?: string;
  rootItemId?: string;
  defaultLanguage?: string;
  fetchWith?: string;
}

export interface IConfigPlugin {
  order: number;

  execute(config: JssConfig): Promise<JssConfig>;
}

class JssConfigGenerator {
  public async generateConfig(defaultConfig: JssConfig = {}): Promise<JssConfig> {
    const configPlugins: IConfigPlugin[] = Object.values(plugins) as IConfigPlugin[];
    
    const result: Promise<JssConfig> = configPlugins
      .sort((x, y) => x.order - y.order)
      .reduce((promise, plugin) => 
        promise.then(config => plugin.execute(config)),
        Promise.resolve(defaultConfig));

    return result;
  }
}

export const jssConfigGenerator = new JssConfigGenerator();