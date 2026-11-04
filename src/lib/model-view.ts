import { BENCHMARKS } from '../data/benchmarks';
import { INCIDENTS } from '../data/incidents';
import { lab } from '../data/labs';
import { AVAILABLE, displayName, variantLabel, type Model } from '../data/models';
import { TWEETS, tweetById, type Tweet } from '../data/tweets';
import { indexRows, rows, shipDays, signed, tmbIndex, value } from './scores';
import { MODEL_STATUS } from './status';

export function modelView(m: Model) {
  const index = tmbIndex(m);
  const gap = index === undefined ? undefined : m.claimed - index;
  return {
    model: m,
    lab: lab(m.lab),
    name: displayName(m),
    variant: variantLabel(m),
    href: `/models/${m.id}/`,
    vapor: m.status !== 'available',
    status: MODEL_STATUS[m.status],
    index,
    rank: index === undefined ? undefined : AVAILABLE.filter((o) => (tmbIndex(o) ?? 0) > index).length + 1,
    gap,
    gapText: signed(gap),
    shipDays: shipDays(m),
  };
}

export type ModelView = ReturnType<typeof modelView>;

const incidentsFor = (m: Model) => INCIDENTS.filter((i) => i.models?.includes(m.id));

export function postsFor(m: Model, limit = 4): Tweet[] {
  const byLikes = (a: Tweet, b: Tweet) => b.likes - a.likes || b.date.localeCompare(a.date);
  const tagged = TWEETS.filter((t) => t.models?.includes(m.id)).sort(byLikes);
  const cited = incidentsFor(m)
    .flatMap((i) => i.timeline.flatMap((e) => (e.tweetId ? [tweetById(e.tweetId)] : [])))
    .sort(byLikes);
  return [...new Set([...tagged, ...cited])].slice(0, limit).sort((a, b) => a.date.localeCompare(b.date));
}

export function modelPage(m: Model) {
  const view = modelView(m);
  const order = indexRows(true).map((r) => r.model);
  const pos = order.findIndex((x) => x.id === m.id);
  const results = BENCHMARKS.flatMap((b) => {
    const v = value(b, m);
    if (v === undefined || b.computed === 'random-axis') return [];
    const all = rows(b);
    const vals = all.map((r) => r.value);
    const lo = Math.min(...vals, 0);
    const hi = Math.max(...vals, 1);
    return [{ b, v, place: all.findIndex((r) => r.model.id === m.id) + 1, n: all.length, share: (v - lo) / (hi - lo || 1) }];
  });
  const target = view.index ?? m.claimed;
  const peers = order
    .filter((x) => x.id !== m.id)
    .map((x) => ({ x, d: Math.abs((tmbIndex(x) ?? x.claimed) - target) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, 4)
    .map((p) => modelView(p.x));
  return {
    ...view,
    results,
    incidents: incidentsFor(m),
    posts: postsFor(m),
    peers,
    prev: modelView(order[(pos - 1 + order.length) % order.length]),
    next: modelView(order[(pos + 1) % order.length]),
  };
}
