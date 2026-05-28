import path from 'path';
import inquirer from 'inquirer';
import { prompts, AstroAnswer } from './prompts';
import { Initializer, transform } from '../../common';
import { AstroArgs } from './args';

export default class AstroInitializer implements Initializer {
  async init(args: AstroArgs) {
    const answers = await inquirer.prompt<AstroAnswer>(prompts, args);
    const templatePath = path.resolve(__dirname, '../../templates/astro');

    await transform(templatePath, { ...args, ...answers });

    const response = {};
    return response;
  }
}
