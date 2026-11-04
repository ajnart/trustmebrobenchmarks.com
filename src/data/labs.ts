export type LabId =
  | 'anthropic'
  | 'openai'
  | 'google'
  | 'meta'
  | 'xai'
  | 'mistral'
  | 'deepseek'
  | 'moonshot'
  | 'zai'
  | 'alibaba'
  | 'reflection'
  | 'reflectionai'
  | 'minimax'
  | 'inception'
  | 'skyfall'
  | 'tmb';

export interface Lab {
  id: LabId;
  name: string;
  color: string;
  mark: string;
  handle?: string;
}

export const LABS: Record<LabId, Lab> = {
  anthropic: { id: 'anthropic', name: 'Anthropic', color: '#c4785a', mark: 'A\\', handle: 'AnthropicAI' },
  openai: { id: 'openai', name: 'OpenAI', color: '#74747e', mark: 'O', handle: 'OpenAI' },
  google: { id: 'google', name: 'Google', color: '#4f9d63', mark: 'G', handle: 'GoogleDeepMind' },
  meta: { id: 'meta', name: 'Meta', color: '#3b82f6', mark: '∞', handle: 'AIatMeta' },
  xai: { id: 'xai', name: 'xAI', color: '#7c6fd0', mark: 'x', handle: 'xai' },
  mistral: { id: 'mistral', name: 'Mistral', color: '#f0782d', mark: 'M', handle: 'MistralAI' },
  deepseek: { id: 'deepseek', name: 'DeepSeek', color: '#2f45d6', mark: 'D', handle: 'deepseek_ai' },
  moonshot: { id: 'moonshot', name: 'Moonshot', color: '#17a2a0', mark: 'K', handle: 'Kimi_Moonshot' },
  zai: { id: 'zai', name: 'Z.ai', color: '#5b6b86', mark: 'Z', handle: 'Zai_org' },
  alibaba: { id: 'alibaba', name: 'Alibaba', color: '#a855f7', mark: 'Q', handle: 'Alibaba_Qwen' },
  reflection: { id: 'reflection', name: 'Reflection', color: '#db2777', mark: 'R' },
  reflectionai: { id: 'reflectionai', name: 'Reflection AI', color: '#e879f9', mark: 'R²', handle: 'reflection_ai' },
  minimax: { id: 'minimax', name: 'MiniMax', color: '#ef4444', mark: 'Mx', handle: 'MiniMax_AI' },
  inception: { id: 'inception', name: 'Inception', color: '#84cc16', mark: 'I', handle: '_inception_ai' },
  skyfall: { id: 'skyfall', name: 'Skyfall AI', color: '#38bdf8', mark: 'S', handle: 'skyfallai' },
  tmb: { id: 'tmb', name: 'Trust Me Bro Labs', color: '#d4a20b', mark: '*' },
};

export const lab = (id: LabId): Lab => LABS[id];
