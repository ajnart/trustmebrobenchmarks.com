import { BENCHMARKS } from '../data/benchmarks';
import { ANNOUNCEMENTS, CHANGELOG } from '../data/changelog';
import { COMMENDATIONS, INCIDENTS, incidentHref } from '../data/incidents';
import { LABS } from '../data/labs';
import { MODELS } from '../data/models';
import { TWEETS } from '../data/tweets';
import { ogPages } from './og-pages';
import { ogKey } from './seo';

const ISO = /^\d{4}-\d{2}-\d{2}$/;

export const ROUTES = [
  '/',
  '/models/',
  '/benchmarks/',
  '/incidents/',
  '/in-the-wild/',
  '/methodology/',
  '/chart-crime-studio/',
  ...MODELS.map((m) => `/models/${m.id}/`),
  ...BENCHMARKS.map((b) => `/benchmarks/${b.slug}/`),
  ...INCIDENTS.map(incidentHref),
];

export const latestPostDate = () => TWEETS.map((t) => t.date).sort().at(-1);
export const usedPostIds = () => new Set(TWEETS.map((t) => t.id));
export const labHandles = () => Object.values(LABS).flatMap((l) => (l.handle ? [l.handle] : []));
export const benchmarkAuthors = () => BENCHMARKS.flatMap((b) => b.inspiredBy?.author.match(/^@(\w+)$/)?.[1] ?? []);

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export function mentionedModels(text: string) {
  const spans = MODELS.flatMap((m) =>
    [...text.matchAll(new RegExp(`(?<![\\w.])${escape(m.name)}(?![\\w]|[.-]\\d)`, 'gi'))].map((x) => ({ id: m.id, a: x.index, b: x.index + x[0].length })),
  );
  const kept = spans.filter((s) => !spans.some((o) => o !== s && o.a <= s.a && o.b >= s.b && o.b - o.a > s.b - s.a));
  return [...new Set(kept.map((s) => s.id))];
}

export function validateContent(): string[] {
  const out: string[] = [];
  const posts = usedPostIds();
  const models = new Set(MODELS.map((m) => m.id));
  const routes = new Set(ROUTES);
  const og = new Set(ogPages().map((p) => p.key));

  const unique = (kind: string, ids: string[]) => {
    const seen = new Set<string>();
    for (const id of ids) {
      if (seen.has(id)) out.push(`${kind} ${id}: duplicate id`);
      seen.add(id);
    }
  };
  const post = (where: string, id: string) => {
    if (!posts.has(id)) out.push(`${where}: unknown post ${id}`);
  };
  const model = (where: string, id: string) => {
    if (!models.has(id)) out.push(`${where}: unknown model ${id}`);
  };
  const route = (where: string, href: string) => {
    if (!routes.has(href.split('#')[0])) out.push(`${where}: no page at ${href}`);
  };

  unique('Model', MODELS.map((m) => m.id));
  unique('Post', TWEETS.map((t) => t.id));
  unique('Incident', INCIDENTS.map((i) => i.id));
  unique('Benchmark', BENCHMARKS.map((b) => b.slug));

  for (const t of TWEETS) {
    if (!ISO.test(t.date)) out.push(`Post ${t.id}: date ${t.date} is not YYYY-MM-DD`);
    for (const id of t.models ?? []) model(`Post ${t.id} models`, id);
  }

  for (const m of MODELS) {
    if (m.status === 'available' && !m.released) out.push(`Model ${m.id}: available, but has no released date`);
    if (m.status !== 'available' && m.released) out.push(`Model ${m.id}: ${m.status}, but has a released date`);
  }

  INCIDENTS.forEach((inc, i) => {
    const before = INCIDENTS[i - 1];
    if (before && inc.id <= before.id) out.push(`Incident ${inc.id}: listed after ${before.id}`);
    for (const id of inc.models ?? []) model(`Incident ${inc.id} models`, id);
    inc.timeline.forEach((e, k) => {
      const where = `Incident ${inc.id} timeline[${k}]`;
      if (e.tweetId) post(where, e.tweetId);
      if (e.date === 'ongoing') {
        if (k !== inc.timeline.length - 1) out.push(`${where}: "ongoing" must be the last entry`);
        return;
      }
      if (!ISO.test(e.date)) out.push(`${where}: date ${e.date} is not YYYY-MM-DD or "ongoing"`);
      const prev = inc.timeline[k - 1];
      if (prev && prev.date !== 'ongoing' && e.date < prev.date) out.push(`${where}: ${e.date} comes after ${prev.date}`);
    });
  });

  for (const c of COMMENDATIONS) post(`Commendation ${c.name}`, c.tweetId);

  for (const b of BENCHMARKS) {
    for (const id of b.inspiredBy?.tweetIds ?? []) post(`Benchmark ${b.slug} inspiredBy`, id);
    for (const id of Object.keys(b.generator?.overrides ?? {})) model(`Benchmark ${b.slug} overrides`, id);
  }

  CHANGELOG.forEach((c, i) => {
    if (c.href) route(`Changelog[${i}] "${c.title}"`, c.href);
  });
  for (const a of ANNOUNCEMENTS) route(`Announcement "${a.title}"`, a.href);
  for (const r of ROUTES) {
    if (!og.has(ogKey(r))) out.push(`Page ${r}: no OG image`);
  }

  return out;
}
