import { BENCHMARKS, type Benchmark } from '../data/benchmarks';
import { INCIDENTS, incidentSlug, type IncidentStatus } from '../data/incidents';
import { lab } from '../data/labs';
import { AVAILABLE, MODELS, STATUS_LABEL, type Model } from '../data/models';
import { TWEETS } from '../data/tweets';
import { compact, fmt, indexRows, money, rows, shipDays, tmbIndex, type Row } from './scores';
import type { OgBar, OgSpec } from './og';
import { INDEX_NAME, INDEX_VERSION } from './site';

const label = (m: Model) => m.name;
const shortClaim = (m: Model) => (m.claimLabel && m.claimLabel.length <= 5 ? m.claimLabel : String(m.claimed));

const STATUS_TONE: Record<IncidentStatus, string> = {
  Open: '#c2410c',
  Resolved: '#2f7d4f',
  Disputed: '#b7791f',
  Unconfirmed: '#787774',
  'Partially delivered': '#7b2a85',
  Unfalsifiable: '#787774',
};

export const indexRank = (m: Model) => {
  const idx = tmbIndex(m);
  if (idx === undefined) return undefined;
  return AVAILABLE.filter((o) => (tmbIndex(o) ?? 0) > idx).length + 1;
};

export const gapText = (m: Model) => {
  const idx = tmbIndex(m);
  if (idx === undefined) return '+∞';
  const gap = m.claimed - idx;
  if (gap > 0) return `+${gap}`;
  if (gap === 0) return '±0';
  return `−${-gap}`;
};

const indexBar = (r: Row): OgBar => ({
  label: label(r.model),
  value: Math.min(r.value, 100),
  display: r.vapor ? `${shortClaim(r.model)}*` : String(r.value),
  color: lab(r.model.lab).color,
  vapor: r.vapor,
});

function benchSpec(b: Benchmark): OgSpec {
  const top = rows(b).slice(0, 6);
  const max = Math.max(...top.map((r) => r.value), b.format === 'pct' ? 100 : 1);
  const dir = { higher: 'Higher is better', lower: 'Lower is better', unclear: 'Direction unclear' }[b.better];
  return {
    key: `benchmarks/${b.slug}`,
    eyebrow: `Benchmark · ${b.category}`,
    title: b.name,
    subtitle: b.tagline,
    visual: {
      kind: 'rows',
      caption: `Top results · ${dir}`,
      max,
      bars: top.map((r) => ({ label: label(r.model), value: r.value, display: fmt(r.value, b.format), color: lab(r.model.lab).color, vapor: r.vapor })),
    },
  };
}

function modelSpec(m: Model): OgSpec {
  const idx = tmbIndex(m);
  const rank = indexRank(m);
  const variant = m.variant ? ` (${m.variant})` : '';
  return {
    key: `models/${m.id}`,
    eyebrow: `Model · ${lab(m.lab).name}`,
    title: `${m.name}${variant}`,
    subtitle: m.status === 'available' ? `Evaluated on ${BENCHMARKS.length} trust-me-bro benchmarks.` : `${STATUS_LABEL[m.status]}. Evaluated anyway, using the announcement.`,
    visual: {
      kind: 'model',
      score: idx === undefined ? `${shortClaim(m)}*` : String(idx),
      caption: rank === undefined ? 'Self-reported score · not measurable' : `${INDEX_NAME.replace('Trust Me Bro ', 'TMB ')} · #${rank} of ${AVAILABLE.length}`,
      color: lab(m.lab).color,
      items: [
        { value: shortClaim(m), label: 'Self-reported' },
        { value: gapText(m), label: 'Benchmaxx Gap' },
        { value: m.speed ? `${m.speed}` : '—', label: 'Tokens / second' },
        { value: m.cost ? money(m.cost) : `${shipDays(m)}d`, label: m.cost ? 'Cost per task' : 'Days to ship' },
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
      visual: { kind: 'rows', caption: `${INDEX_NAME.replace('Trust Me Bro ', 'TMB ')} · * self-reported`, max: 100, bars: indexRows(true).slice(0, 7).map(indexBar) },
    },
    {
      key: 'models',
      eyebrow: 'Leaderboard',
      title: 'Model Leaderboard',
      subtitle: `${MODELS.length} models: ${AVAILABLE.length} we could evaluate, ${MODELS.length - AVAILABLE.length} we evaluated anyway.`,
      visual: { kind: 'rows', caption: `${INDEX_NAME.replace('Trust Me Bro ', 'TMB ')} · released models`, max: 100, bars: indexRows(false).slice(0, 7).map(indexBar) },
    },
    ...MODELS.map(modelSpec),
    {
      key: 'benchmarks',
      eyebrow: 'Benchmarks',
      title: 'Fourteen evaluations nobody asked for',
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
        visual: { kind: 'incident', status: i.status, tone: STATUS_TONE[i.status], severity: i.severity, claim: i.claim.length > 150 ? `${i.claim.slice(0, 147).trimEnd()}…` : i.claim },
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
