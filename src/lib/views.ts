import type { Bar } from '../components/charts/BarChart.astro';
import type { Point } from '../components/charts/ScatterChart.astro';
import type { Dumbbell } from '../components/charts/DumbbellChart.astro';
import type { Span } from '../components/charts/GanttChart.astro';
import type { Stack } from '../components/charts/StackedBarChart.astro';
import type { Benchmark } from '../data/benchmarks';
import { lab } from '../data/labs';
import { AVAILABLE, MODELS, displayName, modelById, STATUS_LABEL, type Model } from '../data/models';
import { modelTip } from './chart';
import { INDEX_NAME } from './site';
import { costBreakdown, fmt, indexRows, money, randomAxis, rows, shipDays, tmbIndex } from './scores';

const href = (m: Model) => `/models/#${m.id}`;

export const chartLabel = (m: Model) => (m.variant ? `${m.name} (${m.variant})` : m.name);

const bar = (m: Model, value: number, display: string, tip: string, hatched = false): Bar => ({
  id: m.id,
  label: chartLabel(m),
  value,
  display,
  color: lab(m.lab).color,
  mark: lab(m.lab).mark,
  hatched,
  href: href(m),
  tip,
});

export function indexBars(opts: { vapor?: boolean; limit?: number } = {}): Bar[] {
  const list = indexRows(opts.vapor ?? true).slice(0, opts.limit ?? 99);
  return list.map((r) =>
    r.vapor
      ? bar(
          r.model,
          r.value,
          r.model.claimLabel === 'AGI' ? 'AGI*' : `${r.value}*`,
          modelTip(r.model, [['Claimed', r.model.claimLabel ?? String(r.value)], ['Measured', 'n/a (cannot be used)']]),
          true,
        )
      : bar(r.model, r.value, String(r.value), modelTip(r.model, [[INDEX_NAME, String(r.value)], ['Self-reported', String(r.model.claimed)]])),
  );
}

export function benchBars(b: Benchmark, limit = 99): Bar[] {
  return rows(b)
    .slice(0, limit)
    .map((r) =>
      bar(
        r.model,
        r.value,
        fmt(r.value, b.format),
        modelTip(r.model, [[b.short, fmt(r.value, b.format)]], r.vapor ? 'Value derived from public claims, not measurement.' : undefined),
        r.vapor,
      ),
    );
}

export function speedBars(limit = 99): Bar[] {
  const list = [...MODELS].filter((m) => m.speed > 0).sort((a, b) => b.speed - a.speed);
  return list.slice(0, limit).map((m) =>
    bar(
      m,
      m.speed,
      m.status === 'available' ? String(m.speed) : `${m.speed}*`,
      modelTip(m, [['Output speed', `${m.speed} tok/s`]], m.status === 'available' ? undefined : 'Claimed. Measured on a slide.'),
      m.status !== 'available',
    ),
  );
}

export function costBars(limit = 99): Bar[] {
  const list = AVAILABLE.filter((m) => m.cost > 0).sort((a, b) => a.cost - b.cost);
  return list.slice(0, limit).map((m) => bar(m, m.cost, money(m.cost), modelTip(m, [['Cost per TMB task', money(m.cost)]])));
}

export function costStacks(): Stack[] {
  return [...AVAILABLE]
    .sort((a, b) => a.cost - b.cost)
    .map((m) => {
      const segments = costBreakdown(m);
      return {
        id: m.id,
        label: chartLabel(m),
        color: lab(m.lab).color,
        mark: lab(m.lab).mark,
        total: money(m.cost),
        segments,
        href: href(m),
        tip: modelTip(
          m,
          segments.map((s) => [s.label, money(s.value)]),
        ),
      };
    });
}

export function claimDumbbells(): Dumbbell[] {
  return MODELS.map((m) => {
    const measured = tmbIndex(m);
    return {
      id: m.id,
      label: chartLabel(m),
      color: lab(m.lab).color,
      measured,
      claimed: m.claimed,
      claimLabel: m.claimLabel,
      href: href(m),
      tip: modelTip(m, [
        ['Self-reported', m.claimLabel ? `${m.claimed} (${m.claimLabel})` : String(m.claimed)],
        ['Measured', measured === undefined ? 'n/a' : String(measured)],
        ['Gap', measured === undefined ? '+∞' : `+${m.claimed - measured}`],
      ]),
    };
  }).sort((a, b) => {
    const ga = a.measured === undefined ? Infinity : a.claimed - a.measured;
    const gb = b.measured === undefined ? Infinity : b.claimed - b.measured;
    if (ga === gb) return b.claimed - a.claimed;
    return gb - ga;
  });
}

const SPAN_SUB: Record<string, string> = {
  'reflection-405b': '"Coming next week"',
  'grok-5': '"A shot at being true AGI"',
  'le-chaton-fat': 'Rumored 30T spec',
  'mistral-large-4': 'Le Chaton Fat → Le Chonk',
  'gemini-4-argon': 'Announced with benchmark table',
  'claude-next': 'Routing rumor',
  'muse-wonder': 'Announced and shipped same day',
  'our-model': 'Internal checkpoint',
};

export function shipSpans(): Span[] {
  return Object.keys(SPAN_SUB).map((id) => {
    const m = modelById(id);
    return {
      id: m.id,
      label: m.name,
      sub: SPAN_SUB[id],
      color: lab(m.lab).color,
      start: m.announced,
      end: m.released,
      href: href(m),
      tip: modelTip(m, [
        ['First claim', m.announced],
        ['Available', m.released ?? 'not yet'],
        ['Days', `${shipDays(m)}${m.released ? '' : ' and counting'}`],
      ]),
    };
  });
}

const point = (m: Model, x: number, y: number, tip: string): Point => ({
  id: m.id,
  label: m.name,
  x,
  y,
  color: lab(m.lab).color,
  mark: lab(m.lab).mark,
  hatched: m.status !== 'available',
  href: href(m),
  tip,
});

export function indexVsCost(): Point[] {
  return AVAILABLE.map((m) => {
    const idx = tmbIndex(m)!;
    return point(m, m.cost, idx, modelTip(m, [[INDEX_NAME, String(idx)], ['Cost per task', money(m.cost)]]));
  });
}

export function indexVsSpeed(): Point[] {
  return AVAILABLE.map((m) => {
    const idx = tmbIndex(m)!;
    return point(m, m.speed, idx, modelTip(m, [[INDEX_NAME, String(idx)], ['Output speed', `${m.speed} tok/s`]]));
  });
}

export function indexVsClaim(): Point[] {
  return AVAILABLE.map((m) => {
    const idx = tmbIndex(m)!;
    return point(m, m.claimed, idx, modelTip(m, [[INDEX_NAME, String(idx)], ['Self-reported', String(m.claimed)]]));
  });
}

export function overTime(): Point[] {
  return MODELS.filter((m) => m.status !== 'self-reported').map((m) => {
    const idx = tmbIndex(m);
    const y = idx ?? Math.min(m.claimed, 100);
    const date = m.released ?? m.announced;
    return point(
      m,
      Date.parse(date),
      y,
      modelTip(m, [
        [idx === undefined ? 'Claimed' : INDEX_NAME, idx === undefined ? (m.claimLabel ?? String(m.claimed)) : String(idx)],
        [m.released ? 'Released' : 'First claim', date],
      ]),
    );
  });
}

export function randomPoints(): Point[] {
  return randomAxis().map((r) => point(r.model, r.x, r.y, modelTip(r.model, [['x', r.x.toFixed(1)], ['y', r.y.toFixed(1)]], 'Re-randomized every deploy.')));
}

export function contextDumbbells(): Dumbbell[] {
  return AVAILABLE.map((m) => ({
    id: m.id,
    label: chartLabel(m),
    color: lab(m.lab).color,
    measured: m.contextRemembered,
    claimed: m.contextClaimed,
    claimLabel: `${m.contextClaimed.toLocaleString()}k`,
    href: href(m),
    tip: modelTip(m, [
      ['Advertised', `${m.contextClaimed.toLocaleString()}k`],
      ['Remembers', `${m.contextRemembered}k`],
    ]),
  })).sort((a, b) => b.claimed - b.measured! - (a.claimed - a.measured!));
}

export { displayName, STATUS_LABEL };
