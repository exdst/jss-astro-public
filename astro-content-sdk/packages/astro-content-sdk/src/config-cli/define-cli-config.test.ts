import { expect } from 'chai';
import { defineCliConfig } from './define-cli-config';
import {
  SitecoreCliConfigInput,
  SitecoreCliConfig,
  ComponentTemplateType,
} from '@sitecore-content-sdk/content/config';
import chalk from 'chalk';

describe('defineCliConfig', () => {
  const validateDefaultTemplates = (result: SitecoreCliConfig) => {
    expect(result.scaffold.templates[0].name).to.equal(ComponentTemplateType.DEFAULT);
    const defaultTemplate = result.scaffold.templates[0].generateTemplate('ComponentName');

    expect(defaultTemplate).to.contain('ComponentName');
    if (result.scaffold.templates[0].getNextSteps) {
      const componentpath = 'src/components/ComponentName.astro';
      expect(result.scaffold.templates[0].getNextSteps(componentpath)[0]).to.contain(
        `* Implement the Astro component in ${chalk.green(componentpath)}`
      );
    }
  };

  it('should add default and byoc scaffold templates', () => {
    const inputConfig: SitecoreCliConfigInput = {
      build: {
        commands: [
          () => {
            return async () => {
              Promise.resolve('test');
            };
          },
        ],
      },
      scaffold: {
        templates: [{ name: 'existing template', generateTemplate: () => 'test' }],
      },
    };

    const result = defineCliConfig(inputConfig);
    expect(result.scaffold.templates).to.have.lengthOf(2);

    validateDefaultTemplates(result);

    expect(result.scaffold.templates[1].name).to.equal('existing template');
  });

  it('should initialize scaffold object if not present', () => {
    const inputConfig: SitecoreCliConfigInput = {
      build: {
        commands: [
          () => {
            return async () => {
              Promise.resolve('test');
            };
          },
        ],
      },
    };

    const result = defineCliConfig(inputConfig);

    expect(result.scaffold.templates).to.have.lengthOf(1);

    validateDefaultTemplates(result);
  });
});
