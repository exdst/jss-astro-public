import {
  GenerateMapArgs,
  GenerateMapFunction,
  ComponentMapTemplate,
} from '@sitecore-content-sdk/core/tools';
import path from 'path';
import fs from 'fs';
import { getComponentList } from './templating/components';

/**
 * Generate and write componentMap.ts file based on provided params.
 * @param {GenerateMapArgs} param0 params for generateMap
 */
export const generateMap: GenerateMapFunction = ({
  paths,
  destination = '.sitecore',
  exclude,
  componentImports,
  mapTemplate = buildAstroMapContent,
}: GenerateMapArgs) => {
  const components = getComponentList(paths, exclude);

  const content = (mapTemplate as ComponentMapTemplate)(components, componentImports);

  const componentMapFile = path.join(process.cwd(), destination, 'component-map.ts');

  try {
    fs.writeFileSync(componentMapFile, content, {
      encoding: 'utf8',
    });
  } catch (error) {
    console.error(`Component Map generation failed. Error writing to file ${destination}:`, error);
    throw error;
  }
};

const buildAstroMapContent: ComponentMapTemplate = (components, componentImports): string => {
  const wildcardImports: string[] = [];
  const namedImports: string[] = [];

  const componentMapEntries: string[] = [];

  components.forEach((component) => {
    wildcardImports.push(`import ${component.moduleName} from '${component.importPath}.astro';`);
    componentMapEntries.push(`['${component.moduleName}', ${component.moduleName}]`);
  });

  componentImports?.forEach((packageEntry) => {
    if (packageEntry.importInfo.namedImports) {
      namedImports.push(
        `import { ${packageEntry.importInfo.namedImports.join(', ')} } from '${
          packageEntry.importInfo.importFrom
        }.astro';`
      );
      packageEntry.importInfo.namedImports.forEach((importName) => {
        componentMapEntries.push(`['${importName}', ${importName}]`);
      });
    } else {
      wildcardImports.push(
        `import ${packageEntry.importName} from '${packageEntry.importInfo.importFrom}';`
      );
      componentMapEntries.push(`['${packageEntry.importName}', ${packageEntry.importName}]`);
    }
  });

  return `//@ts-nocheck
import { AstroContentSdkComponent } from '@astro-sitecore-jss/astro-content-sdk';

// Components imported from the app itself
${wildcardImports.join('\n')}
${namedImports.join('\n')}

// Components must be registered within the map to match the string key with component name in Sitecore
export const componentMap = new Map<string, AstroContentSdkComponent>([
${componentMapEntries
  .map((component) => {
    return `  ${component},\n`;
  })
  .join('')}]);

export default componentMap;
`;
};
