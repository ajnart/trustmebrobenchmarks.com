import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { ReactNode } from 'react';
import satori from 'satori';
import { svgToPng, CHECK_PATH, SEAL_PATH } from './icons';
import { OG_SIZE } from './seo';

export interface OgBar {
  label: string;
  display: string;
  value: number;
  color: string;
  vapor?: boolean;
}

export interface OgStat {
  value: string;
  label: string;
}

export type OgVisual =
  | { kind: 'rows'; caption: string; bars: OgBar[]; max: number }
  | { kind: 'stats'; caption: string; items: OgStat[] }
  | { kind: 'model'; score: string; caption: string; color: string; items: OgStat[] }
  | { kind: 'incident'; status: string; tone: string; severity: number; claim: string }
  | { kind: 'chips'; caption: string; items: string[] }
  | { kind: 'paper' }
  | { kind: 'crime' };

export interface OgSpec {
  key: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  visual: OgVisual;
}

const C = {
  ink: '#0b0b0c',
  ink2: '#37352f',
  muted: '#787774',
  faint: '#a8a7a3',
  line: '#e9e9e7',
  pill: '#f1f1ef',
  subtle: '#f7f7f5',
  accent: '#7b2a85',
  accentSoft: '#f6eef7',
};

const font = (pkg: string, file: string) => readFileSync(join(process.cwd(), 'node_modules', pkg, 'files', file));

let fonts: Parameters<typeof satori>[1]['fonts'] | undefined;
const loadFonts = () => {
  fonts ??= [
    { name: 'Inter', data: font('@fontsource/inter', 'inter-latin-400-normal.woff'), weight: 400, style: 'normal' },
    { name: 'Inter', data: font('@fontsource/inter', 'inter-latin-500-normal.woff'), weight: 500, style: 'normal' },
    { name: 'Inter', data: font('@fontsource/inter', 'inter-latin-600-normal.woff'), weight: 600, style: 'normal' },
    { name: 'Inter', data: font('@fontsource/inter', 'inter-latin-700-normal.woff'), weight: 700, style: 'normal' },
    { name: 'Serif', data: font('@fontsource/source-serif-4', 'source-serif-4-latin-400-normal.woff'), weight: 400, style: 'normal' },
    { name: 'Serif', data: font('@fontsource/source-serif-4', 'source-serif-4-latin-600-normal.woff'), weight: 600, style: 'normal' },
    { name: 'Inter', data: font('@fontsource/inter', 'inter-latin-ext-400-normal.woff'), weight: 400, style: 'normal' },
    { name: 'Inter', data: font('@fontsource/inter', 'inter-greek-400-normal.woff'), weight: 400, style: 'normal' },
    { name: 'Serif', data: font('@fontsource/source-serif-4', 'source-serif-4-latin-ext-400-normal.woff'), weight: 400, style: 'normal' },
    { name: 'Serif', data: font('@fontsource/source-serif-4', 'source-serif-4-greek-400-normal.woff'), weight: 400, style: 'normal' },
  ];
  return fonts;
};

const titleSize = (t: string) => {
  if (t.length > 52) return 50;
  if (t.length > 34) return 58;
  if (t.length > 18) return 68;
  return 80;
};

function Inf({ size }: { size: number }) {
  return (
    <svg width={size * 1.15} height={size * 0.62} viewBox="0 0 24 13" style={{ margin: '0 2px' }}>
      <path d="M6.2 1.5a5 5 0 1 0 0 10c2.6 0 4-2.2 5.8-5s3.2-5 5.8-5a5 5 0 1 1 0 10c-2.6 0-4-2.2-5.8-5S8.8 1.5 6.2 1.5z" stroke="currentColor" strokeWidth={2} fill="none" />
    </svg>
  );
}

function T({ text, size }: { text: string; size: number }) {
  const parts = text.split('∞');
  return (
    <span style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
      {parts.map((p, i) => (
        <span key={i} style={{ display: 'flex', alignItems: 'center' }}>
          {p}
          {i < parts.length - 1 && <Inf size={size} />}
        </span>
      ))}
    </span>
  );
}

function Seal({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path d={SEAL_PATH} fill="#ffffff" />
      <path d={CHECK_PATH} stroke={C.ink} strokeWidth={2.2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Caption({ children }: { children: string }) {
  return <div style={{ display: 'flex', fontSize: 17, fontWeight: 600, color: C.muted, letterSpacing: 0.3, marginBottom: 22 }}>{children}</div>;
}

function Panel({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: 500, border: `1px solid ${C.line}`, borderRadius: 24, padding: '30px 32px', background: '#ffffff' }}>
      {children}
    </div>
  );
}

function Rows({ v }: { v: Extract<OgVisual, { kind: 'rows' }> }) {
  return (
    <Panel>
      <Caption>{v.caption}</Caption>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
        {v.bars.map((b) => (
          <div key={b.label} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ display: 'flex', width: 150, fontSize: 18, fontWeight: 600, color: C.ink, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{b.label}</div>
            <div style={{ display: 'flex', flex: 1, height: 26, borderRadius: 6, background: C.pill }}>
              <div
                style={{
                  display: 'flex',
                  width: `${Math.max(4, Math.min(100, (b.value / v.max) * 100))}%`,
                  height: 26,
                  borderRadius: 6,
                  background: b.vapor ? `repeating-linear-gradient(135deg, ${b.color} 0px, ${b.color} 3px, #ffffff 3px, #ffffff 8px)` : b.color,
                  border: b.vapor ? `2px solid ${b.color}` : 'none',
                }}
              />
            </div>
            <div style={{ display: 'flex', width: 62, justifyContent: 'flex-end', fontSize: 19, fontWeight: 700, color: C.ink }}>{b.display}</div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function Stats({ v }: { v: Extract<OgVisual, { kind: 'stats' }> }) {
  return (
    <Panel>
      <Caption>{v.caption}</Caption>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
        {v.items.map((s) => (
          <div key={s.label} style={{ display: 'flex', flexDirection: 'column', width: 208, padding: '18px 20px', borderRadius: 16, background: C.subtle }}>
            <div style={{ display: 'flex', fontFamily: 'Serif', fontSize: 54, lineHeight: 1, color: C.ink, letterSpacing: -1 }}>{s.value}</div>
            <div style={{ display: 'flex', fontSize: 17, color: C.muted, marginTop: 8 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function ModelScore({ v }: { v: Extract<OgVisual, { kind: 'model' }> }) {
  return (
    <Panel>
      <Caption>{v.caption}</Caption>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16 }}>
        <div style={{ display: 'flex', fontFamily: 'Serif', fontSize: 150, lineHeight: 0.9, color: v.color, letterSpacing: -4 }}>{v.score}</div>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 26 }}>
        {v.items.map((s) => (
          <div key={s.label} style={{ display: 'flex', flexDirection: 'column', width: 210, padding: '12px 16px', borderRadius: 14, background: C.subtle }}>
            <div style={{ display: 'flex', fontSize: 26, fontWeight: 700, color: C.ink }}><T text={s.value} size={26} /></div>
            <div style={{ display: 'flex', fontSize: 15, color: C.muted, marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function IncidentCard({ v }: { v: Extract<OgVisual, { kind: 'incident' }> }) {
  return (
    <Panel>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', padding: '6px 14px', borderRadius: 8, background: `${v.tone}1f`, color: v.tone, fontSize: 18, fontWeight: 700 }}>{v.status}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ display: 'flex', fontSize: 15, color: C.muted, marginRight: 6 }}>Severity</div>
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} style={{ display: 'flex', width: 16, height: 16, borderRadius: 8, background: n <= v.severity ? '#c2410c' : C.line }} />
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', fontSize: 14, fontWeight: 600, color: C.muted, letterSpacing: 1.5, marginTop: 30 }}>CLAIM</div>
      <div style={{ display: 'flex', fontFamily: 'Serif', fontSize: 28, lineHeight: 1.35, color: C.ink, marginTop: 10 }}>{v.claim}</div>
    </Panel>
  );
}

function Chips({ v }: { v: Extract<OgVisual, { kind: 'chips' }> }) {
  return (
    <Panel>
      <Caption>{v.caption}</Caption>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        {v.items.map((c) => (
          <div key={c} style={{ display: 'flex', padding: '9px 16px', borderRadius: 999, background: C.pill, fontSize: 19, fontWeight: 500, color: C.ink2 }}>
            {c}
          </div>
        ))}
      </div>
    </Panel>
  );
}

function Paper() {
  return (
    <Panel>
      <div style={{ display: 'flex', fontSize: 14, fontWeight: 600, color: C.muted, letterSpacing: 1.5 }}>EQUATION 1</div>
      <div style={{ display: 'flex', fontFamily: 'Serif', fontSize: 36, color: C.ink, marginTop: 16, paddingBottom: 22, borderBottom: `1px solid ${C.line}` }}>
        TMB(m) = Σ w · ŝ(m) / Σ w
      </div>
      {[
        ['95% confidence interval', '±∞'],
        ['Reproduced', 'Internally, twice'],
        ['Data availability', 'On request*'],
        ['Peer review', 'Vibes'],
      ].map(([k, val]) => (
        <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 20, padding: '13px 0', borderBottom: `1px solid ${C.line}` }}>
          <div style={{ display: 'flex', color: C.muted }}>{k}</div>
          <div style={{ display: 'flex', color: C.ink, fontWeight: 600 }}><T text={val} size={20} /></div>
        </div>
      ))}
    </Panel>
  );
}

function Crime() {
  return (
    <Panel>
      <Caption>TrustMeBench Pro (Verified) · y-axis starts at 50</Caption>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 48, height: 260, borderBottom: `2px solid ${C.line}` }}>
        {[
          { label: 'Us', v: '52.8*', h: 240, c: C.accent },
          { label: 'Them', v: '50.1', h: 34, c: C.faint },
        ].map((b) => (
          <div key={b.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div style={{ display: 'flex', fontSize: 22, fontWeight: 700, color: C.ink }}>{b.v}</div>
            <div style={{ display: 'flex', width: 120, height: b.h, background: b.c, borderRadius: '6px 6px 0 0' }} />
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 18 }}>
        <div style={{ display: 'flex', fontSize: 18, color: C.muted }}>Lie Factor (Tufte)</div>
        <div style={{ display: 'flex', fontSize: 30, fontWeight: 700, color: '#c2410c' }}>83.5</div>
      </div>
    </Panel>
  );
}

function Visual({ v }: { v: OgVisual }) {
  switch (v.kind) {
    case 'rows':
      return <Rows v={v} />;
    case 'stats':
      return <Stats v={v} />;
    case 'model':
      return <ModelScore v={v} />;
    case 'incident':
      return <IncidentCard v={v} />;
    case 'chips':
      return <Chips v={v} />;
    case 'paper':
      return <Paper />;
    case 'crime':
      return <Crime />;
  }
}

function Card({ spec }: { spec: OgSpec }) {
  const path = spec.key === 'home' ? '' : `/${spec.key}`;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: OG_SIZE.width, height: OG_SIZE.height, background: '#ffffff', fontFamily: 'Inter' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 46, flexShrink: 0, padding: '0 64px', background: C.ink, color: '#ffffff', fontSize: 17 }}>
        <div style={{ display: 'flex' }}>
          <span style={{ fontWeight: 700, marginRight: 8 }}>Satire.</span>
          <span>Every score on this site is made up. The tweets are real.</span>
        </div>
      </div>
      <div style={{ display: 'flex', flex: 1, padding: '44px 64px 46px', gap: 52 }}>
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <div style={{ display: 'flex' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, height: 50, padding: '0 22px 0 16px', borderRadius: 999, background: C.ink, color: '#ffffff', fontFamily: 'Serif', fontSize: 24 }}>
              <Seal size={24} />
              Trust Me Bro
            </div>
          </div>
          <div style={{ display: 'flex', marginTop: 38, fontSize: 18, fontWeight: 700, letterSpacing: 1.6, color: C.accent }}>{spec.eyebrow.toUpperCase()}</div>
          <div style={{ display: 'flex', marginTop: 12, fontFamily: 'Serif', fontSize: titleSize(spec.title), lineHeight: 1.04, letterSpacing: -1.5, color: C.ink }}>{spec.title}</div>
          <div style={{ display: 'flex', marginTop: 18, fontSize: 23, lineHeight: 1.4, color: C.muted }}>{spec.subtitle.includes('∞') ? <T text={spec.subtitle} size={23} /> : spec.subtitle}</div>
          <div style={{ display: 'flex', marginTop: 'auto', fontSize: 17, color: C.faint, whiteSpace: 'nowrap' }}>
            <span style={{ color: C.ink2, fontWeight: 600 }}>trustmebrobenchmarks.com</span>
            <span>{path}</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Visual v={spec.visual} />
        </div>
      </div>
    </div>
  );
}

export async function renderOg(spec: OgSpec) {
  const svg = await satori(<Card spec={spec} />, { ...OG_SIZE, fonts: loadFonts() });
  return svgToPng(svg, OG_SIZE.width);
}
