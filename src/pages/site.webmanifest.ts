import type { APIRoute } from 'astro';
import { SITE_NAME } from '../lib/site';
import { DEFAULT_DESCRIPTION } from '../lib/seo';

export const GET: APIRoute = () =>
  Response.json({
    name: SITE_NAME,
    short_name: 'Trust Me Bro',
    description: DEFAULT_DESCRIPTION,
    start_url: '/',
    scope: '/',
    display: 'minimal-ui',
    background_color: '#ffffff',
    theme_color: '#111111',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  });
