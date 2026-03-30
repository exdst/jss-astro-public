import type { APIRoute, APIContext } from 'astro';
import { EditingRenderMiddleware } from '@exdst-sitecore-content-sdk/astro/editing';

/**
 * This API route is used to handle GET requests from Sitecore Editor.
 * This route should match the `serverSideRenderingEngineEndpointUrl` in your Sitecore configuration,
 * which is set to "http://<rendering_host>/api/editing/render" by default (see the settings item under /sitecore/content/<your/site/path>/Settings/Site Grouping).
 *
 * The `EditingRenderMiddleware` will
 *  1. Extract data about the route we need to render from the Sitecore Editor GET request
 *  2. Enable Preview Mode, passing the route data as preview data
 *  3. Redirect the request to the route, passing along the Preview Mode cookies.
 *     This allows retrieval of the editing data in preview context (via an `EditingDataService`) - see `SitecorePagePropsFactory`
 *  4. The redirected request will render the page with editing markup in place
 */
export const ALL: APIRoute = async ({ request }: APIContext) => {
  const handler = new EditingRenderMiddleware().getHandler();
  return await handler(request);
};
