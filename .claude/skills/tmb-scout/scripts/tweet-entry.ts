import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { getTweet, type Tweet } from 'react-tweet/api';

const TOPICS = ['meme-bench', 'benchmaxxed', 'trust-me-bro', 'vaporware', 'chart-crime', 'counterpoint'];

function quote(s: string) {
  if (!s.includes("'")) return `'${s.replace(/\\/g, '\\\\').replace(/\n/g, '\\n')}'`;
  return JSON.stringify(s);
}

function clean(t: Tweet) {
  const [start, end] = t.display_text_range;
  return Array.from(t.text)
    .slice(start, end)
    .join('')
    .replace(/https:\/\/t\.co\/\S+/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('usage: bun tweet-entry.ts <id>[:topic[:views]] ...');
  process.exit(1);
}

const existing = await readFile(join(process.cwd(), 'src/data/tweets.ts'), 'utf8').catch(() => '');

for (const arg of args) {
  const [id, topic = 'trust-me-bro', views] = arg.split(':');
  const notes: string[] = [];
  if (!TOPICS.includes(topic)) notes.push(`unknown topic "${topic}", use one of ${TOPICS.join(', ')}`);
  if (existing.includes(`id: '${id}'`)) notes.push('already in src/data/tweets.ts');
  const t = await getTweet(id).catch(() => undefined);
  if (!t) {
    console.log(`// ${id}: NOT AVAILABLE via syndication (deleted, protected or sensitive). Skip it.\n`);
    continue;
  }
  if (t.in_reply_to_screen_name) notes.push(`reply to @${t.in_reply_to_screen_name}: make sure it reads on its own`);
  if (t.note_tweet) notes.push('long post: text below is truncated, end it at a sentence boundary with …');
  if (t.quoted_tweet) notes.push(`quotes @${t.quoted_tweet.user.screen_name}: the joke may live in the quoted post`);
  const lines = [
    '  {',
    `    id: '${t.id_str}',`,
    `    handle: '${t.user.screen_name}',`,
    `    name: ${quote(t.user.name)},`,
    `    date: '${new Date(t.created_at).toISOString().slice(0, 10)}',`,
    `    text: ${quote(clean(t))},`,
    `    likes: ${t.favorite_count},`,
  ];
  if (views) lines.push(`    views: ${Number(views)},`);
  lines.push(`    topic: '${topic}',`, '  },');
  for (const n of notes) console.log(`// ${id}: ${n}`);
  console.log(lines.join('\n'));
}
