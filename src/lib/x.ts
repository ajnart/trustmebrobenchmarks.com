import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { getTweet, type Tweet } from 'react-tweet/api';

const DIR = join(process.cwd(), 'node_modules', '.astro', 'tweets');
const TTL = 12 * 60 * 60 * 1000;
const pending = new Map<string, Promise<Tweet | undefined>>();

interface Cached {
  at: number;
  tweet: Tweet | null;
}

async function load(id: string): Promise<Tweet | undefined> {
  const file = join(DIR, `${id}.json`);
  const cached = await readFile(file, 'utf8')
    .then((s) => JSON.parse(s) as Cached)
    .catch(() => undefined);
  if (cached && Date.now() - cached.at < TTL) return cached.tweet ?? undefined;
  try {
    const tweet = await getTweet(id);
    await mkdir(DIR, { recursive: true });
    await writeFile(file, JSON.stringify({ at: Date.now(), tweet: tweet ?? null } satisfies Cached));
    return tweet;
  } catch {
    return cached?.tweet ?? undefined;
  }
}

export function fetchTweet(id: string) {
  const hit = pending.get(id);
  if (hit) return hit;
  const p = load(id);
  pending.set(id, p);
  return p;
}
