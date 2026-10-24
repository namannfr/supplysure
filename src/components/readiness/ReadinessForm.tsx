import { ClipboardCheck, Layers, Link2, ShieldQuestion } from 'lucide-react';
import { PACKAGES, REQUIREMENTS_BY_ID } from '../../data/demoData';
import { TRADE_LABELS, formatDate } from '../../lib/formatters';
import { setsFor } from '../../lib/readinessEngine';
import type { Supplier } from '../../types';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Field, Input, Select } from '../ui/Form';

export interface CheckInputs {
  supplierId: string;
  packageId: string;
  mobilisation: string;
  finish: string;
}

export function ReadinessForm({
  suppliers,
  inputs,
  onChange,
  onRun,
  dateError,
}: {
  suppliers: Supplier[];
  inputs: CheckInputs;
  onChange: (next: Partial<CheckInputs>) => void;
  onRun: () => void;
  dateError?: string;
}) {
  const supplier = suppliers.find((s) => s.id === inputs.supplierId);
  const pkg = PACKAGES.find((p) => p.id === inputs.packageId);
  const sets = supplier && pkg ? setsFor(supplier, pkg) : [];
  const total = sets.reduce((n, s) => n + s.requirementIds.length, 0);
  const assignment = pkg?.assignments.find((a) => a.supplierId === inputs.supplierId);
  const datesChanged = pkg && (inputs.mobilisation !== pkg.mobilisation || inputs.finish !== pkg.finish);
  const sorted = [...suppliers].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <Card className="p-5 lg:sticky lg:top-20">
      <h2 className="text-[15px] font-semibold">Check details</h2>
      <p className="mt-0.5 text-[13px] text-muted">One supplier, one package, one assessment window.</p>

      <div className="mt-5 space-y-4">
        <Field label="Supplier" htmlFor="rc-supplier">
          <Select id="rc-supplier" value={inputs.supplierId} onChange={(e) => onChange({ supplierId: e.target.value })}>
            {sorted.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} — {TRADE_LABELS[s.trade]}{s.status === 'invited' ? ' (invited)' : ''}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Package" htmlFor="rc-package">
          <Select
            id="rc-package"
            value={inputs.packageId}
            onChange={(e) => {
              const p = PACKAGES.find((x) => x.id === e.target.value)!;
              onChange({ packageId: p.id, mobilisation: p.mobilisation, finish: p.finish });
            }}
          >
            {PACKAGES.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </Select>
        </Field>

        {pkg && (
          <div className={`flex items-start gap-2 rounded-md px-3 py-2 text-xs ${assignment ? 'bg-canvas text-muted' : 'bg-info-bg text-[#36618A]'}`}>
            {assignment ? <Link2 className="mt-px h-3.5 w-3.5 shrink-0" /> : <ShieldQuestion className="mt-px h-3.5 w-3.5 shrink-0" />}
            <span>{assignment ? <>Appointed for <span className="text-ink">{assignment.scopeOfWorks.toLowerCase()}</span></> : 'Not appointed to this package — this is a hypothetical check.'}</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Field label="Mobilisation date" htmlFor="rc-mob">
            <Input id="rc-mob" type="date" value={inputs.mobilisation} onChange={(e) => e.target.value && onChange({ mobilisation: e.target.value })} invalid={!!dateError} />
          </Field>
          <Field label="Package finish" htmlFor="rc-fin">
            <Input id="rc-fin" type="date" value={inputs.finish} onChange={(e) => e.target.value && onChange({ finish: e.target.value })} invalid={!!dateError} />
          </Field>
        </div>
        {dateError ? (
          <p className="-mt-2 text-xs text-bad">{dateError}</p>
        ) : datesChanged ? (
          <p className="-mt-2 text-xs text-muted">
            Package dates are {formatDate(pkg!.mobilisation)} → {formatDate(pkg!.finish)}.{' '}
            <button type="button" className="font-medium text-brand hover:text-brand-dark" onClick={() => onChange({ mobilisation: pkg!.mobilisation, finish: pkg!.finish })}>Reset</button>
          </p>
        ) : null}

        <div>
          <div className="mb-1.5 flex items-center justify-between text-[13px] font-medium text-ink">
            <span>Requirement set</span>
            <span className="tnum text-xs font-normal text-muted">{total} requirements</span>
          </div>
          <ul className="divide-y divide-line-soft rounded-md border border-line">
            {sets.map((s) => {
              const critical = s.requirementIds.filter((id) => REQUIREMENTS_BY_ID[id].critical).length;
              return (
                <li key={s.id} className="flex items-start gap-2.5 px-3 py-2.5">
                  <Layers className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" />
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] text-ink">{s.name}</div>
                    <div className="text-xs text-muted">
                      {s.kind === 'trade' ? 'Trade set' : 'Package addition'} · v{s.version} · {s.requirementIds.length} requirement{s.requirementIds.length > 1 ? 's' : ''}, {critical} critical
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <Button variant="primary" icon={ClipboardCheck} className="h-10 w-full" onClick={onRun} disabled={!!dateError}>
          Run readiness check
        </Button>
        <p className="text-xs leading-relaxed text-muted">
          Deterministic rules over recorded evidence metadata. The same inputs always return the same verdict. Document authenticity is confirmed by reviewers, not the engine.
        </p>
      </div>
    </Card>
  );
}
