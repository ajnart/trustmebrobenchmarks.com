import type { Bar } from '../components/charts/BarChart.astro';
import type { Dumbbell } from '../components/charts/DumbbellChart.astro';
import type { Span } from '../components/charts/GanttChart.astro';
import type { Point } from '../components/charts/ScatterChart.astro';
import type { Benchmark, Better } from '../data/benchmarks';
import { VAPOR } from '../data/models';
import { rows } from './scores';
import { benchBars, claimDumbbells, randomPoints, shipSpans } from './views';

export const DIRECTION: Record<Better, string> = { higher: 'Higher is better', lower: 'Lower is better', unclear: 'Direction unclear' };

export type BenchChart =
  | { kind: 'scatter'; points: Point[] }
  | { kind: 'dumbbell'; rows: Dumbbell[] }
  | { kind: 'gantt'; spans: Span[] }
  | { kind: 'bars'; bars: Bar[]; breakAbove?: number };

function chart(b: Benchmark): BenchChart {
  switch (b.computed) {
    case 'random-axis':
      return { kind: 'scatter', points: randomPoints() };
    case 'benchmaxx-gap':
      return { kind: 'dumbbell', rows: claimDumbbells() };
    case 'ship-latency':
      return { kind: 'gantt', spans: shipSpans() };
    default:
      return { kind: 'bars', bars: benchBars(b), breakAbove: b.breakAbove };
  }
}

export function benchmarkView(b: Benchmark) {
  const random = b.computed === 'random-axis';
  return {
    direction: DIRECTION[b.better],
    random,
    results: random ? [] : rows(b),
    unmeasured: b.computed === 'benchmaxx-gap' ? VAPOR : [],
    chart: chart(b),
  };
}
