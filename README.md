<div align="center">

# 🤝 trustmebrobenchmarks.com

### The definitive leaderboard for AI benchmarks that ask you to just trust them.

**"Our model scores 99.7% on SWE-Bench."**  
_"Can we see the methodology?"_  
**"Trust me bro."**

[![trust me bro](https://img.shields.io/badge/trust_level-maximum-brightgreen?label=trust%20me%20bro)](https://trustmebrobenchmarks.com)
[![benchmark](<https://img.shields.io/badge/benchmark-verified%20(Trust%20Me%20Bro%20certified)-success>)](https://trustmebrobenchmarks.com)
[![reproducibility](https://img.shields.io/badge/reproducibility-lmao-red)](https://trustmebrobenchmarks.com)

</div>

---

## What is a "Trust Me Bro" Benchmark?

A **Trust Me Bro Benchmark** is any AI evaluation where:

1. A company posts impressive benchmark scores
2. The methodology, prompts, or evaluation code are undisclosed
3. Independent reproduction is... _not possible_
4. The response to scrutiny is essentially: **"Trust me bro"**

[Fireship](https://x.com/fireship_dev) calls them **TMBBs**. This phenomenon was named after the repeated pattern of AI labs claiming state-of-the-art results on benchmarks like SWE-Bench, TerminalBench, and WebArena — only for researchers to discover the scores were achieved through exploitation, cherry-picking, or outright gaming.

Contribute to this website [here](https://github.com/ajnart/trustmebrobenchmarks.com)

## What's on the site

- **Leaderboard** with the Trust Me Bro Intelligence Index, Benchmaxx Gap, Days to Ship and other fake metrics, styled after [Artificial Analysis](https://artificialanalysis.ai/) (not affiliated)
- **14 evaluations** inspired by real meme benchmarks (BullshitBench, the pelican, Brainfuck tic-tac-toe, lava lamps, the strawberry...)
- **Incident database** of claims that outran their evidence, sourced from public posts
- **In the Wild**: the real, verbatim posts that inspired it all
- **Chart Crime Studio**: truncate a y-axis and watch Tufte's Lie Factor climb

Every score is fabricated. The quoted posts are real and link to their originals.

## Development

Static [Astro](https://astro.build) site built with [bun](https://bun.sh), deployed to GitHub Pages on every push to `main`.

```sh
bun install
bun dev          # http://localhost:4321
bun run build    # outputs to dist/
bun run check    # typecheck
```

- Tweets are fetched at build time and rendered with the [Magic UI tweet card](https://magicui.design/docs/components/tweet-card) (cached in `node_modules/.astro/tweets`)
- Every page gets its own share image, rendered with satori at build time (`src/lib/og.tsx`, `src/pages/og/`)
- Favicons, app icons and the web manifest are generated from one SVG (`src/lib/icons.ts`)
- Navigation uses Speculation Rules prerendering and cross-document view transitions
- Production builds load Cloudflare Web Analytics (cookieless, no consent banner needed)
- New posts and news are found and verified with the `tmb-scout` agent skill (`.claude/skills/tmb-scout`)

Data lives in `src/data/` (models, benchmarks, tweets, incidents). Add a meme benchmark or a tweet there and open a PR.
