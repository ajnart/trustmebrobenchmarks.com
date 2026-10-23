import { readFile } from 'node:fs/promises';

interface Post {
  id: string;
  handle: string;
  date: string;
  likes: number;
  views: number;
  reply: boolean;
  text: string;
}

interface Labelled {
  model: string;
  labels: string;
}

const LABELS = { h: 'hype', p: 'positive', n: 'neutral', k: 'skeptical', x: 'negative' } as const;
type Code = keyof typeof LABELS;

const args = process.argv.slice(2);
const flag = (name: string) => args.flatMap((a, i) => (a === `--${name}` && args[i + 1] ? [args[i + 1]] : []));
const sweeps = args.filter((a, i) => a.endsWith('.json') && !['--labels'].includes(args[i - 1] ?? ''));

const ranked = (posts: Post[]) => [...posts].sort((a, b) => b.likes - a.likes || a.id.localeCompare(b.id));

const pools: Record<string, Post[]> = {};
for (const file of sweeps) {
  const data = JSON.parse(await readFile(file, 'utf8')) as { vibes?: Record<string, Post[]> };
  for (const [model, posts] of Object.entries(data.vibes ?? {})) pools[model] = ranked(posts);
}

if (args.includes('--list')) {
  for (const [model, posts] of Object.entries(pools)) {
    console.log(`\n### ${model} (${posts.length})`);
    posts.forEach((p, i) =>
      console.log(`${i + 1}. [${p.likes}♥ ${p.date}${p.reply ? ' reply' : ''}] @${p.handle} ${p.id} :: ${p.text.replace(/\s+/g, ' ').slice(0, 220)}`),
    );
  }
  process.exit(0);
}

const labelFile = flag('labels')[0];
if (!labelFile) {
  console.error('usage: bun vibes.ts <sweep.json>... --list\n       bun vibes.ts <sweep.json>... --labels labels.json --week YYYY-MM-DD');
  process.exit(1);
}

const labels = JSON.parse(await readFile(labelFile, 'utf8')) as Record<string, Labelled>;
const rows: string[] = [];
let failed = false;

for (const [query, { model, labels: raw }] of Object.entries(labels)) {
  const posts = pools[query];
  const codes = raw.replace(/\s+/g, '').split('');
  if (!posts) {
    console.error(`${query}: not found in the sweep files`);
    failed = true;
    continue;
  }
  if (codes.length !== posts.length) {
    console.error(`${query}: ${codes.length} labels for ${posts.length} posts`);
    failed = true;
    continue;
  }
  const bad = codes.filter((c) => c !== 's' && !(c in LABELS));
  if (bad.length > 0) {
    console.error(`${query}: unknown labels ${[...new Set(bad)].join(', ')} (use h p n k x, or s to skip)`);
    failed = true;
    continue;
  }
  const kept = posts.flatMap((p, i) => (codes[i] === 's' ? [] : [{ post: p, label: LABELS[codes[i] as Code] }]));
  const counts = Object.fromEntries(Object.values(LABELS).map((l) => [l, kept.filter((k) => k.label === l).length]));
  const loudest = (label: string) => kept.filter((k) => k.label === label).sort((a, b) => b.post.likes - a.post.likes)[0]?.post.id;
  const hype = loudest('hype');
  const skeptic = loudest('skeptical') ?? loudest('negative');
  rows.push(
    [
      `      { model: '${model}', posts: ${kept.length}, counts: { ${Object.entries(counts).map(([k, v]) => `${k}: ${v}`).join(', ')} }`,
      hype ? `, loudestHype: '${hype}'` : '',
      skeptic ? `, loudestDoubt: '${skeptic}'` : '',
      ' },',
    ].join(''),
  );
}

if (failed) process.exit(1);
const week = flag('week')[0] ?? new Date().toISOString().slice(0, 10);
console.log(`  {\n    week: '${week}',\n    rows: [\n${rows.join('\n')}\n    ],\n  },`);
