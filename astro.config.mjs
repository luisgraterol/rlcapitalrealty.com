import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  integrations: [tailwind()],
  vite: {
    resolve: {
      alias: {
        '@lib': fileURLToPath(new URL('./src/lib', import.meta.url)),
      },
    },
  },
});
