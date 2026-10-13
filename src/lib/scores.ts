import { BENCHMARKS, INDEX_BENCHMARKS, type Benchmark, type Format } from '../data/benchmarks';
import { MODELS, AVAILABLE, type Model } from '../data/models';
import { clamp, jitter, mulberry32 } from './rng';

export const BUILD_DATE = new Date();
export const BUILD_ISO = BUILD_DATE.toISOString().slice(0, 10);
const DAY = 86_400_000;

export interface Row {
  model: Model;
  value: number;
  vapor?: boolean;
}

function generated(b: Benchmark, m: Model): number | undefined {
  const g = b.generator;
  if (!g) return undefined;
  const override = g.overrides?.[m.id];
  if (override !== undefined) return override;
  if (m.status !== 'available' && !g.includeVapor) return undefined;
  const bias = g.labBias?.[m.lab] ?? 0;
  const effort = m.variant === 'max' || m.variant === 'xhigh' ? (g.maxEffortPenalty ?? 0) : 0;
  const raw = g.base + g.slope * (m.skill - 50) + bias + effort + jitter(`${b.slug}:${m.id}`) * g.spread;
  return clamp(raw, g.min, g.max);
}

const normalized = (b: Benchmark, v: number) => {
  if (b.slug === 'voxel-pagoda') return clamp(100 - v / 2, 0, 100);
  if (b.slug === 'great-question') return clamp(100 - v * 1.5, 0, 100);
  if (b.better === 'lower') return 100 - v;
  return v;
};

const indexCache = new Map<string, number>();

export function tmbIndex(m: Model): number | undefined {
  if (m.status !== 'available') return undefined;
  const hit = indexCache.get(m.id);
  if (hit !== undefined) return hit;
  let sum = 0;
  let w = 0;
  for (const b of INDEX_BENCHMARKS) {
    const v = generated(b, m);
    if (v === undefined) continue;
    sum += normalized(b, v) * b.indexWeight;
    w += b.indexWeight;
  }
  const idx = Math.round(sum / w);
  indexCache.set(m.id, idx);
  return idx;
}

export const shipEnd = (m: Model) => (m.released ? new Date(m.released) : BUILD_DATE);

export const shipDays = (m: Model) =>
  Math.max(0, Math.round((shipEnd(m).getTime() - new Date(m.announced).getTime()) / DAY));

const randomSeed = Math.floor(BUILD_DATE.getTime() / 1000);

export function randomAxis(models: Model[] = AVAILABLE) {
  const rnd = mulberry32(randomSeed);
  return models.map((model) => ({ model, x: rnd() * 100, y: rnd() * 100 }));
}

export function value(b: Benchmark, m: Model): number | undefined {
  if (b.computed === 'benchmaxx-gap') {
    const idx = tmbIndex(m);
    return idx === undefined ? undefined : Math.max(0, m.claimed - idx);
  }
  if (b.computed === 'ship-latency') return shipDays(m);
  if (b.computed === 'random-axis') return randomAxis().find((r) => r.model.id === m.id)?.y;
  return generated(b, m);
}

export function rows(b: Benchmark, opts: { vapor?: boolean } = {}): Row[] {
  const pool = b.computed === 'ship-latency' || b.generator?.includeVapor || opts.vapor ? MODELS : AVAILABLE;
  const out: Row[] = [];
  for (const m of pool) {
    const v = value(b, m);
    if (v === undefined) continue;
    out.push({ model: m, value: v, vapor: m.status !== 'available' });
  }
  const dir = b.better === 'lower' ? 1 : -1;
  return out.sort((a, c) => dir * (a.value - c.value));
}

export function indexRows(includeVapor = true): Row[] {
  const out: Row[] = [];
  for (const m of MODELS) {
    const idx = tmbIndex(m);
    if (idx !== undefined) out.push({ model: m, value: idx });
    else if (includeVapor) out.push({ model: m, value: m.claimed, vapor: true });
  }
  return out.sort((a, b) => b.value - a.value);
}

export const tier = (v: number) => {
  if (v >= 95) return 'S+';
  if (v >= 85) return 'S';
  if (v >= 70) return 'A';
  if (v >= 55) return 'B';
  if (v >= 40) return 'C';
  if (v >= 25) return 'D';
  return 'F';
};

export function fmt(v: number, f: Format): string {
  switch (f) {
    case 'pct':
      return `${Math.round(v)}%`;
    case 'usd':
      return v >= 1000 ? `$${(v / 1000).toFixed(1)}k` : `$${Math.round(v)}`;
    case 'ktok':
      return `${Math.round(v)}k`;
    case 'days':
      return `${Math.round(v)}d`;
    case 'tier':
      return tier(v);
    default:
      return `${Math.round(v)}`;
  }
}

export const money = (v: number) => {
  if (v === 0) return '—';
  if (v < 0.01) return `$${v.toFixed(3)}`;
  return `$${v.toFixed(2)}`;
};

export const compact = (n: number) =>
  new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(n);

export const shortDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });

export const COST_SEGMENTS = [
  { key: 'answer', label: 'Answer', color: '#52525b' },
  { key: 'reasoning', label: 'Reasoning', color: '#7c6fd0' },
  { key: 'hedging', label: 'Hedging', color: '#a3a3a3' },
  { key: 'apology', label: 'Apologies', color: '#e5a54b' },
  { key: 'flattery', label: '"Great question!"', color: '#e57399' },
] as const;

export function costBreakdown(m: Model) {
  const share = (k: string, lo: number, hi: number) => lo + (jitter(`${m.id}:${k}`) * 0.5 + 0.5) * (hi - lo);
  const raw = {
    answer: share('a', 0.08, 0.22),
    reasoning: m.reasoning ? share('r', 0.45, 0.7) : share('r', 0.05, 0.15),
    hedging: share('h', 0.06, 0.18),
    apology: share('p', 0.02, 0.1) + (m.lab === 'anthropic' ? 0.05 : 0),
    flattery: share('f', 0.01, 0.06) + (m.lab === 'openai' || m.lab === 'meta' ? 0.05 : 0),
  };
  const total = Object.values(raw).reduce((a, b) => a + b, 0);
  return COST_SEGMENTS.map((s) => ({ ...s, value: (raw[s.key] / total) * m.cost }));
}

export { BENCHMARKS };
