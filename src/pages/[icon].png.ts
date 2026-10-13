import type { APIRoute, GetStaticPaths } from 'astro';
import { iconSvg, svgToPng } from '../lib/icons';

const ICONS = {
  'apple-touch-icon': { size: 180, bleed: true },
  'icon-192': { size: 192, bleed: false },
  'icon-512': { size: 512, bleed: false },
  'icon-maskable-512': { size: 512, bleed: true },
};

export const getStaticPaths = (() => Object.entries(ICONS).map(([icon, props]) => ({ params: { icon }, props }))) satisfies GetStaticPaths;

export const GET: APIRoute = ({ props }) => new Response(svgToPng(iconSvg(props.bleed), props.size), { headers: { 'Content-Type': 'image/png' } });
