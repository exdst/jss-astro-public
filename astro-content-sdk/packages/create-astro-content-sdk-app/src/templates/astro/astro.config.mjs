import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import dotenvFlow from 'dotenv-flow';

// Load enviroment variables from .env.* files
dotenvFlow.config();

// https://astro.build/config
export default defineConfig({
  security: {
    checkOrigin: false,
    allowedDomains: [{ hostname: '*.sitecorecloud.io' }, { hostname: '*.sitecore.cloud' }],
  },
  server: {
    port: 3005,
    host: true,
  },
  output: 'server',
  adapter: node({
    mode: 'standalone',
  }),
  i18n: {
    locales: ['en'],
    defaultLocale: 'en',
  },
  devToolbar: {
    enabled: false,
  },
  vite: {
    server: {
      cors: {
        preflightContinue: true,
      },
    },
    resolve: {
      extensions: ['.mjs', '.js', '.mts', '.ts'],
      noExternal: [
        '@sitecore-content-sdk/content',
        '@sitecore-content-sdk/core',
        '@sitecore-content-sdk/events',
        '@sitecore-content-sdk/analytics-core',
        '@exdst-sitecore-content-sdk/astro',
      ],
    },
  },
});
