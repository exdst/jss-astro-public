import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import node from '@astrojs/node';


const vueConfig = {
  appEntrypoint: '/src/components/integrations/vue/initVueApp'
}

// https://astro.build/config
export default defineConfig({
  integrations: [
    vue(vueConfig),
  ],
  output: 'server',
  adapter: node({
    mode: 'standalone',
  }),
  outDir: './dist',
  security: {
    checkOrigin: false,
  },
  image: {
    domains: ['astro.headless.localhost'],
  },
});
