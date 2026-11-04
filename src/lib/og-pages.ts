import { BENCHMARKS, type Benchmark } from '../data/benchmarks';
import { INCIDENTS, incidentSlug } from '../data/incidents';
import { lab } from '../data/labs';
import { AVAILABLE, MODELS, shortClaim, type Model } from '../data/models';
import { TWEETS } from '../data/tweets';
import { DIRECTION } from './benchmark-view';
import { modelView } from './model-view';
import { compact, money } from './scores';
import type { OgBar, OgSpec } from './og';
import { INDEX_NAME, INDEX_VERSION } from './site';
import { INCIDENT_STATUS } from './status';
import { benchSeries, indexSeries, type Datum } from './views';

const toOgBar = (d: Datum): OgBar => ({ label: d.model.name, value: d.value, display: d.display, color: lab(d.model.lab).color, vapor: d.vapor });

const indexBars = (vapor: boolean) =>
  indexSeries(vapor)
    .slice(0, 7)
    .map((d) => toOgBar({ ...d, value: Math.min(d.value, 100) }));

function benchSpec(b: Benchmark): OgSpec {
  const top = benchSeries(b).slice(0, 6);
  const max = Math.max(...top.map((d) => d.value), b.format === 'pct' ? 100 : 1);
  return {
    key: `benchmarks/${b.slug}`,
    eyebrow: `Benchmark · ${b.category}`,
    title: b.name,
    subtitle: b.tagline,
    visual: { kind: 'rows', caption: `Top results · ${DIRECTION[b.better]}`, max, bars: top.map(toOgBar) },
  };
}

function modelSpec(m: Model): OgSpec {
  const v = modelView(m);
  return {
    key: `models/${m.id}`,
    eyebrow: `Model · ${v.lab.name}`,
    title: v.name,
    subtitle: v.vapor ? `${v.status.label}. Evaluated anyway, using the announcement.` : `Evaluated on ${BENCHMARKS.length} trust-me-bro benchmarks.`,
    visual: {
      kind: 'model',
      score: v.index === undefined ? `${shortClaim(m)}*` : String(v.index),
      caption: v.rank === undefined ? 'Self-reported score · not measurable' : `${INDEX_NAME.replace('Trust Me Bro ', 'TMB ')} · #${v.rank} of ${AVAILABLE.length}`,
      color: v.lab.color,
      items: [
        { value: shortClaim(m), label: 'Self-reported' },
        { value: v.gapText, label: 'Benchmaxx Gap' },
        { value: m.speed ? `${m.speed}` : '—', label: 'Tokens / second' },
        { value: m.cost ? money(m.cost) : `${v.shipDays}d`, label: m.cost ? 'Cost per task' : 'Days to ship' },
      ],
    },
  };
}

export function ogPages(): OgSpec[] {
  const counts = INCIDENTS.reduce<Record<string, number>>((a, i) => ({ ...a, [i.status]: (a[i.status] ?? 0) + 1 }), {});
  const likes = TWEETS.reduce((a, t) => a + t.likes, 0);
  const views = TWEETS.reduce((a, t) => a + (t.views ?? 0), 0);
  const authors = new Set(TWEETS.map((t) => t.handle)).size;
  return [
    {
      key: 'home',
      eyebrow: 'Independent* analysis of AI',
      title: 'The leaderboard for benchmarks that say "trust me bro"',
      subtitle: `${MODELS.length} models, ${BENCHMARKS.length} evaluations, 0 reproducible results.`,
      visual: { kind: 'rows', caption: `${INDEX_NAME.replace('Trust Me Bro ', 'TMB ')} · * self-reported`, max: 100, bars: indexBars(true) },
    },
    {
      key: 'models',
      eyebrow: 'Leaderboard',
      title: 'Model Leaderboard',
      subtitle: `${MODELS.length} models: ${AVAILABLE.length} we could evaluate, ${MODELS.length - AVAILABLE.length} we evaluated anyway.`,
      visual: { kind: 'rows', caption: `${INDEX_NAME.replace('Trust Me Bro ', 'TMB ')} · released models`, max: 100, bars: indexBars(false) },
    },
    ...MODELS.map(modelSpec),
    {
      key: 'benchmarks',
      eyebrow: 'Benchmarks',
      title: 'Fifteen evaluations nobody asked for',
      subtitle: 'Each inspired by a meme benchmark that went viral on X. Theirs are real. Ours are not.',
      visual: { kind: 'chips', caption: `${BENCHMARKS.length} evaluations`, items: BENCHMARKS.map((b) => b.short) },
    },
    ...BENCHMARKS.map(benchSpec),
    {
      key: 'incidents',
      eyebrow: 'Incident database',
      title: 'Claims that outran their evidence',
      subtitle: 'Documented with timelines and primary sources. Severity is measured in handshakes.',
      visual: {
        kind: 'stats',
        caption: 'Trust Me Bro Incident Database',
        items: [
          { value: String(INCIDENTS.length), label: 'Incidents filed' },
          { value: String(counts.Open ?? 0), label: 'Still open' },
          { value: String(counts.Disputed ?? 0), label: 'Disputed' },
          { value: String(counts.Resolved ?? 0), label: 'Resolved' },
        ],
      },
    },
    ...INCIDENTS.map(
      (i): OgSpec => ({
        key: `incidents/${incidentSlug(i)}`,
        eyebrow: i.id,
        title: i.title,
        subtitle: `Subject: ${i.subject}`,
        visual: { kind: 'incident', status: i.status, tone: INCIDENT_STATUS[i.status].tone, severity: i.severity, claim: i.claim.length > 150 ? `${i.claim.slice(0, 147).trimEnd()}…` : i.claim },
      }),
    ),
    {
      key: 'in-the-wild',
      eyebrow: 'Primary sources',
      title: 'The meme-benchmark era, as posted',
      subtitle: 'Every post quoted verbatim and linked. The only numbers on this site we did not make up.',
      visual: {
        kind: 'stats',
        caption: 'Real posts on X',
        items: [
          { value: String(TWEETS.length), label: 'Posts' },
          { value: String(authors), label: 'Authors' },
          { value: compact(likes), label: 'Likes' },
          { value: compact(views), label: 'Views' },
        ],
      },
    },
    {
      key: 'methodology',
      eyebrow: `Technical report · ${INDEX_VERSION}`,
      title: 'Methodology and Known Limitations',
      subtitle: 'Index construction, contamination, and confidence intervals of ±∞. Plus a real disclaimer.',
      visual: { kind: 'paper' },
    },
    {
      key: 'chart-crime-studio',
      eyebrow: 'Tools · Beta',
      title: 'Chart Crime Studio',
      subtitle: "Turn a 2.7-point lead into a generational leap. Tufte's Lie Factor, computed live.",
      visual: { kind: 'crime' },
    },
  ];
}
