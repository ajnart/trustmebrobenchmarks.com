import type { Bar } from '../components/charts/BarChart.astro';
import type { Point } from '../components/charts/ScatterChart.astro';
import type { Dumbbell } from '../components/charts/DumbbellChart.astro';
import type { Span } from '../components/charts/GanttChart.astro';
import type { Stack } from '../components/charts/StackedBarChart.astro';
import type { Benchmark } from '../data/benchmarks';
import { lab } from '../data/labs';
import { AVAILABLE, MODELS, displayName, modelHref as href, shortClaim, type Model } from '../data/models';
import { modelTip } from './chart';
import { INDEX_NAME } from './site';
import { costBreakdown, fmt, indexRows, money, randomAxis, rows, shipDays, signed, tmbIndex } from './scores';

export interface Datum {
  model: Model;
  value: number;
  display: string;
  vapor: boolean;
}

export const indexSeries = (vapor = true): Datum[] =>
  indexRows(vapor).map((r) => ({ model: r.model, value: r.value, display: r.vapor ? `${shortClaim(r.model)}*` : String(r.value), vapor: Boolean(r.vapor) }));

export const benchSeries = (b: Benchmark): Datum[] =>
  rows(b).map((r) => ({ model: r.model, value: r.value, display: fmt(r.value, b.format), vapor: Boolean(r.vapor) }));

const claimSeries = (): Datum[] =>
  [...MODELS].sort((a, b) => b.claimed - a.claimed).map((m) => ({ model: m, value: m.claimed, display: shortClaim(m), vapor: false }));

const toBar = (d: Datum, tip: string): Bar => ({
  id: d.model.id,
  label: displayName(d.model),
  value: d.value,
  display: d.display,
  color: lab(d.model.lab).color,
  mark: lab(d.model.lab).mark,
  hatched: d.vapor,
  href: href(d.model),
  tip,
});

export function indexBars(opts: { vapor?: boolean; limit?: number } = {}): Bar[] {
  return indexSeries(opts.vapor ?? true)
    .filter((d) => !d.model.archived)
    .slice(0, opts.limit ?? 99)
    .map((d) => {
      if (d.vapor) return toBar(d, modelTip(d.model, [['Claimed', d.model.claimLabel ?? String(d.value)], ['Measured', 'n/a (cannot be used)']]));
      return toBar(d, modelTip(d.model, [[INDEX_NAME, d.display], ['Self-reported', String(d.model.claimed)]]));
    });
}

export function benchBars(b: Benchmark, limit = 99): Bar[] {
  return benchSeries(b)
    .slice(0, limit)
    .map((d) => toBar(d, modelTip(d.model, [[b.short, d.display]], d.vapor ? 'Value derived from public claims, not measurement.' : undefined)));
}

export const claimBars = (): Bar[] =>
  claimSeries()
    .filter((d) => !d.model.archived)
    .map((d) => toBar(d, modelTip(d.model, [['Self-reported', d.model.claimLabel ?? String(d.value)]])));

export function speedBars(limit = 99): Bar[] {
  return [...MODELS]
    .filter((m) => m.speed > 0)
    .sort((a, b) => b.speed - a.speed)
    .slice(0, limit)
    .map((m) => {
      if (m.status === 'available') return toBar({ model: m, value: m.speed, display: String(m.speed), vapor: false }, modelTip(m, [['Output speed', `${m.speed} tok/s`]]));
      return toBar({ model: m, value: m.speed, display: `${m.speed}*`, vapor: true }, modelTip(m, [['Output speed', `${m.speed} tok/s`]], 'Claimed. Measured on a slide.'));
    });
}

export function costBars(limit = 99): Bar[] {
  return AVAILABLE.filter((m) => m.cost > 0)
    .sort((a, b) => a.cost - b.cost)
    .slice(0, limit)
    .map((m) => toBar({ model: m, value: m.cost, display: money(m.cost), vapor: false }, modelTip(m, [['Cost per TMB task', money(m.cost)]])));
}

export function costStacks(): Stack[] {
  return [...AVAILABLE]
    .sort((a, b) => a.cost - b.cost)
    .map((m) => {
      const segments = costBreakdown(m);
      return {
        id: m.id,
        label: displayName(m),
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
      label: displayName(m),
      color: lab(m.lab).color,
      measured,
      claimed: m.claimed,
      claimLabel: m.claimLabel,
      href: href(m),
      tip: modelTip(m, [
        ['Self-reported', m.claimLabel ? `${m.claimed} (${m.claimLabel})` : String(m.claimed)],
        ['Measured', measured === undefined ? 'n/a' : String(measured)],
        ['Gap', signed(measured === undefined ? undefined : m.claimed - measured)],
      ]),
    };
  }).sort((a, b) => {
    const ga = a.measured === undefined ? Infinity : a.claimed - a.measured;
    const gb = b.measured === undefined ? Infinity : b.claimed - b.measured;
    if (ga === gb) return b.claimed - a.claimed;
    return gb - ga;
  });
}

export function shipSpans(): Span[] {
  return MODELS.flatMap((m) => (m.shipNote ? [{ m, sub: m.shipNote }] : []))
    .sort((a, b) => a.m.announced.localeCompare(b.m.announced))
    .map(({ m, sub }) => ({
      id: m.id,
      label: m.name,
      sub,
      color: lab(m.lab).color,
      start: m.announced,
      end: m.released,
      href: href(m),
      tip: modelTip(m, [
        ['First claim', m.announced],
        ['Available', m.released ?? 'not yet'],
        ['Days', `${shipDays(m)}${m.released ? '' : ' and counting'}`],
      ]),
    }));
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
    label: displayName(m),
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
