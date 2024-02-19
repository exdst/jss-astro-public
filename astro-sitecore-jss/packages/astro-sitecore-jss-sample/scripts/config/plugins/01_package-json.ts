import type {IConfigPlugin, JssConfig} from "../config-generator";
import packageConfig from "./../../../package.json";

/*
 * This plugin sets configuration properties based on package.json.
 * But it can override a value set from scjssconfig.json in case it is undefined or empty only. 
 */
class PackageJsonPlugin implements IConfigPlugin {
  order =  10;

  async execute(config: JssConfig): Promise<JssConfig> {
    console.log("PackageJson Plugin");

    if(!packageConfig) {
      return config;
    }

    return Object.assign({}, config, {
      sitecoreSiteName: packageConfig.config.appName || config.sitecoreSiteName || "",
      defaultLanguage: packageConfig.config.language || config.defaultLanguage || ""
    });
  }
}

export const packageJsonPlugin = new PackageJsonPlugin();