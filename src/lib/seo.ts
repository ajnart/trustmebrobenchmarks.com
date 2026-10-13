import { REPO_URL, SITE_NAME } from './site';
import { tweetUrl, type Tweet } from '../data/tweets';

export const SITE_URL = 'https://trustmebrobenchmarks.com';
export const SITE_TAGLINE = 'Independent* analysis of AI';
export const DEFAULT_DESCRIPTION =
  'Independent* analysis of AI models and TMBBs (trust-me-bro benchmarks). Satire: every score is made up, every quoted post is real.';
export const OG_SIZE = { width: 1200, height: 630 };

export type JsonLd = Record<string, unknown>;

export interface Crumb {
  name: string;
  path: string;
}

export const absolute = (path: string) => new URL(path, SITE_URL).href;

export function clip(text: string, max = 158) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(' ')).replace(/[\s,.;:]+$/, '')}…`;
}

export function ogKey(pathname: string) {
  const key = pathname.replace(/^\/+|\/+$/g, '');
  if (key === '' || key === '404') return 'home';
  return key;
}

export const ogImagePath = (pathname: string) => `/og/${ogKey(pathname)}.png`;

const ORG_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;

export const organization = (): JsonLd => ({
  '@type': 'Organization',
  '@id': ORG_ID,
  name: SITE_NAME,
  url: `${SITE_URL}/`,
  logo: { '@type': 'ImageObject', url: absolute('/icon-512.png'), width: 512, height: 512 },
  sameAs: [REPO_URL],
});

export const website = (): JsonLd => ({
  '@type': 'WebSite',
  '@id': WEBSITE_ID,
  url: `${SITE_URL}/`,
  name: SITE_NAME,
  alternateName: ['TMBB', 'TMB Benchmarks', 'Trust Me Bro Benchmarks'],
  description: DEFAULT_DESCRIPTION,
  genre: 'Satire',
  inLanguage: 'en',
  publisher: { '@id': ORG_ID },
});

export function breadcrumbList(url: string, crumbs: Crumb[]): JsonLd {
  const all = [{ name: 'Home', path: '/' }, ...crumbs];
  return {
    '@type': 'BreadcrumbList',
    '@id': `${url}#breadcrumb`,
    itemListElement: all.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: absolute(c.path) })),
  };
}

interface PageLd {
  url: string;
  type: string;
  name: string;
  description: string;
  image: string;
  hasBreadcrumb: boolean;
  modified: string;
}

export const webPage = (p: PageLd): JsonLd => ({
  '@type': p.type,
  '@id': `${p.url}#webpage`,
  url: p.url,
  name: p.name,
  description: p.description,
  inLanguage: 'en',
  isPartOf: { '@id': WEBSITE_ID },
  publisher: { '@id': ORG_ID },
  primaryImageOfPage: { '@type': 'ImageObject', url: p.image, ...OG_SIZE },
  dateModified: p.modified,
  ...(p.hasBreadcrumb && { breadcrumb: { '@id': `${p.url}#breadcrumb` } }),
});

export const graph = (nodes: JsonLd[]) => JSON.stringify({ '@context': 'https://schema.org', '@graph': nodes }).replace(/</g, '\\u003c');

export const itemList = (name: string, items: { name: string; path: string }[]): JsonLd => ({
  '@type': 'ItemList',
  name,
  numberOfItems: items.length,
  itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, url: absolute(it.path) })),
});

export const socialPosting = (t: Tweet): JsonLd => ({
  '@type': 'SocialMediaPosting',
  url: tweetUrl(t),
  headline: clip(t.text, 110),
  datePublished: t.date,
  author: { '@type': 'Person', name: t.name, url: `https://x.com/${t.handle}` },
  interactionStatistic: { '@type': 'InteractionCounter', interactionType: 'https://schema.org/LikeAction', userInteractionCount: t.likes },
});

export interface ArticleLd {
  url: string;
  headline: string;
  description: string;
  image: string;
  published: string;
  modified: string;
  type?: string;
  citations?: Tweet[];
}

export const article = (a: ArticleLd): JsonLd => ({
  '@type': a.type ?? 'Article',
  '@id': `${a.url}#article`,
  headline: a.headline,
  description: a.description,
  image: a.image,
  datePublished: a.published,
  dateModified: a.modified,
  author: { '@id': ORG_ID },
  publisher: { '@id': ORG_ID },
  mainEntityOfPage: { '@id': `${a.url}#webpage` },
  genre: 'Satire',
  inLanguage: 'en',
  ...(a.citations?.length && { citation: a.citations.map(socialPosting) }),
});
