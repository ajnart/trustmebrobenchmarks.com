import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

const lastmod = new Date();

export default defineConfig({
  site: 'https://trustmebrobenchmarks.com',
  trailingSlash: 'ignore',
  integrations: [
    react(),
    sitemap({
      filter: (page) => !page.includes('/404'),
      serialize: (item) => {
        const path = new URL(item.url).pathname;
        const depth = path.split('/').filter(Boolean).length;
        return {
          ...item,
          lastmod: lastmod.toISOString(),
          changefreq: 'weekly',
          priority: Math.max(0.4, 1 - depth * 0.2),
        };
      },
    }),
  ],
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: 'Inter',
      cssVariable: '--ff-sans',
      weights: ['100 900'],
      styles: ['normal'],
      subsets: ['latin', 'latin-ext', 'greek'],
      fallbacks: ['ui-sans-serif', 'system-ui', 'sans-serif'],
    },
    {
      provider: fontProviders.fontsource(),
      name: 'Source Serif 4',
      cssVariable: '--ff-serif',
      weights: ['200 900'],
      styles: ['normal', 'italic'],
      subsets: ['latin', 'latin-ext', 'greek'],
      fallbacks: ['Georgia', 'serif'],
    },
    {
      provider: fontProviders.fontsource(),
      name: 'JetBrains Mono',
      cssVariable: '--ff-mono',
      weights: ['100 800'],
      styles: ['normal'],
      subsets: ['latin', 'greek'],
      fallbacks: ['ui-monospace', 'monospace'],
    },
  ],
  build: { format: 'directory' },
  vite: {
    plugins: [tailwindcss()],
    resolve: { noExternal: ['react-tweet'] },
    ssr: { external: ['@resvg/resvg-js'] },
    optimizeDeps: { exclude: ['@resvg/resvg-js'] },
  },
});
