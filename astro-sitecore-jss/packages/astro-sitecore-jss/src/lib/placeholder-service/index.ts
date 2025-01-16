import { ComponentRendering, HtmlElementRendering, RouteData } from "@sitecore-jss/sitecore-jss/layout";
import { EditMode } from "../../models";

export interface IPlaceholderService {
  getPlaceholderDataFromRenderingData(rendering: ComponentRendering | RouteData,
    name: string,
    editMode?: EditMode): any
}

export class PlaceholderService implements IPlaceholderService {
  async getPlaceholderDataFromRenderingData(
    rendering: ComponentRendering | RouteData,
    name: string,
    editMode?: EditMode
  ) : Promise<(ComponentRendering | HtmlElementRendering)[]> {
    let result;
    let phName = name.slice();
  
    /**
     * [Chromes Mode]: [SXA] it needs for deleting dynamics placeholder when we set him number(props.name) of container.
     * from backend side we get common name of placeholder is called 'nameOfContainer-{*}' where '{*}' marker for replacing.
     * [Metadata Mode]: We need to keep the raw placeholder name. e.g 'nameOfContainer-{*}' instead of 'nameOfContainer-1'
     */
    if (rendering?.placeholders) {
      Object.keys(rendering.placeholders).forEach((placeholder) => {
        const patternPlaceholder = isDynamicPlaceholder(placeholder)
          ? getDynamicPlaceholderPattern(placeholder)
          : null;
  
        if (patternPlaceholder && patternPlaceholder.test(phName)) {
          if (editMode === EditMode.Metadata) {
            phName = placeholder;
          } else {
            rendering.placeholders[phName] = rendering.placeholders?.[placeholder];
            delete rendering.placeholders?.[placeholder];
          }
        }
      });
    }
  
    if (rendering && rendering.placeholders && Object.keys(rendering.placeholders).length > 0) {
      result = rendering.placeholders[phName];
    } else {
      result = null;
    }
  
    if (!result) {
      console.warn(
        `Placeholder '${phName}' was not found in the current rendering data`,
        JSON.stringify(rendering, null, 2)
      );
  
      return [];
    }
  
    return result;
  }
}

/**
 * Returns a regular expression pattern for a dynamic placeholder name.
 * @param {string} placeholder Placeholder name with a dynamic segment (e.g. 'main-{*}')
 * @returns Regular expression pattern for the dynamic segment
 */
export const getDynamicPlaceholderPattern = (placeholder: string) => {
  return new RegExp(`^${placeholder.replace(/\{\*\}+/i, '\\d+')}$`);
};

/**
 * Checks if the placeholder name is dynamic.
 * @param {string} placeholder Placeholder name
 * @returns True if the placeholder name is dynamic
 */
export const isDynamicPlaceholder = (placeholder: string) => placeholder.indexOf('{*}') !== -1;

export const placeholderService = new PlaceholderService();