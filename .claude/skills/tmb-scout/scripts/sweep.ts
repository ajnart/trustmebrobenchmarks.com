import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

interface Post {
  id: string;
  handle: string;
  name: string;
  date: string;
  likes: number;
  views: number;
  reply: boolean;
  text: string;
}

interface Query {
  kind: 'discourse' | 'account' | 'model';
  q: string;
  model?: string;
  type: 'Top' | 'Latest';
}

const DISCOURSE = [
  '"trust me bro" benchmark',
  '"trust me bro" (model OR AI OR benchmarks OR leak) min_faves:10',
  'benchmaxxed OR benchmaxxing OR benchmaxx min_faves:10',
  '"self-reported" (benchmark OR benchmarks OR evals) min_faves:30',
  '"internal benchmarks" OR "internal evals" min_faves:30',
  '"new benchmark" (AI OR LLM OR model OR models) min_faves:150',
  '("y-axis" OR "y axis" OR "chart crime") (AI OR model OR benchmark) min_faves:50',
  '("independent evals" OR "independent benchmarks" OR "can\'t reproduce") model min_faves:30',
  '(leak OR leaked) benchmarks model min_faves:100',
  '("coming next week" OR "coming soon" OR "next week") (model OR AGI) min_faves:300',
  '("now available" OR "introducing" OR "new model") (AI OR LLM OR model) min_faves:1500',
];

const ACCOUNTS = [
  'ArtificialAnlys',
  'lmarena_ai',
  'OpenAI',
  'AnthropicAI',
  'GoogleDeepMind',
  'xai',
  'AIatMeta',
  'MistralAI',
  'deepseek_ai',
  'Alibaba_Qwen',
  'Kimi_Moonshot',
  'Zai_org',
  'MiniMax_AI',
  'reflection_ai',
  '_inception_ai',
  'NVIDIAAI',
];

const args = process.argv.slice(2);
const flag = (name: string) => args.flatMap((a, i) => (a === `--${name}` && args[i + 1] ? [args[i + 1]] : []));
const root = process.cwd();
const src = (p: string) => readFile(join(root, p), 'utf8');

const tweets = await src('src/data/tweets.ts');
const dates = [...tweets.matchAll(/date: '(\d{4}-\d{2}-\d{2})'/g)].map((m) => m[1]).sort();
const fallback = new Date(Date.parse(dates.at(-1) ?? new Date().toISOString().slice(0, 10)) - 2 * 864e5).toISOString().slice(0, 10);
const since = flag('since')[0] ?? fallback;
const out = flag('out')[0] ?? join('/tmp', 'tmb-scout', new Date().toISOString().slice(0, 10));

const authors = [...(await src('src/data/benchmarks.ts')).matchAll(/author: '@(\w+)'/g)].map((m) => m[1]);
const models = [...new Set(flag('model'))];

const defaults = args.includes('--no-defaults')
  ? []
  : [
      ...DISCOURSE.map((q) => ({ kind: 'discourse' as const, q, type: 'Top' as const })),
      ...[...new Set([...ACCOUNTS, ...authors])].map((h) => ({ kind: 'account' as const, q: `from:${h}`, type: 'Latest' as const })),
    ];

const queries: Query[] = [
  ...defaults,
  ...flag('query').map((q) => ({ kind: 'discourse' as const, q, type: 'Top' as const })),
  ...models.flatMap((m) =>
    (['Top', 'Latest'] as const).map((type) => ({ kind: 'model' as const, model: m, q: `"${m}" -filter:retweets`, type })),
  ),
];

const known = new Set([...tweets.matchAll(/id: '(\d+)'/g)].map((m) => m[1]));
let charged = 0;

function toPost(raw: unknown): Post | undefined {
  if (typeof raw !== 'object' || raw === null) return undefined;
  const t = raw as Record<string, unknown>;
  const text = String(t.text ?? '');
  if (text.startsWith('RT @')) return undefined;
  return {
    id: String(t.id),
    handle: String(t.authorUsername),
    name: String(t.authorName),
    date: new Date(Number(t.createdUtc) * 1000).toISOString().slice(0, 10),
    likes: Number(t.likeCount ?? 0),
    views: Number(t.viewCount ?? 0),
    reply: Boolean(t.isReply),
    text: text.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>'),
  };
}

async function search(query: Query) {
  const body = JSON.stringify({ query: `${query.q} since:${since}`, limit: 20, queryType: query.type });
  const proc = Bun.spawn(['treg', '--json', 'call', 'anyapi.x.search.posts', '--data', body], { stdout: 'pipe', stderr: 'pipe' });
  const raw = await new Response(proc.stdout).text();
  await proc.exited;
  try {
    const parsed = JSON.parse(raw) as { result?: { output?: { data?: { items?: unknown[] } } }; _treg?: { charged_micro?: number; http_status?: number } };
    charged += parsed._treg?.charged_micro ?? 0;
    const posts = (parsed.result?.output?.data?.items ?? []).flatMap((i) => toPost(i) ?? []);
    return { ...query, status: parsed._treg?.http_status ?? 0, posts };
  } catch {
    return { ...query, status: 0, posts: [] as Post[], error: raw.slice(0, 300) };
  }
}

const results: Awaited<ReturnType<typeof search>>[] = [];
for (let i = 0; i < queries.length; i += 6) results.push(...(await Promise.all(queries.slice(i, i + 6).map(search))));

const failed = results.filter((r) => r.status !== 200);
if (failed.length === results.length) {
  console.error(`every search failed. First error: ${failed[0]?.error ?? 'unknown'}\nRun \`treg login\` and retry.`);
  process.exit(1);
}

const ranked = (posts: Post[]) => [...posts].sort((a, b) => b.likes - a.likes || a.id.localeCompare(b.id));

const line = (p: Post) =>
  `- [${p.likes}♥ ${p.views}v ${p.date}${p.reply ? ' reply' : ''}${known.has(p.id) ? ' ON-SITE' : ''}] @${p.handle} ${p.id} :: ${p.text.replace(/\s+/g, ' ').slice(0, 280)}`;

const md: string[] = [`# Sweep since ${since}`, '', `${results.length} searches, ${failed.length} failed, $${(charged / 1e6).toFixed(4)} charged.`, ''];
for (const kind of ['discourse', 'account'] as const) {
  md.push(`## ${kind === 'discourse' ? 'Discourse' : 'Accounts'}`, '');
  for (const r of results.filter((x) => x.kind === kind && x.posts.length > 0)) {
    md.push(`### ${r.q}`, '', ...ranked(r.posts).slice(0, 12).map(line), '');
  }
}

const vibes: Record<string, Post[]> = {};
for (const r of results.filter((x) => x.kind === 'model')) {
  const pool = new Map((vibes[r.model ?? ''] ?? []).map((p) => [p.id, p]));
  for (const p of r.posts) pool.set(p.id, p);
  vibes[r.model ?? ''] = [...pool.values()];
}
if (models.length > 0) {
  md.push('## Model samples (classify each post for the vibe check)', '');
  for (const [model, posts] of Object.entries(vibes)) {
    md.push(`### ${model} (${posts.length} posts)`, '', ...ranked(posts).map((p, i) => `${i + 1}. ${line(p).slice(2)}`), '');
  }
}

await mkdir(out, { recursive: true });
const ordered = Object.fromEntries(Object.entries(vibes).map(([m, posts]) => [m, ranked(posts)]));
await writeFile(join(out, 'sweep.json'), JSON.stringify({ since, charged_micro: charged, results, vibes: ordered }, null, 1));
await writeFile(join(out, 'sweep.md'), md.join('\n'));
console.log(`since ${since} · ${results.length} searches · ${failed.length} failed · $${(charged / 1e6).toFixed(4)}\n${join(out, 'sweep.md')}`);
