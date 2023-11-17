import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import vue from '@astrojs/vue';
import node from '@astrojs/node';
import angular from '@analogjs/astro-angular';

export default defineConfig({
  integrations: [react(), vue(), angular()],
  output: 'server',
  adapter: node({
    mode: 'standalone',
  }),
  outDir: './dist',
  vite: {
    resolve: {
      alias: [
        {
          find: '@astro-sitecore-jss/astro-sitecore-jss',
          replacement: 'packages/astro-sitecore-jss',
        },
      ],
    },
  },
});
