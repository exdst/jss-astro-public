import type { App } from 'vue';
import componentFactory from '../../../temp/vueComponentFactory';
import SitecoreJssStorePlugin from '../../../lib/SitecoreJssStorePlugin';
import { SitecoreJssPlaceholderPlugin } from '@sitecore-jss/sitecore-jss-vue';

export default (app: App) => {
  app.use(SitecoreJssPlaceholderPlugin, { componentFactory });
  app.use(SitecoreJssStorePlugin);
};