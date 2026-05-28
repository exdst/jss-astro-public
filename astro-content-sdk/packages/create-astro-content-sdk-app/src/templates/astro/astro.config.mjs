import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import dotenvFlow from 'dotenv-flow';
import { loadEnv } from 'vite';

// Load enviroment variables from .env.* files
dotenvFlow.config();

// https://astro.build/config
export default defineConfig({
  integrations: [
    {
      name: 'set-prerender',
      hooks: {
        'astro:route:setup': ({ route }) => {
          // Load environment variables from .env files
          const { PRERENDER } = loadEnv(process.env.NODE_ENV, process.cwd(), '');
          if (route.component.endsWith('/[...path].astro')) {
            // Set the prerender value on routes
            if (process.env.NODE_ENV === 'development') {
              route.prerender = false;
            } else {
              route.prerender = PRERENDER === 'true';
            }
          }
        },
      },
    },
  ],
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
