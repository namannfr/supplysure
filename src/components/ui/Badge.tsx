import type { ReactNode } from 'react';
import type { Outcome, Priority, Risk, Verdict, Verification } from '../../types';
import { PRIORITY_LABELS, RISK_LABELS, VERDICT_LABELS } from '../../lib/formatters';

export type Tone = 'ok' | 'warn' | 'bad' | 'info' | 'neutral' | 'brand';

const TONES: Record<Tone, string> = {
  ok: 'bg-ok-bg text-ok border-[#CBE6DA]',
  warn: 'bg-warn-bg text-[#94611A] border-[#EFDDB8]',
  bad: 'bg-bad-bg text-[#B8323D] border-[#F4CDD0]',
  info: 'bg-info-bg text-info border-[#D3E1EE]',
  neutral: 'bg-canvas text-muted border-line',
  brand: 'bg-brand-50 text-brand-dark border-brand-100',
};

const DOTS: Record<Tone, string> = {
  ok: 'bg-ok', warn: 'bg-warn', bad: 'bg-bad', info: 'bg-info', neutral: 'bg-subtle', brand: 'bg-brand',
};

export function Badge({ tone = 'neutral', dot = false, children, className = '' }: { tone?: Tone; dot?: boolean; children: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex h-[22px] items-center gap-1.5 whitespace-nowrap rounded-full border px-2 text-xs font-medium ${TONES[tone]} ${className}`}>
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${DOTS[tone]}`} />}
      {children}
    </span>
  );
}

export const verdictTone = (v: Verdict): Tone => (v === 'ready' ? 'ok' : v === 'action' ? 'warn' : 'bad');
export const riskTone = (r: Risk): Tone => (r === 'low' ? 'ok' : r === 'medium' ? 'warn' : 'bad');
export const outcomeTone = (o: Outcome): Tone => (o === 'satisfied' ? 'ok' : o === 'action' ? 'warn' : 'bad');
export const priorityTone = (p: Priority): Tone => (p === 'critical' ? 'bad' : p === 'high' ? 'warn' : 'info');

export function VerdictBadge({ verdict }: { verdict: Verdict }) {
  return <Badge tone={verdictTone(verdict)} dot>{VERDICT_LABELS[verdict]}</Badge>;
}

export function RiskBadge({ risk }: { risk: Risk }) {
  return <Badge tone={riskTone(risk)} dot>{RISK_LABELS[risk]}</Badge>;
}

export function OutcomeBadge({ outcome }: { outcome: Outcome }) {
  const label = outcome === 'satisfied' ? 'Satisfied' : outcome === 'action' ? 'Action required' : 'Not satisfied';
  return <Badge tone={outcomeTone(outcome)} dot>{label}</Badge>;
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  return <Badge tone={priorityTone(priority)}>{PRIORITY_LABELS[priority]}</Badge>;
}

export function VerificationBadge({ v }: { v: Verification }) {
  if (v === 'verified') return <Badge tone="ok">Verified</Badge>;
  if (v === 'pending') return <Badge tone="info">Awaiting review</Badge>;
  return <Badge tone="bad">Correction requested</Badge>;
}
