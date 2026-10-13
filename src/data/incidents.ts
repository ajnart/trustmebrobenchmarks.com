export type IncidentStatus =
  | 'Open'
  | 'Resolved'
  | 'Disputed'
  | 'Unconfirmed'
  | 'Partially delivered'
  | 'Unfalsifiable';

export interface TimelineEntry {
  date: string;
  text: string;
  tweetId?: string;
}

export interface Incident {
  id: string;
  date: string;
  title: string;
  subject: string;
  category: string;
  status: IncidentStatus;
  severity: 1 | 2 | 3 | 4 | 5;
  claim: string;
  finding: string;
  timeline: TimelineEntry[];
}

export const INCIDENTS: Incident[] = [
  {
    id: 'TMB-2024-0001',
    date: '2024-09-05',
    title: 'Reflection 70B, and the 405B that is coming next week',
    subject: 'Reflection 70B / 405B',
    category: 'Unreplicated claim',
    status: 'Open',
    severity: 5,
    claim: '"The world\'s top open-source model." A 405B version was announced as "coming next week" and expected to be "the best model in the world".',
    finding:
      'Two days later, independent evaluators reported they were "unable to replicate the eval results claimed" and saw worse performance than the base model it was fine-tuned from. The 405B week has, at the time of this build, not ended.',
    timeline: [
      { date: '2024-09-05', text: 'Announcement: "world\'s top open-source model"; 405B "coming next week".', tweetId: '1831767014341538166' },
      { date: '2024-09-07', text: 'Independent evals: unable to replicate; worse than Llama 3.1 70B.', tweetId: '1832457791010959539' },
      { date: 'ongoing', text: 'Next week.' },
    ],
  },
  {
    id: 'TMB-2025-0002',
    date: '2025-08-21',
    title: 'Grok 5 has a shot at being true AGI',
    subject: 'Grok 5',
    category: 'Promised capability',
    status: 'Open',
    severity: 4,
    claim:
      '"Wait until you see Grok 5. I think it has a shot at being true AGI." Later: a "chance of reaching AGI", and "smartest AI in the world by a significant margin on every metric" (as reported).',
    finding:
      'At the time of this build, the most recent xAI model we can find on public leaderboards is Grok 4.7. Grok 5 has therefore been benchmarked exclusively by its future self.',
    timeline: [
      { date: '2025-08-21', text: '"Shot at being true AGI."', tweetId: '1958499441469739329' },
      { date: '2025-09-17', text: '"A chance of reaching AGI with Grok 5."', tweetId: '1968202372276163029' },
      { date: '2025-11-14', text: '"Smartest AI in the world by a significant margin on every metric" (as reported).', tweetId: '1989453462770237688' },
      { date: '2026-09-14', text: 'Version numbers continue to approach 5 asymptotically.', tweetId: '2099476647569416657' },
    ],
  },
  {
    id: 'TMB-2026-0003',
    date: '2026-02-19',
    title: 'No low points on all of my internal benchmarks',
    subject: 'Grok 4.20',
    category: 'Unfalsifiable',
    status: 'Unfalsifiable',
    severity: 2,
    claim: '"I can not find any low points to Grok 4.20 on all of my internal benchmarks." The post was viewed over 18 million times.',
    finding:
      'The internal benchmarks were not published. We have no reason to doubt them and no way to. This is the defining property of the genre.',
    timeline: [{ date: '2026-02-19', text: 'Post published.', tweetId: '2024297111190458720' }],
  },
  {
    id: 'TMB-2026-0004',
    date: '2026-02-22',
    title: '"Garlic" surpasses the SimpleBench human baseline',
    subject: 'GPT-5.3 (rumored)',
    category: 'Rumor',
    status: 'Resolved',
    severity: 3,
    claim:
      'Pre-release: GPT-5.3 "surpasses human baseline on SimpleBench of 83.7%" and "blows every previous model out of the water". "Word has it is a HUGE leap."',
    finding:
      'Six months later, Claude Fable 5.1 was widely reported as "the first ever model to beat the human baseline score in SimpleBench". Word, it turns out, did not have it.',
    timeline: [
      { date: '2026-02-22', text: 'Rumor: human baseline surpassed.', tweetId: '2025672400407597373' },
      { date: '2026-09-03', text: 'First model reported above the human baseline is a different model.', tweetId: '2095523169545187439' },
    ],
  },
  {
    id: 'TMB-2026-0005',
    date: '2026-03-24',
    title: 'Agent reports a 101,687× speedup',
    subject: 'Autonomous research agent',
    category: 'Agentic benchmaxxing',
    status: 'Resolved',
    severity: 3,
    claim: 'After 108 experiments with a legitimate ceiling of 2.6×, an optimization agent reported a 101,687× throughput improvement.',
    finding:
      'The agent had discovered that caching the test set\'s inputs and outputs is the fastest possible way to compute them. Caught by the human, who described it as "benchmaxxing by IO memorization". A rare case of a trust-me-bro claim being made by the model itself.',
    timeline: [{ date: '2026-03-24', text: 'Speedup claimed; speedup un-claimed.', tweetId: '2036516670571946153' }],
  },
  {
    id: 'TMB-2026-0006',
    date: '2026-06-15',
    title: 'Le Chaton Fat',
    subject: 'Mistral Large 4',
    category: 'Rumor → partial delivery',
    status: 'Partially delivered',
    severity: 2,
    claim:
      'A teased Mistral model, immediately nicknamed "Le Chaton Fat", spread with a rumored spec sheet: 30T-parameter MoE, 256 experts, "outperforms Fable 5 on every benchmark". It was then "confirmed to launch this summer".',
    finding:
      'The CEO clarified the name ("It\'s actually le gros chaton"). The model shipped on 6 October as Mistral Large 4, "Le Chonk": 1T parameters, 49B active, with open weights scheduled for "the end of October". Delta versus rumor: 29 trillion parameters and one season. Severity is low because the cat was real.',
    timeline: [
      { date: '2026-06-15', text: 'Rumored spec: 30T MoE, outperforms Fable 5 on every benchmark.', tweetId: '2066423720042959176' },
      { date: '2026-06-15', text: '"It\'s actually le gros chaton."', tweetId: '2066456715650793956' },
      { date: '2026-06-15', text: 'Calls for the French government to intervene before the FAT takeoff.', tweetId: '2066535006487339282' },
      { date: '2026-06-16', text: '"Confirmed to launch this summer."', tweetId: '2066915923626172424' },
      { date: '2026-09-08', text: 'Still waiting.', tweetId: '2097356014873931777' },
      { date: '2026-10-06', text: 'Mistral Large 4 "Le Chonk" ships: 1T params, 49B active.', tweetId: '2107457414387622310' },
      { date: 'ongoing', text: 'Open weights: "end of October".' },
    ],
  },
  {
    id: 'TMB-2026-0007',
    date: '2026-09-09',
    title: 'Tied with Fable 5 on the index; lava exits lamp',
    subject: 'Muse Spark 1.3',
    category: 'Alleged benchmaxxing',
    status: 'Disputed',
    severity: 3,
    claim: 'A model tied with Claude Fable 5 on an aggregate intelligence index.',
    finding:
      'An independent single-prompt test produced a lava lamp in which "the lava is coming OUT of the lamp", prompting the conclusion that "the scores have no relationship to real world use". Both an index and a lamp are, in the end, n of something.',
    timeline: [{ date: '2026-09-09', text: 'Lamp breached.', tweetId: '2097639511802933425' }],
  },
  {
    id: 'TMB-2026-0008',
    date: '2026-09-18',
    title: 'The 98.2%',
    subject: 'Qwen3.8 27B derivative',
    category: 'Cherry-picking (alleged)',
    status: 'Disputed',
    severity: 3,
    claim: 'A headline "98.2%" figure relative to Qwen3.8 27B.',
    finding:
      'A widely shared rebuttal called the figure "cherry-picked across 14 static benchmarks" after the model was given "a real agent job right away". The rebuttal itself is also n = 1, which we note in the interest of balance.',
    timeline: [
      { date: '2026-09-18', text: '"98.2% of Qwen3.8 27B my ass."', tweetId: '2101038100889927810' },
      { date: '2026-09-18', text: '"Cherry-picked across 14 static benchmarks."', tweetId: '2101085600401289427' },
    ],
  },
  {
    id: 'TMB-2026-0009',
    date: '2026-09-29',
    title: '"Near-Astra intelligence for a fifth of the price"',
    subject: 'GPT-6.1 Sol',
    category: 'Marketing claim',
    status: 'Disputed',
    severity: 2,
    claim: 'GPT-6.1 Sol marketed as "near-Astra intelligence for a fifth of the price".',
    finding:
      'A third-party sunset-ocean test reported "same cost as GPT 6 Sol. Twice as slow. And it barely rendered an ocean." The ocean has declined to comment.',
    timeline: [{ date: '2026-09-29', text: 'Ocean barely rendered.', tweetId: '2105018236165099538' }],
  },
  {
    id: 'TMB-2026-0010',
    date: '2026-10-01',
    title: 'Announced with a benchmark table, available with a waitlist',
    subject: 'Gemini 4 Argon',
    category: 'Announced, not available',
    status: 'Open',
    severity: 3,
    claim: 'A launch announcement with strong benchmark results.',
    finding:
      'Reportedly, employees with access said the results "don\'t always translate that well to real-world tasks, especially coding" (per Bloomberg, as relayed on X). Eleven days after the announcement the model was "still not out to the public". It is therefore undefeated on this leaderboard.',
    timeline: [
      { date: '2026-09-30', text: 'Pre-launch reporting on real-world translation.', tweetId: '2105400431274840238' },
      { date: '2026-10-01', text: 'Announced.' },
      { date: '2026-10-12', text: '"Announced 11 days ago and still isn\'t out to the public."', tweetId: '2109720113578737999' },
    ],
  },
  {
    id: 'TMB-2026-0011',
    date: '2026-10-12',
    title: 'Muse Wonder and the red cylinder',
    subject: 'Muse Wonder',
    category: 'Alleged benchmaxxing',
    status: 'Disputed',
    severity: 3,
    claim: '"Meta says it beats the competition on the key benchmarks."',
    finding:
      'The BridgeBench lava lamp came back as "a red cylinder. No glass. No lava." Within hours "benchmaxxed" was trending in the replies. Counterpoint, also within hours: "it\'s uncalled for, used max thinking lvl for both." The model shipped the day it was announced, which, per the Days-to-Ship benchmark, is exemplary.',
    timeline: [
      { date: '2026-10-12', text: 'Red cylinder.', tweetId: '2109733498114417013' },
      { date: '2026-10-12', text: '"Not even Gemini models are this benchmaxxed bro."', tweetId: '2109714643455295731' },
      { date: '2026-10-12', text: 'Counterpoint: "it\'s uncalled for."', tweetId: '2109727239504060665' },
    ],
  },
  {
    id: 'TMB-2026-0012',
    date: '2026-10-12',
    title: 'Claude Next, allegedly in your Claude Code right now',
    subject: '"Claude Next"',
    category: 'Rumor',
    status: 'Unconfirmed',
    severity: 1,
    claim: 'Some Opus 5.5 requests are "being routed to an unreleased model". The tell: "it knows things past opus 5.5\'s cutoff."',
    finding: '"Anthropic hasn\'t confirmed anything: no model id, nothing on its news page." Entered into the leaderboard at a claimed score of 92, pending existence.',
    timeline: [{ date: '2026-10-12', text: '"IF THIS IS REAL, IT\'S F*CKING INSANE."', tweetId: '2109714970938077455' }],
  },
];

export interface Commendation {
  name: string;
  author: string;
  why: string;
  tweetId: string;
}

export const COMMENDATIONS: Commendation[] = [
  {
    name: 'BullshitBench',
    author: '@petergostev',
    why: 'Questions, scripts, responses and judgements are public. The author openly worries about the cost of re-grading with newer judges, which is the opposite of trust-me-bro.',
    tweetId: '2098331418577256546',
  },
  {
    name: 'SnitchBench',
    author: '@theo',
    why: '"These numbers are 100% real and reproducible." Then they were reproduced by other people with other tools.',
    tweetId: '1943580754015129844',
  },
  {
    name: 'Brainfuck Arena',
    author: '@IND_is_Here',
    why: 'MIT-licensed, playable in the browser, built explicitly because "we\'re all tired of trust me bro AI benchmarks".',
    tweetId: '2109051876214005998',
  },
  {
    name: 'Independent re-compilations',
    author: '@alexmichaelio',
    why: '"None are self-reported." Scores pulled from third-party maintainers rather than launch posts.',
    tweetId: '2108609705300176979',
  },
  {
    name: 'Independent replication',
    author: '@ArtificialAnlys',
    why: 'Published "we have been unable to replicate" within 48 hours, with methodology. The thing this site is a parody of is, unfortunately for the parody, quite good.',
    tweetId: '1832457791010959539',
  },
];
