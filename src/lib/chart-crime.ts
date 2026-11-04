export const EXHIBIT = { ours: 52.8, theirs: 50.1, launchBase: 49.5 } as const;

export const LEAD = (EXHIBIT.ours - EXHIBIT.theirs).toFixed(1);

export const BREAK = 0.08;

export const NERF = 7.4;

export interface Preset {
  base: number;
  axis: boolean;
  star: boolean;
  sota: boolean;
  nerf: boolean;
  brk: boolean;
}

export const PRESETS: Record<string, Preset> = {
  honest: { base: 0, axis: false, star: false, sota: false, nerf: false, brk: false },
  launch: { base: EXHIBIT.launchBase, axis: true, star: true, sota: true, nerf: false, brk: false },
  deck: { base: Number((EXHIBIT.theirs - NERF - 0.1).toFixed(1)), axis: true, star: true, sota: true, nerf: true, brk: false },
};

export const VERDICTS = [
  { limit: 1.1, level: 'honest', label: 'Honest', sub: 'Nobody will share this.' },
  { limit: 2, level: 'spin', label: 'Spin', sub: 'Acceptable in a blog post.' },
  { limit: 5, level: 'marketing', label: 'Marketing', sub: 'Ready for the keynote.' },
  { limit: 15, level: 'launch-post', label: 'Launch post', sub: 'Expect 2M views and a quote-tweet from Gary Marcus.' },
  { limit: Infinity, level: 'chart-crime', label: 'Chart crime', sub: 'Felony. Your chart will appear on this site.' },
] as const;

export const verdict = (lie: number) => VERDICTS.find((v) => lie < v.limit) ?? VERDICTS[VERDICTS.length - 1];

const METER_MAX = 100;

export const meterPos = (v: number) => (Math.log10(Math.min(METER_MAX, Math.max(1, v))) / Math.log10(METER_MAX)) * 100;

export function axis(ours: number, theirs: number, base: number, brk = false) {
  const hi = Math.max(ours, theirs, 0.1);
  let top = hi + (hi - base) * 0.12;
  if (base === 0) top = Math.ceil((hi * 1.12) / 10) * 10;
  const frac = (v: number) => {
    if (!brk) return (v - base) / (top - base);
    if (v <= base) return (BREAK * v) / base;
    return BREAK + ((1 - BREAK) * (v - base)) / (top - base);
  };
  return { top, frac };
}

export const dataEffect = (ours: number, theirs: number) => (ours - theirs) / Math.max(0.01, theirs);

export function lieFactor(ours: number, theirs: number, shownOurs: number, shownTheirs: number) {
  const data = dataEffect(ours, theirs);
  if (Math.abs(data) < 1e-6) return 1;
  return (shownOurs - shownTheirs) / shownTheirs / data;
}

export const lieText = (lie: number) => {
  if (lie >= 100) return lie.toFixed(0);
  return lie.toFixed(1);
};

export function exhibitPanel(base: number) {
  const { frac } = axis(EXHIBIT.ours, EXHIBIT.theirs, base);
  const ours = frac(EXHIBIT.ours);
  const theirs = frac(EXHIBIT.theirs);
  return { base, ours, theirs, lie: lieText(lieFactor(EXHIBIT.ours, EXHIBIT.theirs, ours, theirs)) };
}
