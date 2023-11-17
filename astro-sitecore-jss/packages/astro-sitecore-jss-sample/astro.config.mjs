import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import vue from '@astrojs/vue';
import node from '@astrojs/node';
import angular from '@analogjs/astro-angular';
import path from 'path';
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  integrations: [react(), vue(), angular()],
  output: 'server',
  adapter: node({
    mode: 'standalone',
  }),
  outDir: './dist',
  vite: {
    plugins: [tsconfigPaths()]
  },
});
