import type { APIRoute } from 'astro';
import { ico } from '../lib/icons';

export const GET: APIRoute = () => new Response(ico([16, 32, 48]), { headers: { 'Content-Type': 'image/x-icon' } });
