import { CheckCircle2, Download, FilePlus2, History } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { ActionsTable } from '../components/readiness/CorrectiveActions';
import { Badge, OutcomeBadge, VerdictBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, EmptyState, TableWrap } from '../components/ui/Card';
import { Drawer } from '../components/ui/Overlay';
import { useToast } from '../components/ui/Toast';
import { PACKAGES } from '../data/demoData';
import { formatDate, formatDateTime, nowStamp } from '../lib/formatters';
import { reproduces, runAssessment } from '../lib/readinessEngine';
import { downloadAssessment } from '../lib/reports';
import { setParam, type Route } from '../lib/router';
import { useStore } from '../lib/store';
import type { AuditRecord } from '../types';

export function AuditPacks({ route }: { route: Route }) {
  const { audits, suppliers, evidence, lastAssessment, createAuditPack } = useStore();
  const toast = useToast();
  const openId = route.params.get('record');
  const open = audits.find((a) => a.id === openId);

  const supplierName = (id: string) => suppliers.find((s) => s.id === id)?.name ?? id;
  const pkgOf = (id: string) => PACKAGES.find((p) => p.id === id)!;

  const isReproducible = (r: AuditRecord) => {
    const supplier = suppliers.find((s) => s.id === r.assessment.supplierId);
    if (!supplier) return false;
    const fresh = runAssessment({ supplier, pkg: pkgOf(r.assessment.packageId), mobilisation: r.assessment.mobilisation, finish: r.assessment.finish, evidence, ranAt: r.assessment.ranAt });
    return reproduces(r.assessment, fresh);
  };

  const download = (r: AuditRecord) => {
    downloadAssessment(r.assessment, { recordId: r.id, generatedAt: r.generatedAt, reviewer: r.reviewer, note: r.note }, suppliers);
    toast({ tone: 'success', title: `${r.id} downloaded`, description: 'Printable HTML report — open it and print to PDF if needed.' });
  };

  const generate = () => {
    let source = lastAssessment;
    let note = 'Generated from the most recent readiness check.';
    if (!source) {
      const supplier = suppliers.find((s) => s.id === 'S01')!;
      const pkg = pkgOf('P01');
      source = runAssessment({ supplier, pkg, mobilisation: pkg.mobilisation, finish: pkg.finish, evidence, ranAt: nowStamp() });
      note = 'No readiness check had been run in this session; generated for Apex Electrical Services on Riverside Apartments.';
    }
    const record = createAuditPack({ ...source, ranAt: nowStamp() }, note);
    toast({ tone: 'success', title: `Audit pack ${record.id} generated`, description: `${supplierName(record.assessment.supplierId)} · ${pkgOf(record.assessment.packageId).name}` });
    setParam(route, 'record', record.id);
  };

  return (
    <>
      <PageHeader
        eyebrow="Reproducible decision record"
        title="Audit packs"
        description="Each pack records the package, date, rules, evidence, reviewer decisions and document references."
        actions={<Button variant="primary" icon={FilePlus2} onClick={generate}>Generate current pack</Button>}
      />

      <Card>
        <CardHeader
          title="Decision records"
          subtitle={lastAssessment ? `Next pack will use your latest check: ${supplierName(lastAssessment.supplierId)} → ${pkgOf(lastAssessment.packageId).name}` : 'Run a readiness check to generate a pack from it'}
        />
        {audits.length === 0 ? (
          <EmptyState icon={History} title="No audit packs" description="Generate a pack from a readiness check to record the decision." />
        ) : (
          <TableWrap>
            <table className="w-full min-w-[980px]">
              <thead className="border-b border-line-soft">
                <tr>
                  <th className="th pl-5">Record</th>
                  <th className="th">Generated</th>
                  <th className="th">Package</th>
                  <th className="th">Supplier</th>
                  <th className="th">Verdict</th>
                  <th className="th">Reviewer</th>
                  <th className="th">Integrity</th>
                  <th className="th pr-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-soft">
                {audits.map((r) => {
                  const ok = isReproducible(r);
                  return (
                    <tr key={r.id} className={`row-link ${openId === r.id ? 'bg-brand-50/60' : ''}`} onClick={() => setParam(route, 'record', r.id)}>
                      <td className="td pl-5">
                        <div className="font-mono text-[13px] font-medium text-ink">{r.id}</div>
                        {r.origin === 'generated' && <div className="text-xs text-brand">New this session</div>}
                      </td>
                      <td className="td tnum text-[13px] text-ink">{formatDateTime(r.generatedAt)}</td>
                      <td className="td text-[13px] text-ink">{pkgOf(r.assessment.packageId).name}</td>
                      <td className="td text-[13px] text-ink">{supplierName(r.assessment.supplierId)}</td>
                      <td className="td"><VerdictBadge verdict={r.assessment.verdict} /></td>
                      <td className="td text-[13px] text-ink">{r.reviewer}</td>
                      <td className="td">
                        {ok ? <Badge tone="ok">Reproduces</Badge> : <Badge tone="warn">Evidence changed</Badge>}
                      </td>
                      <td className="td pr-5 text-right">
                        <Button size="sm" icon={Download} onClick={(e) => { e.stopPropagation(); download(r); }}>Download</Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </TableWrap>
        )}
        <div className="border-t border-line-soft px-5 py-3 text-xs text-muted">
          “Reproduces” means re-running the recorded requirement set versions against today’s evidence gives the same outcomes. Records are stored in this browser for the demonstration; no tamper-proofing is claimed.
        </div>
      </Card>

      {open && (
        <Drawer
          open
          onClose={() => setParam(route, 'record', null)}
          title={<h2 className="font-mono text-lg font-semibold text-ink">{open.id}</h2>}
          subtitle={`${supplierName(open.assessment.supplierId)} → ${pkgOf(open.assessment.packageId).name}`}
          headerExtra={
            <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-4">
              <div className="bg-white px-3 py-2.5"><dt className="text-xs text-muted">Verdict</dt><dd className="mt-1"><VerdictBadge verdict={open.assessment.verdict} /></dd></div>
              <div className="bg-white px-3 py-2.5"><dt className="text-xs text-muted">Assessment window</dt><dd className="tnum mt-0.5 text-[13px] font-medium">{formatDate(open.assessment.mobilisation)}<br /><span className="font-normal text-muted">to {formatDate(open.assessment.finish)}</span></dd></div>
              <div className="bg-white px-3 py-2.5"><dt className="text-xs text-muted">Generated</dt><dd className="tnum mt-0.5 text-[13px] font-medium">{formatDateTime(open.generatedAt)}</dd></div>
              <div className="bg-white px-3 py-2.5"><dt className="text-xs text-muted">Reviewer</dt><dd className="mt-0.5 text-[13px] font-medium">{open.reviewer}</dd></div>
            </dl>
          }
          footer={<Button variant="primary" icon={Download} onClick={() => download(open)}>Download report</Button>}
        >
          <div className="space-y-6">
            <div className="rounded-md bg-canvas px-3.5 py-2.5 text-[13px] text-muted">
              <span className="font-medium text-ink">Reviewer note: </span>{open.note}
            </div>

            <section>
              <h3 className="mb-2 text-[13px] font-semibold">Rules applied</h3>
              <div className="flex flex-wrap gap-2">
                {open.assessment.requirementSets.map((s) => (
                  <span key={s.id} className="rounded border border-line bg-white px-2 py-1 text-xs text-ink">{s.name} <span className="font-mono text-muted">v{s.version}</span></span>
                ))}
              </div>
            </section>

            <section>
              <h3 className="mb-2 text-[13px] font-semibold">Requirement outcomes <span className="tnum font-normal text-muted">· {open.assessment.counts.satisfied} of {open.assessment.counts.assessed} satisfied</span></h3>
              <ul className="divide-y divide-line-soft rounded-md border border-line">
                {open.assessment.rows.map((r) => (
                  <li key={r.requirementId} className="px-3.5 py-2.5">
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-[13px] font-medium text-ink">{r.name}</span>
                      <OutcomeBadge outcome={r.outcome} />
                    </div>
                    <p className="mt-0.5 text-xs text-muted">{r.explanation}</p>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h3 className="mb-2 text-[13px] font-semibold">Evidence references</h3>
              <ul className="divide-y divide-line-soft rounded-md border border-line">
                {open.assessment.rows.filter((r) => r.evidence).map((r) => (
                  <li key={r.evidence!.id} className="flex items-center gap-3 px-3.5 py-2">
                    <span className="w-16 shrink-0 font-mono text-[11px] text-ink">{r.evidence!.id}</span>
                    <span className="min-w-0 flex-1 truncate text-[13px] text-ink">{r.evidence!.title}</span>
                    <span className="hidden font-mono text-[11px] text-muted sm:block">{r.evidence!.reference}</span>
                    <span className="w-24 text-right text-xs text-muted">{r.evidence!.expires ? formatDate(r.evidence!.expires) : 'No expiry'}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h3 className="mb-2 text-[13px] font-semibold">Open actions</h3>
              {open.assessment.actions.length === 0 ? (
                <p className="flex items-center gap-2 rounded-md border border-line px-3.5 py-3 text-[13px] text-muted"><CheckCircle2 className="h-4 w-4 text-ok" />No open actions at generation.</p>
              ) : (
                <div className="overflow-hidden rounded-md border border-line"><ActionsTable actions={open.assessment.actions} /></div>
              )}
            </section>

            <p className="text-xs text-muted">
              {isReproducible(open)
                ? 'Re-running these rule versions against current evidence produces the same outcomes.'
                : 'Evidence has changed since this pack was generated (for example, a reviewer decision). The pack preserves the inputs and outcomes as they were.'}
            </p>
          </div>
        </Drawer>
      )}
    </>
  );
}
