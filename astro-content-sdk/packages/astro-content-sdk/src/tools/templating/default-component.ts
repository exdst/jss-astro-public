import chalk from 'chalk';
import {
  ScaffoldTemplate,
  ComponentTemplateType,
} from '@sitecore-content-sdk/core/config';
import { COMPONENT_FILE_EXTENSION } from './constants';

/**
 * Astro component boilerplate
 * @param {string} componentName - the component name
 * @returns component generated template
 */
const generateTemplate = (componentName: string): string => {
  return `
  ---
  import { Field } from "@exdst-sitecore-content-sdk/astro";
  
  interface Fields {
    Title: Field<string>;
  }

  export type ${componentName}Props = {
    params: { [key: string]: string };
    fields: Fields;
  };

  const props: ${componentName}Props = Astro.props.route;

  const id = props.params.RenderingIdentifier;
---

  <div class={\`component \${props.params.styles}\`} id={id ? id : undefined}>
    <div class="component-content">
      <p>${componentName} Component</p>
      <Text field={props.fields.Title} />
    </div>
  </div>
`;
};

/**
 * Generates a list of next steps when scaffolding a component.
 * @param {string} componentOutputPath - The file path where the component file is generated.
 * @returns {string[]} An array of strings, each representing a next step.
 */
const getNextSteps = (componentOutputPath: string): string[] => {
  const nextSteps = [];

  if (componentOutputPath) {
    nextSteps.push(
      `* Implement the Astro component in ${chalk.green(componentOutputPath)}`
    );
  }

  return nextSteps;
};

export const defaultTemplate: ScaffoldTemplate = {
  name: ComponentTemplateType.DEFAULT,
  fileExtension: COMPONENT_FILE_EXTENSION,
  generateTemplate,
  getNextSteps,
};
