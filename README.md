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

This phenomenon was named after the repeated pattern of AI labs claiming state-of-the-art results on benchmarks like SWE-Bench, TerminalBench, and WebArena — only for researchers to discover the scores were achieved through exploitation, cherry-picking, or outright gaming.

---

## The Berkeley Proof

In April 2026, UC Berkeley's Robust and Reliable AI group published **"How We Broke Top AI Agent Benchmarks and What Comes Next"**, proving that:

- **100% on TerminalBench** — without solving a single task
- **100% on SWE-Bench Verified** — without solving a single task
- **100% on SWE-Bench Pro** — without solving a single task
- **100% on WebArena** — without solving a single task
- **100% on FieldWork Arena** — without solving a single task

Zero tasks truly solved. Not one. The benchmarks were so gameable that 10 lines of Python beat them.

---

## The Trust Me Bro Benchmark Leaderboard

| Rank | Model                | SWE-Bench | Trust Level              | Verified? | Bro Score  |
| ---- | -------------------- | --------- | ------------------------ | --------- | ---------- |
| 🥇   | GPT-Next-Turbo-Ultra | 99.97%    | 🔴 Trust Me Bro          | ❌        | 🤝🤝🤝🤝🤝 |
| 🥈   | Claude-5-Opus        | 99.95%    | 🔴 Trust Me Bro          | ❌        | 🤝🤝🤝🤝   |
| 🥉   | Gemini-3-Ultra-Pro   | 99.92%    | 🔴 Trust Me Bro          | ❌        | 🤝🤝🤝     |
| 4    | Model-X-2026         | 99.90%    | 🔴 Trust Me Bro          | ❌        | 🤝🤝🤝     |
| 5    | DeepSeek-R2          | 99.87%    | 🔴 Trust Me Bro          | Partially | 🤝🤝       |
| 6    | Llama-6-405B         | 99.80%    | 🟡 Trust Me Bro-ish      | Partially | 🤝         |
| 7    | Some Random 7B       | 74.3%     | 🟢 Actually Reproducible | ✅        | 👍         |

> **Note**: The top scores are all **"Trust Me Bro" certified** — meaning no independent researcher has been able to reproduce them. The only reproducible score on this list is from that humble 7B model that actually shared their evaluation code.

---

## How to Spot a Trust Me Bro Benchmark

### 🚩 Red Flags

- **No evaluation code published** — "We'll release it soon" (spoiler: they won't)
- **Custom prompting not disclosed** — "We used standard evaluation" (they didn't)
- **Cherry-picked test set** — "We evaluated on a representative subset" (of their choosing)
- **Self-reported scores only** — "Our internal team validated this" (no external audit)
- **Benchmark score goes up every week** — "3% improvement!" (meanwhile the task didn't change)
- **"Verified" in the name** but not actually verified — SWE-Bench "Verified" included exploited cases
- **Model specifically trained on benchmark data** — "We only used public data" (which included the benchmark)

### ✅ Green Flags

- **Open evaluation code** with deterministic reproduction
- **Hash-pinned dependencies** and full run manifests
- **Per-run tarballs** with run_id, timestamps, seeds, and hashes
- **Independent third-party verification**
- **Procedurally generated tasks** that can't be memorized (like [TrustBench](https://github.com/Co-Messi/TrustBench))
- **Results published with diffs against a baseline**

---

## The Philosophy

```
┌─────────────────────────────────────────────────┐
│                                                 │
│   "Our model achieves 99.7% accuracy"          │
│                                                 │
│   "Can you share the evaluation code?"         │
│                                                 │
│   "It's proprietary"                           │
│                                                 │
│   "Can you share the prompts?"                  │
│                                                 │
│   "They're sensitive"                           │
│                                                 │
│   "Can anyone reproduce this?"                  │
│                                                 │
│   "Trust me bro"  🤝                           │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## Real Projects Fighting Back

These projects are working to make AI benchmarks actually trustworthy:

| Project          | What They Do                                                                        | Link                                                    |
| ---------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------- |
| **TrustBench**   | Procedurally generated tasks, zero data contamination, adversarial pressure testing | [GitHub](https://github.com/Co-Messi/TrustBench)        |
| **TrustLLM**     | Comprehensive trustworthiness benchmark across 8 dimensions                         | [Paper](https://arxiv.org/abs/2401.05561)               |
| **Berkeley RAI** | Exposed benchmark exploitation with reproducible proof                              | [Paper](https://arxiv.org/abs/2604.xxxxx)               |
| **MMTrustEval**  | Multimodal trustworthiness evaluation framework                                     | [GitHub](https://github.com/thu-ml/MMTrustEval)         |
| **TRUSTEVAL**    | Dynamic evaluation toolkit for generative foundation models                         | [Paper](https://aclanthology.org/2025.naacl-demo.8.pdf) |
| **HELM**         | Holistic evaluation of language models                                              | [Site](https://crfm.stanford.edu/helm/)                 |

---

## The Trust Me Bro Scale

How trustworthy is your benchmark? Rate it:

| Score      | Level                    | Description                                                        |
| ---------- | ------------------------ | ------------------------------------------------------------------ |
| 🤝🤝🤝🤝🤝 | **Maximum Bro**          | Self-reported, no code, no methodology, "just trust us"            |
| 🤝🤝🤝🤝   | **Pretty Bro**           | Code released but doesn't reproduce claimed scores                 |
| 🤝🤝🤝     | **Moderate Bro**         | Methodology partially disclosed, some reproduction possible        |
| 🤝🤝       | **Mild Bro**             | Most things reproducible, minor gaps in documentation              |
| 🤝         | **Barely Bro**           | Nearly fully reproducible, small methodology questions             |
| 👍         | **Actually Trustworthy** | Fully reproducible, independently verified, procedurally generated |

---

## Contributing

See a benchmark that screams "trust me bro"? Open an issue or PR!

1. Fork this repo
2. Add the benchmark to the leaderboard
3. Document the trust level
4. Submit a PR

All contributions are peer-reviewed (unlike some benchmarks we could mention).

---

## License

This project is licensed under the **"Trust Me Bro" License** — which is exactly as reliable as the benchmarks we're cataloging.

Just kidding. It's [MIT](LICENSE).

---

<div align="center">

**Remember: If a benchmark can't be independently reproduced, it's not a benchmark.**  
**It's a marketing document.** 🤝

[made with trust, not bros](https://trustmebrobenchmarks.com)

</div>
