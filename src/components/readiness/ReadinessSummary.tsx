import { Download, FileArchive } from 'lucide-react';
import { PACKAGES } from '../../data/demoData';
import { VERDICT_LABELS, formatDate, formatDateTime, pct } from '../../lib/formatters';
import type { Assessment, Supplier } from '../../types';
import { Button } from '../ui/Button';

function Ring({ value, color }: { value: number | null; color: string }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative h-[88px] w-[88px] shrink-0">
      <svg viewBox="0 0 80 80" className="h-full w-full -rotate-90" aria-hidden="true">
        <circle cx="40" cy="40" r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="7" />
        {value !== null && (
          <circle cx="40" cy="40" r={r} fill="none" stroke={color} strokeWidth="7" strokeLinecap="round" strokeDasharray={`${(value / 100) * c} ${c}`} className="transition-[stroke-dasharray] duration-500" />
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="tnum text-xl font-semibold leading-none text-white">{value === null ? '—' : `${value}%`}</span>
        <span className="mt-1 text-[10px] text-navy-muted">satisfied</span>
      </div>
    </div>
  );
}

const VERDICT_COLOR = { ready: '#2DD4BF', action: '#F2B857', not_ready: '#F07A84' };

export function ReadinessSummary({
  assessment,
  supplier,
  onExport,
  onSavePack,
}: {
  assessment: Assessment | null;
  supplier?: Supplier;
  onExport: () => void;
  onSavePack: () => void;
}) {
  if (!assessment) {
    return (
      <div className="relative overflow-hidden rounded-lg bg-navy p-5 text-white">
        <div className="absolute inset-x-0 top-0 h-[3px] bg-brand-accent/70" />
        <div className="flex items-center gap-5">
          <Ring value={null} color="#14B8A6" />
          <div className="min-w-0">
            <div className="text-2xs font-semibold uppercase tracking-[0.08em] text-brand-accent">Overall readiness</div>
            <h2 className="mt-1 text-lg font-semibold">Select a package to begin</h2>
            <p className="mt-1 max-w-lg text-[13px] leading-relaxed text-navy-muted">
              Results show each requirement, the evidence used and its source, and a recommended action wherever the supplier falls short.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const pkg = PACKAGES.find((p) => p.id === assessment.packageId)!;
  const { counts, verdict } = assessment;
  const color = VERDICT_COLOR[verdict];
  const stats = [
    { label: 'Assessed', value: counts.assessed, cls: 'text-white' },
    { label: 'Satisfied', value: counts.satisfied, cls: 'text-[#5EEAD4]' },
    { label: 'Action required', value: counts.action, cls: 'text-[#F2B857]' },
    { label: 'Not satisfied', value: counts.notSatisfied, cls: 'text-[#F07A84]' },
  ];

  return (
    <div className="relative overflow-hidden rounded-lg bg-navy p-5 text-white">
      <div className="absolute inset-x-0 top-0 h-[3px]" style={{ background: color }} />
      <div className="flex flex-col gap-5 md:flex-row md:items-center">
        <div className="flex min-w-0 flex-1 items-center gap-5">
          <Ring value={pct(counts.satisfied, counts.assessed)} color={color} />
          <div className="min-w-0">
            <div className="text-2xs font-semibold uppercase tracking-[0.08em] text-brand-accent">Overall verdict</div>
            <div className="mt-1 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
              <h2 className="text-xl font-semibold">{VERDICT_LABELS[verdict]}</h2>
            </div>
            <p className="mt-1 text-[13px] text-[#C9D5E1]">{supplier?.name} → {pkg.name}</p>
            <p className="text-xs text-navy-muted">
              Window {formatDate(assessment.mobilisation)} → {formatDate(assessment.finish)} · calculated {formatDateTime(assessment.ranAt)}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button size="sm" icon={Download} onClick={onExport} className="!border-white/15 !bg-white/10 !text-white hover:!bg-white/15">Export audit record</Button>
          <Button size="sm" icon={FileArchive} onClick={onSavePack} className="!border-brand-accent/40 !bg-brand !text-white hover:!bg-brand-dark">Save as audit pack</Button>
        </div>
      </div>
      <dl className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-md bg-white/10 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-navy-deep/60 px-4 py-3">
            <dt className="text-xs text-navy-muted">{s.label}</dt>
            <dd className={`tnum mt-0.5 text-xl font-semibold ${s.cls}`}>{s.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
