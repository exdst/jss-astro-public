/// <reference types="vitest" />
import { getViteConfig } from 'astro/config';

export default getViteConfig({
  test: {
    environment: 'node',
    setupFiles: ['./src/tests/vitest.setup.ts'],
    include: ['src/**/*.astro.test.ts'],
  },
});

