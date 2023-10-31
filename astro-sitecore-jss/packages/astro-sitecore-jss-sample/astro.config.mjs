import { defineConfig } from 'astro/config';
import react from "@astrojs/react";
import vue from "@astrojs/vue";
import image from "@astrojs/image";

import node from "@astrojs/node";

// https://astro.build/config
export default defineConfig({
  integrations: [react(), vue(),  image({
    serviceEntryPoint: '@astrojs/image/sharp'
  })],
  output: 'server',
  adapter: node({
    mode: 'standalone'
  }),
  outDir: './dist',
});