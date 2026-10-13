import type { APIRoute, GetStaticPaths } from 'astro';
import { renderOg, type OgSpec } from '../../lib/og';
import { ogPages } from '../../lib/og-pages';

export const getStaticPaths = (() => ogPages().map((spec) => ({ params: { key: spec.key }, props: { spec } }))) satisfies GetStaticPaths;

export const GET: APIRoute<{ spec: OgSpec }> = async ({ props }) =>
  new Response(await renderOg(props.spec), { headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=86400' } });
