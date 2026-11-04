import { getTweet, type Tweet } from 'react-tweet/api';
import { TOPIC_LABEL } from '../../../../src/data/tweets';
import { mentionedModels, usedPostIds } from '../../../../src/lib/content';

const TOPICS = Object.keys(TOPIC_LABEL);

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

const existing = usedPostIds();

for (const arg of args) {
  const [id, topic = 'trust-me-bro', views] = arg.split(':');
  const notes: string[] = [];
  if (!TOPICS.includes(topic)) notes.push(`unknown topic "${topic}", use one of ${TOPICS.join(', ')}`);
  if (existing.has(id)) notes.push('already in src/data/tweets.ts');
  const t = await getTweet(id).catch(() => undefined);
  if (!t) {
    console.log(`// ${id}: NOT AVAILABLE via syndication (deleted, protected or sensitive). Skip it.\n`);
    continue;
  }
  if (t.in_reply_to_screen_name) notes.push(`reply to @${t.in_reply_to_screen_name}: make sure it reads on its own`);
  if (t.note_tweet) notes.push('long post: text below is truncated, end it at a sentence boundary with …');
  if (t.quoted_tweet) notes.push(`quotes @${t.quoted_tweet.user.screen_name}: the joke may live in the quoted post`);
  const text = clean(t);
  const models = mentionedModels(text);
  if (models.length > 0) notes.push('models: matched by name; keep only the subject, drop models it merely compares against, add any it names differently');
  const lines = [
    '  {',
    `    id: '${t.id_str}',`,
    `    handle: '${t.user.screen_name}',`,
    `    name: ${quote(t.user.name)},`,
    `    date: '${new Date(t.created_at).toISOString().slice(0, 10)}',`,
    `    text: ${quote(text)},`,
    `    likes: ${t.favorite_count},`,
  ];
  if (views) lines.push(`    views: ${Number(views)},`);
  lines.push(`    topic: '${topic}',`);
  if (models.length > 0) lines.push(`    models: [${models.map((m) => `'${m}'`).join(', ')}],`);
  lines.push('  },');
  for (const n of notes) console.log(`// ${id}: ${n}`);
  console.log(lines.join('\n'));
}
