import { defineConfig } from 'eslint/config';
import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import eslintPluginAstro from 'eslint-plugin-astro';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

export default defineConfig([
  {
    ignores: ['**/node_modules/**', '**/dist/**', '**/.astro/**'],
  },
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts,astro}'],
    plugins: { js },
    extends: ['js/recommended'],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
  },
  tseslint.configs.recommended,
  eslintPluginPrettierRecommended,
  eslintPluginAstro.configs.recommended,
]);
