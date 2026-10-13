import type { APIRoute } from 'astro';
import { absolute } from '../lib/seo';

export const GET: APIRoute = () =>
  new Response(`User-agent: *\nAllow: /\nDisallow: /404\n\nSitemap: ${absolute('/sitemap-index.xml')}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
