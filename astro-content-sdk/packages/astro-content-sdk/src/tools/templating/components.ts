import * as glob from 'glob';
import { ComponentFile } from '@sitecore-content-sdk/core/tools';

const componentNamePattern = /^[\/]*(.+[\/\\])*(.+)\.astro?$/;

const componentPathPattern = /^([\/]*.+[\/\\].+)\..+$/;

/**
 * Get list of components from @var path
 * Returns a list of components in the following format:
 * {
 *  path: 'path/to/component',
 *  componentName: 'ComponentName',
 *  moduleName: 'ComponentName'
 * }
 * @param {string[]} paths paths to search
 * @param {string[]} [exclude] paths and glob patterns to exclude from final result
 */
export function getComponentList(
  paths: string[],
  exclude?: string[]
): ComponentFile[] {
  const components = paths.reduce<ComponentFile[]>((result, path) => {
    const globPath =
      glob.hasMagic(path, { magicalBraces: true }) ||
      path.match(componentNamePattern)
        ? path
        : path.replace(/\/$/, '').concat('/**/*.astro');
    return result.concat(
      ...glob
        .sync(globPath, { ignore: exclude, nodir: true })
        .filter((path) => path.match(componentNamePattern))
        .map((filePath) => {
          const name = filePath.match(componentNamePattern)![2];
          console.debug(`Registering Content SDK component ${name}`);
          return {
            filePath,
            importPath: filePath.match(componentPathPattern)![1].replace(/\\/g, '/'), // use forward slashes for consistency
            componentName: name,
            moduleName: name.replace(/[^\w]+/g, ''),
          };
        })
    );
  }, []);

  return components;
}
