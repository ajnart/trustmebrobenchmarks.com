import { BENCHMARKS, benchHref, type Benchmark } from '../data/benchmarks';
import { ANNOUNCEMENTS, CHANGELOG, type ChangelogEntry } from '../data/changelog';
import { COMMENDATIONS, INCIDENTS, incidentHref, type Commendation, type Incident } from '../data/incidents';
import { LABS } from '../data/labs';
import { MODELS, modelHref, type Model } from '../data/models';
import { TWEETS, type Tweet } from '../data/tweets';
import { ogPages } from './og-pages';
import { ogKey } from './seo';

const ISO = /^\d{4}-\d{2}-\d{2}$/;
const INCIDENT_ID = /TMB-\d{4}-\d{4}/g;

export interface Content {
  models: Model[];
  tweets: Tweet[];
  incidents: Incident[];
  commendations: Commendation[];
  benchmarks: Benchmark[];
  changelog: ChangelogEntry[];
  announcements: { title: string; href: string }[];
  ogKeys: string[];
}

export const liveContent = (): Content => ({
  models: MODELS,
  tweets: TWEETS,
  incidents: INCIDENTS,
  commendations: COMMENDATIONS,
  benchmarks: BENCHMARKS,
  changelog: CHANGELOG,
  announcements: ANNOUNCEMENTS,
  ogKeys: ogPages().map((p) => p.key),
});

export const routesOf = (c: Content) => [
  '/',
  '/models/',
  '/benchmarks/',
  '/incidents/',
  '/in-the-wild/',
  '/methodology/',
  '/chart-crime-studio/',
  ...c.models.map(modelHref),
  ...c.benchmarks.map(benchHref),
  ...c.incidents.map(incidentHref),
];

export const latestPostDate = () => TWEETS.map((t) => t.date).sort().at(-1);
export const usedPostIds = () => new Set(TWEETS.map((t) => t.id));
export const labHandles = () => Object.values(LABS).flatMap((l) => (l.handle ? [l.handle] : []));
export const benchmarkAuthors = () => BENCHMARKS.flatMap((b) => b.inspiredBy?.author.match(/^@(\w+)$/)?.[1] ?? []);

const pattern = (name: string) => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/[ -]/g, '[\\s-]');

export function mentionedModels(text: string) {
  const spans = MODELS.flatMap((m) =>
    [...text.matchAll(new RegExp(`(?<![\\w.])${pattern(m.name)}(?![\\w]|[.-]\\d)`, 'gi'))].map((x) => ({ id: m.id, a: x.index, b: x.index + x[0].length })),
  );
  const kept = spans.filter((s) => !spans.some((o) => o !== s && o.a <= s.a && o.b >= s.b && o.b - o.a > s.b - s.a));
  return [...new Set(kept.map((s) => s.id))];
}

export const formatProblems = (problems: string[]) => `Content integrity: ${problems.length} problem(s)\n${problems.map((p) => `  - ${p}`).join('\n')}`;

export function validateContent(c: Content = liveContent()): string[] {
  const out: string[] = [];
  const posts = new Set(c.tweets.map((t) => t.id));
  const models = new Set(c.models.map((m) => m.id));
  const incidents = new Set(c.incidents.map((i) => i.id));
  const routes = new Set(routesOf(c));
  const og = new Set(c.ogKeys);

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
  const mentions = (where: string, text: string) => {
    for (const [id] of text.matchAll(INCIDENT_ID)) {
      if (!incidents.has(id)) out.push(`${where}: mentions unknown incident ${id}`);
    }
  };

  unique('Model', c.models.map((m) => m.id));
  unique('Post', c.tweets.map((t) => t.id));
  unique('Incident', c.incidents.map((i) => i.id));
  unique('Benchmark', c.benchmarks.map((b) => b.slug));

  for (const t of c.tweets) {
    if (!ISO.test(t.date)) out.push(`Post ${t.id}: date ${t.date} is not YYYY-MM-DD`);
    for (const id of t.models ?? []) model(`Post ${t.id} models`, id);
  }

  for (const m of c.models) {
    if (m.status === 'available' && !m.released) out.push(`Model ${m.id}: available, but has no released date`);
    if (m.status !== 'available' && m.released) out.push(`Model ${m.id}: ${m.status}, but has a released date`);
  }

  c.incidents.forEach((inc, i) => {
    const before = c.incidents[i - 1];
    if (before && inc.id <= before.id) out.push(`Incident ${inc.id}: listed after ${before.id}`);
    for (const id of inc.models ?? []) model(`Incident ${inc.id} models`, id);
    mentions(`Incident ${inc.id}`, `${inc.claim} ${inc.finding}`);
    inc.timeline.forEach((e, k) => {
      const where = `Incident ${inc.id} timeline[${k}]`;
      if (e.tweetId) post(where, e.tweetId);
      mentions(where, e.text);
      if (e.date === 'ongoing') {
        if (k !== inc.timeline.length - 1) out.push(`${where}: "ongoing" must be the last entry`);
        return;
      }
      if (!ISO.test(e.date)) out.push(`${where}: date ${e.date} is not YYYY-MM-DD or "ongoing"`);
      const prev = inc.timeline[k - 1];
      if (prev && prev.date !== 'ongoing' && e.date < prev.date) out.push(`${where}: ${e.date} comes after ${prev.date}`);
    });
  });

  for (const cm of c.commendations) post(`Commendation ${cm.name}`, cm.tweetId);

  for (const b of c.benchmarks) {
    for (const id of b.inspiredBy?.tweetIds ?? []) post(`Benchmark ${b.slug} inspiredBy`, id);
    for (const id of Object.keys(b.generator?.overrides ?? {})) model(`Benchmark ${b.slug} overrides`, id);
  }

  c.changelog.forEach((e, i) => {
    if (e.href) route(`Changelog[${i}] "${e.title}"`, e.href);
  });
  for (const a of c.announcements) route(`Announcement "${a.title}"`, a.href);
  for (const r of routes) {
    if (!og.has(ogKey(r))) out.push(`Page ${r}: no OG image`);
  }

  return out;
}
