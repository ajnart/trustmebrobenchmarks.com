import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://trustmebrobenchmarks.com',
  integrations: [sitemap()],
  build: { format: 'directory' },
});
