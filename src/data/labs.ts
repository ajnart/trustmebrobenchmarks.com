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
  | 'tmb';

export interface Lab {
  id: LabId;
  name: string;
  color: string;
  mark: string;
}

export const LABS: Record<LabId, Lab> = {
  anthropic: { id: 'anthropic', name: 'Anthropic', color: '#c4785a', mark: 'A\\' },
  openai: { id: 'openai', name: 'OpenAI', color: '#74747e', mark: 'O' },
  google: { id: 'google', name: 'Google', color: '#4f9d63', mark: 'G' },
  meta: { id: 'meta', name: 'Meta', color: '#3b82f6', mark: '∞' },
  xai: { id: 'xai', name: 'xAI', color: '#7c6fd0', mark: 'x' },
  mistral: { id: 'mistral', name: 'Mistral', color: '#f0782d', mark: 'M' },
  deepseek: { id: 'deepseek', name: 'DeepSeek', color: '#2f45d6', mark: 'D' },
  moonshot: { id: 'moonshot', name: 'Moonshot', color: '#17a2a0', mark: 'K' },
  zai: { id: 'zai', name: 'Z.ai', color: '#5b6b86', mark: 'Z' },
  alibaba: { id: 'alibaba', name: 'Alibaba', color: '#a855f7', mark: 'Q' },
  reflection: { id: 'reflection', name: 'Reflection', color: '#db2777', mark: 'R' },
  tmb: { id: 'tmb', name: 'Trust Me Bro Labs', color: '#d4a20b', mark: '*' },
};

export const lab = (id: LabId): Lab => LABS[id];
