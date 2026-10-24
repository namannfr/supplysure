import type { Priority, Risk, TradeId, Verdict } from '../types';

/** The single reference date for the demonstration environment. Every calculation reads from here. */
export const DEMO_TODAY = '2026-10-24';
/** Clock time used when the prototype stamps a new record. */
export const DEMO_TIME = '11:30';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_LONG = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function parts(iso: string) {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  return { y, m, d };
}

export function toDayNumber(iso: string): number {
  const { y, m, d } = parts(iso);
  return Math.round(Date.UTC(y, m - 1, d) / 86_400_000);
}

export function daysBetween(fromIso: string, toIso: string): number {
  return toDayNumber(toIso) - toDayNumber(fromIso);
}

export function addDays(iso: string, days: number): string {
  const t = (toDayNumber(iso) + days) * 86_400_000;
  return new Date(t).toISOString().slice(0, 10);
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const { y, m, d } = parts(iso);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

export function formatShortDate(iso: string): string {
  const { m, d } = parts(iso);
  return `${d} ${MONTHS[m - 1]}`;
}

export function formatLongDate(iso: string): string {
  const { y, m, d } = parts(iso);
  return `${d} ${MONTHS_LONG[m - 1]} ${y}`;
}

export function formatDateTime(isoDateTime: string): string {
  const time = isoDateTime.slice(11, 16);
  return `${formatDate(isoDateTime)}, ${time}`;
}

export function nowStamp(): string {
  return `${DEMO_TODAY}T${DEMO_TIME}`;
}

export function dueLabel(due: string, today = DEMO_TODAY): string {
  const diff = daysBetween(today, due);
  if (diff < 0) return `Overdue ${Math.abs(diff)}d`;
  if (diff === 0) return 'Due today';
  if (diff === 1) return 'Due tomorrow';
  if (diff <= 7) return `Due in ${diff} days`;
  return `Due ${formatShortDate(due)}`;
}

export function formatCover(value?: number): string {
  if (!value) return '—';
  return `£${(value / 1_000_000).toFixed(value % 1_000_000 === 0 ? 0 : 1)}m`;
}

/** Lower-cases the first letter unless the word is an acronym (DBS, ISO, CHAS…). */
export function lowerFirst(s: string): string {
  return /^[A-Z][A-Z0-9-]/.test(s) ? s : s.charAt(0).toLowerCase() + s.slice(1);
}

export function pct(n: number, d: number): number {
  return d === 0 ? 0 : Math.round((n / d) * 100);
}

export const TRADE_LABELS: Record<TradeId, string> = {
  electrical: 'Electrical',
  fire: 'Fire protection',
  mechanical: 'Mechanical services',
  renewables: 'Renewables',
  groundworks: 'Groundworks',
  scaffolding: 'Scaffolding',
  roofing: 'Roofing & cladding',
  steel: 'Structural steel',
};

export const VERDICT_LABELS: Record<Verdict, string> = {
  ready: 'Ready',
  action: 'Action required',
  not_ready: 'Not ready',
};

export const RISK_LABELS: Record<Risk, string> = { high: 'High', medium: 'Medium', low: 'Low' };

export const PRIORITY_LABELS: Record<Priority, string> = { critical: 'Critical', high: 'High', medium: 'Medium' };

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter((w) => /[A-Za-z]/.test(w[0] ?? ''))
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('');
}
