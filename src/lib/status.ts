import type { IncidentStatus } from '../data/incidents';
import type { Status } from '../data/models';

export const MODEL_STATUS: Record<Status, { label: string; badge: string }> = {
  available: { label: 'Available', badge: 'badge-good' },
  announced: { label: 'Announced, not available', badge: 'badge-warn' },
  rumored: { label: 'Rumored', badge: 'badge-bad' },
  promised: { label: 'Promised', badge: 'badge-bad' },
  'self-reported': { label: 'Self-reported', badge: 'badge-bad' },
};

export const INCIDENT_STATUS: Record<IncidentStatus, { badge: string; tone: string }> = {
  Open: { badge: 'badge-bad', tone: '#c2410c' },
  Resolved: { badge: 'badge-good', tone: '#2f7d4f' },
  Disputed: { badge: 'badge-warn', tone: '#b7791f' },
  Unconfirmed: { badge: 'badge', tone: '#787774' },
  'Partially delivered': { badge: 'badge-accent', tone: '#7b2a85' },
  Unfalsifiable: { badge: 'badge', tone: '#787774' },
};
