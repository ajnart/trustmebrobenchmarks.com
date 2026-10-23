export type Vibe = 'hype' | 'positive' | 'neutral' | 'skeptical' | 'negative';

export interface VibeRow {
  model: string;
  posts: number;
  counts: Record<Vibe, number>;
  loudestHype?: string;
  loudestDoubt?: string;
}

export interface VibeWeek {
  week: string;
  rows: VibeRow[];
}

export const VIBE_SEGMENTS: { key: Vibe; label: string; color: string }[] = [
  { key: 'hype', label: 'Hype', color: '#f97316' },
  { key: 'positive', label: 'Positive', color: '#4f9d63' },
  { key: 'neutral', label: 'Neutral', color: '#a3a3a3' },
  { key: 'skeptical', label: 'Skeptical', color: '#7c6fd0' },
  { key: 'negative', label: 'Negative', color: '#dc2626' },
];

export const VIBES: VibeWeek[] = [
  {
    week: '2026-10-19',
    rows: [
      { model: 'muse-spark-open', posts: 32, counts: { hype: 6, positive: 1, neutral: 19, skeptical: 5, negative: 1 }, loudestHype: '2111661203516997828', loudestDoubt: '2113584817761816822' },
      { model: 'beam-1-0', posts: 33, counts: { hype: 9, positive: 2, neutral: 21, skeptical: 1, negative: 0 }, loudestHype: '2112165729021599943', loudestDoubt: '2113571024327299560' },
      { model: 'minimax-m3-1-flash', posts: 35, counts: { hype: 9, positive: 5, neutral: 18, skeptical: 3, negative: 0 }, loudestHype: '2113414387666927980', loudestDoubt: '2113645689465160181' },
      { model: 'mercury-3', posts: 28, counts: { hype: 4, positive: 2, neutral: 17, skeptical: 4, negative: 1 }, loudestHype: '2112238767771914533', loudestDoubt: '2112266045394133365' },
      { model: 'gemini-4-argon', posts: 33, counts: { hype: 7, positive: 6, neutral: 16, skeptical: 3, negative: 1 }, loudestHype: '2111175666398048620', loudestDoubt: '2113653235558838408' },
      { model: 'deepseek-v4-1-flash', posts: 28, counts: { hype: 5, positive: 4, neutral: 17, skeptical: 1, negative: 1 }, loudestHype: '2110677445850325128', loudestDoubt: '2113647402964115562' },
      { model: 'kimi-k3-1', posts: 37, counts: { hype: 10, positive: 5, neutral: 17, skeptical: 5, negative: 0 }, loudestHype: '2113180444858667485', loudestDoubt: '2113322179303821765' },
    ],
  },
];

export const LATEST_VIBES = VIBES[0];
export const vibeFor = (modelId: string) => LATEST_VIBES.rows.find((r) => r.model === modelId);
export const postUrl = (id: string) => `https://x.com/i/status/${id}`;
