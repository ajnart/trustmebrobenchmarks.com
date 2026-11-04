export interface ChangelogEntry {
  date: string;
  kind: string;
  title: string;
  href?: string;
}

export const CHANGELOG: ChangelogEntry[] = [
  { date: '4 Nov', kind: 'New incident filed', title: 'LifeVal, on which every model tested is ChatGPT', href: '/incidents/tmb-2026-0024/' },
  { date: '4 Nov', kind: 'New incident filed', title: 'DeepSeek V4.1 Pro leaks via a quick-start example', href: '/incidents/tmb-2026-0023/' },
  { date: '4 Nov', kind: 'New incident filed', title: 'Chad 4 benchmarks have leaked; Chad 4 does not exist', href: '/incidents/tmb-2026-0022/' },
  { date: '4 Nov', kind: 'New incident filed', title: 'Gemini 4 Xenon beats a model nobody has released', href: '/incidents/tmb-2026-0021/' },
  { date: '4 Nov', kind: 'New incident filed', title: 'Grok 4.8 is "not optimizing for benchmarks"', href: '/incidents/tmb-2026-0020/' },
  { date: '4 Nov', kind: 'New incident filed', title: 'Gemini 4 Carbon: number one on the index, available by appointment', href: '/incidents/tmb-2026-0019/' },
  { date: '4 Nov', kind: 'New incident filed', title: 'Obsidian 3: first place for about a day', href: '/incidents/tmb-2026-0018/' },
  { date: '4 Nov', kind: 'New model evaluation', title: 'GPT-6.1 Terra, which beat its own Terminal-Bench claim', href: '/models/gpt-6-1-terra/' },
  { date: '4 Nov', kind: 'Model update', title: 'Kimi K3.1 Pro weights ship on the promised date; index v5 moves it from fourth to ninth', href: '/models/kimi-k3-1-pro/' },
  { date: '4 Nov', kind: 'Incident update', title: 'Le Chonk open weights ship as scheduled. Incident resolved', href: '/incidents/tmb-2026-0006/' },
  { date: '4 Nov', kind: 'Corpus update', title: 'Twenty-three posts added to In the Wild, including a crocodile', href: '/in-the-wild/' },
  { date: '26 Oct', kind: 'New incident filed', title: 'Kimi K3.1 Pro: the most benchmaxxed model ever released, allegedly', href: '/incidents/tmb-2026-0017/' },
  { date: '26 Oct', kind: 'New model evaluation', title: 'Kimi K3.1 Pro (available; it was a teaser for about fifteen hours)', href: '/models/kimi-k3-1-pro/' },
  { date: '26 Oct', kind: 'Incident update', title: 'Kimi K3.1 ships the same day as its teaser, not the fifth of November', href: '/incidents/tmb-2026-0016/' },
  { date: '26 Oct', kind: 'Corpus update', title: 'Thirteen posts added to In the Wild, all concerning Kimi', href: '/in-the-wild/' },
  { date: '23 Oct', kind: 'New incident filed', title: 'Kimi K3.1 and the fifth of November', href: '/incidents/tmb-2026-0016/' },
  { date: '23 Oct', kind: 'Incident update', title: 'MiniMax M3.1 Flash weights ship on the promised date', href: '/incidents/tmb-2026-0014/' },
  { date: '23 Oct', kind: 'Corpus update', title: 'Thirty-five posts added to In the Wild, including one grandmother', href: '/in-the-wild/' },
  { date: '20 Oct', kind: 'New benchmark', title: 'Granny Survival Rate, direction of improvement unclear', href: '/benchmarks/granny/' },
  { date: '19 Oct', kind: 'New incident filed', title: 'SKY-001 beats every frontier model its makers tested', href: '/incidents/tmb-2026-0013/' },
  { date: '19 Oct', kind: 'New model evaluation', title: 'MiniMax M3.1 Flash, formerly Space Bunny', href: '/models/minimax-m3-1-flash/' },
  { date: '19 Oct', kind: 'New model evaluation', title: 'Mercury 3, which landed "next week" as promised', href: '/models/mercury-3/' },
  { date: '17 Oct', kind: 'Model update', title: 'DeepSeek V4.1 Flash 1017: a Pareto improvement, independently confirmed', href: '/models/deepseek-v4-1-flash/' },
  { date: '16 Oct', kind: 'Incident update', title: 'Reflection ships a model. A different Reflection', href: '/incidents/tmb-2024-0001/' },
  { date: '16 Oct', kind: 'New model evaluation', title: 'Beam 1.0 (Reflection AI)', href: '/models/beam-1-0/' },
  { date: '15 Oct', kind: 'New model evaluation', title: 'Muse Spark Open, the most capable US open-weight model, per Meta', href: '/models/muse-spark-open/' },
  { date: '14 Oct', kind: 'New model evaluation', title: 'Gemini 4 Argon (available; evaluated on the model this time)', href: '/models/gemini-4-argon/' },
  { date: '14 Oct', kind: 'Incident update', title: 'Gemini 4 Argon ships, twelve days after its benchmark table', href: '/incidents/tmb-2026-0010/' },
  { date: '14 Oct', kind: 'Corpus update', title: 'Eight posts added to In the Wild, six concerning Gemini 4', href: '/in-the-wild/' },
  { date: '13 Oct', kind: 'External benchmark update', title: 'BullshitBench V2 adds Gemini 4 Argon, Muse Wonder, Haiku 5.5 and Mistral Large 4', href: '/benchmarks/nonsense-pushback/' },
  { date: '13 Oct', kind: 'New model evaluation', title: 'Our Model™ (internal checkpoint, self-reported)', href: '/models/our-model/' },
  { date: '12 Oct', kind: 'New incident filed', title: 'Muse Wonder and the red cylinder', href: '/incidents/tmb-2026-0011/' },
  { date: '12 Oct', kind: 'New incident filed', title: 'Claude Next, allegedly in your Claude Code right now', href: '/incidents/tmb-2026-0012/' },
  { date: '12 Oct', kind: 'New language model evaluation', title: 'Muse Wonder Full (max)', href: '/models/muse-wonder-full/' },
  { date: '10 Oct', kind: 'Exemplary practice', title: 'Brainfuck Arena added to the Commendations registry', href: '/incidents/#commendations' },
  { date: '7 Oct', kind: 'Benchmark result', title: 'Claude Haiku 5.5 scores 4/100 on Lava Lamp Fidelity', href: '/benchmarks/lava-lamp/' },
  { date: '6 Oct', kind: 'Incident update', title: 'Le Chaton Fat ships as "Le Chonk". 29T parameters remain at large', href: '/incidents/tmb-2026-0006/' },
  { date: '6 Oct', kind: 'New benchmark', title: 'Random X/Y Axis Placement, re-run on every deploy', href: '/benchmarks/random-axis/' },
  { date: '1 Oct', kind: 'New model evaluation', title: 'Gemini 4 Argon (announced; evaluated on the announcement)', href: '/models/gemini-4-argon/' },
  { date: '1 Oct', kind: 'Methodology update', title: 'Confidence intervals widened from ±0 to ±∞', href: '/methodology/#confidence' },
];

export const ANNOUNCEMENTS = [
  {
    title: 'Gemini 4 Carbon: number one on the index, available by appointment',
    body: 'First on an independent index, and available to cyber defenders in a trusted-access program',
    href: '/incidents/tmb-2026-0019/',
  },
  {
    title: 'Announcing the TMB Benchmaxx Gap',
    body: 'Measuring the distance between a launch-post chart and the model that ships',
    href: '/benchmarks/benchmaxx-gap/',
  },
];
