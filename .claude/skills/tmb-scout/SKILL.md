---
name: tmb-scout
description: Find fresh material for trustmebrobenchmarks.com and add it to the site. Covers new "trust me bro" and TMBB posts on X, new meme benchmarks, real updates to the benchmarks the site parodies (BullshitBench, SnitchBench…), launch claims nobody can verify, and chart crimes. Every post is verified on X before it goes into src/data (tweets, benchmarks, incidents, changelog). Use this whenever the user asks for new tweets, news, "what's new", or a content refresh. Also use it when they paste a news digest or an LLM summary (Grok, ChatGPT, Perplexity) of recent AI happenings, or mention a model launch, leak or benchmark that could become a post, incident or changelog entry.
---

# TMB Scout

trustmebrobenchmarks.com is a deadpan academic parody of artificialanalysis.ai. Its scores are invented, but its quoted posts are real. Everything in this skill protects that split. A made-up or misattributed quote is the one mistake that turns the satire into misinformation about real people. So every post on the site must exist on X with its real ID, and its text must come from X, never from a summary.

## 1. Find the cutoff

```sh
grep -o "date: '20[0-9-]*'" src/data/tweets.ts | sort | tail -3
sed -n 8,12p src/data/changelog.ts
```

Search from a couple of days before the newest date.

## 2. Gather leads

**Pasted digests are leads, not facts.** LLM news summaries usually get the handle and the gist right. They also paraphrase, merge two posts into one, misdate posts, or invent them. In the first run, 7 of 8 tweets from a Grok digest existed and one could not be found. Look each one up.

**X search** goes through treg, using Code Mode `execute`. It costs about $0.00075 per query, so batch queries in parallel:

```js
const queries = ['"trust me bro" benchmark since:2026-10-07', 'from:petergostev since:2026-10-07'];
const run = async (q) => {
  const r = await tools.treg.call({ endpoint_id: 'anyapi.x.search.posts', body: { query: q, limit: 20, queryType: 'Latest' } });
  const items = r?.body?.output?.data?.items || [];
  return { q, items: items.map((t) => `[${t.likeCount}♥ ${t.viewCount}v ${new Date(t.createdUtc * 1000).toISOString().slice(0, 10)}] @${t.authorUsername} /status/${t.id} :: ${(t.text || '').replace(/\s+/g, ' ').slice(0, 300)}`) };
};
return (await Promise.allSettled(queries.map(run))).map((r) => (r.status === 'fulfilled' ? r.value : String(r.reason)));
```

The query field takes X's advanced search syntax (`from:`, `since:`, `until:`, `min_faves:`, `OR`, quotes). Use `queryType: 'Top'` when you want the best posts and `'Latest'` when you want the newest. Starting points:

- The phrase itself: `"trust me bro" benchmark`, `"trust me bro benchmarks"`, `TMBB`, `benchmaxxed OR benchmaxxing min_faves:50`.
- Models in the news. Take names from `src/data/models.ts`, especially announced or unreleased ones, and add `trust me`, `benchmarks`, `leak` or `not out`.
- Authors of the benchmarks the site parodies. Take `inspiredBy.author` from `src/data/benchmarks.ts`, then search `from:<author> since:<date>`.
- New meme benchmarks: `"new benchmark" min_faves:300 since:<date>` and `Bench lmao since:<date>`.
- Chart crimes: `"y-axis" benchmark chart min_faves:200 since:<date>`.

**Outside X:** for real benchmark updates, read the repo commits, for example `gh api 'repos/petergpt/bullshit-benchmark/commits?per_page=10' --jq '.[] | [.commit.author.date, .commit.message[0:160]] | @tsv'`. Use web search for launch coverage.

## 3. Curate

A post earns a spot when it:

- fits one of the topics: `meme-bench` (joke or niche benchmarks), `benchmaxxed` (teaching to the test), `trust-me-bro` (the phrase, opaque scores, "source: trust me"), `vaporware` (announced, not available), `chart-crime` (misleading charts), or `counterpoint` (independent evals, people pushing back);
- reads on its own inside a card. A reply like "is this a trust me bro benchmark??" means nothing without its parent, so skip it;
- makes the joke rather than being the butt of it. Aim at labs, launch posts and hype accounts, not random small accounts.

Engagement breaks ties but is not a gate; the corpus has one-like gems. Prefer original posts over replies. Avoid stacking one author unless each post is clearly the best of its kind. Stick to English unless the user asks otherwise.

## 4. Generate entries

From the repo root:

```sh
bun .claude/skills/tmb-scout/scripts/tweet-entry.ts <id>[:topic[:views]] ...
```

The script pulls each post from X's syndication API, which is the same source the build uses for the cards. It prints a ready-to-paste `TWEETS` entry with t.co links and leading reply mentions stripped. It also flags:

- posts already in `tweets.ts`;
- replies and quote-posts (check that they stand alone);
- truncated long posts (end the text at a sentence boundary with `…`);
- posts unavailable via syndication (skip these, or the card degrades to a plain box).

Take `views` from the search result's `viewCount`, because syndication doesn't return views.

## 5. Wire it in

- **`src/data/tweets.ts`**: append the entries to `TWEETS`. Text stays verbatim. The only allowed edit is trimming with `…`.
- **Model pages** automatically pick up any post whose text contains a model's `name` from `models.ts`.
- **`src/data/benchmarks.ts`**: add IDs to `inspiredBy.tweetIds` on the benchmark that parodies the real one.
- **`src/data/incidents.ts`**: add timeline entries `{ date, text, tweetId }` in date order. `text` is a dry one-liner or a short quote. A new incident needs both a claim and a finding, and it is an editorial call, so pitch it to the user before writing it.
- **`src/data/changelog.ts`**: newest first. Format dates like `'14 Oct'`, reuse the existing `kind` labels, and use internal `href`s. The homepage shows the latest 10.

Every `tweetId` and `tweetIds` value must exist in `TWEETS`; otherwise `tweetById` throws at build time, which is your safety net.

**Voice:** clinical, deadpan, academic. Match the tone of the existing entries. Don't write "as X calls it", don't use exclamation marks, and don't use emoji in the site's own copy (quoted posts keep theirs).

## 6. Ship

Run `bun run check && bun run build`. The build fetches every tweet, so the first run is slow. Then commit with a conventional message such as `feat(content): …`. When the user wants it live, push to `main`; GitHub Pages deploys from there. Follow the run with `gh run watch <id> --compact --exit-status`.

## 7. Report

Keep the report short:

- what was added (handle, gist, where it was wired in);
- what was skipped, and why;
- which leads could not be verified. Say so plainly. Don't swap in a similar post and present it as the one from the digest.
