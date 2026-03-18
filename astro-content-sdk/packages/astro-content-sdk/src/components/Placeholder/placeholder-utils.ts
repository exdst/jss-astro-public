import {
  ComponentRendering,
  RouteData,
  isDynamicPlaceholder,
  getDynamicPlaceholderPattern,
} from '@sitecore-content-sdk/core/layout';

/**
 * Get the renderings for the specified placeholder from the rendering data.
 * @param {ComponentRendering | RouteData } rendering rendering data
 * @param {string} name placeholder name
 * @param {boolean} isEditing whether components should be rendered in editing mode
 * @returns {ComponentRendering[]} array of component renderings
 */
export const getPlaceholderRenderings = (
  rendering: ComponentRendering | RouteData,
  name: string,
  isEditing: boolean
) => {
  let result;
  let phName = name.slice();

  /**
   * Process (SXA) dynamic placeholders
   * Find and replace the matching dynamic placeholder e.g 'nameOfContainer-{*}' with the requested e.g. 'nameOfContainer-1'.
   * For Metadata EditMode, we need to keep the raw placeholder name in place.
   */
  if (rendering?.placeholders) {
    Object.entries(rendering.placeholders).forEach(([key, value]) => {
      const patternPlaceholder = isDynamicPlaceholder(key)
        ? getDynamicPlaceholderPattern(key)
        : null;

      if (patternPlaceholder && patternPlaceholder.test(phName)) {
        if (isEditing) {
          phName = key;
        } else {
          rendering.placeholders![phName] = value;
          delete rendering.placeholders![key];
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
};

/**
 * Get SXA specific params from Sitecore rendering params
 * @param {ComponentRendering} rendering rendering object
 * @returns {object} converted SXA params
 */
export const getSXAParams = (rendering: ComponentRendering) => {
  if (!rendering.params) return { styles: '' };

  const { GridParameters, Styles } = rendering.params;

  return (
    (GridParameters || Styles) && {
      styles: `${GridParameters || ''} ${Styles || ''}`,
    }
  );
};
