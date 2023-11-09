import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import vue from '@astrojs/vue';
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  integrations: [react(), vue()],
  output: 'server',
  adapter: node({
    mode: 'standalone',
  }),
  outDir: './dist',
});
