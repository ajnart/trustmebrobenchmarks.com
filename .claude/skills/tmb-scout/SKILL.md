---
name: tmb-scout
description: Weekly content refresh for trustmebrobenchmarks.com. Sweeps X through treg for new model launches, "trust me bro" and benchmaxxing discourse, meme benchmarks and lab announcements; runs a sentiment Vibe Check on each new model; then verifies every post and wires models, incidents, tweets, benchmarks and changelog into src/data. Use it whenever the user asks for new tweets, news, "what's new", a weekly update, a content refresh, sentiment on a model, or to "update the website". Also use it when they paste a news digest or an LLM summary (Grok, ChatGPT, Perplexity) of recent AI happenings, or mention a model launch, leak or benchmark that could become a post, model, incident or changelog entry.
---

# TMB Scout

trustmebrobenchmarks.com is a deadpan academic parody of artificialanalysis.ai. Its scores are invented; its quoted posts, and every fact in its copy, are real. Everything in this skill protects that split. A made-up or misattributed quote, or a "fact" lifted from a summary, is the one mistake that turns the satire into misinformation about real people and companies. So every post on the site must exist on X with its real ID, its text must come from X, and every factual sentence in a note or finding must trace to a post or page read during this run.

A weekly run is five steps: sweep, find the new models, vibe check, wire in, ship. Budget: a full sweep is about 45 searches, roughly $0.03.

## 0. Prerequisites

- `treg whoami` must succeed. If searches return "not signed in, or this token is invalid", run `treg login` in the background and ask the user to approve the code in their browser. The scripts use the treg CLI; the treg MCP connection can hold a stale token even after login, so don't rely on it.
- Work from the repo root. Scripts write to `/tmp/tmb-scout/<today>/` unless given `--out`.

## 1. Sweep X

```sh
bun .claude/skills/tmb-scout/scripts/sweep.ts
```

It searches the discourse queries, every lab account and every benchmark author from `benchmarks.ts` (`from:<handle>`), since two days before the newest post in `tweets.ts`. It writes `sweep.md` (top 12 per query, ON-SITE marks posts already used) and `sweep.json`. Add `--query '<X search>'` for follow-ups and `--since YYYY-MM-DD` to override the cutoff. Queries take X's advanced syntax (`from:`, `min_faves:`, `OR`, quotes).

Read `sweep.md` end to end. The account sections are where launches show up; the discourse sections are where the jokes are.

**Pasted digests are leads, not facts.** LLM summaries get the handle and the gist right, then paraphrase, merge two posts, misdate them, or invent them. Look each one up with a `--query`.

## 2. Find the new models

Cross-check the account sweep against the outside world with web search: Artificial Analysis model pages and changelog, release trackers, and lab blogs. For each candidate, record from a source you actually read: lab, date, open weights or not, the headline claim (verbatim), and any independent number (AA index, an arena rank, a replication). Anything only "reported" by a fan account is a rumor and gets `status: 'rumored'` or `'announced'`, not `'available'`.

New labs (from `X` accounts like `@MiniMax_AI`) need an entry in `src/data/labs.ts` with a colour and 1–2 character mark distinct from the existing ones. Add the lab's handle to `ACCOUNTS` in `scripts/sweep.ts` so next week's sweep covers it.

## 3. Vibe check

Sample the conversation around each new or newsworthy model (usually 4–8 models):

```sh
bun .claude/skills/tmb-scout/scripts/sweep.ts --no-defaults --out /tmp/tmb-scout/vibes --model "Kimi K3.1" --model "Mercury 3"
bun .claude/skills/tmb-scout/scripts/vibes.ts /tmp/tmb-scout/vibes/sweep.json --list
```

`--list` numbers each model's posts by likes. Label every post, one letter each, in order:

| code | label | meaning |
| --- | --- | --- |
| `h` | hype | "insane", "🤯", "SOTA", "game over", breathless comparisons, rumor amplification |
| `p` | positive | measured approval, a good result reported calmly |
| `n` | neutral | news, availability, side-by-sides without a verdict, questions |
| `k` | skeptical | doubts, "benchmaxxed", "wait for independent evals", unfavourable comparisons |
| `x` | negative | it is bad, it failed, it is a rebrand |
| `s` | skip | the lab's own accounts, ads, giveaways, "FREE" spam, crypto, off-topic, replies that need their parent |

Label the post's stance on the model, not the poster's tone in general. Non-English posts count; read them. Write `labels.json` keyed by the `--model` string, with groups of five separated by spaces for counting:

```json
{ "Kimi K3.1": { "model": "kimi-k3-1", "labels": "nhhpn nnpnn nphkh ..." } }
```

```sh
bun .claude/skills/tmb-scout/scripts/vibes.ts /tmp/tmb-scout/vibes/sweep.json --labels labels.json --week YYYY-MM-DD
```

It refuses a label string whose length doesn't match the sample. Paste the printed object at the top of `VIBES` in `src/data/vibes.ts`; `LATEST_VIBES` is `VIBES[0]`, which drives the homepage chart and the strip on model pages. `--week` is the Monday of the week sampled. Every `model` must exist in `models.ts`.

## 4. Curate and wire in

**Posts.** A post earns a spot when it fits a topic, stands alone in a card, and makes the joke rather than being its butt (aim at labs, launch posts and hype accounts, not small accounts). Topics: `meme-bench` (joke or niche benchmarks), `benchmaxxed`, `trust-me-bro` (the phrase, opaque or self-reported scores, "internal benchmarks"), `vaporware` (announced, not available; rumor mills), `chart-crime`, `counterpoint` (independent evals, delivered promises, people pushing back). Engagement breaks ties but is not a gate. Skip posts whose text is only a link.

```sh
bun .claude/skills/tmb-scout/scripts/tweet-entry.ts <id>[:topic[:views]] ...
```

It prints a `TWEETS` entry from X's syndication API (the source the build uses) and flags posts already on the site, replies, quotes, truncation (end at a sentence boundary with ` …`) and unavailable posts. Take `views` from the sweep's `viewCount`. Text stays verbatim; trimming with `…` is the only edit. When editing texts with a script, beware `$1`-style sequences in `String.replace` replacements (prices like `$1.93`); prefer the edit tool.

**Where things go:**

- `src/data/tweets.ts`: append to `TWEETS`. Model pages pick up any post whose text contains the model's `name`.
- `src/data/models.ts`: new models. `skill` is the invented index input; place it relative to existing models using any independent ranking you found (higher independent score, higher skill). `claimed` and a verbatim `claimLabel` come from the launch post. `note` is one or two dry sentences, every fact sourced. Add notable announce-to-ship gaps to `SPAN_SUB` in `src/lib/views.ts`.
- `src/data/benchmarks.ts`: add IDs to `inspiredBy.tweetIds`; a new viral meme benchmark can become a new entry (`badge: 'New'`, `indexWeight: 0`, a generator, a candid `inspiredBy.note`). Vapor models in `superlatives` take an explicit override.
- `src/data/incidents.ts`: timeline entries `{ date, text, tweetId }` in date order. A new incident needs a sourced claim and finding. In an interactive run, pitch new incidents to the user first; in a scheduled run, file them and list them first in the PR description.
- `src/data/changelog.ts`: newest first, dates like `'23 Oct'`, existing `kind` labels, internal `href`s. The homepage shows the latest 10.

Every `tweetId` must exist in `TWEETS`; `tweetById` throws at build time otherwise.

**Voice:** clinical, deadpan, academic. Credit delivered promises and independent confirmations as plainly as you mock unverified ones; the counterpoints keep the parody fair. No exclamation marks, no emoji in the site's own copy.

## 5. Ship and report

```sh
bun run check && bun run build
```

Then check the homepage `#vibes` chart and one new model page in a browser (`bunx astro preview`). Commit with `feat(content): …`. In an interactive run, push to `main` when the user wants it live and follow the deploy with `gh run watch <id> --compact --exit-status`. In a scheduled run, open a pull request instead (`gh pr create`) unless the schedule's prompt says to push.

Report briefly:

- new models, incidents and benchmarks, each with its source;
- the vibe table (model, n, hype %, skeptical + negative %);
- posts added, and notable leads skipped and why;
- leads that could not be verified, stated plainly, never swapped for a similar post;
- treg spend from the sweep summaries.
