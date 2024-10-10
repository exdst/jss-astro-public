import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import vue from '@astrojs/vue';
import node from '@astrojs/node';
import angular from "@analogjs/astro-angular";

const reactConfig = {
  babel: {
    "presets": [
      [
        "@babel/preset-react",
        {
          "runtime": "classic"
        }
      ]
    ],
    "plugins": [
      ["@babel/plugin-proposal-decorators", { "legacy": true }]
    ]
  }
}

const angularConfig = {
  vite: {
    transformFilter: (code, id ) => {
      return !id.includes('/packages/astro-sitecore-jss/')
    },
  }
}

// https://astro.build/config
export default defineConfig({
  integrations: [
    react(reactConfig),
    vue(),
    angular(angularConfig)
  ],
  output: 'server',
  adapter: node({
    mode: 'standalone',
  }),
  outDir: './dist',
  security: {
    checkOrigin: false,
  },
});