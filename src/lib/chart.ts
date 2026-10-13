import { lab, type LabId } from '../data/labs';
import { displayName, STATUS_LABEL, type Model } from '../data/models';

export function niceStep(span: number, count = 5) {
  const raw = span / count;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const step = [1, 2, 2.5, 5, 10].map((k) => k * mag).find((s) => s >= raw) ?? mag * 10;
  return step;
}

export function niceTicks(lo: number, hi: number, count = 5) {
  const step = niceStep(hi - lo, count);
  const out: number[] = [];
  for (let v = Math.ceil(lo / step) * step; v <= hi + step * 1e-6; v += step) out.push(+v.toFixed(10));
  return out;
}

export const niceMax = (v: number, count = 4) => {
  const step = niceStep(v, count);
  return Math.ceil(v / step) * step;
};

export function topRounded(x: number, y: number, w: number, h: number, r = 3) {
  if (h <= 0) return '';
  const rr = Math.min(r, w / 2, h);
  return `M${x},${y + h}V${y + rr}Q${x},${y} ${x + rr},${y}H${x + w - rr}Q${x + w},${y} ${x + w},${y + rr}V${y + h}Z`;
}

export function rightRounded(x: number, y: number, w: number, h: number, r = 3) {
  if (w <= 0) return '';
  const rr = Math.min(r, h / 2, w);
  return `M${x},${y}H${x + w - rr}Q${x + w},${y} ${x + w},${y + rr}V${y + h - rr}Q${x + w},${y + h} ${x + w - rr},${y + h}H${x}Z`;
}

export function wrapLabel(s: string, max = 15, lines = 3): string[] {
  const words = s.split(' ');
  const out: string[] = [];
  let cur = '';
  for (const w of words) {
    if (!cur) cur = w;
    else if ((cur + ' ' + w).length <= max) cur += ' ' + w;
    else {
      out.push(cur);
      cur = w;
    }
  }
  if (cur) out.push(cur);
  if (out.length > lines) {
    const kept = out.slice(0, lines);
    kept[lines - 1] = `${kept[lines - 1].slice(0, max - 1)}…`;
    return kept;
  }
  return out;
}

export const hatchId = (color: string) => `hatch-${color.replace('#', '')}`;

export function tipHtml(title: string, sub: string, rows: [string, string][] = [], foot?: string) {
  const body = rows.map(([k, v]) => `<div class="tip-row"><span>${k}</span><span>${v}</span></div>`).join('');
  return `<b>${title}</b><div class="tip-sub">${sub}</div>${body ? `<div style="margin-top:6px">${body}</div>` : ''}${
    foot ? `<div class="tip-sub" style="margin-top:6px">${foot}</div>` : ''
  }`;
}

export function modelTip(m: Model, rows: [string, string][] = [], foot?: string) {
  const l = lab(m.lab);
  const status = m.status === 'available' ? l.name : `${l.name} · ${STATUS_LABEL[m.status]}`;
  return tipHtml(displayName(m), status, rows, foot ?? (m.status !== 'available' ? m.note : undefined));
}

export interface Box {
  x1: number;
  x2: number;
  y1: number;
  y2: number;
}

export const overlaps = (a: Box, b: Box) => a.x1 < b.x2 && a.x2 > b.x1 && a.y1 < b.y2 && a.y2 > b.y1;

export const labColor = (id: LabId) => lab(id).color;
