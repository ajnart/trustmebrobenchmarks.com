export interface ChangelogEntry {
  date: string;
  kind: string;
  title: string;
  href?: string;
}

export const CHANGELOG: ChangelogEntry[] = [
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
    title: 'Announcing the TMB Benchmaxx Gap',
    body: 'Measuring the distance between a launch-post chart and the model that ships',
    href: '/benchmarks/benchmaxx-gap/',
  },
  {
    title: 'Le Chaton Fat: 113 days from meme to model',
    body: 'A case study in rumor-driven development, with a full timeline',
    href: '/incidents/tmb-2026-0006/',
  },
];
