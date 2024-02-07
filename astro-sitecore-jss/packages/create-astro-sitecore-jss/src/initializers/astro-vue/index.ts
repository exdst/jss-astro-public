import chalk from 'chalk';
import path, { sep } from 'path';
import { prompt } from 'inquirer';
import {
  Initializer, openPackageJson, transform, writePackageJson,
} from '../../common';
import { prompts, AstroAnswer } from './prompts';
import { AstroArgs } from './args';

export default class AstroInitializer implements Initializer {
  name = 'astro + vue (template for migration existing vue app to astro + vue)';
  description = 'This template is for migrating an existing Vue app to Astro + Vue';
  
  get isBase() {
    return true;
  }

  async init(args: AstroArgs) {
    const answers = await prompt<AstroAnswer>(prompts, args);

    const mergedArgs = {
      ...args,
      ...answers,
    };

    const templatePath = path.resolve(__dirname, '../../templates/astro-vue');
    await transform(templatePath, mergedArgs);

    const pkgPath = path.resolve(`${args.destination}${sep}package.json`);
    const pkg = openPackageJson(pkgPath);

    pkg.name = answers.appName;
    writePackageJson(pkg, pkgPath);

    const scjssconfigPath = path.resolve(`${args.destination}${sep}scjssconfig.json`);
    const scjssconfig = openPackageJson(scjssconfigPath);
    scjssconfig.sitecore.jssAppName = answers.appName;
    scjssconfig.sitecore.sitecoreApiHost = answers.sitecoreApiHost;
    scjssconfig.sitecore.sitecoreApiKey = answers.sitecoreApiKey;
    scjssconfig.sitecore.rootItemId = answers.rootItemId;

    writePackageJson(scjssconfig, scjssconfigPath);

    

    const response = {
      nextSteps: [`* Start you astro application by running ${chalk.green('npm run dev')} (optional)`],
      appName: answers.appName,
    };

    return response;
  }
}
