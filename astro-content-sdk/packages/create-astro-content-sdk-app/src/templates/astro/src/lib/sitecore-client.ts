import { SitecoreClient } from '@exdst-sitecore-content-sdk/astro/client';
import scConfig from 'sitecore.config';

const client = new SitecoreClient({
  ...scConfig,
});

export default client;
