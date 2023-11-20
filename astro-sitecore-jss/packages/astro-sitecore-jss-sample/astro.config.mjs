import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import vue from '@astrojs/vue';
import node from '@astrojs/node';
import angular from "@analogjs/astro-angular";

/*
  Vite config is required to resolve the alias for the local package
  Astro 2.+ was working based on tsconfig.json, but Astro 3.+ is not.
  compilerOptions > paths is not taken into account.
  There was opened Github ticket for this issue:
  https://github.com/withastro/astro/issues/9015
  The other option is to consider vite-tsconfig-paths plugin, but it is not working with Astro 3.+ as well. (After short try) 
  https://www.npmjs.com/package/vite-tsconfig-paths
*/

// https://astro.build/config
export default defineConfig({
  integrations: [react(), vue(), angular({
    vite: {
      transformFilter: (code, id ) => {
        return !id.includes('/packages/astro-sitecore-jss/')
      },
    }
  })],
  output: 'server',
  adapter: node({
    mode: 'standalone',
  }),
  outDir: './dist',
  vite: {
    resolve: {
      alias: [{
        find: '@astro-sitecore-jss/astro-sitecore-jss',
        replacement: 'packages/astro-sitecore-jss'
      }]
    }
  }
});